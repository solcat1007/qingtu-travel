<template>
  <div class="metromap">
    <div class="mm-head">
      <b>{{ title }}</b>
      <span class="cnt">{{ lines.length }} 条线 · {{ total }} 站 · {{ interCount }} 个换乘站</span>
      <div class="mm-tools">
        <label class="switch"><input type="checkbox" v-model="showAll" /> 显示全部站名</label>
        <div class="zoombtns">
          <button type="button" @click="zoomBy(1.3)" aria-label="放大">＋</button>
          <button type="button" @click="zoomBy(1 / 1.3)" aria-label="缩小">－</button>
          <button type="button" class="ztxt" @click="resetView">复位</button>
        </div>
      </div>
    </div>

    <div class="mm-view" ref="viewEl" @wheel.prevent="onWheel" @pointerdown="onDown" @pointermove="onMove"
      @pointerup="onUp" @pointercancel="onUp">
      <svg :viewBox="box" :style="{ width: w + 'px', height: h + 'px', transform: `translate(${tx}px,${ty}px) scale(${k})` }">
        <g v-for="l in lines" :key="l.name" class="ln-g" :class="{ dim: hoverLine && hoverLine !== l.name }">
          <polyline :points="pts(l)" fill="none" :stroke="l.color" :stroke-width="4.5 / u2s" stroke-linejoin="round"
            stroke-linecap="round" />
          <g v-for="(s, i) in l.stations" :key="s.n + i">
            <!-- 可视：换乘站白环大点 -->
            <circle v-if="isInter(s.n)" :cx="s.x" :cy="s.y" :r="6.5 / u2s" fill="#fff" :stroke="interStroke(s.n)"
              :stroke-width="3.5 / u2s" class="dot inter" pointer-events="none" />
            <circle v-else :cx="s.x" :cy="s.y" :r="3.6 / u2s" fill="#fff" :stroke="l.color" :stroke-width="2 / u2s"
              class="dot" pointer-events="none" />
            <text v-if="showAll || isInter(s.n) || hotSet.has(s.n) || i === 0 || i === l.stations.length - 1"
              :x="s.x + 8 / u2s" :y="s.y + 3.2 / u2s" class="lbl" :class="{ bold: isInter(s.n) || hotSet.has(s.n) }"
              :style="{ fontSize: (isInter(s.n) || hotSet.has(s.n) ? 11 : 10) / u2s + 'px', strokeWidth: 2.6 / u2s + 'px' }"
              pointer-events="none">{{ s.n }}</text>
            <!-- 命中区（放大点击热区） -->
            <circle :cx="s.x" :cy="s.y" :r="hitR" class="hit" fill="transparent" :data-n="s.n" :data-line="l.name">
              <title>{{ s.n }}{{ isInter(s.n) ? '（换乘：' + interOf(s.n).join('·') + '）' : '' }}</title>
            </circle>
          </g>
        </g>
      </svg>
    </div>

    <div class="mm-hint">单指拖动平移 · 双指缩放 / 用右上按钮缩放 · 点击站点看周边</div>
    <div class="mm-legend">
      <span v-for="l in lines" :key="l.name" class="lg" :class="{ act: hoverLine === l.name }"
        @mouseenter="hoverLine = l.name" @mouseleave="hoverLine = null" @click="toggleLine(l.name)">
        <i :style="{ background: l.color }"></i>{{ l.name }}
      </span>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const props = defineProps({
  title: String,
  lines: { type: Array, default: () => [] },   // [{name,color,stations:[{n,x,y}]}]
  interchange: { type: Object, default: () => ({}) }, // {站名:[线路...]}
  stationPois: { type: Object, default: () => ({}) }, // {站名:[景区...]}
})
const emit = defineEmits(['pick'])

const showAll = ref(false)
const hoverLine = ref(null)
const k = ref(1), tx = ref(0), ty = ref(0)
const viewEl = ref(null)

const total = computed(() => props.lines.reduce((n, l) => n + l.stations.length, 0))
const interCount = computed(() => Object.keys(props.interchange).length)
const hotSet = computed(() => new Set(Object.keys(props.stationPois || {})))

const box = computed(() => {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
  for (const l of props.lines) for (const s of l.stations) {
    x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x); y1 = Math.max(y1, s.y)
  }
  if (x0 > x1) return '0 0 100 100'
  const pad = 60
  return `${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}`
})
const boxW = computed(() => Number(box.value.split(' ')[2]) || 100)
const w = computed(() => 1000)
const h = computed(() => {
  const [, , vw, vh] = box.value.split(' ').map(Number)
  return Math.round(1000 * (vh / vw)) || 700
})

// 单位坐标 → 屏幕像素比例（含缩放），用于把点/线/字固定为屏幕像素大小
const u2s = computed(() => (1000 / boxW.value) * k.value || 1)
// 点击热区半径（单位坐标）≈ 屏幕 16px
const hitR = computed(() => 16 / u2s.value)

const isInter = (n) => !!(props.interchange && props.interchange[n.replace(/站$/, '')])
const interOf = (n) => props.interchange[n.replace(/站$/, '')] || []
const interStroke = (n) => {
  const first = interOf(n)[0]
  const l = props.lines.find(l => l.name === first)
  return l ? l.color : '#666'
}
const pts = (l) => l.stations.map(s => `${s.x},${s.y}`).join(' ')

function toggleLine(name) {
  hoverLine.value = hoverLine.value === name ? null : name
}

// ===== 缩放 / 平移（鼠标 + 触屏）=====
function zoomAt(mx, my, factor) {
  const nk = Math.min(8, Math.max(0.3, k.value * factor))
  tx.value = mx - (mx - tx.value) * (nk / k.value)
  ty.value = my - (my - ty.value) * (nk / k.value)
  k.value = nk
}
function onWheel(e) {
  const r = viewEl.value.getBoundingClientRect()
  zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY > 0 ? 0.88 : 1.14)
}
function zoomBy(f) {
  const r = viewEl.value.getBoundingClientRect()
  zoomAt(r.width / 2, r.height / 2, f)
}
function resetView() { fit() }

function fit() {
  const el = viewEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  if (!r.width) return
  const kw = r.width / 1000
  const kh = r.height / (h.value || 700)
  k.value = Math.min(kw, kh) * 0.96
  tx.value = (r.width - 1000 * k.value) / 2
  ty.value = (r.height - h.value * k.value) / 2
}

const ptrs = new Map()
let pinch = null
let down = null
let moved = false

function onDown(e) {
  try { viewEl.value.setPointerCapture(e.pointerId) } catch { }
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (ptrs.size === 1) {
    down = { x: e.clientX, y: e.clientY, t: Date.now() }
    moved = false
  } else if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()]
    pinch = {
      dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      k: k.value,
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      tx: tx.value, ty: ty.value,
    }
    moved = true
  }
}
function onMove(e) {
  if (!ptrs.has(e.pointerId)) return
  const prev = ptrs.get(e.pointerId)
  const now = { x: e.clientX, y: e.clientY }
  ptrs.set(e.pointerId, now)
  if (ptrs.size >= 2 && pinch) {
    const [a, b] = [...ptrs.values()]
    const d = Math.hypot(a.x - b.x, a.y - b.y) || 1
    const nk = Math.min(8, Math.max(0.3, pinch.k * (d / pinch.dist)))
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    const r = viewEl.value.getBoundingClientRect()
    // 以起始中点为锚点缩放，再跟随当前中点平移
    const ax = (pinch.mid.x - r.left - pinch.tx) / pinch.k
    const ay = (pinch.mid.y - r.top - pinch.ty) / pinch.k
    tx.value = m.x - r.left - ax * nk
    ty.value = m.y - r.top - ay * nk
    k.value = nk
  } else if (ptrs.size === 1 && down) {
    const dx = now.x - down.x, dy = now.y - down.y
    if (Math.hypot(dx, dy) > 9) moved = true
    if (moved) {
      tx.value += now.x - prev.x
      ty.value += now.y - prev.y
    }
  }
}
function onUp(e) {
  ptrs.delete(e.pointerId)
  if (ptrs.size < 2) pinch = null
  if (ptrs.size === 0) {
    // 轻点（未拖动）→ 命中站点
    if (!moved && down && Date.now() - down.t < 700) {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const n = el && el.getAttribute && el.getAttribute('data-n')
      if (n) emit('pick', { station: n, line: el.getAttribute('data-line') })
    }
    down = null
    moved = false
  }
}

onMounted(() => {
  fit()
  window.addEventListener('resize', fit)
})
onBeforeUnmount(() => window.removeEventListener('resize', fit))
</script>
<style scoped>
.metromap { background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; margin-bottom: 24px; }
.mm-head { padding: 14px 18px 10px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mm-head b { font-size: 16px; }
.mm-head .cnt { font-size: 12px; color: var(--ink2); }
.mm-tools { margin-left: auto; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.switch { font-size: 13px; color: var(--ink2); display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; }
.zoombtns { display: flex; gap: 6px; }
.zoombtns button {
  min-width: 38px; height: 38px; border: 1px solid var(--line); background: #fff; border-radius: 9px;
  font-size: 18px; color: var(--ink); cursor: pointer; line-height: 1;
}
.zoombtns button:active { background: var(--acc-soft); }
.zoombtns .ztxt { font-size: 13px; padding: 0 12px; }
.mm-view {
  overflow: hidden; cursor: grab; touch-action: none;
  background: linear-gradient(180deg, #fbfcfe, #f2f5f9);
  border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  height: 58vh; min-height: 340px;
}
.mm-view:active { cursor: grabbing; }
svg { transform-origin: 0 0; display: block; }
.ln-g { transition: opacity .15s; }
.ln-g.dim { opacity: .15; }
.dot { cursor: pointer; }
.hit { cursor: pointer; }
.lbl {
  fill: #40505e; paint-order: stroke; stroke: #fff; stroke-linejoin: round;
  pointer-events: none; user-select: none;
}
.lbl.bold { font-weight: 700; fill: #22313f; }
.mm-hint { padding: 8px 18px 0; font-size: 11.5px; color: var(--ink2); }
.mm-legend { padding: 8px 18px 14px; display: flex; flex-wrap: wrap; gap: 8px 10px; }
.lg {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--ink2);
  cursor: pointer; user-select: none; border: 1px solid var(--line); border-radius: 999px; padding: 5px 11px;
  background: #fff;
}
.lg.act { color: var(--acc); border-color: var(--acc); background: var(--acc-soft); }
.lg i { width: 16px; height: 5px; border-radius: 3px; display: inline-block; }
@media (max-width: 640px) {
  .mm-view { height: 52vh; min-height: 300px; }
  .mm-head { padding: 12px 14px 8px; }
  .zoombtns button { min-width: 44px; height: 44px; }
}
</style>
