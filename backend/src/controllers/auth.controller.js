import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ─── helpers ─────────────────────────────────────────────────────────────────

const generateTokens = async (userId) => {
  const user = await User.findById(userId);

  const accessToken = jwt.sign(
    { _id: user._id, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );

  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

// ─── controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Body: { fullName, username, password }
 * File (optional): profilePic  (multipart/form-data via multer)
 */
const signup = asyncHandler(async (req, res) => {
  const { fullName, username, password } = req.body;

  if ([fullName, username, password].some((f) => !f?.trim())) {
    throw new ApiError(400, null, "fullName, username and password are required");
  }

  const existingUser = await User.findOne({ username: username.toLowerCase() });
  if (existingUser) throw new ApiError(409, null, "Username already taken");

  let profilePicUrl = "";
  const localFile = req.file?.path;
  if (localFile) {
    const uploaded = await uploadOnCloudinary(localFile);
    if (!uploaded) throw new ApiError(500, null, "Profile picture upload failed");
    profilePicUrl = uploaded.url;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    password: hashedPassword,
    profilePic: profilePicUrl,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "Account created successfully"));
});

/**
 * POST /api/auth/login
 * Body: { username, password }
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    throw new ApiError(400, null, "Username and password are required");
  }

  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) throw new ApiError(404, null, "User not found");

  // ✅ uses the model instance method now
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, null, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Logged in successfully"));
});

/**
 * POST /api/auth/logout
 * Protected route (verifyJWT)
 */
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

/**
 * POST /api/auth/refresh-token
 * Body or cookie: refreshToken
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, null, "Unauthorized request");

  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded?._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, null, "Refresh token is expired or invalid");
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed"));
});

export { signup, login, logout, refreshAccessToken };