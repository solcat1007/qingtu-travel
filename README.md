# 🌏 晴途 QingTu — 二次元文旅 3D 地图官网

> 一个融合 **Three.js 3D 中国地图**、**高铁航线系统**、**31 城市全景数据库** 的二次元风格旅游网站。深色科技风 × 毛玻璃 UI × 实时数据引擎，零 API 依赖离线可用。

[![Node](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey)](https://expressjs.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r168-blue)](https://threejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js-orange)](https://sql.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 项目简介

晴途是一款面向二次元爱好者和旅行者的交互式 3D 旅游地图网站。首页以 **Three.js 渲染的 3D 中国地图** 为核心，192+ 城市以发光悬浮标记分布其上；底部三大导航可在「3D 地图」「高铁系统」「航空航线」间无缝切换。点击任意城市进入详情页，可查阅该城市的公交地铁线路、景区美食购物、旅游攻略等全方位信息。

**核心亮点**：所有城市数据预编译进 SQLite 数据库，网站运行时 **零外部 API 调用**，毫秒级响应，纯离线可用。

---

## 🚀 核心功能

### 🗺️ 3D 中国地图（首页）
| 特性 | 说明 |
|------|------|
| 3D 底板 | Three.js PlaneGeometry + PolarGridHelper 经纬网格 + TorusGeometry 边框 |
| 城市标记 | 192+ 城市呼吸光环（正弦脉冲缩放+透明度）+ 扩散环 + 光柱 + 3D 球体 |
| 差异化配色 | 118+ 城市独立配色方案（primary/accent/landmark/desc/tags），按西北/华北/东北/华东/华中/西南/华南/港澳台/国际分区 |
| 星空背景 | Three.js 粒子星空 + 动态云朵系统 |
| 相机交互 | OrbitControls 旋转缩放平移，点击城市标记弹出详情面板 |

### 🚄 高铁系统
| 特性 | 说明 |
|------|------|
| 真实车型 | CR400AF 红神龙、CR400BF 金凤凰、CRH2A 带鱼、CRH380A 银箭 |
| 3D 建模 | 流线型车头 + 多节车厢 + 彩色腰线 + 受电弓 + 转向架完整部件 |
| 动态行驶 | 40 条高铁线路，CatmullRom 曲线上动态行驶，列车朝向自动跟随路径切线 |
| 线路渲染 | TubeGeometry 管状渲染 + 发光外层，8 种路线颜色区分 |

### ✈️ 航空航线系统
| 特性 | 说明 |
|------|------|
| 真实航司 | 国航/南航/东航/海航/厦航/深航 6 大航司，含航司代码/主色/标记 |
| 机型建模 | A320 窄体、A350 宽体、B737 窄体、B787 宽体，含翼尖小翼/引擎/涂装细节 |
| 动态飞行 | 35 条航线，CatmullRom 高空弧线路径，飞行方向自动跟随，飞机自动倾斜 |
| 航线渲染 | LineDashedMaterial 虚线渲染（青色 #22D3EE），高空弧线路径 |

### 🏙️ 城市详情系统
| 数据维度 | 说明 |
|------|------|
| 城市信息 | 城市简介、区号、邮政编码、气候描述、最佳旅游季节 |
| 公交线路 | 完整线路名/编号/起终点/首末班/票价 + 站点列表 |
| 地铁线路 | 线路名/编号/起终点/首末班/票价 + 站点列表 |
| 景区列表 | 景区名/分类/地址/开放时间/门票/评分，按评分降序 |
| 美食推荐 | 名称/分类/描述/价格区间/推荐店铺 |
| 购物指南 | 名称/分类/描述/地址/营业时间/价格水平 |
| 旅游攻略 | 标题/天数/内容/标签/适宜季节/预算 |
| 酒店信息 | 名称/星级/地址/价格 |

### 📊 数据引擎
| 特性 | 说明 |
|------|------|
| 数据库 | SQLite (sql.js)，所有数据预编译，无运行时依赖 |
| 数据导出 | 每个城市支持 CSV 导出（公交/地铁/景区/美食/购物/攻略） |
| 反馈系统 | 用户可提交数据纠错反馈，存入 feedbacks 表 |
| 搜索功能 | 全文模糊搜索景区名称/描述/地址 |
| 统计面板 | `/api/stats` 返回全站数据总览 |

### 🎬 抖音宣传页
独立的移动端宣传落地页，配有品牌首页、功能展示、西安首城、行动号召四张滑屏式宣传图。

### 🧸 沐晴看板娘
二次元虚拟导游看板娘页面，展示 AI 助手形象与交互入口。

---

## 🛠️ 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 本地运行

```bash
# 进入项目目录
cd travel-website

# 安装依赖
npm install

# 初始化数据库（首次运行）
npm run init-db

# 启动服务
npm start
```

访问 `http://localhost:3001` 即可查看 3D 地图首页。

### 数据库位置

数据库文件位于 `G:\旅游网站项目\数据库\travel.db`，可通过修改 `server.js` 中的 `DB_PATH` 变量调整。

---

## 📁 项目结构

```
travel-website/
├── server.js                   # Express 主服务（15 个 API 路由）
├── package.json                # 项目配置
├── package-lock.json
├── start.bat                   # Windows 一键启动脚本
├── start-qingtut.bat           # 晴途专用启动脚本（GPU 加速）
├── start-gpu.bat               # GPU 加速启动脚本
├── COMPLETION_REPORT.md        # 开发完成对照报告
├── LOCAL_AI_INSTRUCTIONS.md    # AI 辅助开发指引
├── GPU加速状态报告.md            # GPU 加速配置说明
├── 二次元改造方案_沐晴看板娘_网名提案.md
├── 3D地图方案.md                # 3D 地图技术方案文档
│
├── public/                     # 前端页面（完整网站）
│   ├── index.html              # 3D 地图首页 (39KB)
│   ├── city.html               # 城市详情页 (22KB)
│   ├── attraction.html         # 景区详情页 (14KB)
│   ├── flight-route.html       # 航空航线页 (24KB)
│   ├── high-speed.html         # 高铁系统页 (22KB)
│   ├── 31城市列表.json          # 城市列表数据
│   ├── 31城市完整数据.json       # 城市完整数据
│   ├── 全部城市数据.json         # 全量城市数据 (348KB)
│   ├── 城市列表_无景区.txt        # 城市清单
│   └── 素材补全清单.md           # 素材管理清单
│
├── public/js/                  # 前端 JS 模块
│   ├── city-data.js            # 118+ 城市差异化配色方案
│   ├── train-system.js         # 高铁 3D 建模与行驶系统
│   ├── flight-system.js        # 航空 3D 建模与飞行系统
│   ├── map-system.js           # 3D 地图渲染引擎
│   └── ...
│
├── public/css/                 # 前端样式
│   └── mascot.css              # 看板娘样式
│
├── scripts/                    # 数据采集/填充脚本
│   ├── init-db.js              # 数据库初始化
│   ├── fetch-data.js           # 数据采集主脚本
│   ├── fill-attr-details.js    # 景区详情填充
│   ├── fill-missing-routes.js  # 线路补全
│   ├── fill_bus_data.js        # 公交数据填充
│   ├── fill_metro.js           # 地铁数据填充
│   └── ...                     # 100+ 数据管理脚本
│
├── 抖音宣传页/                  # 抖音落地页
│   ├── index.html              # 宣传页主页 (13KB)
│   ├── slide_1_品牌首页.png
│   ├── slide_2_功能展示.png
│   ├── slide_3_西安首城.png
│   └── slide_5_行动号召.png
│
└── 沐晴看板娘/                  # 虚拟导游页面
    ├── index.html              # 看板娘主页 (6KB)
    └── images/                 # 看板娘资源
```

---

## 🔌 API 接口

| Method | Endpoint | 说明 |
|--------|----------|------|
| GET | `/api/cities` | 获取全部城市列表（含各维度计数） |
| GET | `/api/cities/:cityId` | 获取单个城市详情 |
| GET | `/api/cities/:cityId/bus` | 获取城市公交线路+站点 |
| GET | `/api/cities/:cityId/metro` | 获取城市地铁线路+站点 |
| GET | `/api/cities/:cityId/attractions` | 获取城市景区列表 |
| GET | `/api/cities/:cityId/hotels` | 获取城市酒店列表 |
| GET | `/api/cities/:cityId/foods` | 获取城市美食列表 |
| GET | `/api/cities/:cityId/shopping` | 获取城市购物列表 |
| GET | `/api/cities/:cityId/guides` | 获取城市攻略列表 |
| GET | `/api/attractions` | 获取全部景区（支持分页/城市筛选） |
| GET | `/api/attractions/:id` | 获取景区详情 |
| GET | `/api/search?q=` | 模糊搜索景区 |
| GET | `/api/flights` | 获取航班列表 |
| GET | `/api/trains` | 获取高铁列表 |
| GET | `/api/stats` | 获取全站数据统计 |
| GET | `/api/alerts/:cityId` | 获取城市数据异常提醒 |
| GET | `/api/export/:cityId/:type` | 导出城市数据为 CSV |
| POST | `/api/feedback` | 提交数据纠错反馈 |

---

## 🗄️ 数据库设计

数据库包含以下核心表：

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `cities` | 城市基础信息 | id, name, slug, province, region, intro, climate, best_season, area_code, zip_code |
| `attractions` | 景区信息 | id, city_id, name, category, address, open_time, ticket_price, rating, description |
| `bus_lines` / `bus_stations` | 公交线路+站点 | line_name, line_code, start/end_station, first/last_bus, price, station_name, sequence |
| `metro_lines` / `metro_stations` | 地铁线路+站点 | line_name, line_code, start/end_station, first/last_train, price, station_name, sequence |
| `hotels` | 酒店信息 | id, city_id, name, stars, address, price, description |
| `flights` | 航班信息 | id, departure_city_id, arrival_city_id, flight_number, airline, departure_time, price |
| `high_speed_trains` | 高铁信息 | id, departure_city_id, arrival_city_id, train_number, train_type, departure_time, duration, price |
| `foods` | 美食推荐 | id, city_id, name, category, description, price_range, recommend_shop |
| `shopping` | 购物指南 | id, city_id, name, category, description, address, business_hours, price_level |
| `guides` | 旅游攻略 | id, city_id, title, duration, content, tags, season, budget |
| `feedbacks` | 用户反馈 | id, type, content, contact, created_at |
| `data_alerts` | 数据异常提醒 | id, city_id, message, is_resolved, created_at |

---

## 🎨 设计风格

- **深色科技风**：底板色 `#0a0e17`，qingtu 色系（蓝青渐变 `#7EB8DA → #5A9BCB → #E8A87C` 暖色点缀）
- **毛玻璃 UI**：`backdrop-filter: blur(20px)` 玻璃拟态面板、边框、导航栏
- **二次元元素**：星空粒子背景、呼吸光环动画、斜角标题、悬浮光柱
- **响应式布局**：TailwindCSS CDN，桌面端优先，底部导航适配移动端
- **中文优化**：Noto Sans SC + ZCOOL XiaoWei 字体栈

---

## ⚙️ 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 后端框架 | Express 4.21 | HTTP 服务 + API 路由 |
| 数据库 | SQL.js (SQLite WASM) | 零安装本地数据库 |
| 前端渲染 | Three.js r168 (ES Module) | 3D 地图/高铁/飞机渲染 |
| 样式系统 | TailwindCSS CDN | 响应式布局 |
| 字体 | Google Fonts (Noto Sans SC + ZCOOL XiaoWei) | 中文字体优化 |
| 数据采集 | 自研 Node.js 脚本簇 | 100+ 数据填充/校验脚本 |
| 截图工具 | Puppeteer + screenshot-desktop | 页面截图/宣传图生成 |

---

## 📝 开发历程

本项目从 2026 年 4 月启动，历经 2 个月开发迭代：

1. **架构搭建**：Express + SQL.js 后端框架，单页应用 SPA 前端
2. **数据采集**：192 城市基础信息 + 景区/公交/地铁数据批量采集
3. **3D 渲染**：Three.js 中国地图底板 + 城市标记 + 星空云朵系统
4. **高铁系统**：4 种真实车型 3D 建模 + CatmullRom 动态行驶
5. **航空系统**：4 种机型 + 6 大航司 + 35 条动态航线
6. **城市详情**：景区/美食/购物/攻略/酒店 全维度数据填充
7. **质量保障**：100+ 数据校验/审计/补全脚本，完整对照报告

详见 `COMPLETION_REPORT.md` 开发方案 vs 实际完成情况对照表。

---

## 📝 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

---

<p align="center">
  <b>🗺️ 3D 地图 · 🚄 高铁系统 · ✈️ 航空航线 · 🏙️ 31城全景</b><br>
  <sub>深色科技风 × 二次元美学 × 零 API 离线可用</sub><br>
  <sub>Made with ❤️ by 沐晴</sub>
</p>
