from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0002_car_vehicle_details'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='dealer',
            name='logo',
            field=models.URLField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='dealer',
            name='owner',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='dealer_profile', to=settings.AUTH_USER_MODEL),
        ),
    ]
