from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from urllib.parse import quote
from urllib.request import urlopen
import json
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status

from .models import Car, CarVideo, Dealer
from .serializers import CarSerializer, CarVideoSerializer, DealerSerializer

User = get_user_model()


@api_view(['GET'])
def car_list(request):
    cars = Car.objects.all()
    serializer = CarSerializer(cars, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def car_create(request):
    data = request.data.copy()
    data['dealer'] = request.user.get_full_name().strip() or request.user.email or request.user.get_username()

    uploaded_image = request.FILES.get('image')
    if uploaded_image:
        if uploaded_image.size > 10 * 1024 * 1024:
            return Response({'detail': 'Image must be smaller than 10 MB.'}, status=status.HTTP_400_BAD_REQUEST)
        image_path = default_storage.save(f'cars/{uploaded_image.name}', uploaded_image)
        data['image'] = request.build_absolute_uri(f'{settings.MEDIA_URL}{image_path}')

    uploaded_video = request.FILES.get('video')
    if uploaded_video and uploaded_video.size > 200 * 1024 * 1024:
        return Response({'detail': 'Video must be smaller than 200 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CarSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    car = serializer.save()
    if uploaded_video:
        CarVideo.objects.create(car=car, video=uploaded_video)
    return Response(CarSerializer(car).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([AllowAny])
def car_videos(request, car_id):
    try:
        car = Car.objects.get(id=car_id)
    except Car.DoesNotExist:
        return Response({'detail': 'Car not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(CarVideoSerializer(car.videos.all(), many=True, context={'request': request}).data)

    if not request.user.is_authenticated:
        return Response({'detail': 'Sign in as the dealer to upload media.'}, status=status.HTTP_401_UNAUTHORIZED)

    owner_name = request.user.get_full_name().strip() or request.user.email or request.user.get_username()
    if car.dealer != owner_name and car.dealer not in {request.user.email, request.user.get_username()}:
        return Response({'detail': 'You can only upload media for your own listings.'}, status=status.HTTP_403_FORBIDDEN)

    video = request.FILES.get('video')
    if not video:
        return Response({'detail': 'Choose a video first.'}, status=status.HTTP_400_BAD_REQUEST)
    if video.size > 200 * 1024 * 1024:
        return Response({'detail': 'Video must be smaller than 200 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    uploaded_video = CarVideo.objects.create(car=car, video=video)
    return Response(CarVideoSerializer(uploaded_video, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def vehicle_options(request):
    make = request.query_params.get('make')
    endpoint = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/' + quote(make, safe='') if make else 'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car'

    try:
        with urlopen(f'{endpoint}?format=json', timeout=8) as response:
            payload = json.load(response)
    except Exception:
        return Response({'detail': 'Vehicle catalog service is temporarily unavailable.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    if make:
        return Response({
            'make': make,
            'models': sorted({item['Model_Name'] for item in payload.get('Results', []) if item.get('Model_Name')}),
        })

    return Response({
        'makes': sorted({item['MakeName'] for item in payload.get('Results', []) if item.get('MakeName')}),
    })


@api_view(['GET'])
def dealer_list(request):
    dealers = Dealer.objects.all()
    serializer = DealerSerializer(dealers, many=True)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def dealer_profile(request):
    user = request.user
    dealer, _ = Dealer.objects.get_or_create(
        owner=user,
        defaults={
            'name': user.get_full_name().strip() or user.email or user.get_username(),
            'location': 'Ghana',
            'initials': (user.get_full_name() or user.get_username())[:2].upper(),
            'phone': '',
            'email': user.email,
            'response': 'Usually within a few hours',
            'description': 'A dealer on AutoGhana.',
            'hours': 'Contact dealer for opening hours',
        },
    )

    if request.method == 'POST':
        logo = request.FILES.get('logo')
        update_fields = []
        for field in ['name', 'location', 'phone', 'email', 'hours', 'description', 'response']:
            if field in request.data:
                setattr(dealer, field, str(request.data.get(field, '')).strip())
                update_fields.append(field)
        if 'specialties' in request.data:
            dealer.specialties = [item.strip() for item in str(request.data.get('specialties', '')).split(',') if item.strip()]
            update_fields.append('specialties')
        if dealer.name:
            dealer.initials = ''.join(part[0] for part in dealer.name.split()[:2]).upper()
            update_fields.append('initials')
        if logo:
            if logo.size > 5 * 1024 * 1024:
                return Response({'detail': 'Logo must be smaller than 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)
            logo_path = default_storage.save(f'dealers/{logo.name}', logo)
            dealer.logo = request.build_absolute_uri(f'{settings.MEDIA_URL}{logo_path}')
            update_fields.append('logo')
        if update_fields:
            dealer.save(update_fields=list(set(update_fields)))

    return Response(DealerSerializer(dealer).data)


@api_view(['GET'])
def api_home(request):
    return Response({
        'message': 'AutoGhana API is running',
        'cars': '/api/cars/',
        'dealers': '/api/dealers/',
    })


@api_view(['POST'])
def login_view(request):
    identifier = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')

    if not identifier or not password:
        return Response({'detail': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    username = identifier
    user_by_email = User.objects.filter(email__iexact=identifier).first()
    if user_by_email:
        username = user_by_email.get_username()

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.get_username(),
            'email': user.email,
            'name': user.get_full_name(),
        },
    })


@api_view(['POST'])
def register_view(request):
    name = str(request.data.get('name', '')).strip()
    email = str(request.data.get('email', '')).strip().lower()
    password = request.data.get('password', '')

    if not name or not email or not password:
        return Response({'detail': 'Name, email, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email__iexact=email).exists():
        return Response({'detail': 'An account with this email already exists.'}, status=status.HTTP_409_CONFLICT)

    try:
        validate_password(password)
    except ValidationError as error:
        return Response({'detail': error.messages[0]}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name,
    )
    token = Token.objects.create(user=user)
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.get_username(),
            'email': user.email,
            'name': user.get_full_name(),
        },
    }, status=status.HTTP_201_CREATED)
