export const ERROR_CODES = {
  INVALID_POINT: 'INVALID_POINT',
  INVALID_PATH: 'INVALID_PATH',
  DUPLICATE_POINT: 'DUPLICATE_POINT',
  TOO_MANY_POINTS: 'TOO_MANY_POINTS',
  TOO_FEW_POINTS: 'TOO_FEW_POINTS',
  INVALID_TIME: 'INVALID_TIME',
  INVALID_EASING: 'INVALID_EASING',
} as const

export class PathError extends Error {
  code: string
  details?: any

  constructor(code: string, details?: any) {
    super(`Path Error: ${code}`)
    this.name = 'PathError'
    this.code = code
    this.details = details
  }
}