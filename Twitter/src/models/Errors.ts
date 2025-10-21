/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTTP_STATUS } from '~/constants/httpStatus'

// Lỗi custom với trạng thái HTTP
type ErrorType = Record<
  string,
  {
    msg: string
    [key: string]: any //index signature, có thể có nhiều trường nữa
  }
>
export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

//Error 422 - Unprocessable Entity
export class EntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({ message = 'Validation Error', errors }: { message?: string; errors: ErrorType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
