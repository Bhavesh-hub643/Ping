import Conversation from "../models/convo.model.js";
import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

/**
 * POST /api/messages/send/:receiverId
 * Protected route (verifyJWT)
 * Body: { message }
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const receiverId = req.params.receiverId;
  const senderId = req.user._id;

  if (!message?.trim()) {
    throw new ApiError(400, null, "Message cannot be empty");
  }

  if (String(senderId) === String(receiverId)) {
    throw new ApiError(400, null, "You cannot message yourself");
  }

  const receiverExists = await User.findById(receiverId);
  if (!receiverExists) throw new ApiError(404, null, "Receiver not found");

  // Find existing conversation or create a new one
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      messages: [],
    });
  }

  // Create the message
  const newMessage = await Message.create({
    senderId,
    receiverId,
    message: message.trim(),
  });

  // Push message ref into conversation
  conversation.messages.push(newMessage._id);
  await conversation.save();

  // Emit to receiver in real-time if they are online
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

/**
 * GET /api/messages/:receiverId
 * Protected route (verifyJWT)
 * Returns full conversation between logged-in user and the other user
 */
const getMessages = asyncHandler(async (req, res) => {
  const receiverId = req.params.receiverId;
  const senderId = req.user._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate("messages");

  if (!conversation) {
    // No conversation yet — return empty array (not an error)
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No messages yet"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, conversation.messages, "Messages fetched successfully"));
});

/**
 * GET /api/messages/users
 * Protected route (verifyJWT)
 * Returns all users except the logged-in user (for the sidebar)
 */
const getSidebarUsers = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  const users = await User.find({ _id: { $ne: loggedInUserId } }).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export { sendMessage, getMessages, getSidebarUsers };