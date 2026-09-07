function errorHandler(err, req, res, next) {
  // If response headers already sent, delegate to default express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle express-validator or validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message || 'Validation failed'
      }
    });
  }

  // Handle Mongoose CastError (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: `Invalid format for field: ${err.path}`
      }
    });
  }

  // Handle MongoDB Duplicate Key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      error: {
        code: 'DUPLICATE_KEY',
        message: `A record with that ${field} already exists`
      }
    });
  }

  // Custom application errors with status code
  if (err.statusCode || err.status) {
    return res.status(err.statusCode || err.status).json({
      error: {
        code: err.code || 'REQUEST_ERROR',
        message: err.message || 'An error occurred'
      }
    });
  }

  // General server error
  console.error('[Unhandled Error]:', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred'
    }
  });
}

module.exports = errorHandler;
