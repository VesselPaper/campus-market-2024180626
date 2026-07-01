// ============================================
// Axios 封装 — 整个项目都用这个发请求
// ============================================
import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'
import { logger } from '@/utils/logger'

// 创建一个 Axios 实例，设置基础地址和超时时间
const request = axios.create({
  baseURL: API_BASE_URL,  // 后端地址：http://localhost:3000
  timeout: 10000,         // 10秒没响应就报错
})

// 拦截器：所有请求回来都会经过这里，统一处理错误
request.interceptors.response.use(
  (res) => res,            // 成功就直接返回数据
  (error) => {
    // 失败时打印错误，再抛出去让调用方处理
    logger.error('API Error:', error.message)
    return Promise.reject(error)
  },
)

export default request
