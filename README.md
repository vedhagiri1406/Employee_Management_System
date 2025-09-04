Employee Management System (DRF + React)

Dynamic form-driven employee manager. Build custom form templates (drag & drop), then create, edit, and filter employees using those templates. Authentication is email-based with a “set password” link sent via email, plus JWT for API access.

✨ Features

Form Builder: Add fields (Text/Number/Date/Password), drag to reorder, save multiple templates.

Dynamic Employees: Create/update employees using the selected template; filters map to dynamic field keys.

Auth:

Register (username + email) → receive set-password link by email.

Login with email + password (JWT).

Forgot password, change password, resend link.

API: Django REST Framework + SimpleJWT.

UI: React + dnd-kit, simple modern styles.

🗺️ Tech Stack

Backend: Django, DRF, SimpleJWT, django-cors-headers

Frontend: React, React Router, Axios, dnd-kit

DB: SQLite (dev; swap to Postgres/MySQL in prod)

Email: SMTP or Django console backend

📦 Project Structure
backend/
  accounts/      # auth email/set-password flow + login (email+password)
  formsapp/      # FormTemplate CRUD (JSONField)
  employees/     # EmployeeRecord CRUD (JSONField keyed by template fields)
  config/        # settings, urls
  manage.py
  .env           # backend env vars

frontend/
  src/
    api/api.js
    pages/       # Login, Register, ResetPassword, ForgotPassword, ChangePassword,
                 # FormDesign (builder), EmployeeManagement, Profile
    App.js, App.css
  .env           # optional (REACT_APP_API_BASE)

🚀 Quick Start
1) Backend

Requirements: Python 3.10+, pip

cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
# (If you don't have it) pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv


Create backend/.env:

DJANGO_SECRET_KEY=dev-secret-change-me

# CORS — allow your React dev server
CORS_ALLOWED_ORIGINS=http://localhost:3000

# URLs
FRONTEND_URL=http://localhost:3000
SITE_URL=http://localhost:8000

# Email (choose ONE option)

# Option A: Console (prints links in terminal—easy for dev)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=dev@example.com

# Option B: SMTP (real emails)
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_HOST_USER=you@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password
# EMAIL_USE_TLS=true
# DEFAULT_FROM_EMAIL=you@gmail.com


Migrate & run:

python manage.py migrate
python manage.py runserver


API runs at http://127.0.0.1:8000
.

2) Frontend

Requirements: Node 18+ (or 20 LTS) & npm

cd frontend
npm install


Create frontend/.env :

REACT_APP_API_BASE=http://127.0.0.1:8000


Start:

npm start


App runs at http://localhost:3000
.

🔐 Auth Flow

Register (username + email) → backend emails a set-password link:

https://localhost:3000/reset-password/:uid/:token


User sets password (first time also activates account).

Login with email + password → store JWT access token.

Use protected pages: /forms, /employee_management, /profile.

🧠 How It Works

Form Templates (FormTemplate):

name

fields (JSON): [{ id, label, key, type, required, order }]

Employees (EmployeeRecord):

template (FK → FormTemplate, on_delete=PROTECT)

values (JSON): { [key]: value } where keys come from the template

Required field checks and basic type checks (e.g. Number) run in the serializer.

🔗 API Endpoints
Auth

POST /api/auth/register/

Body: { "username": "Vedhagiri", "email": "vedhagiri1421@gmail.com" }

Sends set-password email.

POST /api/auth/reset-password/

Body: { "uidb64": "...", "token": "...", "new_password": "StrongPass123!" }

POST /api/auth/login-email/

Body: { "email": "user@email.com", "password": "StrongPass123!" }

→ { "access": "...", "refresh": "..." }

PUT /api/auth/change-password/ (Bearer required)

Body: { "old_password": "...", "new_password": "..." }

POST /api/auth/forgot-password/

Body: { "email": "user@email.com" }

Sends reset link (active users).

POST /api/auth/resend-verification/

Body: { "email": "user@email.com" } (resends set-password if needed)

Forms

GET /api/forms/

POST /api/forms/

GET /api/forms/:id/

PUT /api/forms/:id/

DELETE /api/forms/:id/ (409 if employees reference it)

Employees

GET /api/employees/?template=<id>&first_name=Ann

POST /api/employees/

GET /api/employees/:id/

PUT /api/employees/:id/

DELETE /api/employees/:id/

Auth: All non-auth endpoints require Authorization: Bearer <access>.

🧪 Testing With Postman

Import the provided collection JSON (or build your own).

Create an Environment with:

base_url = http://127.0.0.1:8000

access_token = (blank initially)

In the login-email request → Tests:

const json = pm.response.json();
if (json.access) pm.environment.set("access_token", json.access);
if (json.refresh) pm.environment.set("refresh_token", json.refresh);


For protected requests, set Auth → Bearer Token to {{access_token}}.

Export: right-click collection → Export → Collection v2.1.

🧯 Troubleshooting

No emails?

Use console backend for dev: EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

Check backend terminal for the reset link.

CORS / 401

Ensure CORS_ALLOWED_ORIGINS includes http://localhost:3000.

Frontend must send Authorization: Bearer <access>.

PUT /api/forms/:id returns 404

Confirm you’re using the exact id returned from create. URL must be /api/forms/<id>/.

Deleting a form fails (409)

Employees reference it (on_delete=PROTECT). Delete or move those employees first.

🏗️ Production Notes

Set DEBUG=False, proper ALLOWED_HOSTS.

Use a strong DJANGO_SECRET_KEY.

Configure HTTPS & a real SMTP provider (DKIM/SPF).

Switch DB to Postgres/MySQL.

Harden JWT config, CSRF/CORS as needed.

📜 License

MIT (or your preferred license)

🙋 Support

Questions or issues? Open a GitHub issue with:

Steps to reproduce

Expected vs. actual behavior

Backend/Frontend logs (omit secrets)