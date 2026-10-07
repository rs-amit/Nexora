import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

/*
Render free-tier services sleep after inactivity and rate-limit requests
made while they're waking back up (429 "hibernate-rate-limited"). Retry
those with backoff instead of surfacing a hard failure.
*/

const WAKE_RETRY_DELAYS_MS = [3000, 5000]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/*
Fires a "retry" event each time a request is retried after a 429, so UI
code (e.g. the login form) can show a "server is waking up" message
without every caller having to plumb a callback through.
*/

export const wakeEvents = new EventTarget()

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

    if (error.response?.status === 429) {

      originalRequest._wakeRetryCount =
        originalRequest._wakeRetryCount || 0

      if (originalRequest._wakeRetryCount < WAKE_RETRY_DELAYS_MS.length) {

        const delay =
          WAKE_RETRY_DELAYS_MS[originalRequest._wakeRetryCount]

        originalRequest._wakeRetryCount += 1

        wakeEvents.dispatchEvent(new Event("retry"))

        await wait(delay)

        return api(originalRequest)
      }
    }

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