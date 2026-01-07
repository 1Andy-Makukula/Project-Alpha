# Django Backend Implementation Guide
## KithLy "Wizard of Oz" Logistics System

**Developer Handover Document**
**Priority:** High
**Timeline:** Week 1 (MVP)
**Version:** 1.0

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Authentication Setup](#authentication-setup)
3. [Order Model Updates](#order-model-updates)
4. [WhatsApp Integration](#whatsapp-integration)
5. [CSV Manifest Export](#csv-manifest-export)
6. [API Endpoints](#api-endpoints)
7. [Testing Checklist](#testing-checklist)

---

## Quick Start

### Prerequisites
```bash
Python 3.10+
Django 4.2+
PostgreSQL 14+
```

### Initial Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt
pip install psycopg2-binary python-decouple twilio

# Create project (if new)
django-admin startproject kithly_backend
cd kithly_backend
python manage.py startapp orders
python manage.py startapp users
```

---

## 1. Authentication Setup

### Install JWT Authentication

**File:** `requirements.txt`
```txt
Django==4.2.0
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
psycopg2-binary==2.9.9
python-decouple==3.8
twilio==8.10.0
django-cors-headers==4.3.0
```

### Custom User Model

**File:** `users/models.py`
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom User model with role-based access"""

    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', 'Customer'
        SHOP = 'SHOP', 'Shop Owner'
        ADMIN = 'ADMIN', 'Administrator'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CUSTOMER
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
```

### Update Settings

**File:** `kithly_backend/settings.py`
```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'users',
    'orders',
]

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Settings (for frontend)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative port
    "https://kith.ly",        # Production frontend
]

# Twilio Configuration
from decouple import config

TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = config('TWILIO_WHATSAPP_NUMBER', default='whatsapp:+14155238886')
WHATSAPP_SUPPORT_NUMBER = config('WHATSAPP_SUPPORT_NUMBER', default='+260971234567')
```

### Create ENV File

**File:** `.env`
```bash
# Django
SECRET_KEY=your-super-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=kithly_db
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
WHATSAPP_SUPPORT_NUMBER=+260971234567

# Frontend
FRONTEND_URL=http://localhost:5173
VERIFICATION_BASE_URL=https://kith.ly/verify
```

---

## 2. Order Model Updates

### Complete Order Model

**File:** `orders/models.py`
```python
from django.db import models
from django.conf import settings
from django.utils import timezone

class Order(models.Model):
    """Order model with Wizard of Oz logistics fields"""

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PAID = 'paid', 'Paid'
        READY_FOR_DISPATCH = 'ready_for_dispatch', 'Ready for Dispatch'
        DISPATCHED = 'dispatched', 'Dispatched'
        DELIVERED = 'delivered', 'Delivered'
        COLLECTED = 'collected', 'Collected'

    class DeliveryMethod(models.TextChoices):
        PICKUP = 'pickup', 'Pickup'
        DELIVERY = 'delivery', 'Delivery'

    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        DELIVERED = 'delivered', 'Delivered'

    class OrderType(models.TextChoices):
        INSTANT = 'instant', 'Instant'
        REQUEST = 'request', 'Request (Made-to-Order)'

    class ApprovalStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    # Core Fields
    id = models.CharField(max_length=20, primary_key=True, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    customer_name = models.CharField(max_length=200)
    customer_avatar = models.URLField(blank=True, null=True)

    # Order Details
    total = models.DecimalField(max_digits=10, decimal_places=2)
    item_count = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    # Delivery Information
    delivery_method = models.CharField(
        max_length=10,
        choices=DeliveryMethod.choices,
        default=DeliveryMethod.PICKUP
    )
    collection_code = models.CharField(max_length=20, unique=True)

    # Shop Reference
    shop_name = models.CharField(max_length=200)
    shop_id = models.IntegerField()  # Reference to Shop model (to be created)

    # Timestamps
    paid_on = models.DateTimeField(default=timezone.now)
    collected_on = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Additional Details
    message = models.TextField(blank=True, null=True)
    pickup_time = models.CharField(max_length=50, blank=True, null=True)
    order_type = models.CharField(
        max_length=10,
        choices=OrderType.choices,
        default=OrderType.INSTANT
    )
    approval_status = models.CharField(
        max_length=10,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.APPROVED
    )

    # ============================================
    # WIZARD OF OZ LOGISTICS FIELDS
    # ============================================

    # Recipient Contact
    recipient_phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        help_text="Zambian phone number for WhatsApp verification (+260XXXXXXXXX)"
    )

    # Delivery Address (from WhatsApp GPS pin)
    delivery_address_note = models.TextField(
        blank=True,
        null=True,
        help_text="Address or GPS coordinates captured from recipient's WhatsApp pin"
    )

    # Driver Assignment (from Yango)
    driver_plate_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Vehicle plate number assigned by Yango for delivery"
    )

    # Verification Tracking
    delivery_verification_status = models.CharField(
        max_length=10,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
        blank=True,
        null=True
    )

    verification_link_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when WhatsApp verification link was sent"
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'delivery_method']),
            models.Index(fields=['delivery_verification_status']),
            models.Index(fields=['shop_id']),
        ]

    def __str__(self):
        return f"{self.id} - {self.customer_name} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        if not self.id:
            # Generate unique Order ID
            self.id = self.generate_order_id()
        if not self.collection_code:
            # Generate collection code
            self.collection_code = self.generate_collection_code()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_order_id():
        import random
        import string
        return f"KLY-{''.join(random.choices(string.ascii_uppercase + string.digits, k=7))}"

    @staticmethod
    def generate_collection_code():
        import random
        import string
        return f"KLY-{''.join(random.choices(string.ascii_uppercase + string.digits, k=10))}"


class OrderItem(models.Model):
    """Items within an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_id = models.IntegerField()
    product_name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
```

### Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 3. WhatsApp Integration

### Create WhatsApp Service

**File:** `orders/services/whatsapp_service.py`
```python
from twilio.rest import Client
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    """Service for sending WhatsApp messages via Twilio"""

    def __init__(self):
        self.client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        self.from_number = settings.TWILIO_WHATSAPP_NUMBER

    def send_delivery_verification_link(self, order):
        """
        Send delivery verification link to recipient

        Args:
            order: Order instance

        Returns:
            bool: True if message sent successfully
        """
        if not order.recipient_phone:
            logger.error(f"No recipient phone for order {order.id}")
            return False

        verification_url = f"{settings.FRONTEND_URL}/verify/{order.id}"

        message_body = f"""Hello {order.customer_name}!

A gift has been sent to you via KithLy 🎁

To ensure we deliver to your exact gate, please tap this link to share your location with our dispatch team:

{verification_url}

- KithLy Team"""

        try:
            message = self.client.messages.create(
                from_=self.from_number,
               to=f'whatsapp:{order.recipient_phone}',
                body=message_body
            )

            logger.info(f"WhatsApp sent to {order.recipient_phone} for order {order.id}. SID: {message.sid}")
            return True

        except Exception as e:
            logger.error(f"Failed to send WhatsApp for order {order.id}: {str(e)}")
            return False
```

### Create Post-Save Signal

**File:** `orders/signals.py`
```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Order
from .services.whatsapp_service import WhatsAppService

@receiver(post_save, sender=Order)
def send_delivery_verification_on_create(sender, instance, created, **kwargs):
    """
    Send WhatsApp verification link when delivery order is created
    """
    if created and instance.delivery_method == Order.DeliveryMethod.DELIVERY:
        # Send WhatsApp message
        whatsapp_service = WhatsAppService()
        success = whatsapp_service.send_delivery_verification_link(instance)

        if success:
            # Update verification timestamp
            Order.objects.filter(pk=instance.pk).update(
                verification_link_sent_at=timezone.now()
            )
```

### Register Signals

**File:** `orders/apps.py`
```python
from django.apps import AppConfig

class OrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'orders'

    def ready(self):
        import orders.signals  # Register signals
```

---

## 4. CSV Manifest Export

### Create Admin Action

**File:** `orders/admin.py`
```python
from django.contrib import admin
from django.http import HttpResponse
from django.utils import timezone
import csv
from .models import Order, OrderItem

@admin.action(description="📦 Export CSV Manifest for Yango")
def export_yango_manifest(modeladmin, request, queryset):
    """
    Export orders ready for dispatch to CSV for Yango Business upload
    """
    # Filter for eligible orders
    queryset = queryset.filter(
        status=Order.Status.READY_FOR_DISPATCH,
        delivery_method=Order.DeliveryMethod.DELIVERY,
        delivery_verification_status=Order.VerificationStatus.VERIFIED
    )

    # Create CSV response
    timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="yango_manifest_{timestamp}.csv"'

    writer = csv.writer(response)

    # Header row
    writer.writerow([
        'Order_ID',
        'Shop_Pickup_Address',
        'Delivery_Address',
        'Recipient_Phone',
        'Items_Count',
        'Total_Value',
        'Customer_Name',
        'Special_Instructions'
    ])

    # Data rows
    for order in queryset:
        # Get shop address (you'll need to create Shop model)
        shop_address = f"Shop #{order.shop_id}"  # Placeholder

        writer.writerow([
            order.id,
            shop_address,
            order.delivery_address_note or 'Address not provided',
            order.recipient_phone,
            order.item_count,
            f'{order.total:.2f}',
            order.customer_name,
            order.message or ''
        ])

    return response


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ['product_name', 'quantity', 'price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'customer_name',
        'shop_name',
        'status',
        'delivery_method',
        'delivery_verification_status',
        'driver_plate_number',
        'total',
        'created_at'
    ]

    list_filter = [
        'status',
        'delivery_method',
        'delivery_verification_status',
        'order_type',
        'approval_status',
        'created_at'
    ]

    search_fields = [
        'id',
        'customer_name',
        'recipient_phone',
        'shop_name',
        'collection_code'
    ]

    readonly_fields = [
        'id',
        'collection_code',
        'created_at',
        'updated_at',
        'verification_link_sent_at'
    ]

    fieldsets = [
        ('Order Information', {
            'fields': [
                'id',
                'customer',
                'customer_name',
                'customer_avatar',
                'collection_code',
                'status'
            ]
        }),
        ('Shop & Items', {
            'fields': [
                'shop_id',
                'shop_name',
                'item_count',
                'total',
                'message'
            ]
        }),
        ('Delivery Type', {
            'fields': [
                'delivery_method',
                'pickup_time',
                'order_type',
                'approval_status'
            ]
        }),
        ('Wizard of Oz Logistics', {
            'fields': [
                'recipient_phone',
                'delivery_address_note',
                'driver_plate_number',
                'delivery_verification_status',
                'verification_link_sent_at'
            ],
            'description': 'Manual logistics workflow fields'
        }),
        ('Timestamps', {
            'fields': [
                'paid_on',
                'collected_on',
                'created_at',
                'updated_at'
            ],
            'classes': ['collapse']
        })
    ]

    inlines = [OrderItemInline]
    actions = [export_yango_manifest]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Show shop owners only their orders
        if hasattr(request.user, 'role') and request.user.role == 'SHOP':
            return qs.filter(shop_id=request.user.shop_id)  # Adjust based on your Shop model
        return qs
```

---

## 5. API Endpoints

### Serializers

**File:** `orders/serializers.py`
```python
from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product_id', 'product_name', 'price', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    delivery_method_display = serializers.CharField(source='get_delivery_method_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'customer_avatar',
            'total', 'item_count', 'status', 'status_display',
            'delivery_method', 'delivery_method_display', 'collection_code',
            'shop_name', 'shop_id', 'message',
            'paid_on', 'collected_on', 'created_at', 'updated_at',
            'pickup_time', 'order_type', 'approval_status',
            # Wizard of Oz fields
            'recipient_phone', 'delivery_address_note', 'driver_plate_number',
            'delivery_verification_status', 'verification_link_sent_at',
            'items'
        ]
        read_only_fields = [
            'id', 'collection_code', 'created_at', 'updated_at',
            'verification_link_sent_at'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = [
            'customer_name', 'total', 'item_count',
            'delivery_method', 'shop_name', 'shop_id',
            'message', 'pickup_time', 'order_type',
            'recipient_phone', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)

        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)

        return order
```

### Views

**File:** `orders/views.py`
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer

class OrderViewSet(viewsets.ModelViewSet):
    """
    API endpoints for Order management
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Customers see only their orders
        if user.role == 'CUSTOMER':
            return Order.objects.filter(customer=user)

        # Shop owners see orders for their shop
        elif user.role == 'SHOP':
            return Order.objects.filter(shop_id=user.shop_id)  # Adjust based on Shop model

        # Admins see all
        return Order.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_delivery_address(self, request, pk=None):
        """
        Admin endpoint to update delivery address from WhatsApp
        """
        order = self.get_object()

        delivery_address_note = request.data.get('delivery_address_note')
        if not delivery_address_note:
            return Response(
                {'error': 'delivery_address_note is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.delivery_address_note = delivery_address_note
        order.delivery_verification_status = Order.VerificationStatus.VERIFIED
        order.save()

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['patch'])
    def assign_driver(self, request, pk=None):
        """
        Admin endpoint to assign driver plate number from Yango
        """
        order = self.get_object()

        driver_plate_number = request.data.get('driver_plate_number')
        if not driver_plate_number:
            return Response(
                {'error': 'driver_plate_number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.driver_plate_number = driver_plate_number
        order.status = Order.Status.DISPATCHED
        order.save()

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'])
    def confirm_handover(self, request, pk=None):
        """
        Shop endpoint to confirm handover to driver
        """
        order = self.get_object()

        if not order.driver_plate_number:
            return Response(
                {'error': 'Cannot confirm handover without driver assignment'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = Order.Status.DISPATCHED
        order.save()

        return Response(OrderSerializer(order).data)
```

### URLs

**File:** `orders/urls.py`
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
```

**File:** `kithly_backend/urls.py`
```python
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # API
    path('api/', include('orders.urls')),
]
```

---

## 6. Testing Checklist

### Manual Testing

```bash
# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver

# Test admin interface
# Navigate to http://localhost:8000/admin
```

### API Testing (using cURL or Postman)

**1. Get JWT Token:**
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "yourpassword"}'
```

**2. Create Order:**
```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "total": "250.00",
    "item_count": 3,
    "delivery_method": "delivery",
    "shop_name": "Test Shop",
    "shop_id": 1,
    "recipient_phone": "+260971234567",
    "items": [
      {
        "product_id": 1,
        "product_name": "Chocolate Cake",
        "price": "100.00",
        "quantity": 2
      }
    ]
  }'
```

**3. List Orders:**
```bash
curl -X GET http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**4. Update Delivery Address (Admin):**
```bash
curl -X PATCH http://localhost:8000/api/orders/KLY-ABC123/update_delivery_address/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"delivery_address_note": "House 12, Woodlands, Lusaka"}'
```

---

## 7. Deployment Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set up PostgreSQL database
- [ ] Configure static files (WhiteNoise or S3)
- [ ] Set up Twilio WhatsApp Business API
- [ ] Configure CORS for production frontend URL
- [ ] Set up SSL certificate
- [ ] Configure environment variables securely
- [ ] Set up logging and monitoring
- [ ] Create database backups

---

## Support & Resources

- **Twilio WhatsApp Docs:** https://www.twilio.com/docs/whatsapp
- **Django REST Framework:** https://www.django-rest-framework.org/
- **JWT Auth:** https://django-rest-framework-simplejwt.readthedocs.io/

---

**Last Updated:** 2026-01-06
**Version:** 1.0
