/**
 * The single place that knows where the RentEase API lives.
 *
 * The default is *this* origin, i.e. relative `/api/...` requests, and that is
 * what both setups need:
 *
 *   - `npm start` - the dev server forwards `/api/*` to the Express server on
 *     port 8001 thanks to the "proxy" entry in `frontend/package.json`.
 *   - Vercel - `vercel.json` rewrites `/api/*` and `/uploads/*` to the internal
 *     `backend` service of the same project, so the deployed site needs no
 *     hostname and no CORS.
 *
 * A service *binding* cannot replace this: Vercel injects a binding into
 * server-side code at runtime, while this bundle is static and is executed by
 * the visitor's browser, which can never reach a service that has no public
 * rewrite. Server-side code that calls another service is where bindings
 * belong - there is none in this project, so `vercel.json` declares none.
 *
 * Set `REACT_APP_API_BASE_URL` in `frontend/.env` (Create React App reads it at
 * build/start time and bakes it into the bundle) only when the API lives on
 * another machine:
 *
 *     REACT_APP_API_BASE_URL=http://192.168.1.20:8001
 *
 * The port it must agree with is the one the backend listens on: `PORT` in
 * `backend/index.js` (default 8001).
 */
export const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/+$/, '');

export default API_BASE_URL;
