# Day2 过程性证据

## 基本信息
- **日期**: 2026-06-27
- **阶段**: 页面骨架与路由导航

---

## 1. Vue Router 配置

配置了 8 个路由，支持首页、身份创建页、集市列表页、信息详情页、发布页、消息中心页、个人中心页、趋势看板页之间的导航跳转。

```ts
// src/router/index.ts
const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/create-user', name: 'create-user', component: UserCreateView },
  { path: '/market', name: 'market-list', component: MarketListView },
  { path: '/item/:id', name: 'item-detail', component: ItemDetailView },
  { path: '/publish', name: 'publish', component: PublishView },
  { path: '/message', name: 'message', component: MessageView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
]
```

---

## 2. 页面文件创建

创建了 8 个页面文件：

| 页面 | 文件 | 说明 |
|------|------|------|
| 身份创建页 | `views/UserCreateView.vue` | 表单布局 |
| 今日集市首页 | `views/HomeView.vue` | 欢迎信息、快捷入口、最新信息 |
| 集市列表页 | `views/MarketListView.vue` | 筛选栏 + 信息卡片列表 |
| 信息详情页 | `views/ItemDetailView.vue` | 详情描述布局 + 操作按钮 |
| 信息发布页 | `views/PublishView.vue` | 动态表单布局 |
| 消息中心页 | `views/MessageView.vue` | 会话列表 + 聊天区域 |
| 个人中心页 | `views/ProfileView.vue` | 用户资料 + Tab 切换 |
| 趋势看板页 | `views/DashboardView.vue` | 图表容器布局 |

---

## 3. 导航菜单

顶部导航栏包含 6 个入口：首页、集市列表、发布信息、消息、个人中心、趋势看板。

右侧显示当前登录用户昵称。

---

## 4. Element Plus 引入

在 `main.ts` 中全局引入 Element Plus：

```ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
app.use(ElementPlus)
```

使用了以下组件进行页面布局：
- `ElContainer`、`ElHeader`、`ElMain` — 页面骨架
- `ElMenu`、`ElMenuItem` — 导航菜单
- `ElCard` — 卡片布局
- `ElButton` — 操作按钮
- `ElRow`、`ElCol` — 栅格布局
- `ElTag` — 标签展示

---

## 5. 静态页面结构

### 首页
- 欢迎信息和用户信息
- 四类业务场景快捷入口（二手交易、失物招领、拼单搭子、跑腿委托）
- 最新发布信息卡片区
- 安全提醒组件

### 列表页
- 搜索框 + 类型/校区/状态筛选 + 排序
- 信息卡片展示区域

### 其他页面
- 详情页、发布页、消息页、个人中心页、看板页均具备完整页面框架和布局结构

---

## 6. AI 辅助使用记录

### Prompt 示例
```
请使用 Vue3 + script setup + TypeScript + Element Plus，
为"校园轻集市"生成一个基础首页布局。
页面包含欢迎信息、四类业务入口、最新信息卡片、我的收藏、
未读消息和趋势看板入口。只生成页面骨架，不需要真实接口数据。
```

### 使用情况
- 使用 AI 生成页面骨架和路由配置
- 根据项目目录结构调整页面组件位置
- 添加了 Element Plus 组件完善布局

---

## 7. Git 提交

```bash
git add .
git commit -m "add basic pages and router"
```

---

## 8. 验收

| 验收项 | 结果 |
|--------|------|
| 能够通过导航访问所有主要页面 | ✅ |
| 页面刷新后无明显报错 | ✅ |
| 首页能够展示四类业务入口 | ✅ |
| 列表页能够展示静态信息卡片结构 | ✅ |
| 发布页具备基本页面框架 | ✅ |
| 消息页具备基本页面框架 | ✅ |
| 个人中心页具备基本页面框架 | ✅ |
| 看板页具备基本页面框架 | ✅ |
| Git 中存在 Day2 稳定提交记录 | ✅ |
