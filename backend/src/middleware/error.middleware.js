export function errorHandler(err, req, res, next) {
  console.error("API Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Terjadi kesalahan pada server."
        : err.message
  });
}
