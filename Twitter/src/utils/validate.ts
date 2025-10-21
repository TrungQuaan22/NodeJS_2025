import express from 'express'
import { validationResult, ValidationChain, ValidationError } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

// can be reused by many routes
const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // sequential processing, stops running validations chain if one fails.
    await validation.run(req)
    const errors = validationResult(req)
    // No validation errors --> next
    if (errors.isEmpty()) {
      return next()
    }
    const errorsObject: Record<string, ValidationError> = errors.mapped()
    const errorEntity = new EntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]

      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      errorEntity.errors[key] = errorsObject[key]
    }

    next(errorEntity)
  }
}

export default validate
