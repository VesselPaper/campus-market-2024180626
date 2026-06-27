import request from './request'
import type { Notice } from '@/types'

export function getNotices(): Promise<{ data: Notice[] }> {
  return request.get('/notices')
}
