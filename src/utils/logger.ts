/**
 * Simple logger utility for the campus market app.
 * Replaces console.error/console.warn with structured logging.
 * In production, these could be sent to a logging service.
 */

const LOG_PREFIX = '[CampusMarket]'

export const logger = {
  info(message: string, ...args: unknown[]): void {
    console.log(`${LOG_PREFIX} [INFO]`, message, ...args)
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${LOG_PREFIX} [WARN]`, message, ...args)
  },

  error(message: string, ...args: unknown[]): void {
    console.error(`${LOG_PREFIX} [ERROR]`, message, ...args)
  },

  /**
   * Safely extract error message from unknown error types.
   */
  getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    return String(error)
  },
}
