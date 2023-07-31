import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc Auth user and set token.
 * @route POST /api/users/auth
 * @access Public
 */

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
    //! error on line below : cannot send header after they've been sent
    // throw new Error("Invalid email or password");
  }
});

/**
 * @desc Register a new user
 * @route POST /api/users
 * @access Public
 */

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ error: "User already exists" });
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400).json({ error: "Invalid User Data" });
    throw new Error("Invalid User Data");
  }
});

/**
 * @desc Logout user
 * @route POST /api/users/logout
 * @access Public
 */

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User Logged Out" });
});

/**
 *  Another method
 * 
 * const logoutUser = asyncHandler(async (req, res) => {
      res.clearCookie("jwt", { httpOnly: true });
      res.status(200).json({ message: "User Logged Out" });
    });
 * 
 */

/**
 * @desc get user profile
 * @route GET /api/users/profile
 * @access Private
 */

const getUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "User Profile", user: req.body.user });
});

/**
 * @desc Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.user.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404).json({ error: "User not found" });
    throw new Error("User not found");
  }
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};
