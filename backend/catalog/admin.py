from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count

from .models import Car, CarVideo, Dealer


class CarVideoInline(admin.TabularInline):
    model = CarVideo
    extra = 0
    readonly_fields = ('video_preview', 'uploaded_at')
    fields = ('video_preview', 'video', 'uploaded_at')

    def video_preview(self, obj):
        if obj.video:
            return format_html(
                '<video width="240" height="135" controls style="border-radius:6px">'
                '<source src="{}" type="video/mp4">'
                '<source src="{}" type="video/webm">'
                'No preview</video>',
                obj.video.url,
                obj.video.url,
            )
        return '—'
    video_preview.short_description = 'Preview'


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
        'cars',
        'response',
    )
    list_display_links = ('logo_thumbnail', 'name')
    list_filter = ('verified', 'location')
    search_fields = ('name', 'email', 'phone', 'location', 'owner__email', 'owner__username')
    ordering = ('-id',)
    readonly_fields = ('logo_preview', 'owner_link')

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
    )

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

    def owner_link(self, obj):
        if obj.owner:
            url = f'/admin/auth/user/{obj.owner.pk}/change/'
            return format_html('<a href="{}">{}</a>', url, obj.owner.email or obj.owner.username)
        return '—'
    owner_link.short_description = 'Owner account (link)'

    def logo_preview(self, obj):
        if obj.logo:
            return format_html(
                '<img src="{}" style="max-width:160px;max-height:160px;'
                'object-fit:cover;border-radius:10px;border:1px solid #e5e7eb" />',
                obj.logo,
            )
        return '—'
    logo_preview.short_description = 'Logo preview'


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
                '<source src="{}" type="video/mp4">'
                '<source src="{}" type="video/webm">'
                '</video>',
                obj.video.url,
                obj.video.url,
            )
        return '—'
    video_preview.short_description = 'Video'


# Customise the admin site header
admin.site.site_header = 'AutoGhana Admin'
admin.site.site_title = 'AutoGhana'
admin.site.index_title = 'Dashboard'
