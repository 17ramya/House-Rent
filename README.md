# RentEase - house rent application

A MERN rental demo deployed as **one Vercel project with two services**:

| Path | What it is | Local address |
| --- | --- | --- |
| `frontend/` | Create React App (React 18, MUI, react-bootstrap, antd) | http://localhost:3000 |
| `backend/` | Express API - JWT auth, multer uploads, MongoDB through mongoose | http://localhost:8001 |

## Run it locally

```bash
# API
cd backend
npm install
cp .env.example .env      # fill in MONGO_DB and JWT_KEY
npm start                 # http://localhost:8001

# app, in a second terminal
cd frontend
npm install
npm start                 # http://localhost:3000
```

Every request in the app is built from `API_BASE_URL` in `frontend/src/api.js`,
and `frontend/package.json` forwards `/api` to port 8001 with a dev-server
`proxy`, so the frontend never needs to know where the API is - locally or in
production.

## Deploying on Vercel

`vercel.json` declares the two services and the only routes that are public:

| Route | Served by | Why |
| --- | --- | --- |
| `/api/*` | `backend` | every API call in the app |
| `/uploads/*` | `backend` | property photos served by `express.static` |
| everything else | `frontend` | the React app and its static assets |

Both services are private unless a rewrite targets them, so these three rules
are the only way in. That is also why the browser asks for relative `/api/...`
URLs rather than a hostname: a service *binding* is injected into server-side
code at runtime, and this bundle is static - see the comment in
`frontend/src/api.js`. No service declares a binding, because nothing calls
another service from the server side.

Set these in the Vercel project (Settings -> Environment Variables):

| Name | Value |
| --- | --- |
| `MONGO_DB` | MongoDB connection string, reachable from the internet (e.g. MongoDB Atlas with `0.0.0.0/0` allowed) |
| `JWT_KEY` | any long random string, used to sign login tokens |
| `UPLOAD_DIR` | `/tmp/uploads` - optional, see below |

Leave `REACT_APP_API_BASE_URL` unset: empty means "the API is on this origin",
which is exactly what the rewrite above provides.

The deployment needs no build command, no output directory and no
`functions`/`builds` blocks - each service is built with its own framework
preset (`create-react-app`, `express`).

### Uploaded photos

`backend/config/uploads.js` writes and serves uploads from `UPLOAD_DIR`, and on
Vercel the only writable path is `/tmp`. Set `UPLOAD_DIR=/tmp/uploads` there to
accept uploads at all - but `/tmp` is emptied whenever the instance is recycled,
so a photo uploaded on the live site will eventually 404. For a deployment where
uploads must survive, they belong in external storage (Cloudinary, S3 or MongoDB
GridFS) instead of the filesystem.

### Checking a deployment

`GET /api/health` needs no database and no token:

```json
{ "status": "ok", "service": "house-rent-backend", "db": "connected", "time": "..." }
```

`db: "disconnected"` means `MONGO_DB` is missing or unreachable - the API is up,
but login and every listing will answer `500`. Routes are grouped in
`backend/routes/` (`/api/user`, `/api/admin`, `/api/owner`); `authMiddlware.js`
requires `Authorization: Bearer <token>` on the protected ones.
