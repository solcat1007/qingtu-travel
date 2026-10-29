<script setup>
defineProps({ place: { type: Object, required: true }, intl: { type: Boolean, default: false } })
const grads = [
  'linear-gradient(135deg,#a18cd1,#fbc2eb)', 'linear-gradient(135deg,#89a7f0,#b8c6ff)',
  'linear-gradient(135deg,#f6a6c1,#ffd3a5)', 'linear-gradient(135deg,#84fab0,#8fd3f4)',
  'linear-gradient(135deg,#c2a3f0,#fbc2eb)', 'linear-gradient(135deg,#fbc2eb,#a6c1ee)',
]
const bg = (s) => grads[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % grads.length]
</script>

<template>
  <RouterLink :to="`/place/${place.slug}`" class="card">
    <div class="card-cover" :style="{ background: bg(place.slug) }">
      {{ place.emoji || place.flag }}
      <span v-if="intl" class="flag">{{ place.flag }}</span>
    </div>
    <div class="card-body">
      <h3>{{ place.name }} <span class="tag">{{ place.tag }}</span></h3>
      <p>{{ place.desc }}</p>
      <div class="card-meta">
        <span>🎯 {{ place.attractions.length }} 景点</span>
        <span>🚇 {{ place.transport.metro?.slice(0, 12) || place.transport.rail?.slice(0, 12) }}</span>
      </div>
    </div>
  </RouterLink>
</template>
