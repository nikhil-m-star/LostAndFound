# Lost & Found - Backend

This folder contains a simple Express + MongoDB backend for the Lost & Found app.

Quick start
1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET` (and Cloudinary vars if used).
2. Install dependencies: `npm install`.
3. Start dev server: `npm run dev`.

Endpoints
- POST /api/auth/register - create user
- POST /api/auth/login - log in
- GET /api/auth/me - get current user (requires Authorization: Bearer <token>)
- POST /api/items - create item (requires auth)
- GET /api/items - list + search items
- GET /api/items/:id - get item by id

Notes
- Image uploads: the `utils/cloudinary.js` file is included and configured to use Cloudinary. Use multer in the future to accept files and upload to Cloudinary.
 - Image uploads: `POST /api/items` accepts multipart/form-data with image files in the `images` field (up to 6 files, 5MB each). Uploaded images are stored in Cloudinary and the returned item contains `images: [{ url, public_id }]`.
- This is a minimal scaffold to get you started; we can iterate with tests, validation, and file uploads next.

Frontend

- A minimal frontend lives in `../frontend`. See `frontend/README.md` for setup and run instructions.
- During development set `VITE_API_BASE` to point to this backend (e.g. `http://localhost:5000/api`).