# Developer API Contract

This document shows the exact JSON structure your Django API should return.  
Copy these examples into your serializer tests.

---

## 🔐 Authentication Endpoints

### POST `/api/auth/login/`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "name": "Alice Mwanza",
    "email": "alice@example.com",
    "userType": "customer"
  }
}
```

---

## 📦 Orders Endpoints

### GET `/api/orders/`

**Response:**
```json
[
  {
    "id": "KLY-ABC123",
    "customerName": "Alice Mwanza",
    "customerAvatar": "https://ui-avatars.com/api/?name=Alice+Mwanza",
    "paidOn": "2026-01-03T10:30:00Z",
    "collectedOn": null,
    "total": 250.00,
    "itemCount": 3,
    "status": "paid",
    "deliveryMethod": "pickup",
    "collectionCode": "KLY-ABC123DEF",
    "shopName": "Fresh Greens Market",
    "shopId": 1,
    "message": "Please pack carefully",
    "items": [
      {
        "id": 101,
        "name": "Tomatoes",
        "price": 50,
        "quantity": 2,
        "image": "https://example.com/tomatoes.jpg"
      }
    ],
    "deliveryCoordinates": {
      "lat": -15.4167,
      "lng": 28.2833
    },
    "deliveryNotes": "White gate, call on arrival",
    "orderType": "instant",
    "approvalStatus": "approved"
  }
]
```

**Field Requirements:**
- ✅ All field names in **camelCase** (not snake_case)
- ✅ Dates in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- ✅ Prices as decimal numbers (not strings)
- ✅ Status values: `'pending'`, `'paid'`, `'ready_for_dispatch'`, `'dispatched'`, `'collected'`

---

### POST `/api/orders/`

**Request:**
```json
{
  "customerName": "John Banda",
  "total": 350.00,
  "itemCount": 2,
  "deliveryMethod": "delivery",
  "shopId": 1,
  "items": [
    {
      "id": 102,
      "name": "Lettuce",
      "price": 150,
      "quantity": 1
    },
    {
      "id": 103,
      "name": "Carrots",
      "price": 200,
      "quantity": 1
    }
  ],
  "message": "Extra fresh please",
  "deliveryCoordinates": {
    "lat": -15.4167,
    "lng": 28.2833
  }
}
```

**Response:**
```json
{
  "id": "KLY-XYZ789",
  "collectionCode": "KLY-XYZ789ABC",
  "paidOn": "2026-01-03T14:22:00Z",
  "status": "paid",
  "customerName": "John Banda",
  "total": 350.00,
  "itemCount": 2,
  "deliveryMethod": "delivery",
  "shopId": 1,
  "items": [...],
  "message": "Extra fresh please"
}
```

**Notes:**
- Generate `id` and `collectionCode` on backend
- Set `paidOn` to current timestamp
- Default status: `'paid'` (or `'pending'` for made-to-order)
- Return complete order object

---

### GET `/api/orders/by-code/:code/`

**Example:** `GET /api/orders/by-code/KLY-ABC123DEF/`

**Response:**
```json
{
  "id": "KLY-ABC123",
  "collectionCode": "KLY-ABC123DEF",
  "customerName": "Alice Mwanza",
  "status": "paid",
  "total": 250.00,
  "items": [...]
}
```

**Error (404):**
```json
{
  "detail": "Order not found"
}
```

---

### PATCH `/api/orders/:id/verify/`

**Example:** `PATCH /api/orders/KLY-ABC123/verify/`

**Request:**
```json
{
  "verificationMethod": "scan"
}
```

**Response:**
```json
{
  "id": "KLY-ABC123",
  "status": "collected",
  "collectedOn": "2026-01-03T15:45:00Z",
  "verificationMethod": "scan"
}
```

**Business Logic:**
1. Check order exists
2. Verify status is `'paid'`
3. Update status to `'collected'`
4. Set `collectedOn` to current timestamp
5. Return updated order

**Errors:**
- 404: Order not found
- 400: Order already collected
- 403: User doesn't own this order (shop mismatch)

---

## 🛍️ Products Endpoints

### GET `/api/products/`

**Response:**
```json
[
  {
    "id": 101,
    "name": "Tomatoes (1kg)",
    "price": 25.00,
    "image": "https://cloudinary.com/tomatoes.jpg",
    "category": "groceries",
    "stock": 50,
    "description": "Fresh organic tomatoes",
    "shopId": 1,
    "type": "instant",
    "leadTime": null
  }
]
```

### GET `/api/products/?shopId=1`

**Response:** Same as above, filtered by `shopId`

---

## 🏪 Shops Endpoints

### GET `/api/shops/`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Fresh Greens Market",
    "description": "Organic vegetables and fruits",
    "profilePic": "https://cloudinary.com/profile.jpg",
    "coverImg": "https://cloudinary.com/cover.jpg",
    "category": "groceries",
    "tier": "Verified",
    "isVerified": true,
    "rating": 4.8,
    "reviewCount": 120,
    "coordinates": {
      "lat": -15.4167,
      "lng": 28.2833
    },
    "city": "Lusaka",
    "region": "Lusaka Province",
    "address": "Plot 123, Cairo Road",
    "openingHours": "08:00 - 18:00"
  }
]
```

---

## 🚨 Error Responses

### Format:
```json
{
  "detail": "Error message here",
  "code": "error_code_optional"
}
```

### Status Codes to Use:
- `200 OK` - Successful GET/PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - No auth token or invalid token
- `403 Forbidden` - Authenticated but not allowed
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

---

## 🔑 Authentication Headers

Every request (except login/register) should include:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Django Check:**
```python
# In your view/viewset
def get_queryset(self):
    # Filter orders by current user
    return Order.objects.filter(user=self.request.user)
```

---

## ✅ Django Serializer Example

```python
from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    # Use camelCase for frontend
    customerName = serializers.CharField(source='customer_name')
    paidOn = serializers.DateTimeField(source='paid_on')
    collectedOn = serializers.DateTimeField(source='collected_on', allow_null=True)
    itemCount = serializers.IntegerField(source='item_count')
    deliveryMethod = serializers.CharField(source='delivery_method')
    collectionCode = serializers.CharField(source='collection_code')
    shopId = serializers.IntegerField(source='shop_id')
    shopName = serializers.CharField(source='shop.name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customerName', 'paidOn', 'collectedOn', 
            'total', 'itemCount', 'status', 'deliveryMethod',
            'collectionCode', 'shopId', 'shopName', 'items'
        ]
```

**Alternative (Automatic camelCase):**
Use `djangorestframework-camel-case` package:
```bash
pip install djangorestframework-camel-case
```

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',
    ),
}
```

---

## 🧪 Testing Your API

Use this curl command to test:

```bash
# Test login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test get orders (replace TOKEN)
curl http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test create order
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d @order.json
```

---

## 📞 Questions to Ask

Before you start coding, confirm with the frontend developer:

1. ✅ "All field names in camelCase?"
2. ✅ "JWT authentication with Bearer token?"
3. ✅ "CORS enabled for localhost:5173?"
4. ✅ "ISO 8601 format for dates?"
5. ✅ "Decimal/float for prices (not string)?"

---

**Reference:** This contract matches `src/types/index.ts` in the frontend codebase.  
**Last Updated:** January 3, 2026
