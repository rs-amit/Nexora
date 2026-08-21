const authMiddleware = (
  req,
  res,
  next
) => {
  const userId =
    req.headers["x-user-id"];

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  req.user = {
    id: userId,
    email: req.headers["x-user-email"],
  };

  next();
};

export default authMiddleware;