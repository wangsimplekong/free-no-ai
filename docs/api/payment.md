# Payment Service API Documentation

## Base URL
```
/api/payments
```

## Endpoints

### 1. Create Payment
Creates a new payment request.

**Endpoint:** `POST /create`

**Request Body:**
```json
{
  "orderNo": "ORD123456789",
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "subject": "Premium Plan Subscription",
  "body": "Monthly subscription for Premium Plan",
  "amount": 99.00,
  "userId": "user-123"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "payUrl": "https://payment-gateway.com/pay/qr-code",
    "qrCode": "https://payment-gateway.com/pay/qr-code",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNo": "ORD123456789",
    "amount": 99.00,
    "expireTime": "2024-03-27T12:34:56.789Z"
  },
  "timestamp": 1648374246000
}
```

### 2. Complete Payment
Completes a payment for an order and activates the associated membership plan.

**Endpoint:** `POST /:orderId/complete`

**Authentication:** Required

**URL Parameters:**
- `orderId` (UUID, required): The ID of the order to complete

**Response:**
```json
{
  "code": 200,
  "message": "支付完成",
  "data": {
    "success": true
  },
  "timestamp": 1648374246000
}
```

**Error Responses:**
```json
{
  "code": 400,
  "message": "Order not found",
  "timestamp": 1648374246000
}
```
```json
{
  "code": 400,
  "message": "Order already paid",
  "timestamp": 1648374246000
}
```
```json
{
  "code": 400,
  "message": "Plan not found",
  "timestamp": 1648374246000
}
```

### 3. Get Payment Status
Retrieves the current status of a payment.

**Endpoint:** `GET /:orderNo/status`

**URL Parameters:**
- `orderNo` (string, required): The order number

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "status": "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED",
    "orderNo": "ORD123456789",
    "message": "Optional status message"
  },
  "timestamp": 1648374246000
}
```

### 4. Refresh Payment URL
Refreshes an expired payment URL.

**Endpoint:** `POST /:orderId/refresh`

**URL Parameters:**
- `orderId` (string, required): The order ID

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "payUrl": "https://payment-gateway.com/pay/qr-code",
    "qrCode": "https://payment-gateway.com/pay/qr-code",
    "orderId": "550e8400-e29b-41d4-a716-446655440000",
    "orderNo": "ORD123456789",
    "amount": 99.00,
    "expireTime": "2024-03-27T12:34:56.789Z"
  },
  "timestamp": 1648374246000
}
```

### 5. Payment Callback
Handles payment gateway callbacks.

**Endpoint:** `POST /notify`

**Request Body:**
```json
{
  "order_id": "ORD123456789",
  "trade_no": "T123456789",
  "trade_status": "SUCCESS" | "FAILED",
  "sign": "calculated-signature"
}
```

**Response:**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "success": true,
    "orderId": "ORD123456789",
    "tradeNo": "T123456789"
  },
  "timestamp": 1648374246000
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

## Notes
1. All monetary amounts are in CNY
2. Payment URLs expire after 30 minutes
3. Callbacks must include valid signatures
4. All timestamps are in ISO 8601 format
5. The complete payment endpoint will:
   - Update order status
   - Create/update membership
   - Update user quotas
   - Handle all operations in a transaction