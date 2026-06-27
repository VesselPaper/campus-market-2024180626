# 校园轻集市

AI 辅助前端工程实践项目 — Vue3 + JSON Server 全功能校园信息平台。

---

## 项目简介

面向大学生校园生活的轻量化信息平台，覆盖 **二手交易、失物招领、拼单搭子、跑腿委托** 四类场景，支持信息浏览、发布、收藏、砍价、消息沟通、个人管理和数据看板等完整功能。

本项目为教学型前端实训项目，使用 JSON Server 模拟后端 API，不涉及真实支付、权限系统和实时通信。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 + TypeScript | 前端框架 |
| Vite | 构建工具 |
| Vue Router | 路由导航 |
| Pinia | 状态管理 |
| Axios | HTTP 请求 |
| Element Plus | UI 组件库 |
| ECharts | 数据可视化 |
| JSON Server | Mock API |

---

## 快速开始

```bash
# 1. 安装依赖
npm install --legacy-peer-deps

# 2. 启动 Mock API 服务（终端1）
npx json-server --watch db.json --port 3000

# 3. 启动前端开发服务器（终端2）
npx vite --port 5173

# 4. 浏览器访问
http://localhost:5173
```

或者双击运行 `scripts/start.bat` 一键启动。

---

## 项目结构

```
campus-market/
├── db.json                    # Mock API 数据
├── src/
│   ├── main.ts                # 入口文件
│   ├── App.vue                # 根组件 + 导航
│   ├── router/index.ts        # 路由配置
│   ├── types/index.ts         # 类型定义
│   ├── views/                 # 8个页面
│   │   ├── UserCreateView     # 身份创建
│   │   ├── HomeView           # 首页
│   │   ├── MarketListView     # 集市列表
│   │   ├── ItemDetailView     # 信息详情
│   │   ├── PublishView        # 信息发布
│   │   ├── MessageView        # 消息中心
│   │   ├── ProfileView        # 个人中心
│   │   └── DashboardView      # 趋势看板
│   ├── components/            # 8个组件
│   ├── stores/                # 4个Pinia Store
│   ├── api/                   # 5个API模块
│   └── utils/                 # 工具函数
├── docs/
│   ├── evidence/              # 过程证据
│   └── guide/                 # 使用指南
└── scripts/                   # 工具脚本
```

---

## 核心功能

| 功能 | 说明 |
|------|------|
| 本地身份创建 | 填写昵称/学院/校区/角色，localStorage 持久化 |
| 首页概览 | 欢迎信息、快捷入口、最新信息、统计数字 |
| 信息浏览 | 列表 + 关键词搜索 + 类型/校区/状态筛选 + 排序 |
| 信息详情 | 动态路由展示不同类型专属字段 |
| 信息发布 | 统一入口，四类动态表单，字段校验 |
| 收藏功能 | 收藏/取消，列表-详情-个人中心状态同步 |
| 模拟砍价 | 二手商品出价 + 卖家自动回复 |
| 消息中心 | 会话列表 + 聊天记录 + 消息发送 + 自动回复 |
| 个人中心 | 用户资料 + 我的发布 + 状态更新 + 我的收藏 |
| 趋势看板 | 4 个 ECharts 图表（类型/校区/状态/热度） |
| 安全提醒 | 交易安全提示折叠面板 |

---

## Git 版本

```
main: 校园轻集市完整项目
  ├── init project structure     (Day1)
  ├── add basic pages and router (Day2)
  ├── add json server mock data  (Day3)
  ├── connect core pages with api (Day4)
  ├── complete interactions with stores (Day5)
  ├── add dashboard and optimize features (Day6)
  └── final project submission   (Day7) ✓
```

---

## License

本仓库仅用于《校园轻集市》课程教学与实践。
