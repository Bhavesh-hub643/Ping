import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  fullName:    { type: String, required: true },
  username:    { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  profilePic:  { type: String, default: "" },
  refreshToken:{ type: String },          // ✅ added — needed for logout & token rotation
}, { timestamps: true })

// ── instance methods ──────────────────────────────────────────────────────────

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema)