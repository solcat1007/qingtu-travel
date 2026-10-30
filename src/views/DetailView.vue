<template>
  <div v-if="p">
    <!-- 大图封面 -->
    <div class="dhero">
      <img v-if="!badCover" :src="img(`${p.slug}-cover`)" @error="badCover = true" alt="">
      <div v-else class="em">{{ p.name }}</div>
      <div class="shade"></div>
      <div class="cap wrap">
        <h1>{{ p.name }}</h1>
        <div class="sub">{{ p.country ? p.country : p.province }} · {{ p.tag }} · {{ p.desc }}</div>
      </div>
    </div>

    <div class="wrap">
      <div class="tabs">
        <button v-for="t in tabs" :key="t.k" :class="{ on: tab === t.k }" @click="tab = t.k">{{ t.label }}</button>
      </div>

      <!-- 景区 -->
      <div v-if="tab === 'att'" class="tabbody">
        <div v-for="(a, i) in p.attractions" :key="a.name" class="attr" :id="`att-${i}`">
          <div class="ph">
            <img v-if="!bads[i]" :src="img(`${p.slug}-${i}`)" loading="lazy" @error="bads[i] = true" alt="">
            <div v-else class="em">{{ a.name }}</div>
          </div>
          <div class="bd">
            <h3>{{ a.name }}<span class="rate">{{ a.rating }} 分</span></h3>
            <div class="tags" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
              <span v-for="t in a.tags" :key="t" class="tag" :class="{ intl: p.country }">{{ t }}</span>
            </div>
            <div class="desc">{{ a.desc }}</div>
            <div class="meta"><span>用时 {{ a.duration }}</span><span>门票 {{ a.ticket }}</span></div>
            <div class="review">游客评价 · {{ a.review }}</div>
          </div>
        </div>
      </div>

      <!-- 美食（点按展开） -->
      <div v-else-if="tab === 'food'" class="tabbody">
        <div class="food-hint">点按菜名展开介绍</div>
        <div class="foods">
          <div v-for="(f, i) in p.foods" :key="f[0]" class="food" :class="{ open: openFood === i }">
            <button class="food-head" @click="openFood = openFood === i ? -1 : i">
              <b>{{ f[0] }}</b><span class="arrow">›</span>
            </button>
            <div v-if="openFood === i" class="food-body">{{ f[1] }}</div>
          </div>
        </div>
      </div>

      <!-- 交通 -->
      <div v-else-if="tab === 'tc'" class="tabbody">
        <MetroMap v-if="p.metro_lines && p.metro_lines.length" :title="`${p.name} 轨道交通线网图`"
          :lines="p.metro_lines" :interchange="p.interchange || {}" :stationPois="p.station_pois || {}"
          @pick="onPick" />

        <div v-if="p.metro_lines && p.metro_lines.length" class="tc-sec">
          <h3>地铁线路详情 <span class="cnt">点按线路展开全部站点 · 换乘站标「换」</span></h3>
          <div v-for="l in p.metro_lines" :key="l.name" class="line-item" :class="{ open: openLine === l.name }">
            <button class="line-head" @click="openLine = openLine === l.name ? null : l.name">
              <span class="badge" :style="{ background: l.color }">地铁</span><b>{{ l.name }}</b>
              <span style="color:var(--ink2);font-size:13px">{{ l.stations.length }} 站</span>
              <span class="arrow">›</span>
            </button>
            <div v-if="openLine === l.name" class="stations">
              <button v-for="s in l.stations" :key="s.n" class="st"
                :class="{ hot: hotStation(s.n) }" @click="onPick({ station: s.n, line: l.name })">
                {{ s.n }}<i v-if="isInter(s.n)" class="xfer">换</i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="tr.rail.length" class="tc-sec">
          <h3>高铁 / 铁路 <span class="cnt">{{ tr.rail.length }} 条干线（完整停靠站）</span></h3>
          <div v-for="l in tr.rail" :key="l.name" class="line-item" :class="{ open: openLine === l.name }">
            <button class="line-head" @click="openLine = openLine === l.name ? null : l.name">
              <span class="badge rail">铁路</span><b>{{ l.name }}</b>
              <span style="color:var(--ink2);font-size:13px">{{ l.from }} → {{ l.to }} · {{ l.stops.length }} 站</span>
              <span class="arrow">›</span>
            </button>
            <div v-if="openLine === l.name" class="stations"><span v-for="s in l.stops" :key="s" class="st" style="cursor:default">{{ s }}</span></div>
          </div>
        </div>

        <div v-if="tr.bus.length" class="tc-sec">
          <h3>公交 / BRT <span class="cnt">{{ tr.bus.length }} 条</span></h3>
          <div v-for="l in tr.bus" :key="l.name" class="line-item" :class="{ open: openLine === l.name }">
            <button class="line-head" @click="openLine = openLine === l.name ? null : l.name">
              <span class="badge" :class="{ brt: l.type === 'brt' }">{{ l.type === 'brt' ? 'BRT' : '公交' }}</span>
              <b>{{ l.name }}</b><span style="color:var(--ink2);font-size:13px">{{ l.count }} 站</span>
              <span class="arrow">›</span>
            </button>
            <div v-if="openLine === l.name" class="stations"><span v-for="s in l.stops" :key="s" class="st" style="cursor:default">{{ s }}</span></div>
          </div>
        </div>

        <div v-if="tr.flights && tr.flights.airports && tr.flights.airports.length" class="tc-sec">
          <h3>机场与航线</h3>
          <div class="tc-info"><b>机场：</b>{{ tr.flights.airports.join('、') }}</div>
          <div class="tc-info"><b>热门直达航线：</b><ul><li v-for="r in tr.flights.routes" :key="r">{{ r }}</li></ul></div>
          <div v-if="tr.flights.tip" class="tc-info"><b>贴士：</b>{{ tr.flights.tip }}</div>
        </div>

        <div class="tc-sec">
          <h3>机场进城与出租车</h3>
          <div v-if="airportTransfer.length" class="tc-info"><b>机场 → 市区：</b><ul><li v-for="x in airportTransfer" :key="x">{{ x }}</li></ul></div>
          <div v-if="tr.taxi" class="tc-info"><b>出租车：</b>{{ tr.taxi }} <span style="color:var(--ink2)">（参考价，以当地实际为准）</span></div>
        </div>
      </div>

      <!-- 行程规划（专家系统） -->
      <div v-else class="tabbody">
        <div class="plan-box">
          <h3>智能行程规划 <span class="cnt">基于 {{ p.attractions.length }} 个景区评分 / 标签 / 时长 / 交通的专家规则</span></h3>
          <div class="plan-ctl">
            <div class="grp"><label>玩几天</label>
              <div class="chips"><button v-for="d in [1,2,3]" :key="d" :class="{ on: days === d }" @click="days = d; plan = null">{{ d }} 天</button></div>
            </div>
            <div class="grp"><label>兴趣（可多选）</label>
              <div class="chips">
                <button v-for="t in interests" :key="t" :class="{ on: picked.includes(t) }"
                  @click="toggle(t)">{{ t }}</button>
              </div>
            </div>
            <button class="gen" @click="generate">生成行程方案</button>
          </div>
        </div>

        <template v-if="plan">
          <div v-for="(day, di) in plan" :key="di" class="day">
            <h3>第 {{ di + 1 }} 天</h3>
            <div v-for="(slot, si) in day" :key="si" class="slot">
              <div class="when">{{ slot.when }}</div>
              <div class="what">
                <template v-if="slot.attr">
                  <b>{{ slot.attr.name }}</b><span class="rate" style="margin-left:8px">{{ slot.attr.rating }} 分</span>
                  <div class="tags" style="margin:6px 0;display:flex;gap:6px;flex-wrap:wrap">
                    <span v-for="t in slot.attr.tags" :key="t" class="tag">{{ t }}</span></div>
                  <div class="d2">{{ slot.attr.desc }}</div>
                  <div class="d2">建议 {{ slot.attr.duration }} · 门票 {{ slot.attr.ticket }}</div>
                  <div v-if="slot.transit" class="d2">地铁 · {{ slot.transit }}</div>
                </template>
                <template v-else>
                  <b>{{ slot.title }}</b>
                  <div class="d2">{{ slot.text }}</div>
                  <div v-if="slot.transit" class="d2">地铁 · {{ slot.transit }}</div>
                </template>
              </div>
            </div>
            <div class="day-food">当日推荐美食：{{ dayFoods(di) }}</div>
          </div>
        </template>
      </div>
    </div>

    <!-- 站点弹窗 -->
    <div v-if="pop" class="st-pop" @click.self="pop = null">
      <div class="box">
        <h3>{{ pop.station }}</h3>
        <div class="ln">{{ pop.line }} · {{ pop.xfer || '' }} · 本站周边推荐</div>
        <template v-if="pop.pois.length">
          <button v-for="a in pop.pois" :key="a.name" class="poi" @click="gotoAtt(a)">
            <b>{{ a.name }}</b><span v-if="a.rating" class="rate" style="margin-left:8px">{{ a.rating }} 分</span>
            <div v-if="a.desc" class="d">{{ a.desc }}</div>
            <div class="d tap">查看景点详情 ›</div>
          </button>
        </template>
        <div v-else class="empty">本站暂无标注景区，可前往相邻大站</div>
        <button class="close" @click="pop = null">关闭</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MetroMap from '../components/MetroMap.vue'
import cities from '../data/cities.json'
import intl from '../data/intl.json'

const route = useRoute()
const p = [...cities, ...intl].find(x => x.slug === route.params.slug)

const tab = ref('att')
const tabs = [
  { k: 'att', label: `景区 ${p ? p.attractions.length : 0}` },
  { k: 'food', label: '美食' },
  { k: 'tc', label: '交通' },
  { k: 'plan', label: '行程规划' },
]
const img = (n) => `${import.meta.env.BASE_URL}img/${n}.jpg?v=5`
const badCover = ref(false)
const bads = reactive({})
const openLine = ref(null)
const openFood = ref(-1)
const pop = ref(null)

const tr = computed(() => (p && p.transport) || { metro: [], rail: [], bus: [], taxi: '', airport_transfer: [], flights: {} })
const airportTransfer = computed(() => Array.isArray(tr.value.airport_transfer) ? tr.value.airport_transfer : (tr.value.airport_transfer ? [tr.value.airport_transfer] : []))

const isInter = (n) => !!(p.interchange && p.interchange[n.replace(/站$/, '')])
function hotStation(n) { return !!(p.station_pois && p.station_pois[n]) }

// 站点 → 周边（人工映射优先）
function poisAt(station) {
  const map = p.station_pois || {}
  if (map[station]) {
    const named = map[station].map(n => p.attractions.find(a => a.name === n || a.name.includes(n))).filter(Boolean)
    const extra = map[station].filter(n => !named.some(a => a.name === n)).map(n => ({ name: n, rating: null, desc: '' }))
    return [...named, ...extra]
  }
  return p.attractions.filter(a => {
    const key = a.name.replace(/（.*?）|\(.*?\)|风景区|旅游区|景区|公园$/g, '')
    return key.length >= 2 && (station.includes(key) || key.includes(station))
  })
}
function onPick({ station, line }) {
  const xf = (p.interchange && p.interchange[station.replace(/站$/, '')]) || []
  pop.value = { station, line, xfer: xf.length ? `换乘 ${xf.join('·')}` : '', pois: poisAt(station) }
}
// 弹窗点景区 → 跳到景区卡片
function gotoAtt(a) {
  pop.value = null
  const idx = p.attractions.findIndex(x => x.name === a.name)
  tab.value = 'att'
  if (idx >= 0) nextTick(() => {
    const el = document.getElementById(`att-${idx}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

// ===== 行程规划专家系统 =====
const interests = ['历史古迹', '自然风光', '博物馆', '亲子', '网红打卡', '美食']
const picked = ref([])
const days = ref(1)
const plan = ref(null)
const toggle = (t) => {
  const i = picked.value.indexOf(t)
  i >= 0 ? picked.value.splice(i, 1) : picked.value.push(t)
}
function transitHint(a) {
  for (const [st, names] of Object.entries(p.station_pois || {})) {
    if (names.some(n => a.name.includes(n) || n.includes(a.name.replace(/（.*?）|\(.*?\)/g, '')))) {
      const xf = (p.interchange && p.interchange[st]) || []
      return `最近站点「${st}」${xf.length ? '（换乘 ' + xf.join('·') + '）' : ''}`
    }
  }
  return ''
}
function generate() {
  const score = a => a.rating * 10
    + picked.value.reduce((n, t) => n + (a.tags.some(x => x.includes(t) || t.includes(x)) ? 25 : 0), 0)
    + (a.tags.includes('夜景') ? 8 : 0)
  const pool = p.attractions.map((a, i) => ({ ...a, i, s: score(a) })).sort((x, y) => y.s - x.s)
  const used = new Set()
  const res = []
  for (let d = 0; d < days.value; d++) {
    const day = []
    const slots = d === 0
      ? [['上午', 3.5], ['下午', 3.5], ['晚上', 2]]
      : [['上午', 3], ['下午', 3.5], ['晚上', 2]]
    for (const [when, budget] of slots) {
      const dur = a => parseFloat(a.duration) || 2
      let pickIdx = pool.findIndex(a => !used.has(a.i) && (when !== '晚上' || a.tags.some(t => ['夜景', '网红打卡', '美食'].includes(t))) && dur(a) <= budget + 1)
      if (pickIdx < 0) pickIdx = pool.findIndex(a => !used.has(a.i))
      if (pickIdx >= 0 && when !== '晚上') {
        const a = pool[pickIdx]; used.add(a.i)
        day.push({ when, attr: a, transit: transitHint(a) })
        if (budget - dur(a) >= 1.6) {
          const j = pool.findIndex(x => !used.has(x.i) && dur(x) <= 1.8)
          if (j >= 0) { const b = pool[j]; used.add(b.i); day.push({ when: when + '·续', attr: b, transit: transitHint(b) }) }
        }
      } else if (when === '晚上') {
        const f = p.foods.slice(d * 2 % p.foods.length, d * 2 % p.foods.length + 2)
        day.push({ when, title: '夜间 · 逛吃', text: `推荐体验本地夜生活，品尝 ${f.map(x => x[0]).join('、')}。` })
      } else {
        day.push({ when, title: '自由安排', text: '按体力灵活安排，可逛老街 / 商圈休息。' })
      }
    }
    res.push(day)
  }
  plan.value = res
}
function dayFoods(di) {
  const f = p.foods || []
  return [f[di % f.length]?.[0], f[(di + 3) % f.length]?.[0], f[(di + 5) % f.length]?.[0]].filter(Boolean).join('、')
}
</script>
<style scoped>
.plan-box { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin-bottom: 20px; }
.plan-box h3 { font-size: 18px; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.plan-box .cnt { font-size: 12px; color: var(--ink2); font-weight: 400; }
.plan-ctl { margin-top: 14px; display: flex; flex-direction: column; gap: 12px; }
.grp label { font-size: 13px; color: var(--ink2); display: block; margin-bottom: 8px; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.chips button {
  border: 1px solid var(--line); background: #fff; border-radius: 999px; padding: 10px 18px;
  font-size: 14px; cursor: pointer; color: var(--ink); min-height: 42px;
}
.chips button.on { background: var(--acc); border-color: var(--acc); color: #fff; }
.gen {
  align-self: flex-start; border: 0; background: var(--acc); color: #fff; border-radius: 999px;
  padding: 13px 32px; font-size: 15px; cursor: pointer; min-height: 46px;
}
.gen:active { opacity: .85; }
.day { margin-bottom: 22px; }
.day h3 { font-size: 18px; margin-bottom: 10px; }
.slot { display: flex; gap: 12px; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; margin-bottom: 8px; }
.slot .when { flex: 0 0 62px; font-size: 12px; color: var(--acc); background: var(--acc-soft); border-radius: 8px; height: fit-content; padding: 4px 0; text-align: center; }
.slot .what { flex: 1; min-width: 0; }
.slot .d2 { font-size: 13px; color: var(--ink2); margin-top: 4px; line-height: 1.65; }
.day-food { font-size: 13px; color: var(--green); background: #eefaf2; border-radius: 10px; padding: 10px 14px; margin-top: 6px; }
.st .xfer { font-style: normal; font-size: 10px; background: var(--warm); color: #fff; border-radius: 4px; padding: 0 4px; margin-left: 5px; }

/* 美食手风琴 */
.food-hint { font-size: 12px; color: var(--ink2); margin-bottom: 10px; }
.foods { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.food { background: var(--card); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; height: fit-content; }
.food.open { border-color: var(--acc); }
.food-head {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  border: 0; background: none; padding: 14px 16px; font-size: 15px; cursor: pointer;
  color: var(--ink); text-align: left; min-height: 48px;
}
.food-head:active { background: var(--acc-soft); }
.food-head .arrow { color: var(--ink2); transition: transform .18s; font-size: 18px; flex-shrink: 0; }
.food.open .food-head .arrow { transform: rotate(90deg); color: var(--acc); }
.food-body { padding: 0 16px 14px; font-size: 13px; color: var(--ink2); line-height: 1.75; }

/* 弹窗 POI 可点跳转 */
.st-pop .poi { display: block; width: 100%; text-align: left; border: 1px solid var(--line); background: #fff; font: inherit; color: inherit; }
.poi .tap { margin-top: 6px; color: var(--acc); font-size: 12px; }
</style>
