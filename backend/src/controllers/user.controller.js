import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * GET /api/users/profile
 * Protected route (verifyJWT)
 * Returns the logged-in user's profile
 */
const getMyProfile = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Profile fetched successfully"));
});

/**
 * GET /api/users/:username
 * Protected route (verifyJWT)
 * Returns another user's public profile by username
 */
const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username: username.toLowerCase() }).select(
    "-password -refreshToken"
  );

  if (!user) throw new ApiError(404, null, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

/**
 * PATCH /api/users/update-profile-pic
 * Protected route (verifyJWT)
 * File: profilePic (multipart/form-data via multer)
 */
const updateProfilePic = asyncHandler(async (req, res) => {
  const localFile = req.file?.path;

  if (!localFile) throw new ApiError(400, null, "No file provided");

  const uploaded = await uploadOnCloudinary(localFile);
  if (!uploaded) throw new ApiError(500, null, "Profile picture upload failed");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePic: uploaded.url },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile picture updated successfully"));
});

export { getMyProfile, getUserByUsername, updateProfilePic };