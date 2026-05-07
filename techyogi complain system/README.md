# Techyogi Automation - Complaint Management System

A complete full-stack Complaint Management System for Techyogi Automation.

## Features

### Customer Side
- Submit complaints with service type selection
- Upload images
- Receive unique complaint ID
- Track complaint status

### Admin Dashboard
- Secure login with OTP verification
- View all complaints with filters
- Update complaint status
- Assign technicians
- Export to PDF/Excel
- Dashboard statistics and charts
- Dark mode support

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Cloudinary
- **SMS/OTP**: Twilio
- **Export**: jsPDF + SheetJS

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create `.env` file in backend folder:
   ```bash
   cp .env.example backend/.env
   ```

4. Update environment variables in `backend/.env`

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

## Production Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Set environment variables
2. Deploy backend folder
3. Update FRONTEND_URL in backend

### Frontend Deployment (Vercel/Netlify)
1. Build frontend: `npm run build`
2. Deploy build folder
3. Update API URL in frontend

## Admin Access

Default admin phone numbers:
- +91 85111 50751
- +91 75674 90201

## Project Structure

```
techyogi-complaint-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── utils/
│       └── App.js
└── package.json
```

## License

MIT License - Techyogi Automation
