# 🚀 Smart Leads Dashboard

<div align="center">
  <p>A production-grade, full-stack CRM dashboard built with the MERN stack (MongoDB, Express.js, React, Node.js). Designed with an emphasis on performance engineering, clean architecture, and enterprise-level security.</p>

  [![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-20-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg?style=for-the-badge&logo=docker)](https://www.docker.com/)
</div>

---

## 📖 1. Project Overview
The **Smart Leads Dashboard** is a modern B2B lead management system engineered to handle large datasets efficiently. It replaces scattered spreadsheets with a centralized, secure, and lightning-fast web application. Built with a focus on **Type Safety** (end-to-end TypeScript) and **Performance Optimization** (Compound DB Indexing, Debounced React Queries, and `.lean()` MongoDB execution).

## ✨ 2. Features
- **🔒 JWT Authentication:** Secure login/register with HttpOnly cookie-based refresh tokens.
- **🛡️ Role-Based Access Control (RBAC):** Strict data isolation. `SALES` users only see their own leads; `ADMIN` users have full visibility and deletion rights.
- **⚡ Advanced Data Table:** Sortable columns, active status badges, and skeleton loading states.
- **🔍 Optimized Search & Filters:** Debounced text search (name/email) combined with status/source dropdowns.
- **📄 Server-side Pagination:** Efficient data loading that scales to millions of records.
- **📊 Client-side CSV Export:** Instantly export filtered datasets bypassing pagination limits.
- **🐳 Production Dockerization:** Multi-stage builds orchestrated via Docker Compose.

---

## 🛠️ 3. Tech Stack

### Frontend Architecture
- **Framework:** React 19 + TypeScript (Vite)
- **Styling:** Tailwind CSS v4 + `clsx` / `tailwind-merge`
- **State Management:** Zustand (Global/Auth state) + TanStack React Query (Server caching)
- **Forms & Validation:** React Hook Form + Zod

### Backend Architecture
- **Runtime & Framework:** Node.js + Express.js + TypeScript
- **Database:** MongoDB + Mongoose ODM
- **Security:** Helmet, CORS, express-rate-limit, bcryptjs
- **Validation:** Zod (runtime DTO validation)
- **Logging:** Winston + Morgan

---

## 🏗️ 4. Architecture & Folder Structure
The project strictly follows **Clean Architecture** principles. The backend separates the Request routing (`Controller`), Business Logic (`Service`), and Database Operations (`Repository`).

```text
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/      # DB & Env validation
│   │   ├── core/        # Custom AppErrors & API Responders
│   │   ├── middlewares/ # Auth guards, Error handlers
│   │   ├── modules/     # Domain features (Auth, Leads, Health)
│   │   └── utils/       # JWT, QueryBuilder, Pagination utils
│   └── Dockerfile       # Multi-stage Alpine node build
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI (Buttons, Inputs, Modals)
│   │   ├── features/    # Domain UI (Auth pages, Leads Dashboard)
│   │   ├── hooks/       # Custom hooks (useDebounce)
│   │   ├── lib/         # Axios interceptors, utils
│   │   └── store/       # Zustand persistent stores
│   ├── nginx.conf       # SPA routing config
│   └── Dockerfile       # Multi-stage Vite build to Nginx
├── docker-compose.yml
└── .env.example
```

---

## ⚙️ 5. Deep Dives

### Authentication Flow
1. User logs in. Backend issues a short-lived `accessToken` (JSON) and a long-lived `refreshToken` (HttpOnly, Secure cookie).
2. Frontend Axios interceptors automatically attach the `accessToken` to the `Authorization` header.
3. If an API call fails with `401 Unauthorized`, the Axios interceptor catches it, automatically hits `/auth/refresh` using the cookie, updates the token in Zustand, and seamlessly retries the failed request without interrupting the user.

### RBAC (Role-Based Access Control)
Security is enforced at the **Repository Layer** using a custom `QueryBuilder`. 
- When a `SALES` user requests leads, the builder automatically injects `{ createdBy: userId }` into the MongoDB query. 
- When an `ADMIN` requests leads, this step is bypassed. This guarantees that a standard user can *never* query or manipulate data they do not own, even if they bypass the frontend UI.

### Filtering, Pagination & Search
The backend utilizes MongoDB's **ESR (Equality, Sort, Range)** indexing strategy.
- Compound indexes like `{ createdBy: 1, status: 1, createdAt: -1 }` cover the most common query patterns.
- Searches use regular expressions sanitized against **ReDoS (Regular Expression Denial of Service)** attacks.
- The React Query frontend uses `placeholderData` to keep the current table visible while fetching new pages, completely eliminating jarring layout shifts.

### CSV Export
The frontend `LeadsFilters` component fetches the currently active filtered dataset from the backend (overriding the pagination limit to `1000`). A generic, highly reusable `exportToCsv` utility then converts the JSON payload, escapes quotes/commas safely, and triggers a browser download.

---

## 🚀 6. Installation & Setup

### Option A: Running Locally (Without Docker)

**1. Prerequisites:**
- Node.js (v20+)
- MongoDB running locally on port `27017`

**2. Clone & Install:**
```bash
git clone https://github.com/yourusername/smart-leads-dashboard.git
cd smart-leads-dashboard

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

**3. Environment Variables:**
Copy the `.env.example` file to `.env` in the `backend` directory.
```bash
cp .env.example backend/.env
```

**4. Start the Application:**
Open two terminals:
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```

---

## 🐳 7. Docker Production Deployment

The entire stack is containerized for professional deployment.

1. Ensure Docker and Docker Compose are installed.
2. In the root directory, simply run:
```bash
docker-compose up --build -d
```
3. Access the application:
   - **Frontend UI:** `http://localhost:80`
   - **Backend API:** `http://localhost:5000`

### Docker Highlights
- **Nginx SPA Routing:** The frontend container uses Nginx with `try_files` to ensure React Router push-state URLs don't throw 404s.
- **Isolated Networks:** Containers communicate via the `smart_leads_network` bridge.
- **Boot Sequencing:** The backend container waits for the MongoDB container to pass its `mongosh` health check before booting, preventing crash loops.

---

## 🔌 8. API Documentation

Detailed postman examples are located in `backend/docs/postman_examples.md`.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/v1/auth/register` | Register new user | No |
| `POST` | `/api/v1/auth/login` | Login user | No |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | Yes (Cookie) |
| `GET`  | `/api/v1/leads` | Get leads (Pagination, Filters) | Yes |
| `POST` | `/api/v1/leads` | Create new lead | Yes |
| `PATCH`| `/api/v1/leads/:id` | Update a lead | Yes |
| `DELETE`| `/api/v1/leads/:id`| Delete a lead | Yes (Admin Only) |
| `GET`  | `/api/v1/leads/stats` | Get widget statistics | Yes |

---

## 💡 9. Challenges Faced & Solutions

1. **Challenge:** Complex conditional MongoDB queries resulting in nested `$and` arrays that were difficult to read and maintain.
   - **Solution:** Engineered a generic `QueryBuilder` class using the Builder Pattern. It dynamically chains `addExactMatch()`, `addSearch()`, and `addOwnership()`, resulting in clean, highly reusable repository code.
2. **Challenge:** Layout shifting when the user clicks "Next Page" on the data table.
   - **Solution:** Implemented TanStack React Query's `placeholderData` feature. This retains the previous query's data on screen while the new page loads in the background, creating a perfectly smooth UX.
3. **Challenge:** React Router throwing `404 Not Found` when refreshing a sub-route in the production Docker container.
   - **Solution:** Wrote a custom `nginx.conf` file for the frontend container utilizing `try_files $uri /index.html` to route all traffic back to the React entry point.

---

## 🔮 10. Future Improvements
- **WebSockets:** Implement real-time lead updates via `Socket.io` when multiple sales reps are modifying data simultaneously.
- **Redis Caching:** Introduce a Redis layer for the `/leads/stats` endpoint to cache dashboard widget calculations.
- **E2E Testing:** Add a comprehensive Cypress or Playwright test suite for critical user flows (Login -> Create Lead -> Filter -> Delete).

---

## 🎓 11. Learning Outcomes
Building this project solidified best practices in **Enterprise React Architecture**, **NoSQL Database Optimization**, and **DevOps Containerization**. It demonstrated the massive developer-experience benefits of maintaining strict, end-to-end Type Safety from the database schema all the way to the frontend UI components.
