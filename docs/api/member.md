# Member Service API Documentation

## Overview
This document describes the API endpoints for the member service. All endpoints are accessible without authentication.

## Base URL
```
/api/member
```

## Endpoints

### 1. Get Member Plans
Retrieves all available membership plans.

**Endpoint:** `GET /plans`

**Response:**
```json
{
  "code": 200,
  "message": "Member plans retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Basic Plan",
      "level": 1,
      "period_type": 1,
      "price": 29.99,
      "detection_quota": 10000,
      "rewrite_quota": 5000,
      "status": 1,
      "created_at": "2024-03-27T10:00:00Z",
      "updated_at": "2024-03-27T10:00:00Z"
    }
  ],
  "timestamp": 1648374246000
}
```

**Response Fields:**
- `id` (UUID): Unique identifier for the plan
- `name` (string): Name of the plan
- `level` (integer): Plan level/tier
- `period_type` (integer): Subscription period type (1: Monthly, 2: Yearly)
- `price` (decimal): Plan price
- `detection_quota` (integer): Number of detections included
- `rewrite_quota` (integer): Number of rewrites included
- `status` (integer): Plan status (1: Active, 0: Inactive)
- `created_at` (timestamp): Plan creation time
- `updated_at` (timestamp): Plan last update time

### 2. Subscribe to a Plan
Creates a new subscription for a user.

**Endpoint:** `POST /subscribe`

**Request Body:**
```json
{
  "userId": "user-123",
  "plan_id": "550e8400-e29b-41d4-a716-446655440000",
  "duration": 1,
  "auto_renew": true
}
```

**Parameters:**
- `userId` (string, required): The ID of the user
- `plan_id` (UUID, required): The ID of the subscription plan
- `duration` (integer, required): Duration in months
- `auto_renew` (boolean, required): Whether to enable auto-renewal

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "order_id": "ord_123456",
    "amount": 99.00,
    "pay_url": "https://payment.example.com/pay/ord_123456"
  },
  "timestamp": 1648374246000
}
```

### 3. Get Quota Status
Retrieves the current quota status for a user.

**Endpoint:** `GET /quota`

**Query Parameters:**
- `userId` (string, required): The ID of the user

**Example Request:**
```
GET /api/member/quota?userId=user-123
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "detection": {
      "total": 100000,
      "used": 15000,
      "remaining": 85000,
      "expire_time": "2024-12-31T23:59:59Z"
    },
    "rewrite": {
      "total": 50000,
      "used": 5000,
      "remaining": 45000,
      "expire_time": "2024-12-31T23:59:59Z"
    }
  },
  "timestamp": 1648374246000
}
```

### 4. Consume Quota
Consumes a specified amount of quota.

**Endpoint:** `POST /quota/consume`

**Request Body:**
```json
{
  "userId": "user-123",
  "quota_type": 1,
  "amount": 1000
}
```

**Parameters:**
- `userId` (string, required): The ID of the user
- `quota_type` (integer, required): Type of quota (1: detection, 2: rewrite)
- `amount` (integer, required): Amount to consume

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "success": true,
    "remaining": 84000
  },
  "timestamp": 1648374246000
}
```

### 5. Get Member Status
Retrieves the current membership status.

**Endpoint:** `GET /status`

**Query Parameters:**
- `userId` (string, required): The ID of the user

**Example Request:**
```
GET /api/member/status?userId=user-123
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "status": 1,
    "plan": {
      "name": "Premium Plan",
      "end_date": "2024-12-31T23:59:59Z",
      "quota": {
        "total": 100000,
        "used": 15000,
        "remaining": 85000
      }
    }
  },
  "timestamp": 1648374246000
}
```

### 6. Update Auto-Renewal
Updates the auto-renewal setting for a subscription.

**Endpoint:** `POST /renew`

**Request Body:**
```json
{
  "userId": "user-123",
  "auto_renew": true
}
```

**Parameters:**
- `userId` (string, required): The ID of the user
- `auto_renew` (boolean, required): Whether to enable auto-renewal

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "success": true
  },
  "timestamp": 1648374246000
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 2001 | Plan not found |
| 2002 | Insufficient quota |
| 2003 | Renewal failed |
| 2004 | Invalid operation |
| 2005 | System error |
| 2006 | Quota expired |
| 2007 | Usage limit exceeded |
| 2008 | Billing error |

## Error Response Example
```json
{
  "code": 2002,
  "message": "Insufficient quota",
  "timestamp": 1648374246000
}
```

## Rate Limiting
- Default rate limit: 100 requests per minute per IP
- Quota consumption endpoints: 20 requests per minute per user

## Notes
1. All timestamps are in ISO 8601 format
2. All monetary values are in CNY
3. Quota amounts are measured in characters
4. Member status codes:
   - 1: Normal
   - 2: Expired
   - 3: Cancelled