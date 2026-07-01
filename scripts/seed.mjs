// ============================================
// 种子数据生成脚本 — 一键重置 data/ 目录中的 JSON 文件
// 运行: node scripts/seed.mjs  (或 bun run scripts/seed.mjs)
// 效果: 清空旧数据，重新生成 data/*.json
// ============================================
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')

// ===== 用户 =====
const users = [
  { id: 1, account: 'zhangsan', password: '123456', nickname: '张三',   college: '计算机学院', campus: '成龙校区',   role: '大二学生', creditScore: 85, avatar: 'https://placehold.co/80x80/FF6B35/FFFFFF?text=ZS' },
  { id: 2, account: 'lisi',     password: '123456', nickname: '李四',   college: '外国语学院', campus: '狮子山校区', role: '大三学生', creditScore: 90, avatar: 'https://placehold.co/80x80/00B4D8/FFFFFF?text=LS' },
  { id: 3, account: 'wangwu',   password: '123456', nickname: '王五',   college: '计算机学院', campus: '成龙校区',   role: '研究生',   creditScore: 78, avatar: 'https://placehold.co/80x80/00B894/FFFFFF?text=WW' },
  { id: 4, account: 'zhaoliu',  password: '123456', nickname: '赵六',   college: '经管学院',   campus: '狮子山校区', role: '大二学生', creditScore: 82, avatar: 'https://placehold.co/80x80/FDCB6E/FFFFFF?text=ZL' },
]

// ===== 商品 =====
const items = [
  // 张三发布的
  { id: 1, type: 'secondhand', title: '转让高数教材（第六版）',  description: '高等数学第六版教材，保存较好，内页有少量笔记但不影响阅读。原价45元，现价20元。', campus: '成龙校区', location: '图书馆门口', tags: ['教材','二手','高数'], images: ['/images/math-book.jpg'], publisherId: 1, status: '进行中', viewCount: 46, favoriteCount: 5, price: 20, condition: '良好', allowBargain: true, createdAt: '2026-06-20 10:00:00', updatedAt: '2026-06-20 10:00:00' },
  { id: 3, type: 'lostfound',  title: '丢失校园卡（校园卡号2024001）', description: '6月22日下午在北区食堂丢失校园卡一张，卡面为蓝色，背面有姓名标签。如有捡到请联系我！', campus: '成龙校区', location: '北区食堂', tags: ['校园卡','丢失','重要物品'], images: ['/images/campus-card.jpg'], publisherId: 1, status: '进行中', viewCount: 32, favoriteCount: 2, lostOrFound: 'lost', eventTime: '2026-06-22 下午', itemFeature: '蓝色卡面，背面贴有姓名标签', createdAt: '2026-06-22 17:00:00', updatedAt: '2026-06-22 17:00:00' },
  { id: 10, type: 'lostfound', title: '捡到钥匙串（三把钥匙+门禁卡）', description: '在西区操场跑道边捡到钥匙串一个，三把钥匙+蓝色门禁卡。请失主到体育部办公室认领。', campus: '狮子山校区', location: '西区操场', tags: ['钥匙','捡到','失物招领'], images: ['/images/keys.jpg'], publisherId: 1, status: '已认领', viewCount: 28, favoriteCount: 0, lostOrFound: 'found', eventTime: '2026-06-19 下午', itemFeature: '三把钥匙+蓝色门禁卡', createdAt: '2026-06-19 16:00:00', updatedAt: '2026-06-22 09:00:00' },
  { id: 11, type: 'group',     title: '水果团购：西瓜拼单',       description: '校门口水果店西瓜特价，一个太大吃不完。找2-3人一起拼一个瓜，每人约5元。', campus: '成龙校区', location: '北校门口水果店', tags: ['水果','西瓜','拼单'], images: ['/images/watermelon.jpg'], publisherId: 1, status: '已完成', viewCount: 36, favoriteCount: 3, targetCount: 4, currentCount: 3, deadline: '2026-06-21 12:00:00', createdAt: '2026-06-20 19:00:00', updatedAt: '2026-06-21 12:00:00' },

  // 李四发布的
  { id: 2, type: 'secondhand', title: '九成新自行车出售',          description: '大二买的捷安特自行车，骑了一年多，车况良好，轮胎刚换过。原价600，现价300。', campus: '狮子山校区', location: '北区宿舍楼下', tags: ['自行车','代步','二手'], images: ['/images/bicycle.jpg'], publisherId: 2, status: '进行中', viewCount: 81, favoriteCount: 12, price: 300, condition: '良好', allowBargain: true, createdAt: '2026-06-21 14:30:00', updatedAt: '2026-06-21 14:30:00' },
  { id: 5, type: 'group',      title: '奶茶拼单！一点点满减凑单',  description: '一点点外卖满30减5，现在已经有2杯了，再凑1杯即可。北校区配送。', campus: '成龙校区', location: '北校区', tags: ['奶茶','拼单','一点点'], images: ['/images/milk-tea.jpg'], publisherId: 2, status: '进行中', viewCount: 56, favoriteCount: 4, targetCount: 3, currentCount: 2, deadline: '2026-06-25 18:00:00', createdAt: '2026-06-23 15:00:00', updatedAt: '2026-06-23 15:00:00' },
  { id: 12, type: 'errand',    title: '帮忙交一份材料到行政楼',    description: '有一份学院盖章材料需要交到行政楼308办公室，我下午有课走不开。帮忙跑一趟，酬劳5元。', campus: '狮子山校区', location: '行政楼308', tags: ['代交','材料','跑腿'], images: ['/images/documents.jpg'], publisherId: 2, status: '已完成', viewCount: 23, favoriteCount: 1, reward: 5, taskPlace: '行政楼308', expectedTime: '2026-06-24 17:00:00前', createdAt: '2026-06-23 08:30:00', updatedAt: '2026-06-24 15:00:00' },

  // 王五发布的
  { id: 4, type: 'lostfound',  title: '捡到黑色水杯一个',          description: '在南校区图书馆二楼靠窗座位捡到黑色保温水杯一个，杯身有卡通贴纸。请失主联系认领。', campus: '狮子山校区', location: '南校区图书馆二楼', tags: ['水杯','捡到','失物招领'], images: ['/images/water-bottle.jpg'], publisherId: 3, status: '进行中', viewCount: 24, favoriteCount: 1, lostOrFound: 'found', eventTime: '2026-06-23 上午', itemFeature: '黑色保温杯，杯身有卡通贴纸', createdAt: '2026-06-23 10:30:00', updatedAt: '2026-06-23 10:30:00' },
  { id: 8, type: 'errand',     title: '代买早餐送到宿舍',          description: '早上有课起不来，求帮忙带一份早餐（包子+豆浆）到东区12号楼303室。酬劳3元，7:50前送到。', campus: '狮子山校区', location: '东区食堂→东区12号楼', tags: ['代买','早餐','跑腿'], images: ['/images/breakfast.jpg'], publisherId: 3, status: '进行中', viewCount: 36, favoriteCount: 2, reward: 3, taskPlace: '东区食堂', expectedTime: '每天 7:50 前', createdAt: '2026-06-25 22:00:00', updatedAt: '2026-06-25 22:00:00' },

  // 赵六发布的
  { id: 6, type: 'group',      title: '找学习搭子一起刷高数',      description: '期末高数复习，想找1-2个学习搭子一起刷题。每天晚上7点后在图书馆自习室碰面。', campus: '狮子山校区', location: '东校区图书馆', tags: ['学习','搭子','高数'], images: ['/images/study.jpg'], publisherId: 4, status: '进行中', viewCount: 38, favoriteCount: 6, targetCount: 3, currentCount: 1, deadline: '2026-07-10 00:00:00', createdAt: '2026-06-24 09:00:00', updatedAt: '2026-06-24 09:00:00' },
  { id: 7, type: 'errand',     title: '代取快递（北区菜鸟→南区）', description: '有一个快递在北校区菜鸟驿站，需要帮忙取件送到南校区7号楼宿舍。酬劳5元。', campus: '成龙校区', location: '北区菜鸟驿站→南区7号楼', tags: ['代取','快递','跑腿'], images: ['/images/package.jpg'], publisherId: 4, status: '进行中', viewCount: 47, favoriteCount: 3, reward: 5, taskPlace: '北区菜鸟驿站', expectedTime: '2026-06-26 20:00:00前', createdAt: '2026-06-25 08:00:00', updatedAt: '2026-06-25 08:00:00' },
  { id: 9, type: 'secondhand', title: '台灯（九成新）',            description: '去年买的LED护眼台灯，三档调光，使用频率不高，几乎全新。原价80，现价40。', campus: '成龙校区', location: '西区3号楼', tags: ['台灯','生活用品','二手'], images: ['/images/desk-lamp.jpg'], publisherId: 4, status: '已完成', viewCount: 26, favoriteCount: 0, price: 40, condition: '九成新', allowBargain: true, createdAt: '2026-06-18 11:00:00', updatedAt: '2026-06-22 16:00:00' },

  // 新增二手商品
  { id: 13, type: 'secondhand', title: '全新英语四级真题卷',        description: '2025年12月买的四级真题，只做了一套，其他都是全新的。附赠听力光盘和答案解析。', campus: '成龙校区', location: '东区食堂', tags: ['四级','真题','学习'], images: ['/images/cet4-book.jpg'], publisherId: 2, status: '进行中', viewCount: 18, favoriteCount: 1, price: 15, condition: '几乎全新', allowBargain: true, createdAt: '2026-06-26 14:00:00', updatedAt: '2026-06-26 14:00:00' },
  { id: 14, type: 'secondhand', title: '电风扇（落地式）',          description: '去年夏天买的落地扇，三档风速，静音效果好。今年准备换空调了，便宜出。带遥控器。', campus: '狮子山校区', location: '南区7号楼', tags: ['电风扇','电器','生活用品'], images: ['/images/fan.jpg'], publisherId: 3, status: '进行中', viewCount: 34, favoriteCount: 2, price: 55, condition: '良好', allowBargain: true, createdAt: '2026-06-27 09:30:00', updatedAt: '2026-06-27 09:30:00' },
  { id: 15, type: 'secondhand', title: '吉他（入门款）',            description: '大一买的入门民谣吉他，41寸云杉面板，带琴包和变调夹。弹了半年，弦距有点高手感一般，适合新手练习。', campus: '成龙校区', location: '西区操场看台下', tags: ['吉他','乐器','二手'], images: ['/images/guitar.jpg'], publisherId: 1, status: '进行中', viewCount: 42, favoriteCount: 3, price: 120, condition: '良好', allowBargain: true, createdAt: '2026-06-28 11:00:00', updatedAt: '2026-06-28 11:00:00' },
  { id: 16, type: 'secondhand', title: '移动硬盘 1TB',              description: '希捷1TB移动硬盘，买来存学习资料的，现在毕业了用不上。外观无划痕，读写速度正常。', campus: '狮子山校区', location: '北门', tags: ['移动硬盘','数码','电子'], images: ['/images/hard-drive.jpg'], publisherId: 4, status: '进行中', viewCount: 29, favoriteCount: 4, price: 180, condition: '九成新', allowBargain: true, createdAt: '2026-06-29 16:00:00', updatedAt: '2026-06-29 16:00:00' },
  { id: 17, type: 'secondhand', title: '瑜伽垫（加厚款）',          description: '买来减肥的，用了不到5次就闲置了😂 加厚8mm，防滑效果好，送收纳绑带。', campus: '成龙校区', location: '东区12号楼', tags: ['瑜伽垫','运动','健身'], images: ['/images/yoga-mat.jpg'], publisherId: 2, status: '进行中', viewCount: 15, favoriteCount: 0, price: 25, condition: '九成新', allowBargain: false, createdAt: '2026-06-30 20:00:00', updatedAt: '2026-06-30 20:00:00' },
  { id: 18, type: 'secondhand', title: '计算机二级考试题库',        description: '包含MS Office和C语言两科的题库软件激活码，官网价59元，现30元出。激活后永久使用。', campus: '成龙校区', location: '线上交易', tags: ['计算机二级','题库','学习'], images: ['/images/computer-exam.jpg'], publisherId: 1, status: '进行中', viewCount: 22, favoriteCount: 1, price: 30, condition: '全新', allowBargain: false, createdAt: '2026-07-01 08:00:00', updatedAt: '2026-07-01 08:00:00' },
]

// ===== 收藏 =====
const favorites = [
  { id: 1, userId: 1, itemId: 2, createdAt: '2026-06-22 10:00:00' },
  { id: 2, userId: 1, itemId: 5, createdAt: '2026-06-24 11:00:00' },
  { id: 3, userId: 2, itemId: 1, createdAt: '2026-06-21 09:00:00' },
]

// 统计每个商品的实际收藏数
function calcFavoriteCounts(favs) {
  const counts = {}
  for (const f of favs) {
    counts[f.itemId] = (counts[f.itemId] || 0) + 1
  }
  return counts
}
const favCounts = calcFavoriteCounts(favorites)

// ===== 会话 =====
const conversations = [
  // 会话1: 张三(1) ↔ 李四(2) 关于 高数教材(id1)
  { id: 1, itemId: 1, buyerId: 2, publisherId: 1, lastMessage: '好的，谢谢！',             unreadCount: 0, updatedAt: '2026-06-21 10:15:00' },
  // 会话2: 张三(1) ↔ 李四(2) 关于 奶茶拼单(id5)
  { id: 2, itemId: 5, buyerId: 1, publisherId: 2, lastMessage: '好的，那我加你微信。',     unreadCount: 0, updatedAt: '2026-06-24 15:10:00' },
  // 会话3: 赵六(4) ↔ 张三(1) 关于 西瓜拼单(id11) — 赵六想拼单
  { id: 3, itemId: 11, buyerId: 4, publisherId: 1, lastMessage: '西瓜还有吗？我想拼一个', unreadCount: 1, updatedAt: '2026-06-25 10:00:00' },
]

// ===== 消息 =====
const messages = [
  // 会话1: 张三的高数教材  — 张三(id1)是发布者, 李四(id2)是买家
  { id: 1, conversationId: 1, senderId: 2, receiverId: 1, content: '你好，请问高数教材还在吗？',                   messageType: 'text', createdAt: '2026-06-21 10:00:00', read: true },
  { id: 2, conversationId: 1, senderId: 1, receiverId: 2, content: '在的，下午有时间来图书馆门口看吗？',           messageType: 'text', createdAt: '2026-06-21 10:05:00', read: true },
  { id: 3, conversationId: 1, senderId: 2, receiverId: 1, content: '好的，下午3点图书馆门口见。',                 messageType: 'text', createdAt: '2026-06-21 10:10:00', read: true },
  { id: 4, conversationId: 1, senderId: 1, receiverId: 2, content: '好的，谢谢！',                                messageType: 'text', createdAt: '2026-06-21 10:15:00', read: true },

  // 会话2: 李四的奶茶拼单 — 李四(id2)是发布者, 张三(id1)是买家
  { id: 5, conversationId: 2, senderId: 1, receiverId: 2, content: '奶茶拼单还差人吗？我想一起拼。',               messageType: 'text', createdAt: '2026-06-24 15:00:00', read: true },
  { id: 6, conversationId: 2, senderId: 2, receiverId: 1, content: '还差一个人，你要加吗？',                       messageType: 'text', createdAt: '2026-06-24 15:05:00', read: true },
  { id: 7, conversationId: 2, senderId: 1, receiverId: 2, content: '好的，那我加你微信。',                        messageType: 'text', createdAt: '2026-06-24 15:10:00', read: true },

  // 会话3: 张三的西瓜拼单 — 张三(id1)是发布者, 赵六(id4)是买家
  { id: 8, conversationId: 3, senderId: 4, receiverId: 1, content: '西瓜还有吗？我想拼一个',                      messageType: 'text', createdAt: '2026-06-25 09:50:00', read: true },
  { id: 9, conversationId: 3, senderId: 1, receiverId: 4, content: '有的！现在已经有3个人了，还差1个。你要加吗？', messageType: 'text', createdAt: '2026-06-25 10:00:00', read: false },
]

// ===== 公告 =====
const notices = [
  { id: 1, title: '交易安全提醒', content: '请在公共地点进行线下交易，注意保护个人隐私。', type: 'safety', createdAt: '2026-06-01 00:00:00' },
]

// 用实际收藏数覆盖 favoriteCount
for (const item of items) {
  item.favoriteCount = favCounts[item.id] || 0
}

// ===== 写入 data/*.json =====
mkdirSync(DATA_DIR, { recursive: true })
const datasets = { users, items, favorites, conversations, messages, notices }
for (const [key, val] of Object.entries(datasets)) {
  writeFileSync(join(DATA_DIR, `${key}.json`), JSON.stringify(val, null, 2), 'utf-8')
}
console.log(`种子数据已写入 ${DATA_DIR}/`)
console.log(`${users.length} 个用户, ${items.length} 件商品, ${conversations.length} 个会话, ${messages.length} 条消息`)
