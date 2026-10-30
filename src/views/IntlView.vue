<template>
  <div class="wrap">
    <section class="sec">
      <div class="sec-h"><h2>国际目的地（{{ intl.length }}）</h2></div>
      <div class="grid"><PlaceCard v-for="d in intl" :key="d.slug" :p="d" /></div>
    </section>
    <div style="height: 48px"></div>
  </div>
</template>
<script setup>
import PlaceCard from '../components/PlaceCard.vue'
import intl from '../data/intl.json'
</script>
