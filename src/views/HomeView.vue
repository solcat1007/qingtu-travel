<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ChinaMap from '../components/ChinaMap.vue'
import PlaceCard from '../components/PlaceCard.vue'
import cities from '../data/cities.json'
import intl from '../data/intl.json'

const router = useRouter()
const mode = ref('domestic')
const q = ref('')
const featured = cities.slice(0, 8)
const totalAttr = cities.reduce((a, c) => a + c.attractions.length, 0)

const mapSelect = (d) => router.push(`/place/${d.slug}`)
const goSearch = () => {
  if (!q.value.trim()) return
  const hit = [...cities, ...intl].find(c => c.name.includes(q.value.trim()))
  router.push(hit ? `/place/${hit.slug}` : `/cities?q=${encodeURIComponent(q.value)}`)
}
</script>

<template>
  <div>
    <header class="hero">
      <div class="container hero-inner">
        <h1>晴途 · QingTu</h1>
        <p class="sub">3D 中国地图 · 30 座国内城市 · 12 个国际目的地 · 交通/景点/美食一站式</p>
        <div class="hero-chips">
          <RouterLink class="hero-chip" to="/cities">🇨🇳 国内城市</RouterLink>
          <RouterLink class="hero-chip" to="/intl">🌏 国际目的地</RouterLink>
          <a class="hero-chip" href="#map">🗺️ 3D 地图</a>
        </div>
        <div class="hero-search">
          <input v-model="q" placeholder="搜索城市：成都 / 东京 / 巴黎…" @keydown.enter="goSearch" />
          <button @click="goSearch">出发</button>
        </div>
        <div class="hero-stats">
          <div><div class="num">{{ cities.length }}</div><div class="lab">国内城市</div></div>
          <div><div class="num">{{ intl.length }}</div><div class="lab">国际目的地</div></div>
          <div><div class="num">{{ totalAttr }}</div><div class="lab">精选景点</div></div>
          <div><div class="num">100%</div><div class="lab">离线可用</div></div>
        </div>
      </div>
    </header>

    <section id="map" class="section">
      <div class="container">
        <div class="section-head"><h2>🗺️ 3D 交互地图</h2><span style="color:var(--ink-2)">全国 {{ cities.length }} 城一图纵览</span></div>
        <ChinaMap :mode="mode" @mode="mode = $event" @select="mapSelect" />
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-head">
          <h2>🔥 热门城市</h2>
          <RouterLink class="more" to="/cities">查看全部 →</RouterLink>
        </div>
        <div class="grid">
          <PlaceCard v-for="c in featured" :key="c.slug" :place="c" />
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-head">
          <h2>🌏 国际目的地</h2>
          <RouterLink class="more" to="/intl">查看全部 →</RouterLink>
        </div>
        <div class="grid">
          <PlaceCard v-for="c in intl.slice(0, 4)" :key="c.slug" :place="c" intl />
        </div>
      </div>
    </section>
  </div>
</template>
