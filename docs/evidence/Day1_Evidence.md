# Day1 过程性证据

## 基本信息
- **日期**: 2026-06-27
- **阶段**: 需求分析、架构理解与项目初始化

---

## 1. 业务场景理解

### 四类校园场景

| 场景 | 说明 |
|------|------|
| 二手交易 | 学生之间闲置物品流转，如教材、自行车、数码产品 |
| 失物招领 | 校园物品遗失与拾获互助，如校园卡、钥匙、水杯 |
| 拼单搭子 | 临时性协作需求，如奶茶拼单、学习搭子、运动搭子 |
| 跑腿委托 | 临时任务协助，如代取快递、代买物品、代送文件 |

---

## 2. 页面清单

| 页面 | 说明 |
|------|------|
| 身份创建页 | 创建本地用户档案 |
| 今日集市首页 | 展示概览和功能入口 |
| 集市信息列表页 | 展示四类校园信息、搜索筛选 |
| 信息详情页 | 展示单条信息完整内容 |
| 信息发布页 | 发布四类校园信息 |
| 消息中心页 | 会话列表和聊天记录 |
| 个人中心页 | 用户资料、我的发布、我的收藏 |
| 趋势看板页 | 数据统计图表展示 |

---

## 3. 技术架构理解

```
浏览器 ──> Vue3 前端应用 ──> Axios ──> JSON Server ──> db.json
```

- **Vue3**: 构建页面和组件
- **Vue Router**: 页面路由导航
- **Pinia**: 管理用户、收藏、消息等前端状态
- **Axios**: 前后端数据通信
- **Element Plus**: UI 组件库
- **JSON Server**: Mock API 服务，提供 RESTful 接口
- **ECharts**: 数据可视化图表
- **Git**: 本地版本管理

本项目采用"前端 + Mock API"模式，JSON Server 负责提供数据和 CRUD 接口。

---

## 4. 项目初始化

### Vite 创建项目
```bash
npm create vite@latest campus-market -- --template vue-ts
cd campus-market
```

### 安装依赖
```bash
npm install vue-router pinia axios element-plus echarts
npm install json-server --save-dev
npm install vite @vitejs/plugin-vue --save-dev
```

### 项目目录结构
```
campus-market/
├── index.html
├── package.json
├── vite.config.ts
├── db.json
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   ├── views/
│   ├── components/
│   ├── stores/
│   ├── api/
│   └── utils/
└── docs/
```

---

## 5. AI 辅助使用记录

### 使用场景
- 理解了四类校园场景如何转化为功能模块
- 明确了项目中 Vue3、JSON Server、Axios、Pinia 各自的职责
- 生成了页面清单和项目目录结构建议

### Prompt 示例
```
校园轻集市有四类场景：二手交易、失物招领、拼单搭子、跑腿委托。
请生成适合 Vue3 前端实训的页面清单和功能模块清单。
控制功能复杂度，不涉及真实支付、订单和权限系统。
```

---

## 6. Git 提交

```bash
git init
git add .
git commit -m "init project structure"
```

---

## 7. 验收

| 验收项 | 结果 |
|--------|------|
| 理解四类业务场景 | ✅ |
| 完成页面清单 | ✅ |
| Vue3 项目初始化完成 | ✅ |
| 基础依赖安装完成 | ✅ |
| Git 本地仓库初始化 | ✅ |
| 首次稳定版本提交 | ✅ |
