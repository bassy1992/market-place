from django.contrib import admin, messages
from django.utils.html import format_html
from django.urls import reverse, path
from django.shortcuts import get_object_or_404, redirect
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
# Dealer admin
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
        'dealer_status_badge',
        'listing_count',
        'suspend_toggle',
    )
    list_display_links = ('logo_thumbnail', 'name')
    list_filter = ('verified', 'suspended', 'location')
    search_fields = ('name', 'email', 'phone', 'location', 'owner__email', 'owner__username')
    ordering = ('-id',)
    readonly_fields = ('logo_preview', 'owner_link', 'listings_panel', 'suspend_action_button')
    actions = ['action_suspend', 'action_unsuspend']

    fieldsets = (
        ('Dealer Identity', {
            'fields': ('name', 'initials', 'color', 'owner_link', 'verified'),
        }),
        ('Account Status', {
            'fields': ('suspended', 'suspend_action_button'),
            'description': 'Suspending a dealer hides all their listings from the public site.',
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
    # Custom URL for the one-click toggle
    # ------------------------------------------------------------------

    def get_urls(self):
        urls = super().get_urls()
        custom = [
            path(
                '<int:dealer_id>/toggle-suspend/',
                self.admin_site.admin_view(self.toggle_suspend_view),
                name='catalog_dealer_toggle_suspend',
            ),
        ]
        return custom + urls

    def toggle_suspend_view(self, request, dealer_id):
        dealer = get_object_or_404(Dealer, pk=dealer_id)
        dealer.suspended = not dealer.suspended
        dealer.save(update_fields=['suspended'])
        state = 'suspended' if dealer.suspended else 'reactivated'
        self.message_user(
            request,
            f'"{dealer.name}" has been {state}.',
            level=messages.WARNING if dealer.suspended else messages.SUCCESS,
        )
        return redirect(reverse('admin:catalog_dealer_change', args=[dealer_id]))

    # ------------------------------------------------------------------
    # Bulk actions
    # ------------------------------------------------------------------

    @admin.action(description='🚫  Suspend selected dealers')
    def action_suspend(self, request, queryset):
        updated = queryset.exclude(suspended=True).update(suspended=True)
        self.message_user(request, f'{updated} dealer(s) suspended.', messages.WARNING)

    @admin.action(description='✅  Reactivate selected dealers')
    def action_unsuspend(self, request, queryset):
        updated = queryset.filter(suspended=True).update(suspended=False)
        self.message_user(request, f'{updated} dealer(s) reactivated.', messages.SUCCESS)

    # ------------------------------------------------------------------
    # List-view columns
    # ------------------------------------------------------------------

    def logo_thumbnail(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" width="44" height="44" '
                'style="object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;'
                'opacity:{}" />',
                obj.logo,
                '0.45' if obj.suspended else '1',
            )
        return format_html(
            '<div style="width:44px;height:44px;border-radius:8px;background:{};'
            'display:flex;align-items:center;justify-content:center;'
            'color:#fff;font-weight:700;font-size:13px;opacity:{}">{}</div>',
            obj.color or '#0d1b2a',
            '0.45' if obj.suspended else '1',
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
    verified_badge.short_description = 'Verified'
    verified_badge.admin_order_field = 'verified'

    def dealer_status_badge(self, obj):
        if obj.suspended:
            return format_html(
                '<span style="background:#fee2e2;color:#b91c1c;padding:2px 10px;'
                'border-radius:999px;font-size:11px;font-weight:600">🚫 Suspended</span>'
            )
        return format_html(
            '<span style="background:#dcfce7;color:#15803d;padding:2px 10px;'
            'border-radius:999px;font-size:11px;font-weight:600">● Active</span>'
        )
    dealer_status_badge.short_description = 'Status'
    dealer_status_badge.admin_order_field = 'suspended'

    def suspend_toggle(self, obj):
        """One-click suspend / unsuspend button in the list view."""
        url = reverse('admin:catalog_dealer_toggle_suspend', args=[obj.pk])
        if obj.suspended:
            return format_html(
                '<a href="{}" style="background:#dcfce7;color:#15803d;padding:4px 12px;'
                'border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;'
                'white-space:nowrap">✅ Reactivate</a>',
                url,
            )
        return format_html(
            '<a href="{}" style="background:#fee2e2;color:#b91c1c;padding:4px 12px;'
            'border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;'
            'white-space:nowrap">🚫 Suspend</a>',
            url,
        )
    suspend_toggle.short_description = 'Action'

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
        return format_html('<span style="color:#9ca3af;font-size:12px">No listings</span>')
    listing_count.short_description = 'Listings'

    # ------------------------------------------------------------------
    # Detail-view fields
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

    def suspend_action_button(self, obj):
        """Large prominent button on the detail page."""
        if not obj.pk:
            return '—'
        url = reverse('admin:catalog_dealer_toggle_suspend', args=[obj.pk])
        if obj.suspended:
            return format_html(
                '<a href="{}" style="display:inline-block;background:#16a34a;color:#fff;'
                'padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;'
                'text-decoration:none;letter-spacing:.3px">✅ Reactivate this dealer</a>'
                '<p style="margin-top:8px;font-size:12px;color:#b91c1c">'
                '⚠ This dealer is currently suspended. Their listings are hidden from the public site.</p>',
                url,
            )
        return format_html(
            '<a href="{}" style="display:inline-block;background:#dc2626;color:#fff;'
            'padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;'
            'text-decoration:none;letter-spacing:.3px">🚫 Suspend this dealer</a>'
            '<p style="margin-top:8px;font-size:12px;color:#6b7280">'
            'Suspending will hide all listings from this dealer on the public site.</p>',
            url,
        )
    suspend_action_button.short_description = 'Suspend / Reactivate'

    def listings_panel(self, obj):
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

        return format_html(
            '<div style="overflow-x:auto">'
            '<table style="width:100%;border-collapse:collapse;font-size:13px">'
            '<thead>{}</thead>'
            '<tbody>{}</tbody>'
            '</table>'
            '<p style="margin-top:8px">'
            '<a href="{}" style="font-size:12px;color:#1d4ed8">'
            '→ View all {} listing{} in car admin</a>'
            '</p></div>',
            header,
            mark_safe(''.join(str(r) for r in rows)),
            view_all_url,
            cars.count(),
            's' if cars.count() != 1 else '',
        )
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
