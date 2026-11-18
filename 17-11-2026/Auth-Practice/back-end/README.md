# Customer Login System

A starter full-stack customer login project matching the supplied blue login-screen reference.

## Stack
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: bcrypt password hashing + JWT in an HttpOnly cookie

## Requirements
- Node.js 18 or newer
- PostgreSQL 13 or newer

## 1. Create the database
Open PostgreSQL (for example, with pgAdmin or `psql`) and run `database.sql` to create the database:
```bash
psql -U postgres -f database.sql
```
Then connect to the new `customer_login` database and run `schema.sql` to create the `users` table:
```bash
psql -U postgres -d customer_login -f schema.sql
```

## 2. Configure environment
Copy `.env.example` to `.env`, then set:
- `DATABASE_URL` to your local PostgreSQL connection string
- `JWT_SECRET` to a random secret of at least 32 characters
- `DB_SSL=true` only if your hosted database requires SSL

Example local connection:
```env
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/customer_login
JWT_SECRET=use_a_long_random_secret_value_here_123456
```

## 3. Install and run
```bash
npm install
npm run dev
```
Open http://localhost:3000

For normal start:
```bash
npm start
```

## 4. Create your customer account
Select **Create an account** beneath the login button. Enter your name, email address, and a password of at least eight characters, then confirm it. The form creates the account through `/api/auth/register` and returns you to login with your email prefilled.

## API routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | App and database health |
| POST | `/api/auth/register` | Create a customer account |
| POST | `/api/auth/login` | Log in and set auth cookie |
| GET | `/api/auth/me` | Return current logged-in customer |
| POST | `/api/auth/logout` | Clear auth cookie |
| POST | `/api/auth/forgot-password` | Safe placeholder response for reset request |

## Important security notes
- Passwords are hashed with bcrypt; plain-text passwords are never stored.
- SQL uses parameterized queries.
- Login and registration are rate-limited.
- The JWT is stored in an HttpOnly, SameSite=Strict cookie, not localStorage.
- In production, use HTTPS, set `NODE_ENV=production`, use a strong secret, configure database SSL as required, and review origin/CSRF protections for your deployment.
- The forgot-password route is only a placeholder. It does not send email or change passwords. A real password reset requires a verified email provider and single-use, expiring reset tokens.
- Before public deployment, add a registration abuse-prevention strategy, monitoring, backups, and a proper production security review.

## Troubleshooting
- `ECONNREFUSED`: PostgreSQL is not running or host/port is wrong.
- `password authentication failed`: check the PostgreSQL username and password in `DATABASE_URL`.
- `database "customer_login" does not exist`: run the database creation command.
- `JWT_SECRET` error: set a secret of at least 32 characters in `.env`.
