<template>
  <router-link :to="`/place/${p.slug}`" class="card">
    <div class="ph">
      <img v-if="!bad" :src="`${base}img/${p.slug}-cover.jpg?v=5`" loading="lazy" @error="bad = true" alt="">
      <div v-else class="em">{{ p.name }}</div>
    </div>
    <div class="bd">
      <h3>{{ p.name }}</h3>
      <div class="sub">{{ p.country ? p.country : p.province }} · {{ p.tag }}</div>
      <div class="tags">
        <span v-if="p.attractions" class="tag" :class="{ intl: p.country }">{{ p.attractions.length }} 个精选景区</span>
        <span v-if="p.metro_lines && p.metro_lines.length" class="tag">{{ p.metro_lines.length }} 条轨道线</span>
      </div>
    </div>
  </router-link>
</template>
<script setup>
import { ref } from 'vue'
defineProps({ p: Object })
const base = import.meta.env.BASE_URL
const bad = ref(false)
</script>
