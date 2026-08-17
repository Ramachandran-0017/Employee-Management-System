# Roster — Employee Management System

A full-stack employee management system:

- **Backend:** Spring Boot 3 REST API, Spring Data JPA, Spring Security with JWT auth, Bean Validation
- **Database:** PostgreSQL by default, with MySQL and in-memory H2 profiles included
- **Frontend:** React 18 (Create React App), React Router, Axios, plain CSS (no UI framework)
- **Roles:** `ADMIN`, `MANAGER`, `EMPLOYEE` — enforced on both the API (`@PreAuthorize`) and the UI (route guards + conditional rendering)

```
ems/
├── backend/     Spring Boot REST API
└── frontend/    React single-page app
```

## Role permissions

| Action                        | ADMIN | MANAGER | EMPLOYEE |
|--------------------------------|:---:|:---:|:---:|
| View full employee roster      | ✅  | ✅  | ❌ (own profile only via `/api/employees/me`) |
| Add employee                   | ✅  | ❌  | ❌  |
| Edit employee                  | ✅  | ✅  | ❌  |
| Delete employee                | ✅  | ❌  | ❌  |
| View departments               | ✅  | ✅  | ✅  |
| Add / delete departments       | ✅  | ❌  | ❌  |

## 1. Backend setup

### Requirements
Java 17+, Maven 3.9+, and one of PostgreSQL / MySQL (or nothing — the `h2` profile needs no database at all).

### Configure a database

**Option A — PostgreSQL (default)**
```sql
CREATE DATABASE ems_db;
CREATE USER ems_user WITH PASSWORD 'ems_password';
GRANT ALL PRIVILEGES ON DATABASE ems_db TO ems_user;
```
Adjust `src/main/resources/application.properties` if your credentials differ.

**Option B — MySQL**
```sql
CREATE DATABASE ems_db;
CREATE USER 'ems_user'@'%' IDENTIFIED BY 'ems_password';
GRANT ALL PRIVILEGES ON ems_db.* TO 'ems_user'@'%';
```
Run with: `mvn spring-boot:run -Dspring-boot.run.profiles=mysql`

**Option C — zero setup (H2 in-memory)**, good for a quick demo:
```
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
Data resets every restart.

### Run it
```bash
cd backend
mvn spring-boot:run
```
The API starts on `http://localhost:8080`.

On first boot, `DataSeeder` creates:
- an admin login: **admin / admin123**
- three starter departments (Engineering, Human Resources, Sales)

### Key endpoints
```
POST   /api/auth/register        { username, password, role }
POST   /api/auth/login           { username, password } -> { token, username, role }

GET    /api/employees            ADMIN, MANAGER          ?keyword= for search
GET    /api/employees/me         EMPLOYEE (own profile)
GET    /api/employees/{id}       ADMIN, MANAGER
POST   /api/employees            ADMIN
PUT    /api/employees/{id}       ADMIN, MANAGER
DELETE /api/employees/{id}       ADMIN

GET    /api/departments          ADMIN, MANAGER, EMPLOYEE
POST   /api/departments          ADMIN
PUT    /api/departments/{id}     ADMIN
DELETE /api/departments/{id}     ADMIN
```
All endpoints except `/api/auth/**` require `Authorization: Bearer <token>`.

## 2. Frontend setup

### Requirements
Node.js 18+

```bash
cd frontend
npm install
npm start
```
Opens `http://localhost:3000`. The dev server proxies `/api/*` calls to `http://localhost:8080` (see `"proxy"` in `package.json`), so make sure the backend is running first.

Sign in with `admin / admin123`, or register a new account and pick a role (in a real deployment, self-service role selection at signup would be removed — only an admin should be able to grant `ADMIN`/`MANAGER`).

### Production build
```bash
npm run build
```
Outputs static files to `frontend/build/`, which you can serve from any static host or from the Spring Boot app itself.

## Notes on security defaults

- Change `app.jwt.secret` (env var `APP_JWT_SECRET`) before deploying — the default in `application.properties` is a placeholder.
- Passwords are hashed with BCrypt.
- CORS is currently open to any `localhost` origin for local development; restrict `corsConfigurationSource()` in `SecurityConfig` for production.
- The registration endpoint lets a caller pick their own role for convenience in this demo. In production, gate role assignment behind an admin-only endpoint.
