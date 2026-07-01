# Day4 Evidence - Axios 封装与核心功能打通

## 1. 今日完成内容

今天按照实训计划完成了前端与 JSON Server Mock API 的接口通信，使页面从静态展示转变为动态数据驱动，重点打通了集市列表、信息详情和信息发布三个核心功能。

首先创建了 Axios 实例，配置了基础请求地址 `http://localhost:3000`，并封装了统一的请求错误处理。所有 API 请求都通过 request.ts 统一管理，当后端服务未启动时会在页面显示清晰提示。

然后按资源模块拆分了 API 文件：itemApi.ts 负责信息的增删改查（getItems、getItemById、createItem、updateItem、deleteItem），favoriteApi.ts 负责收藏关系的查询和添加，messageApi.ts 负责会话和消息的 CRUD，noticeApi.ts 获取平台公告，userApi.ts 操作用户数据。

集市列表页（MarketListView）从 itemApi 动态获取 items 数据，不再使用静态数据。实现了关键词搜索、类型筛选、校区筛选、状态筛选和排序功能，筛选条件变化后重新请求后端数据。

详情页（ItemDetailView）根据 URL 中的 id 参数调用 getItemById 获取单条信息，并在页面中展示标题、描述、价格、图片、标签、发布者等字段。访问详情页时自动增加 viewCount。

发布页（PublishView）实现了表单提交功能，通过 createItem 将新信息写入 db.json。发布成功后自动跳转到列表页，并显示成功提示。不同信息类型（二手/失物/拼单/跑腿）展示不同的表单字段。

所有接口请求都处理了 loading 加载状态和错误提示，使用 Element Plus 的 ElMessage 组件展示操作结果。

## 2. 新增文件清单

| 文件 | 功能 |
|---|---|
| src/api/request.ts | Axios 实例封装，基础 URL 配置和统一错误处理 |
| src/api/itemApi.ts | 信息 API（getItems、getItemById、createItem、updateItem、deleteItem） |
| src/api/favoriteApi.ts | 收藏 API（getFavorites、addFavorite、removeFavorite） |
| src/api/messageApi.ts | 消息 API（getConversations、getMessages、sendMessage、updateConversation） |
| src/api/noticeApi.ts | 公告 API（getNotices） |
| src/api/userApi.ts | 用户 API（getUsers、getUserById、createUser） |
| src/utils/logger.ts | 日志工具，统一输出格式 |

## 3. 修改文件清单

| 文件 | 修改内容 |
|---|---|
| src/views/MarketListView.vue | 接入 itemApi 动态渲染列表，添加搜索和筛选逻辑 |
| src/views/ItemDetailView.vue | 接入 getItemById，动态展示详情数据 |
| src/views/PublishView.vue | 接入 createItem，表单提交写入 db.json |
| src/stores/itemStore.ts | Pinia store 封装 itemApi 调用，管理 items 状态 |
| src/stores/userStore.ts | Pinia store 封装 userApi，管理当前用户 |
| src/stores/favoriteStore.ts | Pinia store 封装 favoriteApi，管理收藏状态 |
| src/stores/messageStore.ts | Pinia store 封装 messageApi，管理消息数据 |

## 4. AI 协作记录

本次开发继续使用 Claude Code 作为 AI 辅助工具。

核心提示词围绕 Axios 封装和 API 打通展开。AI 生成了 request.ts 的统一请求封装、各 API 模块的方法定义和 Pinia store 中的接口调用逻辑。

人工检查与修改的内容：
- 确认了 request.ts 中的 baseURL 与 JSON Server 端口一致
- 检查了 itemApi.ts 中筛选参数的字段名称是否与 db.json 匹配（如 title_like 用于关键词搜索）
- 验证了不同类型信息在发布页中的差异化表单字段
- 检查了列表页筛选条件重置时是否需要重新请求数据
- 测试了后端未启动时的错误提示是否清晰

## 5. 遇到的问题与解决方法

**问题：列表页搜索和筛选参数与 JSON Server 查询语法不匹配。**

在实现关键词搜索时，Axios 请求传参 `params: { keyword: searchText }`，但 JSON Server 使用 `title_like` 作为模糊查询参数名，而不是 `keyword`，导致搜索无结果。

**解决方法**：在 itemApi.ts 中将前端参数名映射为 JSON Server 识别的查询参数。`keyword` → `title_like`，`type` → `type`（精确匹配），`campus` → `campus`，`status` → `status`。排序参数映射为 `_sort` 和 `_order`。通过这个映射层，前端组件不需要关心后端的具体参数名，只需要传递业务含义的参数即可。

## 6. 今日反思

通过今天的任务，我理解了前端项目接入 API 的标准流程。Axios 实例的封装看似简单，但统一错误处理带来了很大的便利——所有接口报错都在 request.ts 的拦截器中集中处理，不需要在每个组件中重复写 try/catch。

API 模块按资源拆分（itemApi、userApi、favoriteApi 等）的方式让代码更容易维护。每个 API 文件只关注一个数据资源，方法名清晰（getItems、createItem），使用时一目了然。

另一个体会是参数映射层的重要性。前端组件使用业务含义的参数（keyword、sortBy），API 模块负责转换为后端理解的参数（title_like、\_sort）。这样即使后端接口发生变化，只需要修改 API 模块，不需要改动大量组件代码。

Pinia store 封装 API 调用的模式也让组件逻辑更清晰。组件只需要调用 `itemStore.fetchItems(params)`，不需要关心请求是怎么发的、数据是怎么存的。store 内部管理 loading、error 和 data，组件只需响应式绑定即可。
