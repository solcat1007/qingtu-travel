<template>
  <div v-if="p">
    <div class="dhero">
      <img v-if="!badCover" :src="`/img/${p.slug}-cover.jpg`" @error="badCover = true" alt="">
      <div v-else class="em">{{ p.emoji || p.flag }}</div>
      <div class="shade"></div>
      <div class="cap wrap">
        <h1>{{ p.emoji || p.flag }} {{ p.name }}</h1>
        <div class="sub">{{ p.country ? `${p.flag} ${p.country}` : p.province }} · {{ p.tag }} · {{ p.desc }}</div>
      </div>
    </div>

    <div class="wrap">
      <div class="tabs">
        <button v-for="t in tabs" :key="t.k" :class="{ on: tab === t.k }" @click="tab = t.k">{{ t.label }}</button>
      </div>

      <!-- 景区 -->
      <div v-if="tab === 'att'" class="tabbody">
        <div v-for="(a, i) in p.attractions" :key="a.name" class="attr">
          <div class="ph">
            <img v-if="!bads[i]" :src="`/img/${p.slug}-${i}.jpg`" loading="lazy" @error="bads[i] = true" alt="">
            <div v-else class="em">🏞️</div>
          </div>
          <div class="bd">
            <h3>{{ a.name }}<span class="rate">★ {{ a.rating }}</span></h3>
            <div class="tags" style="margin-top:8px; display:flex; gap:6px; flex-wrap:wrap">
              <span v-for="t in a.tags" :key="t" class="tag" :class="{ intl: p.country }">{{ t }}</span>
            </div>
            <div class="desc">{{ a.desc }}</div>
            <div class="meta"><span>⏱ {{ a.duration }}</span><span>🎫 {{ a.ticket }}</span></div>
            <div class="review">💬 {{ a.review }}</div>
          </div>
        </div>
      </div>

      <!-- 美食 -->
      <div v-else-if="tab === 'food'" class="tabbody">
        <div class="foods"><div v-for="f in p.foods" :key="f" class="food">🍽️ {{ f }}</div></div>
      </div>

      <!-- 交通 -->
      <div v-else class="tabbody">
        <!-- 地铁 -->
        <div v-if="tr.metro.length" class="tc-sec">
          <h3>🚇 地铁线路 <span class="cnt">{{ tr.metro.length }} 条 · {{ metroStations }} 站（点击站点看周边）</span></h3>
          <div v-for="l in tr.metro" :key="l.name" class="line-item" :class="{ open: openLine === l.name }">
            <button class="line-head" @click="openLine = openLine === l.name ? null : l.name">
              <span class="badge">地铁</span><b>{{ l.name }}</b><span style="color:var(--ink2);font-size:13px">{{ l.count }} 站 · 全程站点</span>
              <span class="arrow">▸</span>
            </button>
            <div v-if="openLine === l.name" class="stations">
              <button v-for="s in l.stations" :key="s" class="st" :class="{ hot: hotStation(l, s) }" @click="openStation(l, s)">{{ s }}</button>
            </div>
          </div>
        </div>

        <!-- 铁路 / 高铁 -->
        <div v-if="tr.rail.length" class="tc-sec">
          <h3>🚄 高铁 / 铁路 <span class="cnt">{{ tr.rail.length }} 条干线（含完整停靠站）</span></h3>
          <div v-for="l in tr.rail" :key="l.name" class="line-item" :class="{ open: openLine === l.name }">
            <button class="line-head" @click="openLine = openLine === l.name ? null : l.name">
              <span class="badge rail">铁路</span><b>{{ l.name }}</b>
              <span style="color:var(--ink2);font-size:13px">{{ l.from }} → {{ l.to }} · {{ l.stops.length }} 站</span>
              <span class="arrow">▸</span>
            </button>
            <div v-if="openLine === l.name" class="stations">
              <button v-for="s in l.stops" :key="s" class="st" :class="{ hot: s === cityName }" @click="s === cityName && openStation(l, s)">{{ s }}</button>
            </div>
          </div>
        </div>

        <!-- 公交 / BRT -->
        <div v-if="tr.bus.length" class="tc-sec">
          <h3>🚌 公交 / BRT <span class="cnt">{{ tr.bus.length }} 条线路</span></h3>
          <div v-for="l in tr.bus" :key="l.name" class="line-item" :class="{ open: openLine === l.name }">
            <button class="line-head" @click="openLine = openLine === l.name ? null : l.name">
              <span class="badge" :class="{ brt: l.type === 'brt' }">{{ l.type === 'brt' ? 'BRT' : '公交' }}</span>
              <b>{{ l.name }}</b><span style="color:var(--ink2);font-size:13px">{{ l.count }} 站</span>
              <span class="arrow">▸</span>
            </button>
            <div v-if="openLine === l.name" class="stations"><span v-for="s in l.stops" :key="s" class="st" style="cursor:default">{{ s }}</span></div>
          </div>
        </div>

        <!-- 飞机 -->
        <div v-if="tr.flights && tr.flights.airports && tr.flights.airports.length" class="tc-sec">
          <h3>✈️ 机场与航线</h3>
          <div class="tc-info"><b>机场：</b>{{ tr.flights.airports.join('、') }}</div>
          <div class="tc-info"><b>热门直达航线：</b><ul><li v-for="r in tr.flights.routes" :key="r">{{ r }}</li></ul></div>
          <div v-if="tr.flights.tip" class="tc-info"><b>贴士：</b>{{ tr.flights.tip }}</div>
        </div>

        <!-- 机场进城 + 出租车 -->
        <div class="tc-sec">
          <h3>🚕 机场进城 & 出租车</h3>
          <div v-if="airportTransfer" class="tc-info"><b>机场 → 市区：</b><ul><li v-for="x in airportTransfer" :key="x">{{ x }}</li></ul></div>
          <div v-if="tr.taxi" class="tc-info"><b>出租车：</b>{{ tr.taxi }} <span style="color:var(--ink2)">（价格为参考值，以当地实际为准）</span></div>
          <div v-if="!airportTransfer && !tr.taxi" class="empty">暂无补充信息</div>
        </div>
      </div>
    </div>

    <!-- 站点弹窗：周边可玩 -->
    <div v-if="pop" class="st-pop" @click.self="pop = null">
      <div class="box">
        <h3>📍 {{ pop.station }}</h3>
        <div class="ln">{{ pop.line }} · 本站周边推荐</div>
        <template v-if="pop.pois.length">
          <router-link v-for="a in pop.pois" :key="a.name" class="poi" :to="`/place/${p.slug}`" @click="pop = null">
            <b>{{ a.name }}</b><span v-if="a.rating" class="rate" style="margin-left:8px">★ {{ a.rating }}</span>
            <div v-if="a.desc" class="d">{{ a.desc }}</div>
            <div v-if="a.duration" class="d">⏱ {{ a.duration }} · 🎫 {{ a.ticket }}</div>
          </router-link>
        </template>
        <div v-else class="empty">本站暂无标注景区，可在相邻大站下车（<b>{{ pop.nearStations.join('、') }}</b>）</div>
        <button class="close" @click="pop = null">关闭</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import cities from '../data/cities.json'
import intl from '../data/intl.json'

const route = useRoute()
const all = [...cities, ...intl]
const p = all.find(x => x.slug === route.params.slug)
const cityName = p ? p.name : ''
const cityNameShort = cityName ? cityName.replace(/市$/, '') : ''

const tab = ref('att')
const tabs = [
  { k: 'att', label: `景区 ${p ? p.attractions.length : 0}` },
  { k: 'food', label: '美食' },
  { k: 'tc', label: '交通' },
]
const badCover = ref(false)
const bads = reactive({})
const openLine = ref(null)
const pop = ref(null)

const tr = computed(() => (p && p.transport) || { metro: [], rail: [], bus: [], taxi: '', airport_transfer: [], flights: {} })
const airportTransfer = computed(() => Array.isArray(tr.value.airport_transfer) ? tr.value.airport_transfer : (tr.value.airport_transfer ? [tr.value.airport_transfer] : []))
const metroStations = computed(() => tr.value.metro.reduce((n, l) => n + l.count, 0))

// 站点 ↔ 景区：优先人工标注映射，兜底名称匹配
function poisAt(station) {
  if (!p) return []
  const map = p.station_pois || {}
  if (map[station]) {
    const named = map[station].map(n => p.attractions.find(a => a.name === n || a.name.includes(n) || n.includes(a.name.replace(/（.*?）|\(.*?\)/g, '')))).filter(Boolean)
    const extra = map[station].filter(n => !named.some(a => a.name === n)).map(n => ({ name: n, desc: '', rating: null, duration: '', ticket: '' }))
    return [...named, ...extra]
  }
  return p.attractions.filter(a => {
    const key = a.name.replace(/（.*?）|\(.*?\)|风景区|旅游区|景区|公园$/g, '')
    return key.length >= 2 && (station.includes(key) || key.includes(station) || a.name.includes(station))
  })
}
function hotStation(l, s) { return poisAt(s).length > 0 }
function openStation(l, s) {
  const pois = poisAt(s)
  const idx = l.stations.indexOf(s)
  const near = (l.stations[idx - 1] || '').concat(l.stations[idx + 1] ? '、' + l.stations[idx + 1] : '')
  pop.value = { station: s, line: l.name, pois, nearStations: near.split('、').filter(Boolean) }
}
</script>
