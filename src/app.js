import express from "express";
import router from "./routes/auth.routes.js";
import problemRouter from "./routes/problem.routes.js";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/auth", router);
app.use("/problems", problemRouter);
export default app;
