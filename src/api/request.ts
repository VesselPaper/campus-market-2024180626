import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'
import { logger } from '@/utils/logger'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

request.interceptors.response.use(
  (res) => res,
  (error) => {
    logger.error('API Error:', error.message)
    return Promise.reject(error)
  },
)

export default request
