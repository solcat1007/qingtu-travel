<script setup>
</script>

<template>
  <nav class="nav">
    <div class="nav-inner">
      <RouterLink to="/" class="logo">晴途</RouterLink>
      <RouterLink to="/" class="nav-link">首页</RouterLink>
      <RouterLink to="/cities" class="nav-link">国内城市</RouterLink>
      <RouterLink to="/intl" class="nav-link">国际目的地</RouterLink>
      <div class="nav-spacer"></div>
    </div>
  </nav>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <footer>
    <div>晴途 QingTu v2 · 一天一座城市 · 数据内置离线可用</div>
    <div style="margin-top:6px">Vue 3 + Vite + Three.js · 2026</div>
  </footer>
</template>
