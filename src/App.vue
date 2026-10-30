<template>
  <div>
    <nav class="nav">
      <div class="nav-in">
        <a href="#/" class="logo">晴途<small>QingTu · 文旅指南</small></a>
        <a href="#/" class="route" :class="{ on: tab === 'home' }">首页</a>
        <a href="#/cities" class="route" :class="{ on: tab === 'cities' }">国内游</a>
        <a href="#/intl" class="route" :class="{ on: tab === 'intl' }">国际游</a>
      </div>
    </nav>
    <router-view :key="$route.fullPath" />
    <footer class="foot">晴途 QingTu · 地铁官方全量站点 / 高铁干线 / BRT·公交 / 航线 · 图片来自 Unsplash</footer>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import cities from './data/cities.json'
import intl from './data/intl.json'
const route = useRoute()
const tab = computed(() => {
  if (route.path === '/cities') return 'cities'
  if (route.path === '/intl') return 'intl'
  if (route.path === '/') return 'home'
  const p = [...cities, ...intl].find(x => x.slug === route.params.slug)
  return p && p.country ? 'intl' : (p ? 'cities' : 'home')
})
</script>
