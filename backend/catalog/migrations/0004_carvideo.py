from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0003_dealer_logo_owner'),
    ]

    operations = [
        migrations.CreateModel(
            name='CarVideo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video', models.FileField(upload_to='cars/videos/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('car', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='videos', to='catalog.car')),
            ],
        ),
    ]
