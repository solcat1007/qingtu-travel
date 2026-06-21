# 晴途 QingTu — 二次元文旅 3D 地图网站

> 一个融合 **Three.js 3D 中国地图**、**高铁/航空/公交 3D 交通系统**、**192 城全景数据库**的二次元风格旅游网站。
> 深色科技风 x 毛玻璃 UI x 实时数据引擎，零 API 依赖离线可用。

## 项目概览

晴途是一个全栈旅游 Web 应用，以 3D 交互地图为核心，探索中国 192 个城市的景点、美食、文化和交通信息。采用 Three.js 构建三维地图，Express + SQL.js 提供离线数据库引擎。

## 技术栈

### 前端
- **Three.js**：3D 中国地图渲染，城市标记/航线/高铁线路动画
- **原生 JavaScript**：路由/UI/交互 完全自研，无框架依赖
- **CSS3**：毛玻璃效果 (backdrop-filter)、CSS 动画、渐变主题

### 后端
- **Express.js**：RESTful API 服务，路由/中间件/静态文件
- **SQL.js**：SQLite WebAssembly 离线数据库引擎
- **Node.js**：异步 I/O，文件缓存，流式响应

### 3D 系统
- **高铁 3D 系统**：实时列车位置动画，线路粒子流
- **航空 3D 系统**：航班航线动画，机场标记
- **公交 3D 系统**：城市内交通网络可视化
- **天气粒子**：城市实时天气氛围动画

## 核心功能

### 地图交互
- 可拖拽/缩放 3D 中国地图，鼠标悬停显示城市信息
- 城市搜索 + 自动定位 + 飞行动画跳转
- 白天/夜晚/四季主题自动切换

### 城市详情
- 景点百科：热门景点介绍 + 图片 + 攻略
- 美食指南：地方特色美食 + 推荐餐厅
- 文化探索：历史/民俗/方言/非遗
- 交通指南：机场/火车站/公交线路
- 天气信息：实时天气 + 近 7 日预报

### 路线规划
- 智能路线推荐（高铁/飞机/自驾）
- 多城市串游路线规划
- 旅游攻略生成

## 项目结构

```
qingtu-travel/
  app.js              # Express 主入口
  package.json
  public/             # 静态资源
    index.html        # 主页面
    css/
    js/
      main.js         # 前端主逻辑
      three-map.js    # Three.js 3D 地图模块
      router.js       # 前端路由
      ...
  data/               # 离线数据库
    cities.db         # SQL.js 城市数据库
    routes.db         # 交通路线数据库
  scripts/            # 构建/数据脚本
  views/              # 模板视图
```

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器
open http://localhost:3000
```

## API 概览

| 端点 | 说明 |
|------|------|
| GET /api/cities | 全部城市列表 |
| GET /api/city/:id | 城市详情 |
| GET /api/routes/:from/:to | 路线规划 |
| GET /api/weather/:city | 天气信息 |

## 许可证

MIT (c) solcat1007