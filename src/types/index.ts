// ============================================
// 类型定义 — 整个项目用的数据格式都在这
// 每个接口都规定了字段名和类型，写代码时不会搞混
// ============================================

// 用户 — 对应 data/users.json 的一条数据
export interface User {
  id: number
  account: string        // 登录账号
  password: string       // 登录密码
  nickname: string       // 昵称
  college: string        // 学院
  campus: string         // 校区
  role: string           // 身份（如：大二学生）
  creditScore: number    // 信用分
  avatar: string         // 头像链接
}

// 信息类型 — 四种业务场景
export type ItemType = 'secondhand' | 'lostfound' | 'group' | 'errand'
// secondhand = 二手交易, lostfound = 失物招领, group = 拼单搭子, errand = 跑腿委托

// 商品/信息 — 对应 data/items.json 的一条数据
// 四种类型共用这一个接口，非通用字段用 ? 标记为可选
export interface Item {
  id: number
  type: ItemType          // 信息类型（区分四种业务）
  title: string           // 标题
  description: string     // 详细描述
  campus: string          // 校区
  location: string        // 交易地点/丢失地点
  tags: string[]          // 标签
  images: string[]        // 图片链接数组
  publisherId: number     // 发布者用户 ID
  status: string          // 状态（进行中/已完成/已关闭等）
  viewCount: number       // 浏览次数
  favoriteCount: number   // 收藏次数
  createdAt: string       // 创建时间
  updatedAt: string       // 更新时间
  // 二手交易专属字段
  price?: number          // 价格
  condition?: string      // 成色（全新/良好等）
  allowBargain?: boolean  // 是否允许砍价
  // 失物招领专属字段
  lostOrFound?: string    // lost=丢失, found=捡到
  eventTime?: string      // 丢失/捡到时间
  itemFeature?: string    // 物品特征
  // 拼单搭子专属字段
  targetCount?: number    // 目标人数
  currentCount?: number   // 当前人数
  deadline?: string       // 截止时间
  // 跑腿委托专属字段
  reward?: number         // 跑腿费
  taskPlace?: string      // 任务地点
  expectedTime?: string   // 期望完成时间
}

// 收藏记录 — 记录谁收藏了什么
export interface Favorite {
  id: number
  userId: number    // 谁收藏的
  itemId: number    // 收藏了什么商品
  createdAt: string // 收藏时间
}

// 会话 — 两个人之间的聊天会话
export interface Conversation {
  id: number
  itemId: number            // 关联的商品
  buyerId: number           // 买家/发起人
  publisherId: number       // 卖家/发布者
  lastMessage: string       // 最后一条消息的预览
  unreadCount: number       // 未读消息数
  updatedAt: string         // 最后更新时间
}

// 消息 — 会话里的一条消息
export interface Message {
  id: number
  conversationId: number  // 属于哪个会话
  senderId: number        // 发送者
  receiverId: number      // 接收者
  content: string         // 消息内容
  messageType: string     // 消息类型（text=文字, bargain=砍价等）
  createdAt: string       // 发送时间
  read: boolean           // 是否已读
}

// 商品评论/讨论
export interface Comment {
  id: number
  itemId: number    // 所属商品
  userId: number    // 评论者
  content: string   // 评论内容
  createdAt: string // 评论时间
}

// 公告/安全提醒
export interface Notice {
  id: number
  title: string
  content: string
  type: string      // 类型（safety=安全提醒等）
  createdAt: string
}

// 搜索筛选条件（集市列表页用）
export interface FilterParams {
  keyword?: string         // 关键词搜索
  type?: ItemType | ''     // 按类型筛选
  campus?: string          // 按校区筛选
  status?: string          // 按状态筛选
  sortBy?: string          // 排序方式
  sortOrder?: 'asc' | 'desc'  // 升序/降序
}
