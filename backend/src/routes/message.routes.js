import { Router } from "express";
import { sendMessage, getMessages, getSidebarUsers } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All message routes are protected
router.use(verifyJWT);

router.get("/users", getSidebarUsers);       // GET /api/messages/users
router.get("/:receiverId", getMessages);     // GET /api/messages/:receiverId
router.post("/send/:receiverId", sendMessage); // POST /api/messages/send/:receiverId

export default router;