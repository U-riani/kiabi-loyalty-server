//  backend/middleware/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "Something went wrong",
  });
};
