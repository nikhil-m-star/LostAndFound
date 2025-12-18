# Troubleshooting Guide - Items Not Showing on Home Page

## Common Issues and Solutions

### 1. Backend Not Running
**Check:** Is the backend server running?
```bash
cd backend
npm run dev
```
You should see: `Server running on port 5000`

### 2. Missing .env File
**Check:** Does `backend/.env` exist?

**Solution:** Create `backend/.env` with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
```

**Get MongoDB URI:**
- Local MongoDB: `mongodb://localhost:27017/lost-and-found`
- MongoDB Atlas: Get connection string from your Atlas dashboard

### 3. Frontend Not Connected to Backend
**Check:** Does `frontend/.env` exist with `VITE_API_BASE`?

**Solution:** Create `frontend/.env` with:
```
VITE_API_BASE=http://localhost:5000/api
```

### 4. Database Not Seeded
**Check:** Are there items in the database?

**Solution:** Run the seed script:
```bash
cd backend
npm run seed
```

You should see: `✅ Successfully created 12 dummy items!`

### 5. CORS Issues
**Check:** Open browser console (F12) and look for CORS errors.

**Solution:** The backend already has CORS enabled. Make sure:
- Backend is running on port 5000
- Frontend is using the correct `VITE_API_BASE` URL

### 6. Database Connection Failed
**Check:** Run the test script:
```bash
cd backend
npm run test-db
```

**Solution:** 
- Verify your `MONGO_URI` is correct
- Make sure MongoDB is running (if local)
- Check MongoDB Atlas connection (if using cloud)

## Step-by-Step Debugging

1. **Check Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Visit: http://localhost:5000/api/ping
   Should return: `{"ok":true}`

2. **Check Database:**
   ```bash
   cd backend
   npm run test-db
   ```
   Should show item count

3. **Check API Endpoint:**
   Visit: http://localhost:5000/api/items
   Should return JSON array of items

4. **Check Frontend:**
   - Open browser console (F12)
   - Look for network errors
   - Check if `VITE_API_BASE` is set correctly
   - Look for console.log messages from Home.jsx

5. **Check Browser Network Tab:**
   - Open DevTools → Network tab
   - Refresh the page
   - Look for request to `/api/items`
   - Check status code (should be 200)
   - Check response body

## Quick Fix Checklist

- [ ] Backend `.env` file exists with `MONGO_URI`
- [ ] Frontend `.env` file exists with `VITE_API_BASE=http://localhost:5000/api`
- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Frontend server is running (`npm run dev` in frontend folder)
- [ ] Database is seeded (`npm run seed` in backend folder)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API call

## Still Not Working?

1. Check browser console for specific error messages
2. Check backend terminal for error logs
3. Verify MongoDB connection string is correct
4. Try accessing API directly: http://localhost:5000/api/items
5. Make sure both servers are running on different ports (backend: 5000, frontend: usually 5173)

