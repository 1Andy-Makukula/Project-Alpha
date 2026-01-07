# KithLy Django Backend - Technical Specification
## Monday Development Handover

---

## Project Overview

KithLy is a logistics platform connecting senders with local shops for remittance delivery. The current frontend is built with React + TypeScript and uses **Mock Authentication** for development. Your task is to build the Django REST API backend that will replace the mock system.

---

## Priority 1: Token-Based Authentication System

### Requirements

Replace the current Mock Auth Provider with a production-ready JWT authentication system.

### Tech Stack
- **Framework**: Django REST Framework
- **Authentication**: `djangorestframework-simplejwt`
- **Database**: PostgreSQL (recommended) or SQLite for dev

### Custom User Model

Create a custom user model with the following structure:

```python
# users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('CUSTOMER', 'Customer'),
        ('SHOP', 'Shop Owner'),
        ('ADMIN', 'Administrator'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='CUSTOMER'
    )
    phone_number = models.CharField(max_length=15, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.email} ({self.role})"
```

### API Endpoints Required

#### 1. User Registration
```
POST /api/auth/register/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe",
  "role": "CUSTOMER"  // Optional, defaults to CUSTOMER
}
```

**Response (201 Created):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "CUSTOMER"
  }
}
```

#### 2. User Login
```
POST /api/auth/login/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "CUSTOMER"
  }
}
```

#### 3. Token Refresh
```
POST /api/auth/token/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### 4. Logout
```
POST /api/auth/logout/
```

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

#### 5. Password Reset Request
```
POST /api/auth/password-reset/
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset email sent if the account exists."
}
```

### Implementation Notes

1. **Password Security**: Use Django's built-in password hashing (PBKDF2)
2. **Token Expiry**:
   - Access token: 15 minutes
   - Refresh token: 7 days
3. **Rate Limiting**: Implement rate limiting on login endpoint (5 attempts per 15 minutes)
4. **Email Verification**: Optional for MVP, but prepare the infrastructure
5. **CORS**: Configure Django CORS headers to allow requests from the React frontend

---

## Priority 2: Yango Bulk Manifest Export Engine

### Context

Shop owners use **Yango** (ride-hailing service) for deliveries. Currently, order details are manually entered into Yango's system one by one. This feature automates bulk export via CSV.

### Order Model Updates

Update the Order model to include these fields:

```python
# orders/models.py
from django.db import models
from django.conf import settings

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Payment'),
        ('PAID', 'Paid'),
        ('READY_FOR_DISPATCH', 'Ready for Dispatch'),
        ('IN_TRANSIT', 'In Transit'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    DELIVERY_METHOD_CHOICES = [
        ('pickup', 'Pickup'),
        ('delivery', 'Delivery'),
    ]

    # Core fields
    order_id = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    shop = models.ForeignKey('shops.Shop', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    # Delivery fields
    delivery_method = models.CharField(max_length=10, choices=DELIVERY_METHOD_CHOICES)
    delivery_address_note = models.TextField(blank=True, help_text="Address from WhatsApp")
    recipient_name = models.CharField(max_length=100)
    recipient_phone = models.CharField(max_length=15)

    # Driver tracking
    driver_plate_number = models.CharField(max_length=20, blank=True)
    driver_assigned_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    delivery_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_id} - {self.status}"
```

### Shop Model

```python
# shops/models.py
from django.db import models

class Shop(models.Model):
    name = models.CharField(max_length=200)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Location for Yango pickup
    pickup_address = models.TextField(help_text="Full address for Yango pickup")
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    phone_number = models.CharField(max_length=15)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
```

### CSV Export Endpoint

```
GET /api/orders/export/yango-manifest/
```

**Required Permission**: Shop owner or Admin only

**Query Parameters:**
- `shop_id` (optional): Filter by specific shop
- `date_from` (optional): Filter orders from date (YYYY-MM-DD)
- `date_to` (optional): Filter orders to date (YYYY-MM-DD)

**Response**: CSV file download

**CSV Columns (Yango Required Format):**
1. `Pickup_Address` - Shop's pickup address
2. `Destination_Address` - Customer's `delivery_address_note`
3. `Recipient_Phone` - Customer's phone number
4. `Recipient_Name` - Customer's name
5. `Order_Reference` - KithLy Order ID (e.g., "KITHLY-12345")
6. `Delivery_Notes` - Optional special instructions

**Filter Logic:**
```python
orders = Order.objects.filter(
    status='READY_FOR_DISPATCH',
    delivery_method='delivery'
)
```

**Sample CSV Output:**
```csv
Pickup_Address,Destination_Address,Recipient_Phone,Recipient_Name,Order_Reference,Delivery_Notes
"Mama's Kitchen, Plot 123 Cairo Road, Lusaka","Plot 45 Independence Ave, Apt 2B, Lusaka",+260971234567,John Mukuka,KITHLY-00123,Leave at gate
"Mama's Kitchen, Plot 123 Cairo Road, Lusaka","Chelstone Area, House #89, Lusaka",+260977654321,Sarah Banda,KITHLY-00124,Call on arrival
```

### Implementation Example

```python
# orders/views.py
import csv
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Order

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_yango_manifest(request):
    # Ensure user is shop owner or admin
    if request.user.role not in ['SHOP', 'ADMIN']:
        return HttpResponse('Unauthorized', status=403)

    # Filter orders
    queryset = Order.objects.filter(
        status='READY_FOR_DISPATCH',
        delivery_method='delivery'
    )

    # Apply additional filters
    if 'shop_id' in request.GET:
        queryset = queryset.filter(shop_id=request.GET['shop_id'])

    # Create CSV response
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="yango_manifest.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Pickup_Address',
        'Destination_Address',
        'Recipient_Phone',
        'Recipient_Name',
        'Order_Reference',
        'Delivery_Notes'
    ])

    for order in queryset.select_related('shop'):
        writer.writerow([
            order.shop.pickup_address,
            order.delivery_address_note,
            order.recipient_phone,
            order.recipient_name,
            order.order_id,
            order.delivery_notes
        ])

    return response
```

---

## Additional Requirements

### CORS Configuration

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative port
]

CORS_ALLOW_CREDENTIALS = True
```

### REST Framework Settings

```python
# settings.py
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

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

---

## Testing Checklist

### Authentication Tests
- [ ] User can register with email/password
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with incorrect credentials
- [ ] JWT access token expires after 15 minutes
- [ ] JWT refresh token can generate new access token
- [ ] Password reset email is sent (or logged in dev)
- [ ] User role is correctly assigned based on email or manual selection

### Yango Manifest Tests
- [ ] CSV export includes only READY_FOR_DISPATCH + delivery orders
- [ ] CSV columns match Yango format exactly
- [ ] Shop pickup address is correctly populated
- [ ] Customer delivery notes are included
- [ ] Order reference matches KithLy format
- [ ] Shop owners can only export their own orders
- [ ] Admins can export all orders

---

## Deliverables

1. **Django Project Setup**
   - Virtual environment with all dependencies
   - Database migrations completed
   - Superuser created for testing

2. **API Documentation**
   - Postman collection or Swagger/Redoc documentation
   - Sample request/response examples

3. **Frontend Integration Notes**
   - API base URL for development
   - Instructions for environment variable configuration
   - CORS troubleshooting guide

4. **Deployment Readiness**
   - Environment variables documented
   - Static files configuration
   - Database backup/restore instructions

---

## Questions?

Contact: andy@kithly.com
Expected Delivery: [Date]
Priority: **High** - Frontend is blocked on Authentication

---

**Note**: The frontend currently uses Mock Auth. Once this API is complete, we will integrate it by:
1. Updating `AuthContext.tsx` to call Django REST endpoints
2. Storing JWT tokens in localStorage
3. Adding Authorization headers to all API requests
