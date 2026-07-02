# 🛍️ 校园轻集市

AI 辅助前端工程实践项目 — Vue3 + JSON Server 全功能校园信息平台。

---

## 项目简介

面向大学生校园生活的轻量化信息平台，覆盖 **二手交易、失物招领、拼单搭子、跑腿委托** 四类场景，支持信息浏览、发布、收藏、砍价、消息沟通、个人管理和数据看板等完整功能闭环。

本项目为 **7 天前端实训项目**，采用 "前端 + Mock API" 架构模式，使用 JSON Server 模拟后端 RESTful 接口，不涉及真实支付、权限系统和实时通信。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 + TypeScript | 前端框架（Composition API + script setup） |
| Vite | 构建工具 |
| Vue Router | 路由导航（命名路由 + 动态路由 + 导航守卫） |
| Pinia | 状态管理（4 个 Store：user/item/favorite/message） |
| Axios | HTTP 请求封装 |
| Element Plus | UI 组件库 |
| ECharts | 数据可视化（4 个统计图表） |
| JSON Server | Mock RESTful API |

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm

### 启动步骤

**终端 1 —— 启动 Mock API 服务：**

```bash
cd campus-market
npx json-server --watch db.json --port 3000
```

验证：浏览器访问 http://localhost:3000/items 能看到 JSON 数据。

**终端 2 —— 启动前端应用：**

```bash
cd campus-market
npx vite --port 5173
```

验证：浏览器访问 http://localhost:5173 进入校园轻集市。

### 一键启动（Windows）

双击运行 `scripts/start.bat`，自动同时启动两个服务。

---

## 项目结构

```
campus-market/
├── index.html                 # HTML 入口
├── vite.config.ts             # Vite 配置
├── package.json               # 依赖管理
├── db.json                    # JSON Server Mock 数据
├── server.mjs                 # JSON Server 自定义配置
├── scripts/
│   └── start.bat              # 一键启动脚本
├── public/                    # 静态资源
│   └── images/                # 上传图片存储
├── src/
│   ├── main.ts                # 应用入口（createApp + 插件注册）
│   ├── App.vue                # 根组件（全局布局 + 导航栏 + RouterView）
│   ├── router/
│   │   └── index.ts           # 路由配置（12 个路由 + 导航守卫）
│   ├── types/
│   │   └── index.ts           # TypeScript 类型定义
│   ├── views/                 # 12 个页面组件
│   │   ├── HomeView.vue       # 首页（轮播 + 快捷入口 + 推荐）
│   │   ├── MarketListView.vue # 集市列表（搜索 + 筛选 + 排序）
│   │   ├── ItemDetailView.vue # 商品详情（收藏 + 砍价）
│   │   ├── PublishView.vue    # 发布信息
│   │   ├── LoginView.vue      # 登录
│   │   ├── RegisterView.vue   # 注册
│   │   ├── MessageView.vue    # 消息中心
│   │   ├── ProfileView.vue    # 个人中心
│   │   ├── DashboardView.vue  # 数据看板（ECharts）
│   │   ├── HistoryView.vue    # 浏览记录
│   │   ├── SettingsView.vue   # 账号设置
│   │   └── NotFoundView.vue   # 404 页面
│   ├── components/            # 12 个通用组件
│   │   ├── BannerCarousel.vue # 轮播 Banner
│   │   ├── MarketItemCard.vue # 商品卡片
│   │   ├── MarketFilterBar.vue# 筛选栏
│   │   ├── PublishForm.vue    # 发布表单
│   │   ├── FavoriteButton.vue # 收藏按钮
│   │   ├── BargainPanel.vue   # 砍价面板
│   │   ├── ChatBox.vue        # 聊天框
│   │   ├── DiscussionPanel.vue# 讨论区
│   │   ├── ChartPanel.vue     # 图表容器
│   │   ├── SafetyNotice.vue   # 安全提醒
│   │   ├── BackToTop.vue      # 回到顶部
│   │   └── BackButton.vue     # 返回按钮
│   ├── stores/                # 4 个 Pinia Store
│   │   ├── userStore.ts       # 用户状态（登录/注册/会话恢复）
│   │   ├── itemStore.ts       # 商品状态（CRUD）
│   │   ├── favoriteStore.ts   # 收藏状态（切换/同步）
│   │   └── messageStore.ts    # 消息状态（会话/聊天/未读）
│   ├── api/                   # API 请求模块
│   │   ├── request.ts         # Axios 实例封装
│   │   ├── itemApi.ts         # 商品 API
│   │   ├── userApi.ts         # 用户 API
│   │   ├── favoriteApi.ts     # 收藏 API
│   │   ├── messageApi.ts      # 消息 API
│   │   └── noticeApi.ts       # 公告 API
│   ├── utils/                 # 工具函数
│   │   ├── constants.ts       # 常量定义
│   │   ├── date.ts            # 日期格式化
│   │   ├── statistics.ts      # 统计计算
│   │   └── logger.ts          # 日志工具
│   └── assets/
│       └── css/
│           └── theme.css      # 全局样式变量
├── docs/                      # 项目文档
│   ├── evidence/              # 每日证据卡（Day1-7）
│   ├── ai/                    # AI 协作记录
│   └── guide/                 # 使用指南
└── data/                      # JSON Server 数据文件
    ├── users.json
    ├── items.json
    ├── favorites.json
    ├── conversations.json
    ├── messages.json
    └── notices.json
```

---

## 核心功能

| 功能 | 说明 |
|------|------|
| **本地身份系统** | 注册/登录、localStorage 持久化、会话自动恢复 |
| **首页概览** | 轮播 Banner（热门推荐 + 平台公告）、四类快捷入口、最新发布 |
| **集市列表** | 四类信息混合展示、关键词搜索、类型/校区/状态筛选、排序 |
| **商品详情** | 动态路由展示不同类型专属字段、图片预览 |
| **信息发布** | 统一入口、四类动态表单、图片上传（JPG）、表单校验 |
| **收藏功能** | 收藏/取消、心跳动画、列表-详情-个人中心状态同步 |
| **模拟砍价** | 二手商品出价、砍价消息发送至消息中心 |
| **消息中心** | 会话列表（按人聚合）、聊天记录、消息发送、未读红点 |
| **个人中心** | 用户资料卡片、我的发布、我的收藏标签页切换 |
| **数据看板** | 4 个 ECharts 图表（类型占比/校区分布/状态统计/热门排行） |
| **浏览记录** | localStorage 自动保存（上限 50 条）、去重、一键清空 |
| **账号设置** | 查看用户信息、退出登录 |
| **安全提醒** | 校园交易安全须知折叠面板 |

---

## 架构说明

```
┌─────────────────────────────────────────────┐
│                 浏览器                        │
│  ┌─────────────────────────────────────────┐ │
│  │         Vue 3 前端应用                   │ │
│  │  ┌───────┐ ┌──────┐ ┌────────────┐    │ │
│  │  │ Views  │ │Components│ │  Router   │    │ │
│  │  └───┬───┘ └──────┘ └────────────┘    │ │
│  │      │ 调用                              │ │
│  │  ┌───▼───┐                              │ │
│  │  │Stores │  ←── Pinia 状态管理           │ │
│  │  └───┬───┘                              │ │
│  │      │ 调用                              │ │
│  │  ┌───▼───┐                              │ │
│  │  │  API  │  ←── Axios HTTP 封装          │ │
│  │  └───┬───┘                              │ │
│  └──────┼──────────────────────────────────┘ │
└─────────┼────────────────────────────────────┘
          │ HTTP 请求 (localhost:3000)
  ┌───────▼──────┐
  │  JSON Server │  ←── Mock RESTful API
  │  ┌────────┐  │
  │  │ db.json │  │  ←── 数据文件
  │  └────────┘  │
  └──────────────┘
```

---

## 7 天实训历程

| 天数 | 主题 | 核心成果 |
|------|------|----------|
| Day1 | 需求分析与项目初始化 | 页面清单、技术架构理解、项目初始化 |
| Day2 | 页面骨架与路由导航 | 8 个页面骨架、路由配置、导航布局 |
| Day3 | Mock 数据与列表渲染 | JSON Server 搭建、Axios 封装、列表渲染 |
| Day4 | 发布表单与数据新增 | 发布表单、API 模块（CRUD）、参数映射 |
| Day5 | 状态管理与用户中心 | 4 个 Pinia Store、收藏/消息/个人中心 |
| Day6 | 交互优化与体验完善 | Loading/Empty 状态、搜索筛选、代码清理 |
| Day7 | 综合验收与项目展示 | 功能走查、文档归档、Git 推送、答辩 PPT |

---

## Git 提交记录

```bash
Day1: init project structure
Day2: complete page skeleton and router navigation
Day3: add mock data and list rendering
Day4: connect core pages with api
Day5: complete interactions with stores
Day6: improve interaction states and user experience
Day7: finalize project documentation and evidence
```

---

## 项目文档

详细文档见 `docs/` 目录：

- `docs/evidence/Day1-7_Evidence.md` — 每日过程性证据
- `docs/evidence/Test_Record.md` — 功能测试记录
- `docs/ai/AI_Collaboration_Card.md` — AI 协作全记录
- `docs/guide/Environment_Setup.md` — 环境配置指南
- `docs/guide/Getting_Started.md` — 项目入门指南
- `docs/guide/Run_Guide.md` — 运行说明

---

## 许可

本仓库仅用于《校园轻集市》课程教学与实践。
