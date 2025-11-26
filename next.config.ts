import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  reactCompiler: true,
  webpack(config) {
    // 找到处理 SVG 的现有规则
    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: RegExp; resourceQuery?: { not: RegExp[] } }) =>
        rule.test?.test?.('.svg')
    )

    // 添加两个规则：一个用于 ?url 模式，另一个用于默认的 SVGR 转换
    config.module.rules.push(
      {
        // 保留现有文件 loader 处理 *.svg?url 的情况
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/ // *.svg?url
      },
      {
        // 对于其他 *.svg 导入使用 SVGR 转换
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] },
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              icon: true,
              svgo: true,
              // 配置 SVGO 插件，移除写死的 fill 和 stroke 属性
              svgoConfig: {
                plugins: [
                  {
                    name: 'removeAttrs',
                    params: { attrs: '(fill|stroke)' }
                  }
                ]
              }
            }
          }
        ]
      }
    )

    // 修改原有文件 loader 排除 *.svg 文件
    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js'
      }
    }
  }
}

export default nextConfig
