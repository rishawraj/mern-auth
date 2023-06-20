import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = await User.findById(decoded.userId).select("-password");
      req.body.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: "Not authorized, invalid token" });
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401).json({ error: "Not authorized, no token" });
    throw new Error("Not authorized, no token");
  }
});

export { protect };
