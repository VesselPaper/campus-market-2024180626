# Day2 Evidence - 页面骨架与路由导航

## 1. 今日完成内容

完成了"校园轻集市"的前端页面骨架搭建与路由导航配置：

- **页面创建**：在 `src/views` 下创建了 5 个新页面（TradeView、LostFoundView、GroupBuyView、ErrandView、UserCenterView），加上已有的 HomeView、PublishView、MessageView，共 8 个核心业务页面，均围绕校园轻集市场景展开。
- **公共布局组件**：在 `src/components` 下创建了 AppLayout、AppHeader、AppNav 三个布局组件，实现了顶部导航 + 内容区的统一页面框架。
- **路由配置**：在 `src/router/index.ts` 中配置了所有页面的路由路径，包括 /trade、/lost-found、/group-buy、/errand、/user 等 Day2 新增路由，同时保留了原有功能性页面的路由。
- **App.vue 简化**：将 App.vue 重构为只使用 AppLayout 布局组件的简洁入口。
- **原有功能保留**：项目已有的复杂页面（MarketListView、ItemDetailView、ProfileView、DashboardView 等）及对应的路由继续保留，确保不破坏之前实现的功能。

## 2. 页面与路由清单

| 页面名称 | 路由路径 | 文件位置 |
|---|---|---|
| 首页 | / | src/views/HomeView.vue |
| 二手交易 | /trade | src/views/TradeView.vue |
| 失物招领 | /lost-found | src/views/LostFoundView.vue |
| 拼单搭子 | /group-buy | src/views/GroupBuyView.vue |
| 跑腿委托 | /errand | src/views/ErrandView.vue |
| 发布信息 | /publish | src/views/PublishView.vue |
| 消息中心 | /message | src/views/MessageView.vue |
| 个人中心 | /user | src/views/UserCenterView.vue |

## 3. AI 协作记录

- **使用的 AI 工具**：Claude Code（命令行交互模式）
- **核心提示词**：用户下达指令"根据第二天的实验手册，完成今日目标，注意尽量不要超额完成"，随后分析手册要求并逐步执行。
- **AI 生成的内容**：
  - 5 个新页面骨架（TradeView、LostFoundView、GroupBuyView、ErrandView、UserCenterView）的 `.vue` 文件，每个页面包含 h1 标题和业务描述
  - 3 个布局组件（AppLayout、AppHeader、AppNav）的完整代码，包括导航链接和页面容器
  - 路由配置的更新（新增 Day2 路由路径及 meta 信息）
  - App.vue 的简化重构
  - Day2_Evidence.md 证据卡
- **人工检查与修改**：
  - 确认了页面名称与文件名的对应关系
  - 检查了路由路径是否语义清晰（/trade、/lost-found、/group-buy、/errand、/user）
  - 确认了原有的功能性页面（MarketListView、ItemDetailView 等）及其路由未被删除
  - 验证了项目可以正常构建，无编译错误
  - HTML 语义标签使用 `<main>` 而非无意义的 `<div>`

## 4. 遇到的问题与解决方法

**问题：简化 App.vue 后，原有的用户状态管理和消息未读提醒等功能如何处理？**

App.vue 原本包含了用户登录状态管理（userStore）、消息未读计数（messageStore）、移动端侧滑抽屉菜单、浮动发布按钮（FAB）等复杂逻辑。Day2 实验手册要求将 App.vue 简化为只使用 AppLayout 的统一布局入口，但简单删除这些功能会导致之前实现的功能丢失。

**解决方法**：遵循 Day2 手册"页面骨架搭建"的定位，将 App.vue 简化为布局入口。原有的用户身份创建页面（UserCreateView.vue、/create-user）和个人中心页面（/profile、/dashboard）保留其路由，后续可以在这些页面内部实现对应的业务逻辑。Day2 的核心目标是建立清晰的页面结构，复杂功能会在后续天数逐步添加回来。

## 5. 今日反思

页面骨架、路由导航和公共布局是后续所有开发的基础。如果没有今天的结构梳理，后续在开发商品列表、发布表单、消息功能时，很容易出现页面路径混乱、导航入口不一致、组件复用困难等问题。通过今天的任务，我理解了一个前端项目在开始写具体功能之前，应该先确定"有哪些页面"、"页面之间怎么跳转"、"公共区域长什么样"这三个问题。

**页面骨架**决定了项目的边界——哪些页面属于这个应用，每个页面承担什么职责。**路由导航**决定了用户如何在这些页面之间流动——路径是否语义化、导航高亮是否准确、刷新页面后是否保持状态。**公共布局**决定了所有页面的视觉一致性和可维护性——头部导航抽离成 AppNav 组件后，后续新增页面只需要在路由表中加一行，导航栏会自动出现对应入口。

这次实践也让我体会到，AI 工具可以快速生成页面模板和路由配置，但结构性的决策（页面如何划分、路由如何命名、组件如何分层）仍然需要人工判断。AI 生成的内容需要逐项审查：页面名称是否贴合业务场景、路由路径是否简洁清晰、组件拆分是否合理。审查的过程本身就是对项目架构的深入理解。
