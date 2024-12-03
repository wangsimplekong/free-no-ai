# Benefits API Documentation

## Overview
This API provides endpoints to retrieve user membership benefits and quota information.

## Base URL
```
/api/benefits
```

## Endpoints

### Get User Benefits
Retrieves the current user's membership benefits and quota information.

**Endpoint:** `GET /user`

**Authentication:** Required

**Response:**
```json
{
  "code": 200,
  "message": "Benefits retrieved successfully",
  "data": {
    "membership": {
      "planName": "Premium Plan",
      "level": 3,
      "expireTime": "2024-12-31T23:59:59Z",
      "status": 1
    },
    "quotas": {
      "detection": {
        "total": 100000,
        "used": 15000,
        "remaining": 85000,
        "expireTime": "2024-12-31T23:59:59Z"
      },
      "rewrite": {
        "total": 50000,
        "used": 5000,
        "remaining": 45000,
        "expireTime": "2024-12-31T23:59:59Z"
      }
    }
  },
  "timestamp": 1648374246000
}
```

**Response Fields:**
- `membership`
  - `planName` (string): Name of the current membership plan
  - `level` (number): Plan level (0: No plan, 1: Basic, 2: Standard, 3: Premium)
  - `expireTime` (string): Plan expiration time in ISO 8601 format
  - `status` (number): Membership status (1: Active, 2: Expired, 3: Cancelled)
- `quotas`
  - `detection`
    - `total` (number): Total detection quota
    - `used` (number): Used detection quota
    - `remaining` (number): Remaining detection quota
    - `expireTime` (string): Quota expiration time in ISO 8601 format
  - `rewrite`
    - `total` (number): Total rewrite quota
    - `used` (number): Used rewrite quota
    - `remaining` (number): Remaining rewrite quota
    - `expireTime` (string): Quota expiration time in ISO 8601 format

**Error Response:**
```json
{
  "code": 400,
  "message": "Failed to fetch membership data",
  "timestamp": 1648374246000
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 500 | Internal Server Error |

## Notes
1. All quotas are measured in characters
2. All timestamps are in ISO 8601 format
3. A level of 0 indicates no active membership
4. Expired quotas will show 0 for remaining amount
5. Authentication is required for all endpoints