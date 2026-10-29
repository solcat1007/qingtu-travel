<script setup>
import { ref, computed } from 'vue'
import PlaceCard from '../components/PlaceCard.vue'
import intl from '../data/intl.json'

const q = ref('')
const list = computed(() =>
  intl.filter(c => !q.value.trim() ||
    c.name.includes(q.value.trim()) || c.country.includes(q.value.trim()) || c.tag.includes(q.value.trim())))
</script>

<template>
  <section class="section container">
    <div class="section-head"><h2>🌏 国际目的地</h2><span style="color:var(--ink-2)">{{ list.length }} 个 · 含签证/费用参考</span></div>
    <div class="search-bar">
      <input v-model="q" placeholder="搜索国家 / 城市（如：日本、巴黎、海岛）…" />
    </div>
    <div v-if="list.length" class="grid">
      <PlaceCard v-for="c in list" :key="c.slug" :place="c" intl />
    </div>
    <div v-else class="empty">没有找到「{{ q }}」相关的目的地 🤔</div>
  </section>
</template>
