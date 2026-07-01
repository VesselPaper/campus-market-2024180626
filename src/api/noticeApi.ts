// ============================================
// 公告 API — 对 data/notices.json 做操作
// ============================================
import request from './request'
import type { Notice } from '@/types'

// 获取所有平台公告（安全提醒等）
export function getNotices(): Promise<{ data: Notice[] }> {
  return request.get('/notices')
}
