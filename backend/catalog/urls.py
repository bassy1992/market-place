from django.urls import path

from .views import api_home, car_create, car_list, car_videos, dealer_list, dealer_profile, login_view, register_view, vehicle_options

urlpatterns = [
    path('', api_home, name='api-home'),
    path('cars/', car_list, name='car-list'),
    path('cars/create/', car_create, name='car-create'),
    path('cars/<int:car_id>/videos/', car_videos, name='car-videos'),
    path('vehicle-options/', vehicle_options, name='vehicle-options'),
    path('dealers/', dealer_list, name='dealer-list'),
    path('dealers/profile/', dealer_profile, name='dealer-profile'),
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
]
