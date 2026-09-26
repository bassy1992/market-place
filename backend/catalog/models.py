from django.db import models


class Car(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    price = models.CharField(max_length=50)
    mileage = models.CharField(max_length=50)
    location = models.CharField(max_length=150)
    dealer = models.CharField(max_length=150)
    condition = models.CharField(max_length=50)
    overview = models.TextField(blank=True, default='')
    fuel = models.CharField(max_length=50, blank=True, default='')
    transmission = models.CharField(max_length=50, blank=True, default='')
    engine = models.CharField(max_length=100, blank=True, default='')
    color = models.CharField(max_length=80, blank=True, default='')
    image = models.URLField()

    def __str__(self):
        return f"{self.make} {self.model} ({self.year})"


class CarVideo(models.Model):
    car = models.ForeignKey(Car, related_name='videos', on_delete=models.CASCADE)
    video = models.FileField(upload_to='cars/videos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Dealer(models.Model):
    owner = models.OneToOneField('auth.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='dealer_profile')
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=150)
    cars = models.PositiveIntegerField(default=0)
    verified = models.BooleanField(default=False)
    initials = models.CharField(max_length=10)
    color = models.CharField(max_length=20, default='#000000')
    phone = models.CharField(max_length=50)
    email = models.EmailField()
    rating = models.FloatField(default=0.0)
    response = models.CharField(max_length=100)
    description = models.TextField()
    specialties = models.JSONField(default=list)
    hours = models.CharField(max_length=150)
    logo = models.URLField(blank=True, default='')
    suspended = models.BooleanField(default=False)

    def __str__(self):
        return self.name
