import type { ItemType } from '@/types'

export const API_BASE_URL = 'http://localhost:3000'

export const ITEM_TYPES: { label: string; value: ItemType }[] = [
  { label: '二手交易', value: 'secondhand' },
  { label: '失物招领', value: 'lostfound' },
  { label: '拼单搭子', value: 'group' },
  { label: '跑腿委托', value: 'errand' },
]

export const CAMPUS_LIST = ['北校区', '南校区', '东校区', '西校区', '中心校区']

export const COLLEGE_LIST = ['计算机学院', '数学学院', '物理学院', '外国语学院', '经管学院', '文学院', '艺术学院', '法学院']

export const ROLE_LIST = ['大一学生', '大二学生', '大三学生', '大四学生', '研究生']

export const ITEM_STATUSES = ['进行中', '已完成', '已关闭', '已找回', '已认领']

export const ITEM_STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: '全部状态', value: '' },
  { label: '进行中', value: '进行中' },
  { label: '已完成', value: '已完成' },
  { label: '已关闭', value: '已关闭' },
  { label: '已找回', value: '已找回' },
  { label: '已认领', value: '已认领' },
]

export const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: '最新发布', value: 'createdAt' },
  { label: '最多浏览', value: 'viewCount' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
]

export const PLACEHOLDER_IMAGES: Record<ItemType, string> = {
  secondhand: 'https://picsum.photos/seed/secondhand/400/300',
  lostfound: 'https://picsum.photos/seed/lostfound/400/300',
  group: 'https://picsum.photos/seed/group/400/300',
  errand: 'https://picsum.photos/seed/errand/400/300',
}

export const SAFETY_NOTICES = [
  { title: '选择公共地点交易', content: '建议选择食堂、图书馆、教学楼大厅等公共场所进行线下交易，避免在偏僻或私人场所见面。' },
  { title: '贵重物品注意验真', content: '购买笔记本电脑、手机、相机等贵重物品时，建议当场验货，确认功能正常、配件齐全。' },
  { title: '保护个人隐私', content: '谨慎分享个人联系方式、宿舍地址、身份证号等敏感信息，防止个人信息泄露。' },
  { title: '警惕异常低价', content: '对于价格明显低于市场价的商品，请保持警惕，避免陷入诈骗或假冒商品交易。' },
]
