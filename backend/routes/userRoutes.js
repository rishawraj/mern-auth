// post /api/users -> resigter a user
// post /api/users/auth -> authentication a user and get token
// post /api/users/logout -> logout user and clear cookie
// get /api/users/profile -> get user profile
// put /api/users/profile -> update profile

import express from "express";
import { protect } from "../middleware/authMIddleware.js";

const router = express.Router();
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

export default router;
