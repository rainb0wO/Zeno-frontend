export default {
  plugins: {
    autoprefixer: {
      // 使用 browserslist 配置自动添加 CSS 前缀
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'iOS >= 12',
        'Safari >= 12',
        'Chrome >= 80',
        'Edge >= 80',
        'Android >= 8',
        'Samsung >= 10',
        'not IE 11',
        'not op_mini all',
      ],
    },
  },
}

