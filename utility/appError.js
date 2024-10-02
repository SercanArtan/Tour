class AppError extends Error {
    constructor(message, statusCode){
        super(message)

        this.statusCode= statusCode
        this.status= `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational= true

        // It gives the error where happen
        Error.captureStackTrace(this, this.constructor)

    }
}

module.exports = AppError