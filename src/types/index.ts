// 用户
export interface User {
  id: number
  nickname: string
  college: string
  campus: string
  role: string
  creditScore: number
  avatar: string
}

// 校园信息类型
export type ItemType = 'secondhand' | 'lostfound' | 'group' | 'errand'

// 校园信息
export interface Item {
  id: number
  type: ItemType
  title: string
  description: string
  campus: string
  location: string
  tags: string[]
  images: string[]
  publisherId: number
  status: string
  viewCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
  // 二手交易专属
  price?: number
  condition?: string
  allowBargain?: boolean
  // 失物招领专属
  lostOrFound?: string
  eventTime?: string
  itemFeature?: string
  // 拼单搭子专属
  targetCount?: number
  currentCount?: number
  deadline?: string
  // 跑腿委托专属
  reward?: number
  taskPlace?: string
  expectedTime?: string
}

// 收藏
export interface Favorite {
  id: number
  userId: number
  itemId: number
  createdAt: string
}

// 会话
export interface Conversation {
  id: number
  itemId: number
  buyerId: number
  publisherId: number
  lastMessage: string
  unreadCount: number
  updatedAt: string
}

// 消息
export interface Message {
  id: number
  conversationId: number
  senderId: number
  receiverId: number
  content: string
  messageType: string
  createdAt: string
  read: boolean
}

// 安全提醒
export interface Notice {
  id: number
  title: string
  content: string
  type: string
  createdAt: string
}

// 筛选条件
export interface FilterParams {
  keyword?: string
  type?: ItemType | ''
  campus?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
