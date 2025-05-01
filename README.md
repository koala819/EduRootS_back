# Real-Time Messaging App (WhatsApp-like)

This project is a free and open-source instant messaging app inspired by WhatsApp, built with:

- **NestJS** (TypeScript) for the backend
- **Socket.io** for real-time communication
- **MongoDB** for the database
- **Next.js** for the frontend (in a separate repository)

## 🚀 Planned Features

- JWT authentication
- User management (profiles, roles)
- 1-1 and group conversations
- Sending messages (text, files, images)
- Real-time notifications
- Message history

## 🛠️ Tech Stack

- **Backend**: NestJS, Socket.io, Mongoose, TypeScript
- **Database**: MongoDB
- **Frontend**: Next.js (React, TypeScript)

## 📦 Installation (Backend)

1. **Clone the repo**
   ```bash
   git clone https://github.com/<your-user>/<your-repo>.git
   cd <your-repo>
   ```
2. **Install dependencies**
   ```bash
   pnpm install
   # or npm install
   ```
3. **Set up environment variables**
   - Create a `.env` file at the root with:
     ```env
     MONGODB_URI=mongodb://<user>:<password>@<host>:<port>/<db>
     JWT_SECRET=your_jwt_secret
     ```
4. **Start the server**
   ```bash
   pnpm start:dev
   # or npm run start:dev
   ```

## 📁 Project Structure

```
src/
  database/         # MongoDB connection
  users/            # User schema, service, controller
  teachers/         # Teacher schema
  students/         # Student schema
  root/             # Root schema/options
  ...
```

## 🔗 Frontend

The frontend (Next.js) is in a separate repository:
https://github.com/koala819/EduRootS

For now, both projects are separate. In the future, they may be merged into a monorepo if needed.

## 🤝 Contributing

- Fork the repo, create a branch, and submit your PR!
- Follow the NestJS module structure.
- Use Prettier and ESLint for formatting.

## 📝 TODO

- [ ] JWT authentication
- [ ] User REST API
- [ ] Socket.io integration
- [ ] Conversation/message management
- [ ] API documentation

---

**This project is open and welcomes all contributions!**
