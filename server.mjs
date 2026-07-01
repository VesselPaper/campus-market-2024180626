// ============================================
// 自定义 JSON Server — 从 data/ 加载多文件
// 每个文件对应一个 API 资源：
//   data/users.json → GET/POST /users
//   data/items.json → GET/POST /items
//   ...
// ============================================
import { createRequire } from 'module'
import { readdirSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const jsonServer = require('json-server')

const server = jsonServer.create()
const middlewares = jsonServer.defaults({ static: join(__dirname, 'public') })

// ========== 图片上传接口 ==========
// POST /api/upload
// Body: { "image": "data:image/jpeg;base64,/9j/..." }
// 返回: { "url": "/images/xxx.jpg" }
// 从 data/ 目录加载所有 .json 文件
const dataDir = join(__dirname, 'data')
const data = {}

const files = readdirSync(dataDir).filter(f => f.endsWith('.json'))
for (const file of files) {
  const key = file.replace('.json', '')
  const content = readFileSync(join(dataDir, file), 'utf-8')
  data[key] = JSON.parse(content)
  console.log(`  loaded: ${file}`)
}

const router = jsonServer.router(data)

// json-server 传入对象时只在内存读写，不写回文件
// 重写 render：每次增删改后同步写回 data/*.json
const _render = router.render.bind(router)
router.render = (req, res) => {
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
  if (isMutation) {
    const state = router.db.getState()
    for (const key of Object.keys(state)) {
      writeFileSync(join(dataDir, `${key}.json`), JSON.stringify(state[key], null, 2))
    }
  }
  _render(req, res)
}

const port = process.env.PORT || 3000

// 先跑 json-server 的默认中间件（body 解析 + 静态文件托管）
server.use(middlewares)

// 加上 body 解析（json-server defaults 默认不含 bodyParser）
server.use(jsonServer.bodyParser)

// ========== 图片上传接口（req.body 已可用） ==========
// POST /api/upload
// Body: { "image": "data:image/jpeg;base64,/9j/..." }
// 返回: { "url": "/images/xxx.jpg" }
server.post('/api/upload', (req, res) => {
  if (!req.body || !req.body.image) {
    return res.status(400).json({ error: '缺少 image 字段' })
  }

  const matches = req.body.image.match(/^data:image\/(\w+);base64,(.+)$/)
  if (!matches) {
    return res.status(400).json({ error: '图片格式无效，需要 data:image/...;base64,...' })
  }

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1]
  const base64Data = matches[2]
  const filename = `${randomUUID()}.${ext}`
  const imageDir = join(__dirname, 'public', 'images')
  mkdirSync(imageDir, { recursive: true })
  writeFileSync(join(imageDir, filename), Buffer.from(base64Data, 'base64'))

  console.log(`  uploaded: images/${filename}`)
  res.json({ url: `/images/${filename}` })
})

// ========== 清理未提交的临时上传文件 ==========
// POST /api/cleanup-uploads
// Body: { "urls": ["/images/xxx.jpg", ...] }
// PublishForm 退出时调用，删除未点击发布的临时图片
server.post('/api/cleanup-uploads', (req, res) => {
  if (!req.body || !req.body.urls) {
    return res.status(400).json({ error: '缺少 urls 字段' })
  }
  for (const url of req.body.urls) {
    if (typeof url === 'string' && url.startsWith('/images/')) {
      const filePath = join(__dirname, 'public', url)
      try {
        unlinkSync(filePath)
        console.log(`  cleaned up: ${url}`)
      } catch {
        // 文件可能已被手动删除，忽略
      }
    }
  }
  res.json({ ok: true })
})

// ========== 删除商品时同步删除图片文件 ==========
// DELETE /items/:id  — 先删图片文件，再交给 json-server 删数据
server.delete('/items/:id', (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id, 10)
    // 通过 json-server 的内部 db 查找商品
    const item = router.db.get('items').find({ id: itemId }).value()
    if (item && item.images) {
      for (const img of item.images) {
        if (typeof img === 'string' && img.startsWith('/images/')) {
          const filePath = join(__dirname, 'public', img)
          try {
            unlinkSync(filePath)
            console.log(`  deleted upload: ${img}`)
          } catch {
            // 文件可能已被删除，忽略
          }
        }
      }
    }
  } catch (e) {
    console.error('清理图片文件时出错:', e)
  }
  // 继续让 json-server 处理实际的 DELETE /items/:id
  next()
})

// 最后挂载 json-server 路由（需在 upload / delete 之后，避免被覆盖）
server.use(router)

server.listen(port, () => {
  console.log(`\nJSON Server 已启动 → http://localhost:${port}`)
  console.log(`数据来源: data/ 目录 (${files.length} 个文件)\n`)
})
