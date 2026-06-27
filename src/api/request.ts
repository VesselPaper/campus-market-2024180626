import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

request.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error('API Error:', error.message)
    return Promise.reject(error)
  },
)

export default request
