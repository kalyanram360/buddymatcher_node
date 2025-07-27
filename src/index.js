// import dotenv from "dotenv";
// dotenv.config({ path: "./.env" });
// import express from "express";
// import connectDB from "./db/index.js";
// import app from "./app.js";
// dotenv.config();
// connectDB();
// import User from "./models/users.js";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import socketController from "./controlers/socket.controler.js";

// const httpServer = createServer(app);
// const io = new Server(httpServer, {
//   cors: {
//     origin: "*", // or your frontend origin
//     methods: ["GET", "POST"],
//   },
// });

// socketController(io);

// const port = process.env.PORT || 5000;

// app.listen(port, () => {
//   console.log(`http://localhost:${port}`);
// });

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import connectDB from "./db/index.js";
import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import socketController from "./controlers/socket.controler.js";

// Connect to MongoDB
connectDB();

// Create HTTP server and Socket.IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Match your React frontend
    methods: ["GET", "POST"],
  },
});

// Handle sockets
socketController(io);

// Start the HTTP server (with Socket.IO attached)
const port = process.env.PORT || 5000;
httpServer.listen(port, () => {
  console.log(`Server + Socket.IO running at http://localhost:${port}`);
});
