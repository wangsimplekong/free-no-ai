# Order API Documentation

## Create Order
Creates a new order for a membership plan subscription.

### Endpoint
```http
POST /api/orders/create
```

### Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body
```json
{
  "plan_id": "550e8400-e29b-41d4-a716-446655440000",  // UUID of the membership plan
  "pay_type": 1                                        // Payment type (1: WeChat, 2: Alipay)
}
```

### Response
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "order_id": "123e4567-e89b-12d3-a456-426614174000",
    "order_no": "ORD1648374246123",
    "amount": 99.00,
    "pay_url": "https://payment-gateway.com/pay/qr-code",
    "expire_time": "2024-03-27T12:34:56.789Z"
  },
  "timestamp": 1648374246000
}
```

## Get Orders List
Retrieves a paginated list of orders.

### Endpoint
```http
GET /api/orders/list
```

### Headers
```http
Authorization: Bearer <token>
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| pageSize | number | No | Items per page (default: 10, max: 100) |
| status | number | No | Order status filter |
| startDate | string | No | Start date filter (ISO 8601) |
| endDate | string | No | End date filter (ISO 8601) |

### Response
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "order_no": "ORD1648374246123",
        "amount": 99.00,
        "status": 1,
        "pay_type": 1,
        "created_at": "2024-03-27T10:00:00Z",
        "expire_time": "2024-03-27T10:30:00Z",
        "t_member_plan": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "name": "Basic Plan",
          "price": 99.00
        }
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1648374246000
}
```