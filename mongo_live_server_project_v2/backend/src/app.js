import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postRouter from "./routes/post.route.js";
import userRouter from "./routes/user.route.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendPath = path.resolve(__dirname, "../../frontend");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

// Express serves the separate frontend folder on the same port as the API.
app.use(express.static(frontendPath));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
