# Lost & Found

A modern web application for reporting and claiming lost items, featuring AI-powered matching and a secure claim process.

## Tech Stack

**Frontend:**
- React (Vite)
- CSS / Framer Motion
- Clerk (Authentication)

**Backend:**
- Node.js & Express
- Supabase (Database)
- Google Gemini AI (Item matching & Chat assistance)
- Cloudinary (Image storage)

## Features

- **Report Lost/Found Items**: Users can post items with detailed descriptions and images.
- **AI-Powered Matching**: Uses Google Gemini to analyze item descriptions and images to suggest potential matches.
- **Secure Claims Service**: Users can upload proof images to claim found items, verified by the finder.
- **Admin Dashboard**: Comprehensive dashboard for managing reported items and users.
- **Real-time Chat**: Integrated messaging system for direct communication between finders and claimers.

## Getting Started

### Prerequisites
- Node.js (v16+)
- Supabase account
- Cloudinary account
- Clerk account
- Google Cloud (Gemini API) account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd LostAndFound
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GEMINI_API_KEY=your_gemini_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_API_URL=http://localhost:5000/api
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
