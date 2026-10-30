<template>
  <router-link :to="`/place/${p.slug}`" class="card">
    <div class="ph">
      <img v-if="!bad" :src="`/img/${p.slug}-cover.jpg`" loading="lazy" @error="bad = true" alt="">
      <div v-else class="em">{{ p.emoji || p.flag }}</div>
    </div>
    <div class="bd">
      <h3>{{ p.emoji || p.flag }} {{ p.name }}</h3>
      <div class="sub">{{ p.country ? `${p.flag} ${p.country}` : p.province }} · {{ p.tag }}</div>
      <div class="tags">
        <span v-if="p.attractions" class="tag" :class="{ intl: p.country }">{{ p.attractions.length }} 个精选景区</span>
        <span v-if="p.transport && p.transport.metro && p.transport.metro.length" class="tag">{{ p.transport.metro.length }} 条轨道线</span>
      </div>
    </div>
  </router-link>
</template>
<script setup>
import { ref } from 'vue'
defineProps({ p: Object })
const bad = ref(false)
</script>
