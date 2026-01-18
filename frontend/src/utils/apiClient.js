import axios from "axios";


const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});



// Request intercepter - runs before every request
// apiClient.interceptors.request.use(
//   (config) => {
//     // const token = localStorage.getItem('user_token');
    
//     // // Define list of endpoints that DON'T need a token
//     // const publicEndpoints = ['/login', '/register', '/forgot-password'];

//     // // Check if the current request URL is in that list
//     // const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));

//     // if (token && !isPublic) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }

//     // return config;
//   },
//   error => Promise.reject(error)
// );


// Response intercepter - runs after every response
apiClient.interceptors.response.use(
  (response) => {
    // 200 OK
    return response; 
  },
  (error) => {
    // Global logic (Redirects/Logs)
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }

    if (error.response?.status === 500) {
      console.error("Server error:", error.response.data);
    }

  
    // This allows your local try/catch to see the error too.
    return Promise.reject(error);
  }
)

export default apiClient;