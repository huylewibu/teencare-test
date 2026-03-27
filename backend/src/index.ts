import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import appRoutes from "./routes/app.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "TeenCare backend is running",
  });
});

app.use("/api", appRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});