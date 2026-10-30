<template>
  <div class="wrap">
    <section class="sec">
      <div class="sec-h"><h2>🇨🇳 国内城市（{{ cities.length }}）</h2></div>
      <div class="grid"><PlaceCard v-for="c in cities" :key="c.slug" :p="c" /></div>
    </section>
    <div style="height: 48px"></div>
  </div>
</template>
<script setup>
import PlaceCard from '../components/PlaceCard.vue'
import cities from '../data/cities.json'
</script>
