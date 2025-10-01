import { VALIDATION } from "./constants"

export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL.test(email)
}

export const validatePassword = (password: string): boolean => {
  return VALIDATION.PASSWORD.test(password)
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

export const validateMatch = (value1: string, value2: string): boolean => {
  return value1 === value2
}

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

export const validateNumeric = (value: string): boolean => {
  return /^\d+$/.test(value)
}

export const validateDate = (value: string): boolean => {
  // Format: YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

export const getFormErrors = (
  data: Record<string, any>,
  validations: Record<string, (value: any) => boolean>,
  errorMessages: Record<string, string>,
): Record<string, string> => {
  const errors: Record<string, string> = {}

  Object.keys(validations).forEach((field) => {
    if (data[field] !== undefined && !validations[field](data[field])) {
      errors[field] = errorMessages[field]
    }
  })

  return errors
}
