# 浏览器兼容性说明

## 支持的浏览器范围

本项目已配置为支持市面上主流的桌面和移动端浏览器：

### 桌面浏览器
- **Chrome**: >= 80（及最近 2 个版本）
- **Edge**: >= 80（及最近 2 个版本）
- **Firefox**: >= 78（包括 Firefox ESR）
- **Safari**: >= 12（及最近 2 个版本）
- **Opera**: 最新版本

### 移动端浏览器
- **iOS Safari**: >= 12
- **Chrome Android**: >= 80
- **Samsung Internet**: >= 10
- **Android Browser**: >= 8（Android 8.0+）
- **微信内置浏览器**: 支持（基于 Chromium）
- **QQ 浏览器**: 支持
- **UC 浏览器**: 支持

### 不支持
- Internet Explorer 11 及以下
- Opera Mini
- 已停止维护的浏览器

## 兼容性配置

### 1. Browserslist 配置
- `.browserslistrc`: 定义浏览器支持范围
- `package.json`: 包含 browserslist 字段

### 2. Vite Legacy 插件
- 自动为旧浏览器生成兼容代码
- 提供现代和传统两个版本的代码
- 自动注入必要的 polyfills

### 3. CSS 兼容性
- PostCSS + Autoprefixer 自动添加 CSS 前缀
- 支持所有主流浏览器的 CSS 特性

### 4. JavaScript 兼容性
- 构建目标: ES2015
- 自动转译现代 JavaScript 语法
- 代码压缩使用 Terser（兼容 ES2015）

## 构建说明

### 安装依赖
```bash
cd frontend
npm install
```

### 构建项目
```bash
npm run build
```

构建后会生成：
- 现代浏览器版本（modern chunks）
- 传统浏览器版本（legacy chunks）
- 自动根据浏览器能力加载对应版本

## 测试建议

建议在以下环境中测试：
1. **桌面浏览器**
   - Chrome 最新版
   - Firefox 最新版
   - Safari（macOS）
   - Edge 最新版

2. **移动端浏览器**
   - iOS Safari（iPhone/iPad）
   - Android Chrome
   - 微信内置浏览器
   - 其他主流移动浏览器

## 性能优化

- 代码分割：React、Ant Design、Router 分别打包
- 按需加载：旧浏览器只加载 legacy 版本
- 压缩优化：使用 Terser 进行代码压缩
- CSS 优化：Autoprefixer 自动处理 CSS 兼容性

## 常见问题

### Q: 为什么构建后的文件变多了？
A: 因为 legacy 插件会为旧浏览器生成额外的兼容文件，这是正常的。现代浏览器只会加载 modern 版本。

### Q: 如何查看支持的浏览器列表？
A: 运行 `npx browserslist` 可以查看当前配置支持的浏览器列表。

### Q: 如何更新浏览器支持范围？
A: 修改 `.browserslistrc` 或 `package.json` 中的 `browserslist` 字段，然后重新构建。

