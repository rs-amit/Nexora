import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

/*
Attach access token
*/

api.interceptors.request.use((config) => {

  const token = localStorage.getItem("accessToken")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

/*
Handle token refresh
*/

api.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true

      try {

        /*
        Refresh access token
        */

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true
          }
        )

        const newAccessToken = response.data.accessToken

        /*
        Save new access token
        */

        localStorage.setItem(
          "accessToken",
          newAccessToken
        )

        /*
        Retry original request
        */

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return api(originalRequest)

      } catch (refreshError) {

        /*
        Refresh token expired
        */

        localStorage.removeItem("accessToken")

        window.location.href = "/login"

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api