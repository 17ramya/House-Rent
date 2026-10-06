# RentEase - house rent application

A MERN house-rental app: **MongoDB + Express** in `backend/`, **React (Create
React App) + MUI + antd** in `frontend/`. There are three kinds of account -
**Renter**, **Owner** and **Admin** - and an owner may only publish properties
once an admin has approved the account.

A deployment does not need MongoDB: unless it is switched off, the backend runs
on a built-in **simple database** (a small JSON store seeded with an admin) so
sign up, sign in and the admin pages work with no connection string. See
[Simple database](#simple-database-no-mongodb-needed).

- [1. What you need](#1-what-you-need)
- [2. Run it locally](#2-run-it-locally)
- [3. Accounts and how to log in](#3-accounts-and-how-to-log-in)
- [4. Check it works (copy-paste commands)](#4-check-it-works-copy-paste-commands)
- [5. Project structure](#5-project-structure)
- [6. API endpoints](#6-api-endpoints)
- [7. Troubleshooting](#7-troubleshooting)
- [8. Deploying on Vercel](#8-deploying-on-vercel)
  - [Simple database (no MongoDB needed)](#simple-database-no-mongodb-needed)
- [9. Known limits](#9-known-limits)

## 1. What you need

| Tool | Version used here | Check it | Get it |
| --- | --- | --- | --- |
| Node.js | 18 or newer (20 recommended) | `node -v` | https://nodejs.org |
| npm | 9 or newer | `npm -v` | comes with Node |
| MongoDB | 6 or 7, either locally or a free Atlas cluster | `Get-Service MongoDB` (Windows) | https://www.mongodb.com/try/download/community |

The commands below are PowerShell (Windows). On macOS or Linux they are the
same except for starting MongoDB (`brew services start mongodb-community`).

## 2. Run it locally

You need **two terminals**, with MongoDB running in the background.

### Terminal 1 - the API (port 8001)

```powershell
# 1. MongoDB must be running. On Windows it is a service:
net start MongoDB        # "already started" is fine
Get-Service MongoDB      # Status should be "Running"

# 2. Install the backend
cd backend
npm install

# 3. Create backend/.env - git-ignored, so secrets are never committed
@'
MONGO_DB=mongodb://127.0.0.1:27017/renteasy
JWT_KEY=change-me-to-a-long-random-string
'@ | Set-Content -Encoding utf8 .env

# 4. Create the admin account (see section 3)
npm run create-admin -- admin@renteasy.com Admin@123 "Site Admin"

# 5. Start the API
npm start
```

Expected output:

```
Server is running on port 8001
Connected to MongoDB database "renteasy"
```

`npm run dev` runs the same server under nodemon, restarting on every save.

> Skipping step 3 still works locally: the API reports `MONGO_DB is not set` and
> falls back to `mongodb://127.0.0.1:27017/renteasy`. Set it explicitly when you
> use Atlas, another machine or a deployment.

### Terminal 2 - the app (port 3000)

```powershell
cd frontend
npm install
npm start
```

Open **http://localhost:3000**. The dev server forwards every `/api/...` request
to port 8001 (`"proxy"` in `frontend/package.json`), so the code needs no
hostname and there is no CORS setup.

## 3. Accounts and how to log in

| Account | How it is created | Where signing in lands you |
| --- | --- | --- |
| **Admin** | `npm run create-admin -- <email> <password> ["Full Name"]` | `/adminhome` |
| **Renter** | the Sign up page, choosing `Renter` | `/renterhome` |
| **Owner** | the Sign up page, choosing `Owner` | `/ownerhome` - only after an admin has granted the account, otherwise login replies *"Your account is not yet confirmed by the admin"* |

The register form deliberately offers only **Renter** and **Owner**, so the admin
account can only be created with the command below - that is why a fresh database
has no admin to log in with.

```powershell
cd backend
npm run create-admin -- admin@renteasy.com Admin@123 "Site Admin"   # create it
npm run create-admin -- admin@renteasy.com NewPass@456              # reset the password
```

Then sign in at http://localhost:3000/login with `admin@renteasy.com` /
`Admin@123`. The email is stored exactly as typed and login compares it exactly,
so keep the same capitalisation.

The admin pages are **All users** (approve or revoke an owner with the
Granted/Ungranted button), **All properties** and **All bookings**.

On a deployment that has no MongoDB this admin account is seeded automatically
instead (see *Simple database* in section 8), so you can sign in there without
running any command.

## 4. Check it works (copy-paste commands)

With both servers running:

```powershell
# the API is alive and connected to MongoDB
Invoke-RestMethod http://127.0.0.1:8001/api/health | ConvertTo-Json

# sign up a renter
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8001/api/user/register `
  -ContentType 'application/json' `
  -Body '{"name":"Test Renter","email":"renter@test.com","password":"Passw0rd!","type":"Renter"}'

# sign in
$login = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8001/api/user/login `
  -ContentType 'application/json' `
  -Body '{"email":"renter@test.com","password":"Passw0rd!"}'
$login.user.type                       # Renter
$login.token                           # the JWT the app stores

# an admin-only page, with the admin token
$admin = Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8001/api/user/login `
  -ContentType 'application/json' `
  -Body '{"email":"admin@renteasy.com","password":"Admin@123"}'
Invoke-RestMethod -Uri http://127.0.0.1:8001/api/admin/getallusers `
  -Headers @{ Authorization = "Bearer $($admin.token)" } | ConvertTo-Json -Depth 3
```

`/api/health` answers `{"status":"ok","db":"connected"}` when the database is
reachable, and `"db":"disconnected"` when it is not. When it is not, the data
routes answer **HTTP 503** with a message naming the cause instead of hanging.

## 5. Project structure

```
backend/
  index.js                 entry: middlewares, routes, /api/health, exports the app
  config/connect.js        MongoDB connection (MONGO_DB, local fallback)
  config/databaseMode.js   chooses MongoDB or the built-in simple database
  config/uploads.js        where uploaded photos live (UPLOAD_DIR; /tmp/uploads on Vercel)
  db/                      simple database: simpleModel.js (JSON store), seed.js (admin)
  controllers/             userController, ownerController, adminController
  middlewares/             authMiddlware.js - verifies the Bearer token
  routes/                  userRoutes (/api/user), ownerRoutes (/api/owner), adminRoutes (/api/admin)
  schemas/                 userModel, propertyModel, bookingModel
  scripts/createAdmin.js   npm run create-admin
  uploads/                 property photos (sample.png is committed, the rest ignored)
frontend/
  src/api.js               API_BASE_URL and apiErrorMessage - the only file that knows the API address
  src/App.js               routes: /login /register /forgotpassword /adminhome /ownerhome /renterhome
  src/modules/common/      Home, Login, Register, ForgotPassword
  src/modules/admin/       AdminHome, AllUsers, AllProperty, AllBookings
  src/modules/user/        Owner/*, renter/*
vercel.json                deploys both halves as two Vercel services
```

## 6. API endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | - | status and database state |
| POST | `/api/user/register` | - | create a Renter or an Owner |
| POST | `/api/user/login` | - | sign in, returns a JWT valid for 1 day |
| POST | `/api/user/forgotpassword` | - | set a new password by email |
| POST | `/api/user/getuserdata` | Bearer | the signed-in user |
| GET | `/api/user/getAllProperties` | - | every property (the home page) |
| POST | `/api/user/bookinghandle/:propertyid` | Bearer | book a property |
| GET | `/api/user/getallbookings` | Bearer | the renter's bookings |
| POST | `/api/owner/postproperty` | Bearer | add a property (multipart, field `propertyImages`) |
| GET | `/api/owner/getallproperties` | Bearer | the owner's properties |
| PATCH | `/api/owner/updateproperty/:propertyid` | Bearer | update a property (multipart, field `propertyImage`) |
| DELETE | `/api/owner/deleteproperty/:propertyid` | Bearer | delete a property |
| GET | `/api/owner/getallbookings` | Bearer | bookings on the owner's properties |
| POST | `/api/owner/handlebookingstatus` | Bearer | accept or reject a booking |
| GET | `/api/admin/getallusers` | Bearer | all users |
| POST | `/api/admin/handlestatus` | Bearer | grant or revoke an owner |
| GET | `/api/admin/getallproperties` | Bearer | all properties |
| GET | `/api/admin/getallbookings` | Bearer | all bookings |
| GET | `/uploads/<file>` | - | a property photo |

*Bearer* means `Authorization: Bearer <token>` with the token from
`/api/user/login`.

## 7. Troubleshooting

| What you see | Cause | Fix |
| --- | --- | --- |
| *Could not reach the API* when signing in or up | the backend is not running, or not on port 8001 | `cd backend` and `npm start`; then `Invoke-RestMethod http://127.0.0.1:8001/api/health` |
| On the deployment, sign in / sign up / admin do nothing | the deploy predates the built-in simple database, or `USE_SIMPLE_DB=false` with no reachable `MONGO_DB` | redeploy `main`; sign in with `admin@renteasy.com` / `Admin@123`; `.../api/health` must report "db":"simple" (section 8) |
| *The database is not connected...* (HTTP 503) | `MONGO_DB` is missing or unreachable, or MongoDB is stopped | locally `Get-Service MongoDB` / `net start MongoDB`; for Atlas allow your IP; on a deployment leave `MONGO_DB` unset (built-in simple database) |
| Sign in says *User not found* | the email differs from the one registered (login is case-sensitive) | use the exact email, or register again |
| Sign in says *Invalid email or password* | wrong password | use "Forgot password", or reset an admin with `npm run create-admin -- <email> <new-password>` |
| No admin account, `/adminhome` out of reach | the register form has no Admin option | `cd backend` then `npm run create-admin -- admin@renteasy.com Admin@123` |
| An owner reads *Your account is not yet confirmed by the admin* | owner accounts start as `ungranted` | sign in as admin, All users, press **Granted** |
| On the owner's Add Property page **Submit form** does nothing and *All Properties* stays empty | an older build wrote the photo to the read-only `backend/uploads` on Vercel, so multer failed and only the browser console said so | redeploy `main` - a deployment stores photos in `/tmp/uploads` on its own and any failure is now shown as a message |
| The admin tables are empty | that is the data, not a bug | add properties and bookings with the app; check the database name in `backend/.env` |
| Blank page right after signing in | an old build, or a session left in `localStorage` by one | redeploy `main` - signing in now loads the role's home directly; clear the site data if an old session lingers |
| `npm install` fails on Node 22 | old lockfiles against a new npm | use Node 20, or `npm install --legacy-peer-deps` |
| *Port already in use* | something else holds 3000 or 8001 | `Get-NetTCPConnection -LocalPort 8001 -State Listen`; set `$env:PORT` before `npm start` |
| A freshly uploaded photo 404s | photos are served from `/uploads/<filename>` | locally they persist; on Vercel see section 9 |

Starting over with an empty database:

```powershell
mongosh "mongodb://127.0.0.1:27017/renteasy" --eval "db.dropDatabase()"
cd backend
npm run create-admin -- admin@renteasy.com Admin@123 "Site Admin"   # always re-create the admin
```

## 8. Deploying on Vercel

One Vercel project serves both halves. `vercel.json` declares two **services** -
`frontend` (Create React App) and `backend` (Express) - and three rewrites:
`/api/*` and `/uploads/*` go to the backend service, everything else to the
frontend. Neither service is public on its own, so those rewrites are the only
way in, and the app can call the API with same-origin `/api/...` URLs.

1. **Import the repository** at https://vercel.com/new and leave *Root
   Directory* as the repository root - `vercel.json` sets each service's root.
   The frameworks are detected from that file, so add no build or output settings.
2. **Environment Variables** (Project -> Settings -> Environment Variables), for
   Production *and* Preview if you use preview deployments:

   | Name | Value |
   | --- | --- |
   | `JWT_KEY` | any long random string |
   | `MONGO_DB` | *optional* - left unset, the deployment runs on the built-in simple database. Set it (plus `USE_SIMPLE_DB=false`) to use MongoDB instead - an Atlas user name that is an email needs `@` written as `%40` |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | *optional* - the admin the simple database is seeded with (defaults `admin@renteasy.com` / `Admin@123`) |
   | `UPLOAD_DIR` | *optional* - where property photos are written; a deployment uses `/tmp/uploads` on its own, see section 9 |

   Do **not** set `REACT_APP_API_BASE_URL`. The built app calls the same origin
   and the rewrites take `/api/...` to the backend service. Nothing else is
   needed: with no `MONGO_DB` the deployment signs up, signs in and reaches
   `/adminhome` out of the box.

   **Every value in that table is a secret.** It is typed into Vercel, never
   into the repository: `backend/.env` (git-ignored) holds it locally and
   `backend/.env.example` keeps placeholders. A connection string that reaches a
   commit stays in the git history even after the line is removed, so if one ever
   does, rotate the database password.
3. **Redeploy** after adding or changing environment variables:
   Deployments -> the latest one -> Redeploy. (The first deploy already works.)
4. **Verify** the deployment:

   ```powershell
   Invoke-RestMethod https://<your-project>.vercel.app/api/health | ConvertTo-Json
   ```

   `"db":"simple"` means the built-in simple database is in use and
   `"db":"connected"` means MongoDB is. If it says `"disconnected"` (you set
   `USE_SIMPLE_DB=false` but `MONGO_DB` is missing or unreachable) sign-in,
   sign-up and the admin pages cannot work, and the login page says *"The
   database is not connected..."* instead of doing nothing.
5. **Sign in** at `https://<your-project>.vercel.app/login` - the admin is the
   seeded `admin@renteasy.com` / `Admin@123` unless you set `ADMIN_EMAIL` /
   `ADMIN_PASSWORD` - then register a Renter and an Owner and grant the owner
   from the admin's *All users* page.

### Simple database (no MongoDB needed)

So that a deployment works without MongoDB - the thing that made sign in, sign
up and the admin pages do nothing on an early deploy - the backend carries a
built-in **simple database**. `backend/config/databaseMode.js` selects it
automatically on Vercel (set `USE_SIMPLE_DB=true` to force it anywhere, or
`USE_SIMPLE_DB=false` to force MongoDB). In that mode `backend/db/simpleModel.js`
hands the three schema files a small JSON-file-backed model with the same API as
Mongoose (`findOne`, `find`, `new Model`, `save`, `findByIdAndUpdate`, ...), so
the controllers are unchanged and `requireDatabase` in `index.js` no longer
turns requests away with a 503.

- The store lives in `SIMPLE_DB_DIR` - `backend/data` locally,
  `/tmp/renteasy-db` on Vercel. Files are created on first use; `backend/data`
  is git-ignored.
- On boot it is seeded with the admin account from step 2 (via `db/seed.js`), so
  `/adminhome` is reachable immediately. `npm run create-admin -- <email>
  <password>` also works in this mode.
- `/api/health` reports `"db":"simple"`.
- **Not permanent.** `/tmp` is emptied when a Vercel instance is recycled, so
  accounts and listings can disappear between visits. It is meant to demo the
  app with no setup - pair it with `USE_SIMPLE_DB=false` and `MONGO_DB` for
  data that persists.

## 9. Known limits

- **Uploaded photos are temporary on Vercel.** A deployment writes them to
  `/tmp/uploads` - `backend/config/uploads.js` picks that directory on Vercel
  because the rest of a deployed filesystem is read-only - and `/tmp` is
  emptied when a function instance is recycled. A deployed demo should
  therefore keep using photos that already exist (`backend/uploads/sample.png`)
  or move uploads to real storage (Cloudinary, S3, GridFS). Only
  `backend/config/uploads.js` and `backend/routes/ownerRoutes.js` need changing.
- **Simple-database data is temporary too** - see *Simple database* above.
- **Forgot password** sets a new password for any email in one step and sends
  nothing. Fine for a demo, unsafe for production.
- **Sessions last one day** and live in `localStorage`; there is no refresh token
  and no logout endpoint, so clearing site data signs you out.
- **Both services stay private.** If the API ever needs its own hostname, add a
  rewrite for it in `vercel.json` instead of exposing the service directly.



