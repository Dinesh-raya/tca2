# TCA API Documentation

## Authentication

### Login
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "user",
    "password": "password"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "token": "jwt_token", "user": { ... } }`

### Register (Admin Only)
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Headers:** `x-auth-token: <admin_token>`
- **Body:**
  ```json
  {
    "username": "newuser",
    "password": "password",
    "securityKey": "key"
  }
  ```

### Change Password
- **URL:** `/api/auth/change-password`
- **Method:** `POST`
- **Headers:** `x-auth-token: <token>`
- **Body:**
  ```json
  {
    "oldPassword": "old",
    "newPassword": "new",
    "securityKey": "key"
  }
  ```

## Rooms

### List Rooms
- **URL:** `/api/rooms`
- **Method:** `GET`
- **Success Response:** `["General", "Random", ...]`

## Admin

### Grant Room Access
- **URL:** `/api/admin/grant-room-access`
- **Method:** `POST`
- **Headers:** `x-auth-token: <admin_token>`
- **Body:**
  ```json
  {
    "username": "user",
    "roomName": "PrivateRoom"
  }
  ```

## System

### Health Check
- **URL:** `/health`
- **Method:** `GET`
- **Success Response:** `{ "status": "healthy", ... }`
