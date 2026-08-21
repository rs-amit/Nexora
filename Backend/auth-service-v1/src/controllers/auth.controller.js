import {
  signupUser,
  loginUser,
  refreshUserToken,
  validateUsersService,
  findUserByEmailService
} from "../services/auth.service.js"

export const signup = async (req, res) => {

  const result = await signupUser(req.body)

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.status(201).json({
    user: result.user,
    accessToken: result.accessToken
  })

}

export const login = async (req, res) => {

  const result = await loginUser(req.body)

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })



  res.json({
    user: result.user,
    accessToken: result.accessToken
  })

}

export const refreshToken = async (req, res) => {

  const token = req.cookies.refreshToken

  if (!token) {
    return res.status(401).json({
      message: "Refresh token missing"
    })
  }

  const result = await refreshUserToken(token)

  /*
  Rotate refresh token
  */

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return res.json({
    accessToken: result.accessToken
  })

}

export const logout = async (req, res) => {

  res.clearCookie("refreshToken")

  return res.json({
    success: true,
    message: "Logged out"
  })

}


export const findUserByEmail = async (req, res) => {

  try {

    const user = await findUserByEmailService(req.body)

    return res.status(200).json({
      success: true,
      user
    })

  } catch (error) {

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message
    })

  }

}


export const validateUsers = async (req, res) => {

  const result = await validateUsersService(req.body)

  return res.status(200).json({
    success: true,
    ...result
  })

}