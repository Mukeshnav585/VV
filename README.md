# ChatApp — WhatsApp-style Real-Time Chat

Full-stack real-time private messaging app built with Next.js, Node.js, Socket.io, and MongoDB.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Git

---

## 1. Clone & Setup

```bash
git clone <your-repo>
cd chat-app
```

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (see below)
npm run dev
```

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/chatapp
JWT_SECRET=your_super_secret_key_min_32_chars
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Seed Admin User
```bash
npm run seed
# Creates: admin@chatapp.com / Admin@123456
# ⚠️ Change the password after first login!
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local
npm run dev
```

### Frontend `.env.local`
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

App runs at: **http://localhost:3000**

---

## Project Structure

```
chat-app/
├── backend/
│   ├── server.js          # Entry point
│   ├── app.js             # Express config
│   ├── config/db.js       # MongoDB connection
│   ├── models/            # User, Chat, Message
│   ├── controllers/       # Business logic
│   ├── routes/            # API routes
│   ├── middleware/        # Auth + Admin guards
│   ├── socket/            # Socket.io handler
│   └── scripts/           # Seed scripts
│
└── frontend/
    └── src/
        ├── app/           # Next.js App Router pages
        ├── components/    # UI components
        ├── context/       # AuthContext, SocketContext
        ├── hooks/         # useMessages, useOnlineUsers, useTyping
        ├── services/      # API service layer
        ├── types/         # TypeScript interfaces
        └── utils/         # Helpers
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/users` | ✅ | All users |
| GET | `/api/users/search?q=` | ✅ | Search users |
| POST | `/api/chats` | ✅ | Get/create chat |
| GET | `/api/chats` | ✅ | My chats |
| GET | `/api/messages/:chatId` | ✅ | Message history |
| PATCH | `/api/messages/:chatId/read` | ✅ | Mark as read |
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/users` | Admin | All users |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/admin/chats` | Admin | All chats |
| DELETE | `/api/admin/messages/:id` | Admin | Delete message |

---

## Socket.io Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join_chat` | client→server | `chatId` | Join a chat room |
| `leave_chat` | client→server | `chatId` | Leave a chat room |
| `send_message` | client→server | `{chatId, receiverId, text}` | Send a message |
| `receive_message` | server→client | `Message` | New message received |
| `update_online_users` | server→all | `string[]` | Online user IDs |
| `new_message_notification` | server→client | `{chatId, senderId, text}` | Notification for inactive chat |
| `typing_start` | client→server | `{chatId}` | User started typing |
| `typing_stop` | client→server | `{chatId}` | User stopped typing |
| `user_typing` | server→room | `{userId, chatId}` | Typing indicator |
| `user_stopped_typing` | server→room | `{userId, chatId}` | Stopped typing |

---

## Deployment

### MongoDB Atlas
1. Create free M0 cluster
2. Add DB user + whitelist `0.0.0.0/0`
3. Copy connection string → `MONGO_URI`

### Backend → Render
1. New Web Service → connect `backend/` repo
2. Build: `npm install` | Start: `node server.js`
3. Add env vars
4. After deploy, run seed: `node scripts/seedAdmin.js`

### Frontend → Vercel
1. Import `frontend/` repo
2. Framework: Next.js
3. Set `NEXT_PUBLIC_BACKEND_URL` to Render URL
4. Deploy

---

## Features

- ✅ Email + password auth with JWT
- ✅ Real-time 1-to-1 messaging via Socket.io
- ✅ Online/offline status with last seen
- ✅ Typing indicators
- ✅ Message read receipts
- ✅ Persistent chat history (MongoDB)
- ✅ WhatsApp-style dark UI
- ✅ Mobile responsive
- ✅ Admin dashboard (stats, user management)
- ✅ Role-based access control
- ✅ Message pagination
- ✅ Search users
- ✅ Auto-scroll chat window
- ✅ Secure: bcrypt, JWT, input validation, helmet
