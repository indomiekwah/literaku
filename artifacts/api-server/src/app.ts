import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: ["audio/*", "application/octet-stream"], limit: "10mb" }));

app.use("/api", router);

export default app;
