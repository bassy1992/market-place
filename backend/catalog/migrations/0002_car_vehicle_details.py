from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='car',
            name='overview',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='car',
            name='fuel',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='car',
            name='transmission',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='car',
            name='engine',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='car',
            name='color',
            field=models.CharField(blank=True, default='', max_length=80),
        ),
    ]
