import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import connectDB from "./db/index.js";

dotenv.config();
connectDB();
import User from "./models/users.js";

const createSampleUser = async () => {
  try {
    const user = await User.create({
      Fullname: "Kalyan Ram",
      username: "kalyanram360",
      email: "kalyan@example.com",
      password: "password123",
      Friends: ["friend1", "friend2"],
    });
    console.log("✅ User created:", user);
  } catch (err) {
    console.error("❌ Failed to create user:", err);
  }
};

createSampleUser();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // or your frontend origin
    methods: ["GET", "POST"],
  },
});

socketController(io);

const port = process.env.PORT || 5000;
const app = express();
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
