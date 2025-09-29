# Lingo 项目文档

这是一个tauri项目，不要执行预览。

## 目录
- [项目结构](#项目结构)
- [窗口管理](#窗口管理)
- [命名规范](#命名规范)
- [开发指南](#开发指南)

## 项目结构
```
lingo/
├── docs/                 # 项目文档
├── public/               # 静态资源
├── src/                  # 源代码
│   ├── global/           # 全局样式和布局
│   ├── lib/              # 通用工具和函数
│   ├── windows/          # 窗口相关代码
│       ├── index/        # 主窗口
│       ├── settings/     # 设置窗口
│       └── ...           # 其他窗口
├── src-tauri/            # Tauri后端代码
└── ...
```

## 窗口管理

### 窗口命名规范
- 窗口文件夹名称使用小写，如 `index`, `settings`
- 每个窗口文件夹包含 `main.tsx` 作为入口文件
- 窗口HTML文件放在项目根目录，如 `index.html`, `settings.html`
- 主窗口在应用启动时自动打开
- 其他窗口通过API按需打开，不自动启动
- 特定窗口的操作，其他窗口想要调用，通过 /src/windows/{window-name}/mod.ts 导出的函数进行操作

## 命名规范

### 文件命名
- kebab-case 命名，如 `open-window.ts`
