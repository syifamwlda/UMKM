import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Sisipkan Bearer token Sanctum jika ada di localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sanctum_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Tangani respons 401 (Unauthenticated) diarahkan ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus token dan data sesi yang sudah tidak valid
      localStorage.removeItem('sanctum_token')
      localStorage.removeItem('auth_user')

      // Trigger event custom agar AuthContext dapat mereset state seketika
      window.dispatchEvent(new Event('auth:unauthorized'))

      // Alihkan ke layar login
      if (window.location.hash !== '#login') {
        window.location.hash = '#login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

