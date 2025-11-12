# 🎓 SkillSwap - Peer-to-Peer Skill Exchange Platform

  
  **Learn skills. Teach skills. Grow together.**
  

  
## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🌟 Overview

SkillSwap is a modern web application that connects students who want to exchange knowledge and skills. Instead of traditional one-way learning, SkillSwap enables peer-to-peer education where students can teach what they know in exchange for learning what they need.

### 🎯 Problem Statement
Many students possess valuable skills but lack access to learning opportunities in areas where they want to grow. Traditional tutoring is often expensive and one-directional.

### 💡 Solution
SkillSwap creates a barter system for education where students can:
- Find peers who have skills they want to learn
- Offer their own expertise in exchange
- Connect through real-time chat
- Get AI-powered recommendations for ideal learning partners

---

## ✨ Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- User registration and login
- Profile management with avatar upload and cropping
- Add/remove skills to teach and learn

### 🔍 Discovery & Matching
- Browse all registered students
- Search and filter by skills
- AI-powered skill matching recommendations (OpenAI integration)
- View detailed user profiles

### 🤝 Skill Exchange System
- Send skill swap requests to other students
- Accept or reject incoming requests
- Track swap status (pending, accepted, rejected, completed)
- Manage all your swap requests in one place

### 💬 Real-Time Communication
- Live chat with Socket.io
- One-on-one messaging
- Typing indicators
- Message read status
- Chat history

### 📊 Dashboard & Analytics
- Personal dashboard with statistics
- View total swaps, pending requests, and active chats
- Recent activity feed
- Quick action shortcuts

### 🎨 Modern UI/UX
- Glassmorphism design
- Dark theme landing page with animated light rays
- Smooth animations with Framer Motion
- Fully responsive design
- Tailwind CSS styling

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Easy Crop** - Image cropping
- **OGL** - WebGL for light ray effects

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **OpenAI API** - AI matchmaking

### DevOps & Tools
- **Git** - Version control
- **npm** - Package management
- **dotenv** - Environment variables


## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.x or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/skillswap-platform.git
   cd skillswap-platform
```

2. **Install Backend Dependencies**
```bash
   cd server
   npm install
```

3. **Install Frontend Dependencies**
```bash
   cd ../client
   npm install
```

4. **Set Up Environment Variables** (See [Environment Variables](#environment-variables) section)

5. **Start MongoDB**
```bash
   # On Windows
   net start MongoDB
   
   # On macOS/Linux
   sudo systemctl start mongod
```

6. **Start the Backend Server**
```bash
   cd server
   npm run dev
```
   Server will run on `http://localhost:5000`

7. **Start the Frontend**
```bash
   cd client
   npm start
```
   Application will open at `http://localhost:3000`

---

## 🔐 Environment Variables

### Backend (.env in /server)

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillswap
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
```

### Frontend (.env in /client)

Create a `.env` file in the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 📁 Project Structure
```
skillswap/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Auth/         # Login, Signup, Protected Routes
│   │   │   ├── Dashboard/    # Dashboard components
│   │   │   ├── Skills/       # Skill management
│   │   │   ├── Chat/         # Chat components
│   │   │   ├── Profile/      # Profile components
│   │   │   └── LightRays/    # WebGL light effects
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (Auth, Socket)
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Helper functions
│   │   └── App.jsx           # Main App component
│   └── package.json
│
├── server/                    # Node.js Backend
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   │   ├── db.js        # MongoDB connection
│   │   │   ├── jwt.js       # JWT utilities
│   │   │   └── socket.js    # Socket.io setup
│   │   ├── models/           # Mongoose models
│   │   │   ├── User.js
│   │   │   ├── SwapRequest.js
│   │   │   ├── Chat.js
│   │   │   └── Message.js
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   └── server.js         # Entry point
│   ├── uploads/              # Uploaded files
│   └── package.json
│
└── README.md
```

---

## 📡 API Documentation

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "college": "MIT"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Users

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Search Users
```http
GET /api/users/search?skillToLearn=React
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "bio": "New bio"
}
```

#### Upload Avatar
```http
POST /api/users/:id/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <file>
```

### Swap Requests

#### Create Swap Request
```http
POST /api/swaps
Authorization: Bearer <token>
Content-Type: application/json

{
  "to": "user_id",
  "fromSkill": "React",
  "toSkill": "Node.js",
  "message": "Hey! Let's swap skills"
}
```

#### Get User's Swaps
```http
GET /api/swaps?type=sent
Authorization: Bearer <token>
```

#### Update Swap Status
```http
PUT /api/swaps/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

### Chat

#### Create or Get Chat
```http
POST /api/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "other_user_id"
}
```

#### Get Messages
```http
GET /api/chats/:chatId/messages
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/chats/:chatId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello!"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ES6+ syntax
- Follow Airbnb JavaScript Style Guide
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 🐛 Known Issues

- [ ] Mobile responsiveness needs improvement on some pages
- [ ] AI recommendations require OpenAI API key
- [ ] File upload size limited to 5MB

---

## 🔮 Future Enhancements

- [ ] Video call integration for live skill sessions
- [ ] Rating and review system after completed swaps
- [ ] Skill categories and difficulty levels
- [ ] Email notifications for swap requests
- [ ] Mobile app (React Native)
- [ ] Group learning sessions
- [ ] Skill certification system
- [ ] Integration with online learning platforms

---


## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [MongoDB](https://www.mongodb.com/) - Database
- [Socket.io](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [OpenAI](https://openai.com/) - AI recommendations

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/skillswap-platform/issues) page
2. Open a new issue with detailed description
3. Contact me via email

  

