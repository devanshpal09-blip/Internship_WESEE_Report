import { Router } from "express";
import rateLimit from "express-rate-limit";
import { currentUser, forgotPassword, login, logout, register } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in 15 minutes." }
});

export const authRouter = Router();
authRouter.post("/register", authLimiter, register);
authRouter.post("/login", authLimiter, login);
authRouter.get("/me", requireAuth, currentUser);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", authLimiter, forgotPassword);
