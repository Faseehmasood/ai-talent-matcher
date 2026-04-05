class ApiError extends Error {
  statusCode: number
  data: null
  message: string
  success: boolean
  errors: unknown[]

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown[] = [],
    stack: string = ""
  ) {
    // JavaScript ka built-in Error class ko call kar rahe hain
    super(message)
    
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false
    this.errors = errors

    // Stack trace — error kahan hua yeh batata hai
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

export { ApiError }