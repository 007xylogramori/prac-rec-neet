import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { 
  getAllTests, 
  getTestById, 
  createTest, 
  updateTest, 
  deleteTest, 
  deleteAllTests, 
  getTestStats,
  sendTestEmail
} from "./routes/tests";
import { signup, login, getProfile, updateProfile } from "./routes/auth";
import { authenticateToken } from "./middleware/auth";
import { connectToDatabase } from "./db/connection";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database connection
  connectToDatabase().catch(console.error);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes (no auth required)
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);

  // Protected routes (require authentication)
  app.get("/api/auth/me", authenticateToken, getProfile);
  app.put("/api/auth/profile", authenticateToken, updateProfile);

  // Test records API routes (require authentication)
  app.get("/api/tests", authenticateToken, getAllTests);
  app.get("/api/tests/stats/summary", authenticateToken, getTestStats);
  app.get("/api/tests/:id", authenticateToken, getTestById);
  app.post("/api/tests", authenticateToken, createTest);
  app.put("/api/tests/:id", authenticateToken, updateTest);
  app.delete("/api/tests/:id", authenticateToken, deleteTest);
  app.delete("/api/tests", authenticateToken, deleteAllTests);
  app.post("/api/tests/:id/send-email", authenticateToken, sendTestEmail);

  return app;
}
