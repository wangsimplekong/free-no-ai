# Authentication API Documentation

## Overview
This document describes the authentication endpoints for the FreenoAI backend API.

Base URL: `/api/auth`

## Endpoints

### Register User
Creates a new user account.

```http
POST /api/auth/register
```

#### Request Body
```json
{
  "username": "string",     // Required: Valid email address
  "password": "string",  // Required: Min 8 characters, must contain uppercase, lowercase, number, and special char
  "code": "string", // Required: 验证码
  "register_source": "number" // Required: '注册来源：1-手机号，2-微信，3-邮箱，4-谷歌',
}
```

#### Response
```json
{
  "code": 201,
  "message": "Registration successful",
  "data": {
    "token": "string",        // JWT access token
    "refreshToken": "string", // JWT refresh token
    "user": {
      "id": "string",
      "phone": "string",
      "email": "string",
      "username": "string",
      "nickname": "string",
      "avatar_url": "string",
      "created_at": "string"
    }
  },
  "timestamp": 1700000000000
}
```

#### Error Responses
- `400 Bad Request`: Invalid input data
  ```json
  {
    "code": 400,
    "message": "Email already registered",
    "timestamp": 1700000000000
  }
  ```

### Login
Authenticates a user and returns tokens.

```http
POST /api/auth/login
```

#### Request Body
```json
{
  "username": "string",    // Required: Valid email address
  "password": "string"  // Required: User's password
}
```

#### Response
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "string",        // JWT access token
    "refreshToken": "string", // JWT refresh token
    "user": {
      "id": "string",
      "phone": "string",
      "email": "string",
      "username": "string",
      "nickname": "string",
      "avatar_url": "string",
      "created_at": "string"
    }
  },
  "timestamp": 1700000000000
}
```

#### Error Responses
- `400 Bad Request`: Invalid credentials
  ```json
  {
    "code": 400,
    "message": "Invalid credentials",
    "timestamp": 1700000000000
  }
  ```

### Login
Authenticates a user and returns tokens.

```http
POST /api/auth/loginWithCode
```

#### Request Body
```json
{
  "username": "string",    // Required: Valid email address
  "code": "string"  // Required: 验证码
}
```

#### Response
```json
{
  "code": 200,
  "message": "Login successful",
  "data": {
    "token": "string",        // JWT access token
    "refreshToken": "string", // JWT refresh token
    "user": {
      "id": "string",
      "phone": "string",
      "email": "string",
      "username": "string",
      "nickname": "string",
      "avatar_url": "string",
      "created_at": "string"
    }
  },
  "timestamp": 1700000000000
}
```

#### Error Responses
- `400 Bad Request`: Invalid credentials
  ```json
  {
    "code": 400,
    "message": "Invalid credentials",
    "timestamp": 1700000000000
  }
  ```


### Refresh Token
Generates new access and refresh tokens using a valid refresh token.

```http
POST /api/auth/refresh-token
```

#### Request Body
```json
{
  "refreshToken": "string"  // Required: Valid refresh token
}
```

#### Response
```json
{
  "code": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "expiresIn": 3600
  },
  "timestamp": 1700000000000
}
```

#### Error Responses
- `401 Unauthorized`: Invalid refresh token
  ```json
  {
    "code": 401,
    "message": "Invalid refresh token",
    "timestamp": 1700000000000
  }
  ```

### Logout
Invalidates the user's tokens.

```http
POST /api/auth/logout
```

#### Headers
```
Authorization: Bearer <token>
```

#### Response
```json
{
  "code": 200,
  "message": "Logout successful",
  "timestamp": 1700000000000
}
```

#### Error Responses
- `401 Unauthorized`: Invalid or missing token
  ```json
  {
    "code": 401,
    "message": "Unauthorized",
    "timestamp": 1700000000000
  }
  ```

## Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required or failed
- `403`: Forbidden - Insufficient permissions
- `500`: Internal Server Error - Server-side error

## Token Information
- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- All tokens are JWT format
- Include access token in Authorization header as `Bearer <token>`

## Security Notes
- Passwords must be at least 8 characters long
- Passwords must contain at least:
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character
- All endpoints use HTTPS
- Rate limiting is applied to prevent brute force attacks