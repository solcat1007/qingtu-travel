<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import PlaceCard from '../components/PlaceCard.vue'
import cities from '../data/cities.json'

const route = useRoute()
const q = ref(String(route.query.q || ''))
const list = computed(() =>
  cities.filter(c => !q.value.trim() ||
    c.name.includes(q.value.trim()) || c.province.includes(q.value.trim()) || c.tag.includes(q.value.trim())))
</script>

<template>
  <section class="section container">
    <div class="section-head"><h2>🇨🇳 国内城市</h2><span style="color:var(--ink-2)">{{ list.length }} 座 · 持续扩充中</span></div>
    <div class="search-bar">
      <input v-model="q" placeholder="搜索城市 / 省份 / 别称（如：山城、春城）…" />
    </div>
    <div v-if="list.length" class="grid">
      <PlaceCard v-for="c in list" :key="c.slug" :place="c" />
    </div>
    <div v-else class="empty">没有找到「{{ q }}」相关的城市 🤔</div>
  </section>
</template>
