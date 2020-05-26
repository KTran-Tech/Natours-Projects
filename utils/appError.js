//for 404 Error

class AppError extends Error {
  constructor(message, statusCode) {
    //Erorr is a built in class, so its calling a 'message' method that returns an error msg
    //gets back error message
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4')
      ? 'fail'
      : 'error';
    this.isOperational = true;

    Error.captureStackTrace(
      this,
      this.constructor
    );
  }
}

module.exports = AppError;
