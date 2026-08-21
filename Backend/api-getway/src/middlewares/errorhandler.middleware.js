export const errorHandler = (err, req, res, next) => {

  console.error("Gateway Error:", err)

  res.status(500).json({
    success: false,
    message: "Internal Gateway Error"
  })

}