from django.contrib import admin
from django.utils.html import format_html, format_html_join
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.db.models import Count

from .models import Car, CarVideo, Dealer


# ---------------------------------------------------------------------------
# Inlines
# ---------------------------------------------------------------------------

class CarVideoInline(admin.TabularInline):
    model = CarVideo
    extra = 0
    readonly_fields = ('video_preview', 'uploaded_at')
    fields = ('video_preview', 'video', 'uploaded_at')

    def video_preview(self, obj):
        if obj.video:
            return format_html(
                '<video width="240" height="135" controls style="border-radius:6px">'
                '<source src="{0}" type="video/mp4">'
                '<source src="{0}" type="video/webm">'
                'No preview</video>',
                obj.video.url,
            )
        return '—'
    video_preview.short_description = 'Preview'


# ---------------------------------------------------------------------------
# Car admin
# ---------------------------------------------------------------------------

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = (
        'thumbnail',
        'title',
        'dealer',
        'condition_badge',
        'price',
        'mileage',
        'location',
        'fuel',
        'transmission',
        'year',
        'video_count',
    )
    list_display_links = ('thumbnail', 'title')
    list_filter = ('condition', 'make', 'year', 'fuel', 'transmission', 'location')
    search_fields = ('make', 'model', 'dealer', 'location', 'color', 'engine')
    ordering = ('-id',)
    readonly_fields = ('car_image_preview',)
    inlines = [CarVideoInline]

    fieldsets = (
        ('Identity', {
            'fields': ('make', 'model', 'year', 'condition', 'dealer'),
        }),
        ('Pricing & Location', {
            'fields': ('price', 'mileage', 'location'),
        }),
        ('Vehicle Details', {
            'fields': ('fuel', 'transmission', 'engine', 'color'),
        }),
        ('Media', {
            'fields': ('car_image_preview', 'image'),
        }),
        ('Description', {
            'fields': ('overview',),
            'classes': ('collapse',),
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(_video_count=Count('videos', distinct=True))

    def title(self, obj):
        return f"{obj.year} {obj.make} {obj.model}"
    title.short_description = 'Listing'
    title.admin_order_field = 'make'

    def thumbnail(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="80" height="54" '
                'style="object-fit:cover;border-radius:6px;border:1px solid #e5e7eb" />',
                obj.image,
            )
        return '—'
    thumbnail.short_description = ''

    def condition_badge(self, obj):
        colours = {
            'Brand New':    ('#dcfce7', '#15803d'),
            'Foreign Used': ('#fef9c3', '#854d0e'),
            'Ghana Used':   ('#fee2e2', '#b91c1c'),
        }
        bg, fg = colours.get(obj.condition, ('#f3f4f6', '#374151'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;border-radius:999px;'
            'font-size:11px;font-weight:600;white-space:nowrap">{}</span>',
            bg, fg, obj.condition,
        )
    condition_badge.short_description = 'Condition'
    condition_badge.admin_order_field = 'condition'

    def car_image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width:480px;max-height:280px;'
                'object-fit:cover;border-radius:10px;border:1px solid #e5e7eb" />',
                obj.image,
            )
        return '—'
    car_image_preview.short_description = 'Image preview'

    def video_count(self, obj):
        count = obj._video_count
        if count:
            return format_html(
                '<span style="background:#ede9fe;color:#5b21b6;padding:2px 10px;'
                'border-radius:999px;font-size:11px;font-weight:600">{} video{}</span>',
                count, 's' if count != 1 else '',
            )
        return '—'
    video_count.short_description = 'Videos'
    video_count.admin_order_field = '_video_count'


# ---------------------------------------------------------------------------
# Dealer admin  —  shows all listings for that dealer inline
# ---------------------------------------------------------------------------

CONDITION_COLOURS = {
    'Brand New':    ('#dcfce7', '#15803d'),
    'Foreign Used': ('#fef9c3', '#854d0e'),
    'Ghana Used':   ('#fee2e2', '#b91c1c'),
}


@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    list_display = (
        'logo_thumbnail',
        'name',
        'owner_email',
        'location',
        'phone',
        'email',
        'rating',
        'verified_badge',
        'listing_count',
        'response',
    )
    list_display_links = ('logo_thumbnail', 'name')
    list_filter = ('verified', 'location')
    search_fields = ('name', 'email', 'phone', 'location', 'owner__email', 'owner__username')
    ordering = ('-id',)
    readonly_fields = ('logo_preview', 'owner_link', 'listings_panel')

    fieldsets = (
        ('Dealer Identity', {
            'fields': ('name', 'initials', 'color', 'owner_link', 'verified'),
        }),
        ('Contact', {
            'fields': ('phone', 'email', 'location', 'hours', 'response'),
        }),
        ('Profile', {
            'fields': ('description', 'specialties', 'rating', 'cars'),
        }),
        ('Logo', {
            'fields': ('logo_preview', 'logo'),
        }),
        ('Listings', {
            'fields': ('listings_panel',),
            'description': 'All cars currently listed under this dealer.',
        }),
    )

    # ------------------------------------------------------------------
    # List-view helpers
    # ------------------------------------------------------------------

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(_listing_count=Count('owner__id', distinct=False))

    def logo_thumbnail(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" width="44" height="44" '
                'style="object-fit:cover;border-radius:8px;border:1px solid #e5e7eb" />',
                obj.logo,
            )
        return format_html(
            '<div style="width:44px;height:44px;border-radius:8px;background:{};'
            'display:flex;align-items:center;justify-content:center;'
            'color:#fff;font-weight:700;font-size:13px">{}</div>',
            obj.color or '#0d1b2a',
            obj.initials or '??',
        )
    logo_thumbnail.short_description = ''

    def verified_badge(self, obj):
        if obj.verified:
            return format_html(
                '<span style="background:#dcfce7;color:#15803d;padding:2px 10px;'
                'border-radius:999px;font-size:11px;font-weight:600">✓ Verified</span>'
            )
        return format_html(
            '<span style="background:#f3f4f6;color:#6b7280;padding:2px 10px;'
            'border-radius:999px;font-size:11px;font-weight:600">Unverified</span>'
        )
    verified_badge.short_description = 'Status'
    verified_badge.admin_order_field = 'verified'

    def owner_email(self, obj):
        if obj.owner:
            return obj.owner.email or obj.owner.username
        return '—'
    owner_email.short_description = 'Owner account'

    def listing_count(self, obj):
        count = Car.objects.filter(dealer=obj.name).count()
        if count:
            url = reverse('admin:catalog_car_changelist') + f'?dealer={obj.name}'
            return format_html(
                '<a href="{}" style="background:#dbeafe;color:#1d4ed8;padding:2px 10px;'
                'border-radius:999px;font-size:11px;font-weight:600;text-decoration:none">'
                '{} listing{}</a>',
                url, count, 's' if count != 1 else '',
            )
        return format_html(
            '<span style="color:#9ca3af;font-size:12px">No listings</span>'
        )
    listing_count.short_description = 'Listings'

    # ------------------------------------------------------------------
    # Detail-view helpers
    # ------------------------------------------------------------------

    def owner_link(self, obj):
        if obj.owner:
            url = reverse('admin:auth_user_change', args=[obj.owner.pk])
            return format_html('<a href="{}">{}</a>', url, obj.owner.email or obj.owner.username)
        return '—'
    owner_link.short_description = 'Owner account'

    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" style="max-width:160px;max-height:160px;'
                'object-fit:cover;border-radius:10px;border:1px solid #e5e7eb" />',
                obj.logo,
            )
        return '—'
    logo_preview.short_description = 'Logo preview'

    def listings_panel(self, obj):
        """Renders a full table of all cars listed under this dealer's name."""
        cars = Car.objects.filter(dealer=obj.name).order_by('-id')
        if not cars.exists():
            return format_html(
                '<p style="color:#6b7280;font-style:italic">No listings found for "{}".</p>',
                obj.name,
            )

        view_all_url = reverse('admin:catalog_car_changelist') + f'?dealer={obj.name}'

        rows = []
        for car in cars:
            edit_url = reverse('admin:catalog_car_change', args=[car.pk])
            bg, fg = CONDITION_COLOURS.get(car.condition, ('#f3f4f6', '#374151'))
            thumb = (
                format_html(
                    '<img src="{}" width="72" height="48" '
                    'style="object-fit:cover;border-radius:5px;vertical-align:middle" />',
                    car.image,
                ) if car.image else mark_safe('—')
            )
            condition_html = format_html(
                '<span style="background:{};color:{};padding:2px 8px;border-radius:999px;'
                'font-size:11px;font-weight:600">{}</span>',
                bg, fg, car.condition,
            )
            rows.append(format_html(
                '<tr>'
                '<td style="padding:8px 6px">{}</td>'
                '<td style="padding:8px 6px"><a href="{}">{} {} {}</a></td>'
                '<td style="padding:8px 6px">{}</td>'
                '<td style="padding:8px 6px;font-weight:600">{}</td>'
                '<td style="padding:8px 6px">{}</td>'
                '<td style="padding:8px 6px">{}</td>'
                '<td style="padding:8px 6px">{}</td>'
                '<td style="padding:8px 6px">{}</td>'
                '</tr>',
                thumb,
                edit_url, car.year, car.make, car.model,
                condition_html,
                car.price,
                car.mileage,
                car.fuel or '—',
                car.transmission or '—',
                car.location,
            ))

        header = mark_safe(
            '<tr style="background:#f9fafb;text-align:left">'
            '<th style="padding:8px 6px"></th>'
            '<th style="padding:8px 6px">Listing</th>'
            '<th style="padding:8px 6px">Condition</th>'
            '<th style="padding:8px 6px">Price</th>'
            '<th style="padding:8px 6px">Mileage</th>'
            '<th style="padding:8px 6px">Fuel</th>'
            '<th style="padding:8px 6px">Transmission</th>'
            '<th style="padding:8px 6px">Location</th>'
            '</tr>'
        )

        table = format_html(
            '<div style="overflow-x:auto">'
            '<table style="width:100%;border-collapse:collapse;font-size:13px">'
            '<thead>{}</thead>'
            '<tbody>{}</tbody>'
            '</table>'
            '<p style="margin-top:8px">'
            '<a href="{}" style="font-size:12px;color:#1d4ed8">→ View all {} listing{} in car admin</a>'
            '</p>'
            '</div>',
            header,
            mark_safe(''.join(str(r) for r in rows)),
            view_all_url,
            cars.count(),
            's' if cars.count() != 1 else '',
        )
        return table

    listings_panel.short_description = 'All Listings'


# ---------------------------------------------------------------------------
# Car Video admin
# ---------------------------------------------------------------------------

@admin.register(CarVideo)
class CarVideoAdmin(admin.ModelAdmin):
    list_display = ('car', 'video_preview', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('car__make', 'car__model', 'car__dealer')
    ordering = ('-uploaded_at',)
    readonly_fields = ('video_preview', 'uploaded_at')

    def video_preview(self, obj):
        if obj.video:
            return format_html(
                '<video width="240" height="135" controls style="border-radius:6px">'
                '<source src="{0}" type="video/mp4">'
                '<source src="{0}" type="video/webm">'
                '</video>',
                obj.video.url,
            )
        return '—'
    video_preview.short_description = 'Video'


# ---------------------------------------------------------------------------
# Site branding
# ---------------------------------------------------------------------------

admin.site.site_header = 'AutoGhana Admin'
admin.site.site_title = 'AutoGhana'
admin.site.index_title = 'Dashboard'
