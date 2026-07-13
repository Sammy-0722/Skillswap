require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB= require('./db');
const cors = require('cors');


const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const matches = require('./routes/matches');
const sessionRoutes = require('./routes/session'); 
const messageRoutes = require('./routes/message');     
const Message = require('./models/message');
const Session = require('./models/session');
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
connectDB();
app.use(express.json());
app.use('/api/profile',profileRoutes);
app.use("/api/auth",authRoutes);
app.use('/api/matches', matches);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.get("/",(req,res)=>{
    res.send("hello");
});
const server = http.createServer(app);
 
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
});
 
// Authenticate every socket connection using the same JWT you already issue on login/register.
// The frontend sends the token via `auth: { token }` when connecting (see socket.js on the frontend).
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error("Authentication required"));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded.user; // { id, email }
        next();
    } catch (err) {
        next(new Error("Invalid token"));
    }
});
 
io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.email}`);
 
    // Client asks to join a specific session's chat room.
    // We verify they're actually a participant before letting them join.
    socket.on("join_session", async (sessionId) => {
        try {
            const session = await Session.findById(sessionId);
            if (!session) return;
 
            const isParticipant =
                session.sender.toString() === socket.user.id ||
                session.receiver.toString() === socket.user.id;
 
            if (!isParticipant) return;
 
            socket.join(sessionId);
        } catch (err) {
            console.error("join_session error:", err.message);
        }
    });
 
    // Client sends a new message.
   socket.on("send_message", async ({ sessionId, text }) => {
        try {
            if (!text || !text.trim()) return;

            const session = await Session.findById(sessionId);
            if (!session) return;

            const isSender = session.sender.toString() === socket.user.id;
            const isReceiver = session.receiver.toString() === socket.user.id;
            if (!isSender && !isReceiver) return;

            // The receiver of the MESSAGE is whichever participant did NOT send it
            const messageReceiver = isSender ? session.receiver : session.sender;

            const message = new Message({
                sessionId: sessionId,
                sender: socket.user.id,
                receiver: messageReceiver,
                text: text.trim(),
            });
            await message.save();

            io.to(sessionId).emit("receive_message", {
                id: message._id,
                text: message.text,
                senderId: socket.user.id,
                createdAt: message.createdAt,
            });
        } catch (err) {
            console.error("send_message error:", err.message);
        }
    });
 
    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.user?.email}`);
    });
});
 
server.listen(8000, () => {
    console.log('server is running on the 8000 port');
});
