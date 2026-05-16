# Auth Module Testing Guide (Postman)

This document provides examples for testing the JWT Authentication System using Postman.

## Base URL
`http://localhost:5000/api/v1`

---

### 1. Register a New User

**Endpoint:** `POST /auth/register`

**Body (JSON):**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "role": "ADMIN" // Optional, defaults to SALES
}
```

**Expected Response (201 Created):**
- Returns `user` object (without passwordHash) and an `accessToken`.
- Sets a `refreshToken` in an HttpOnly cookie.

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Expected Response (200 OK):**
- Returns `user` object and a new `accessToken`.
- Sets a new `refreshToken` HttpOnly cookie.

---

### 3. Get Current User Profile (Protected Route)

**Endpoint:** `GET /auth/me`

**Headers:**
`Authorization: Bearer <your_access_token>`

**Expected Response (200 OK):**
- Returns the current `user` profile data.

---

### 4. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Headers:** None (The `refreshToken` cookie is automatically sent by the browser/Postman)

**Expected Response (200 OK):**
- Returns a new `accessToken`.
- Refreshes the `refreshToken` HttpOnly cookie.

---

### 5. Logout

**Endpoint:** `POST /auth/logout`

**Headers:** None

**Expected Response (200 OK):**
- Clears the `refreshToken` HttpOnly cookie.

---

## Lead Management

All routes require `Authorization: Bearer <your_access_token>`.

### 6. Create Lead

**Endpoint:** `POST /leads`

**Body (JSON):**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "source": "WEBSITE"
}
```

**Expected Response (201 Created):**
```json
{
  "status": "success",
  "message": "Lead created successfully",
  "data": {
    "lead": {
      "_id": "682781...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "status": "NEW",
      "source": "WEBSITE",
      "createdBy": { "firstName": "John", "lastName": "Doe", "email": "john@example.com" },
      "createdAt": "2026-05-16T18:00:00.000Z"
    }
  }
}
```

---

### 7. Get All Leads — Advanced Querying Examples

All query parameters are optional and combine with AND logic.

**7a. Basic Pagination:**
```
GET /leads?page=1&limit=20
```

**7b. Filter by status:**
```
GET /leads?status=NEW
```

**7c. Filter by source:**
```
GET /leads?source=INSTAGRAM
```

**7d. Combined filters (status + source):**
```
GET /leads?status=QUALIFIED&source=REFERRAL
```

**7e. Search by name or email:**
```
GET /leads?search=jane
GET /leads?search=gmail.com
```

**7f. Combined filters + search:**
```
GET /leads?status=NEW&source=WEBSITE&search=john
```

**7g. Sort by oldest first:**
```
GET /leads?sortBy=createdAt&sortOrder=asc
```

**7h. Sort by name alphabetically:**
```
GET /leads?sortBy=name&sortOrder=asc
```

**7i. Date range filter:**
```
GET /leads?fromDate=2026-01-01&toDate=2026-06-30
```

**7j. Everything combined:**
```
GET /leads?status=CONTACTED&source=WEBSITE&search=smith&sortBy=name&sortOrder=asc&fromDate=2026-01-01&toDate=2026-12-31&page=1&limit=10
```

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Leads retrieved successfully",
  "data": {
    "leads": [ ... ]
  },
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 8. Get Single Lead

**Endpoint:** `GET /leads/:id`

---

### 9. Update Lead

**Endpoint:** `PATCH /leads/:id`

**Body (JSON):**
```json
{
  "status": "CONTACTED"
}
```

---

### 10. Delete Lead (Admin Only)

**Endpoint:** `DELETE /leads/:id`

**Expected Response:** `204 No Content`

---

### 11. Lead Stats (Dashboard Widget)

**Endpoint:** `GET /leads/stats`

**Expected Response (200 OK):**
```json
{
  "status": "success",
  "message": "Lead statistics retrieved",
  "data": {
    "stats": {
      "NEW": 15,
      "CONTACTED": 8,
      "QUALIFIED": 5,
      "LOST": 2
    }
  }
}
```

