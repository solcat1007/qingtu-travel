<template>
  <div>
    <!-- 首屏：真实照片背景 -->
    <section class="hero">
      <img class="hero-bg" src="/img/beijing-cover.jpg?v=4" alt="">
      <div class="hero-shade"></div>
      <div class="hero-in">
        <h1>晴途 <small>QingTu</small></h1>
        <p>一张线网图，看懂一座城 —— 全国 24 城轨道线网图 · 5866 个站点 · 高铁 / BRT / 航线 · 396 个精选景区实拍</p>
        <div class="search">
          <input v-model="q" placeholder="搜索城市 / 景区 / 别称，如“山城”“西湖”" @keydown.enter="go" />
          <button @click="go">搜索</button>
        </div>
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
    if (c.attractions.some(x => x.name.includes(k))) return router.push(`/place/${c.slug}`)
  }
}
</script>
<style scoped>
.hero { position: relative; height: 420px; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center; }
.hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,32,48,.42), rgba(20,32,48,.62)); }
.hero-in { position: relative; color: #fff; padding: 0 20px; width: 100%; }
.hero-in h1 { font-size: 46px; letter-spacing: 4px; text-shadow: 0 2px 16px rgba(0,0,0,.35); }
.hero-in h1 small { font-size: 18px; letter-spacing: 2px; opacity: .85; font-weight: 400; margin-left: 10px; }
.hero-in p { margin: 16px auto 0; max-width: 620px; font-size: 15px; line-height: 1.9; opacity: .95; text-shadow: 0 1px 8px rgba(0,0,0,.3); }
.search { margin: 30px auto 0; max-width: 560px; display: flex; background: rgba(255,255,255,.96); border-radius: 999px; padding: 6px 8px 6px 20px; box-shadow: 0 10px 40px rgba(0,0,0,.28); }
.search input { flex: 1; border: 0; outline: 0; font-size: 15px; background: transparent; color: var(--ink); }
.search button { border: 0; background: var(--acc); color: #fff; border-radius: 999px; padding: 10px 26px; font-size: 15px; cursor: pointer; }
@media (max-width: 640px) { .hero { height: 340px; } .hero-in h1 { font-size: 34px; } .hero-in p { font-size: 13px; } }
</style>
