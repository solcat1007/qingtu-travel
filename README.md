# 晴途 QingTu v2 · 3D 中国文旅地图

> v1 的彻底重构版：从「Express + SQL.js 全栈应用」激进收敛为「Vite + Vue 3 纯静态站点」。
> 零后端、零数据库、零 API 依赖 —— 数据全部内置 JSON，扔到 GitHub Pages 即可上线。

## ✨ 特性

- 🗺️ **3D 交互地图**：Three.js 渲染中国 34 省份板块，30 个城市光点可点击跳转；WebGL 不可用时自动降级为可交互 2D SVG 地图
- 🇨🇳 **国内城市**：30 座城市，每城含 3 个精选景点、当地美食、机场/铁路/地铁完整交通指南与旅行贴士
- 🌏 **国际目的地**：12 个目的地（日本/韩国/东南亚/欧美/大洋洲），含签证要求与消费水平参考
- 🔍 **全局搜索**：支持城市名/省份/别称（如"山城""春城"）检索
- 📱 **响应式**：移动端优先适配，首屏 < 60KB gzip（地图与 3D 引擎按需分包懒加载）

## 🚀 快速开始

```bash
pnpm install
pnpm dev        # 开发
pnpm build      # 构建到 dist/
```

## 🗂 结构

```
src/
  data/
    cities.json   # 国内 30 城（景点/美食/交通/贴士）
    intl.json     # 国际 12 目的地（含签证/费用）
    china.json    # 省界 GeoJSON（阿里 DataV）
  components/
    ChinaMap.vue  # 3D 地图 + SVG 降级
    PlaceCard.vue # 目的地卡片
  views/
    HomeView.vue  # 首页：Hero + 地图 + 精选
    CitiesView.vue / IntlView.vue  # 国内/国际列表
    DetailView.vue # 目的地详情
```

## 📦 数据扩充

往 `src/data/*.json` 追加城市条目即可，字段结构参照现有条目，无需改任何代码。

---
Vue 3 · Vite · Three.js · 2026
