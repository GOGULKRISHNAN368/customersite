# CustomerSite - Menu & Ordering System

A professional, full-stack menu and ordering system built with the MERN stack (MongoDB, Express, React, Node.js) and styled with Tailwind CSS.

## 🚀 Overview

CustomerSite provides a seamless way for customers to view menu items, filter by time of day (Morning/Evening/Night), and place orders. It includes a modern, responsive dashboard for managing menu items and tracking orders.

## ✨ Features

- **Full-Stack MERN**: Integrated Node.js backend with MongoDB Atlas.
- **Dynamic Menu**: Dishes automatically filtered by time of day.
- **Order Management**: Customers can add items to a cart and place orders.
- **Admin Dashboard**: Effortlessly manage menu items and view order history.
- **Stunning UI**: Crafted with React, Tailwind CSS, and Lucide Icons for a premium experience.
- **Real-Time Data**: Fetches and updates data directly from the database.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide React, Axios, Vite.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB Atlas.

## 📂 Project Structure

```bash
customersite/
├── backend/            # Express server and MongoDB models
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── server.js       # Entry point for backend
│   └── seed.js         # Seed data to the database
├── frontend/           # Vite-powered React application
│   ├── src/            # Source code (components, pages, etc.)
│   ├── public/         # Static assets
│   └── index.html      # Entry point for frontend
└── README.md           # Project documentation
```

## ⚙️ Installation & Usage

### 1. Clone the repository
```bash
git clone https://github.com/GOGULKRISHNAN368/customersite.git
cd customersite
```

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file with your MONGODB_URI
npm start
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

## 📜 License
This project is licensed under the ISC License.

---
Built with ❤️ by [GOGULKRISHNAN368](https://github.com/GOGULKRISHNAN368)
