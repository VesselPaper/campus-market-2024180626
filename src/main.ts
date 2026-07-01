// 导入 Vue 核心库，用于创建应用实例
import { createApp } from 'vue'
// 导入 Pinia 状态管理库
import { createPinia } from 'pinia'
// 导入 Element Plus UI 组件库
import ElementPlus from 'element-plus'
// 导入 Element Plus 默认样式
import 'element-plus/dist/index.css'
// 导入项目自定义主题样式
import '@/assets/css/theme.css'

// 导入根组件 App.vue
import App from './App.vue'
// 导入路由配置
import router from './router'

// 创建 Vue 应用实例
const app = createApp(App)

// 全局错误捕获——任何未捕获的渲染/运行时错误都会到这里
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue 全局错误]', err, info)
}

// 注册 Pinia 状态管理
app.use(createPinia())
// 注册 Vue Router 路由
app.use(router)
// 注册 Element Plus 组件库
app.use(ElementPlus)

// 将应用挂载到 index.html 中 id 为 app 的 DOM 元素上
app.mount('#app')
