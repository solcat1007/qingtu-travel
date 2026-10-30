<template>
  <div>
    <section class="hero">
      <h1>计划一次<span>清爽</span>的旅行</h1>
      <p>30 座国内城市 · 12 个国际目的地 · 5866 个官方地铁站 · 396 个精选景区，交通线路一站查全</p>
      <div class="search">
        <input v-model="q" placeholder="搜索城市 / 景区 / 别称，如“山城”“西湖”" @keydown.enter="go" />
        <button @click="go">搜索</button>
      </div>
    </section>
    <div class="wrap">
      <section class="sec">
        <div class="sec-h"><h2>🔥 热门国内城市</h2><a href="#/cities" class="more">全部 30 城 →</a></div>
        <div class="grid"><PlaceCard v-for="c in hot" :key="c.slug" :p="c" /></div>
      </section>
      <section class="sec">
        <div class="sec-h"><h2>🌏 热门国际目的地</h2><a href="#/intl" class="more">全部 12 地 →</a></div>
        <div class="grid"><PlaceCard v-for="d in hotI" :key="d.slug" :p="d" /></div>
      </section>
      <div style="height: 48px"></div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PlaceCard from '../components/PlaceCard.vue'
import cities from '../data/cities.json'
import intl from '../data/intl.json'
const router = useRouter()
const q = ref('')
const hot = computed(() => ['beijing', 'shanghai', 'chengdu', 'hangzhou', 'xian', 'chongqing', 'xiamen', 'sanya'].map(s => cities.find(c => c.slug === s)).filter(Boolean))
const hotI = computed(() => ['tokyo', 'paris', 'singapore', 'bangkok'].map(s => intl.find(c => c.slug === s)).filter(Boolean))
const go = () => {
  const k = q.value.trim()
  if (!k) return
  const all = [...cities, ...intl]
  const hit = all.find(c => c.name === k || (c.aliases || []).includes(k) || c.name.includes(k))
  if (hit) return router.push(`/place/${hit.slug}`)
  for (const c of all) {
    const i = c.attractions.findIndex(x => x.name.includes(k))
    if (i >= 0) return router.push(`/place/${c.slug}`)
  }
}
</script>
