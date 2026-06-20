import { Router } from "express";
import {
  getMyProfile,
  getUserByUsername,
  updateProfilePic,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// All user routes are protected
router.use(verifyJWT);

router.get("/profile", getMyProfile);                                        // GET  /api/users/profile
router.get("/:username", getUserByUsername);                                 // GET  /api/users/:username
router.patch("/update-profile-pic", upload.single("profilePic"), updateProfilePic); // PATCH /api/users/update-profile-pic

export default router;