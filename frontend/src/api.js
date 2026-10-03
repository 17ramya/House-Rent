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

/**
 * The message to show when a request fails: whatever the API explained, or - for
 * a request that never arrived (backend not running, wrong port, deployment with
 * no database) - a hint about the two things that are usually wrong. Screens used
 * to log failures to the console only, which made a broken backend look like a
 * button that does nothing.
 */
export const apiErrorMessage = (error, fallback) =>
  (error && error.response && error.response.data && error.response.data.message) ||
  fallback ||
  'Could not reach the API. Is the backend running on port 8001?';

export default API_BASE_URL;
