// Final safety net: catches any error a controller passed to next(error)
// without handling itself, so it never falls through to Express's generic
// HTML "Internal Server Error" page.
export const errorHandler = (err, req, res, next) => {

  console.error("Chat service error:", err)

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  })

}
