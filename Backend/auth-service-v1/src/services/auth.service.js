import bcrypt from "bcryptjs"
import { User } from "../models/user.model.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import {
  generateAccessToken,
  generateRefreshToken
} from "./token.service.js"

export const signupUser = async ({ name, email, password }) => {

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    throw new Error("User already exists")
  }

  const user = await User.create({
    name,
    email,
    password
  })

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

  user.refreshToken = hashedRefreshToken
  await user.save()

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    accessToken,
    refreshToken
  }

}

export const loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email }).select("+password")

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    throw new Error("Invalid credentials")
  }

  const accessToken = generateAccessToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

  user.refreshToken = hashedRefreshToken
  await user.save()

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    accessToken,
    refreshToken
  }

}

export const refreshUserToken = async (token) => {

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

  const user = await User.findById(decoded.userId).select("+refreshToken")

  if (!user) {
    throw new Error("User not found")
  }

  const isValid = await bcrypt.compare(token, user.refreshToken)

  if (!isValid) {
    throw new Error("Invalid refresh token")
  }

  const newAccessToken = generateAccessToken(user._id)
  const newRefreshToken = generateRefreshToken(user._id)

  const hashed = await bcrypt.hash(newRefreshToken, 10)

  user.refreshToken = hashed
  await user.save()

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  }

}


export const findUserByEmailService = async ({ email }) => {

  if (!email) {
    throw new Error("email is required")
  }

  const user = await User.findOne(
    { email: email.toLowerCase() },
    "_id name email"
  ).lean()

  if (!user) {
    const error = new Error("No user found with that email")
    error.statusCode = 404
    throw error
  }

  return user

}


const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const searchUsersService = async ({ query, excludeUserId }) => {

  const trimmed = (query || "").trim()

  if (trimmed.length < 2) {
    const error = new Error("Search query must be at least 2 characters")
    error.statusCode = 400
    throw error
  }

  const pattern = new RegExp(escapeRegex(trimmed), "i")

  const filter = {
    $or: [{ name: pattern }, { email: pattern }]
  }

  if (excludeUserId && mongoose.Types.ObjectId.isValid(excludeUserId)) {
    filter._id = { $ne: excludeUserId }
  }

  const users = await User.find(filter, "_id name email")
    .limit(8)
    .lean()

  return users

}


export const validateUsersService = async ({ userIds }) => {


  console.log("reached----------------->")

  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("userIds must be a non-empty array")
  }

  /*
  remove duplicates
  */

  const uniqueUserIds = [...new Set(userIds)]

  /*
  validate objectIds
  */

  const invalidIds = uniqueUserIds.filter(
    id => !mongoose.Types.ObjectId.isValid(id)
  )

  if (invalidIds.length) {
    throw new Error(`Invalid userIds: ${invalidIds.join(", ")}`)
  }

  /*
  fetch users
  */

  const users = await User.find(
    { _id: { $in: uniqueUserIds } },
    "_id name email"
  ).lean()//--->1)"_id name email" --> This tells MongoDB which fields to return. 2)lean() --> return plain javascript object

  const foundIds = users.map(u => u._id.toString())

  const missingUsers = uniqueUserIds.filter(
    id => !foundIds.includes(id)
  )

  return {
    totalRequested: uniqueUserIds.length,
    totalFound: users.length,
    users,
    missingUsers
  }

}