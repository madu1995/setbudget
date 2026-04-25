# Set Budget – Responsive Full-Stack Application

A modern, responsive Single Page Application (SPA) designed to manage and split expenses for events, trips, and parties. This application provides a unified experience across Desktop and Mobile browsers.

## 🚀 Key Features
- **Event Management:** Create, track, and close multiple events or trips.
- **Responsive Dashboard:** 3-column layout on Desktop that stacks into a clean mobile view.
- **Participant Tracking:** Add attendees to events with visual avatar chips.
- **Expense splitting:** Log expenses, record who paid, and attach receipt images.
- **Real-time Recalculation:** Instantly see total budget, total spent, and remaining balance.
- **Visual Receipt Previews:** Upload and view receipt bills directly in the dashboard.

## 🛠️ Technology Stack
- **Frontend:** React (Vite), Styled-components, Axios, Context API.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (via Mongoose).
- **Storage:** Multer (Local receipt storage).

## 📁 Project Structure
```text
Set Budgets/
├── backend/            # Express API server
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Multer upload config
│   └── uploads/        # Receipt image storage
├── web/                # React SPA (Consolidated Web & Mobile)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state management
│   │   └── styles/     # Styled-components theme
└── README.md
```

## ⚙️ Installation & Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

### 2. Backend Setup
1. Open terminal in `/backend`:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *The server will run on http://localhost:5000*

### 3. Frontend Setup
1. Open a new terminal in `/web`:
   ```bash
   cd web
   npm install
   npm run dev
   ```
   *The app will run on http://localhost:5173 (or similar)*

## 📱 Mobile Usage
This application is designed to be fully responsive. To use it on your phone:
1. Ensure your phone is on the same Wi-Fi network as your computer.
2. Find your computer's local IP address (e.g., `192.168.1.5`).
3. Open your mobile browser and go to `http://YOUR_IP:5173`.
4. (Optional) Use "Add to Home Screen" in your browser menu to save it as an app.

## 📄 License
This project is for educational/personal use as part of a development sprint.
