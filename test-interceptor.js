import axios from 'axios';

// 模拟localStorage
const mockLocalStorage = {
  token: 'test-token-123456',
  getItem: function(key) {
    return this[key];
  },
  setItem: function(key, value) {
    this[key] = value;
  },
  removeItem: function(key) {
    delete this[key];
  }
};

// 模拟window.localStorage
global.localStorage = mockLocalStorage;

// 测试1: 相对路径baseURL
console.log('=== 测试1: 相对路径baseURL (/api) ===');
const test1 = axios.create({
  baseURL: '/api'
});

// 模拟请求拦截器
const setupInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const url = config.url;
      console.log('URL:', url);
      const isLoginRequest = url.includes('/auth/login') || url.includes('/auth/register');
      console.log('是否为登录请求:', isLoginRequest);
      
      if (!isLoginRequest) {
        const token = localStorage.getItem('token');
        console.log('Token是否存在:', !!token);
        if (token) {
          const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${cleanToken}`;
          console.log('已添加Authorization头:', config.headers.Authorization);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// 设置拦截器
setupInterceptor(test1);

// 测试请求
const testRequest = async (instance, url, description) => {
  console.log(`\n--- ${description} ---`);
  try {
    // 不实际发送请求，只打印配置
    const config = await instance.interceptors.request.handlers[0].fulfilled({ url });
    console.log('最终配置:', JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('请求错误:', error);
  }
};

// 测试相对路径baseURL下的各种请求
testRequest(test1, '/auth/login', '相对路径 - 登录请求');
testRequest(test1, '/auth/register', '相对路径 - 注册请求');
testRequest(test1, '/employees', '相对路径 - 员工列表请求');

testRequest(test1, '/api/auth/login', '相对路径 - 带/api前缀的登录请求');
testRequest(test1, '/api/employees', '相对路径 - 带/api前缀的员工列表请求');

// 测试2: 完整URL baseURL
console.log('\n\n=== 测试2: 完整URL baseURL (http://47.116.114.170:3000/api) ===');
const test2 = axios.create({
  baseURL: 'http://47.116.114.170:3000/api'
});

setupInterceptor(test2);

// 测试完整URL baseURL下的各种请求
testRequest(test2, '/auth/login', '完整URL - 登录请求');
testRequest(test2, '/auth/register', '完整URL - 注册请求');
testRequest(test2, '/employees', '完整URL - 员工列表请求');

testRequest(test2, 'http://47.116.114.170:3000/api/auth/login', '完整URL - 带完整URL的登录请求');
testRequest(test2, 'http://47.116.114.170:3000/api/employees', '完整URL - 带完整URL的员工列表请求');

// 测试3: 复杂情况 - URL中包含auth但不是登录请求
testRequest(test1, '/api/authorization/check', '相对路径 - 包含auth但不是登录请求');
testRequest(test2, '/api/authorization/check', '完整URL - 包含auth但不是登录请求');

testRequest(test1, '/api/some/path/with/auth/in/it', '相对路径 - path中包含auth');
testRequest(test2, '/api/some/path/with/auth/in/it', '完整URL - path中包含auth');

console.log('\n\n=== 测试完成 ===');
