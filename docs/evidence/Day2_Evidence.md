# Day2 Evidence - 页面骨架与路由导航

## 1. 今日完成内容

今天完成了"校园轻集市"的页面骨架搭建与路由导航配置，主要包括以下工作：

首先，根据业务需求梳理了页面清单，确定了 8 个核心业务页面：首页、二手交易、失物招领、拼单搭子、跑腿委托、发布信息、消息中心、个人中心。然后在 src/views 目录下创建了对应的页面文件，每个页面目前是基础骨架结构，包含页面标题和业务描述，没有添加复杂逻辑。

接着，在 src/components 目录下创建了三个公共布局组件：AppLayout.vue 负责整体页面容器和内容区布局，AppHeader.vue 负责顶部品牌区和导航区域，AppNav.vue 负责导航菜单链接。这三个组件相互配合，形成了统一的页面框架。

然后，在 src/router/index.ts 中配置了 Vue Router 路由，为每个页面分配了语义化的路径（如 /trade、/lost-found、/group-buy、/errand、/user），并设置了路由名称和 meta 标题信息。

最后，验证了所有页面可以通过路由正常访问，项目构建没有报错。

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

本次开发使用了 Claude Code（命令行交互模式）作为 AI 辅助工具。

核心提示词为："根据第二天的实验手册，完成今日目标，注意尽量不要超额完成"。手册内容包含了页面清单、路由配置示例、布局组件代码和证据卡要求。

AI 生成的内容包括：
- 5 个新页面文件（TradeView、LostFoundView、GroupBuyView、ErrandView、UserCenterView）的 .vue 骨架代码
- 3 个布局组件（AppLayout、AppHeader、AppNav）的完整代码
- 路由配置文件的更新
- Day2 证据卡初稿

人工检查与修改的内容：
- 检查了每个页面的文件名是否与对应的业务场景一致。比如 TradeView 对应的是"二手交易"而不是"全部商品"
- 检查了路由路径是否简洁清晰，避免出现 /page1、/test 这类无意义路径
- 确认了 RouterLink 的 to 属性与路由表中的 path 一致，避免导航无法跳转
- 检查了页面骨架代码是否过于复杂，删除了 AI 可能生成的多余样式和逻辑
- 验证了 npm run dev 和 npm run build 都能正常运行

## 4. 遇到的问题与解决方法

**问题：使用语义化路由路径后，导航高亮不生效。**

在 AppNav.vue 中使用 RouterLink 进行导航，路由路径设置为 /lost-found 和 /group-buy 这种带连字符的格式。一开始 RouterLink 的 to 属性写成了驼峰形式的路径（如 /lostFound），导致点击导航后页面跳转到了 404 页面，控制台报错说找不到匹配的路由。

排查后发现是 to 属性的值与路由表中 path 字段的值不匹配。路由表中 path 使用的是连字符格式（kebab-case），而 RouterLink 中写成了驼峰格式。

**解决方法**：将 AppNav.vue 中所有 RouterLink 的 to 属性值与 router/index.ts 中对应的 path 值一一对照，统一使用连字符格式。例如 /lost-found、/group-buy、/create-user 等。修正后所有导航链接都能正常跳转，并且 router-link-active 类自动添加到当前页面对应的链接上，实现了导航高亮效果。

## 5. 今日反思

通过今天的任务，我理解了在开发一个多页面前端应用时，不能直接从某一个页面开始写代码，而是要先搭建页面骨架、配置路由导航、设计公共布局。

页面骨架的作用是明确项目的边界——哪些页面属于这个应用，每个页面负责什么内容。今天创建的 8 个页面覆盖了校园轻集市的核心业务场景：二手交易、失物招领、拼单搭子、跑腿委托，以及发布、消息、个人中心等配套功能。有了清晰的页面清单，后续开发就不会遗漏或重复。

路由导航的作用是定义用户在不同页面之间的跳转关系。使用 Vue Router 的命名路由和 meta 信息，可以让后续的导航高亮、页面标题管理和权限控制变得更加方便。今天在配置路由时特别注意了路径的语义化，用 /trade 而不是 /page1，用 /lost-found 而不是 /a，这样代码的可读性和可维护性都更好。

公共布局的作用是保证所有页面共享统一的视觉结构和交互方式。将 AppHeader、AppNav 抽离成独立组件后，如果后续需要修改导航栏，只需要改动一个文件，而不需要在每个页面中重复修改。这种组件化的思维方式在后续开发中会越来越重要。

总的来说，今天的任务虽然不涉及复杂业务逻辑，但页面骨架、路由导航和公共布局这三件事决定了项目的整体结构是否清晰。如果这一步做得太随意，后续开发很容易出现路径混乱、导航不一致、组件难以复用等问题。
