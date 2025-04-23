import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

//If accessToken token is expired, refresh it, and prepare for quened requests
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

//Execute quened requests after accessToken token refresh
const onRefreshTokenSuccess = async () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

//Request interceptor
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

//Handle refresh accessToken token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401 && !originalRequest?._retry) {
      // 進來代表：
      // 1) 收到 401
      // 2) 這個請求還沒標記過 _retry（避免重複進來）
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }
      originalRequest._retry = true;
      isRefreshing = true; // 開始「刷新流程」
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/refresh-token-seller`,
          {},
          {
            withCredentials: true,
          }
        );
        // 刷新成功，把 isRefreshing = false
        isRefreshing = false;
        // 把所有暫存在 subscribers 裡、等待重試的請求都一次喚醒、並重送
        await onRefreshTokenSuccess();
        // 然後把自己這支請求也重送一次
        return axiosInstance(originalRequest);
      } catch (error) {
        console.error(error);
        isRefreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;


//! 還沒在刷新中（isRefreshing === false）

// 某支請求如果遇到 401，就自己把 isRefreshing = true，去呼叫一次 /refresh-token。

//! 正在刷新時（isRefreshing === true）

// 新遇到 401 的任何請求都不會再去呼叫 /refresh-token，而是走到那段：

// if (isRefreshing) {
//   return new Promise(resolve => {
//     subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
//   });
// }
// 也就是把重試放到佇列裡，等刷新流程結束後（onRefreshTokenSuccess() 被呼叫時）再一口氣把這些請求都重跑一次。

//! 刷新結束

// 刷新成功 → 呼叫 onRefreshTokenSuccess()，把所有佇列中的請求 callback 都執行一遍，然後清空佇列、把 isRefreshing = false。

// 刷新失敗 → 清空佇列、把 isRefreshing = false，並跳到登入頁。

// 所以，isRefreshing 就是個「全域鎖」：

// 鎖關閉（false）→ 第一支 401 請求可以自己去刷新；

// 鎖打開（true）→ 後續的 401 請求都得排隊等鎖開；
