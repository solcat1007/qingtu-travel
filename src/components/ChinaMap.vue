<template>
  <div class="map-wrap">
    <div class="map-tabs">
      <button class="map-tab" :class="{ active: mode === 'domestic' }" @click="$emit('mode', 'domestic')">国内</button>
      <button class="map-tab" :class="{ active: mode === 'intl' }" @click="$emit('mode', 'intl')">国际</button>
    </div>

    <!-- 2D SVG 降级方案 -->
    <svg v-if="fallback" class="svg-map" viewBox="-265 -190 530 380">
      <path v-for="(d, i) in svgPaths" :key="i" :d="d" class="prov" />
      <circle
        v-for="c in svgDots" :key="c.slug" :cx="c.x" :cy="c.y" r="4"
        :fill="c.type === 'intl' ? '#7ef5d0' : '#ffd76e'"
        :class="{ dim: c.type !== mode }" class="dot"
        @mouseenter="tip = { show: true, name: c.name, sub: c.sub }"
        @mouseleave="tip.show = false"
        @click="$emit('select', { slug: c.slug, type: c.type })"
      />
    </svg>
    <div v-if="fallback && tip.show" class="map-tip" style="left: 50%; top: 70px; transform: translateX(-50%)">
      <b>{{ tip.name }}</b> · {{ tip.sub }}（点击进入）
    </div>

    <canvas v-show="!fallback" ref="cv"></canvas>
    <div v-if="!fallback && tip.show" class="map-tip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
      <b>{{ tip.name }}</b> · {{ tip.sub }}
    </div>
    <div class="map-hint">{{ fallback ? '💡 当前浏览器不支持 3D，已切换 2D 模式 · 点击光点进入城市' : '🖱️ 拖拽旋转 · 滚轮缩放 · 点击光点进入城市' }}</div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import cities from '../data/cities.json'
import intl from '../data/intl.json'

const props = defineProps({ mode: { type: String, default: 'domestic' } })
const emit = defineEmits(['select', 'mode'])
const cv = ref(null)
const tip = ref({ show: false, x: 0, y: 0, name: '', sub: '' })
const fallback = ref(false)
const svgPaths = ref([])
const svgDots = ref([])

let renderer, scene, camera, controls, raycaster, pointer, dots3d, raf
let disposed = false

const PX = 8 // 经纬度 → 场景坐标
const proj = (lng, lat) => [(lng - 104.5) * PX, (lat - 37.5) * PX * 1.25]

// ===== 2D SVG 降级 =====
function buildSvg() {
  import('../data/china.json').then(({ default: china }) => {
    const paths = []
    for (const f of china.features) {
      const polys = f.geometry?.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry?.coordinates].filter(Boolean)
      for (const poly of polys) {
        paths.push(poly[0].map(([lng, lat], i) => { const [x, y] = proj(lng, lat); return (i ? 'L' : 'M') + x + ' ' + -y }).join(' ') + 'Z')
      }
    }
    svgPaths.value = paths
      svgDots.value = [
      ...cities.map(c => ({ slug: c.slug, name: c.name, sub: c.tag, type: 'domestic', x: proj(c.lng, c.lat)[0], y: -proj(c.lng, c.lat)[1] })),
      ...intl.map(c => ({ slug: c.slug, name: c.name, sub: c.country, type: 'intl', x: proj(c.lng, c.lat)[0], y: -proj(c.lng, c.lat)[1] })),
    ]
  })
}

// ===== 3D 主方案 =====
async function build() {
  const THREE = await import('three')
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')
  if (disposed) return
  let r
  try {
    r = new THREE.WebGLRenderer({ canvas: cv.value, antialias: true, alpha: true })
  } catch {
    fallback.value = true
    buildSvg()
    return
  }
  renderer = r
  const china = await import('../data/china.json')
  renderer.setSize(cv.value.clientWidth, cv.value.clientHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, cv.value.clientWidth / cv.value.clientHeight, 1, 3000)
  camera.position.set(0, 300, 330)
  camera.lookAt(0, 0, 0)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2.15
  controls.minDistance = 150
  controls.maxDistance = 700

  scene.add(new THREE.AmbientLight(0xffffff, 0.9))
  const dir = new THREE.DirectionalLight(0xffffff, 1.1)
  dir.position.set(150, 300, 200)
  scene.add(dir)

  const group = new THREE.Group()
  group.rotation.x = -Math.PI / 2
  scene.add(group)

  const palette = [0x7b6cf0, 0x8f7df5, 0x6c5ce7, 0x9b8cf8, 0x8471ee, 0xa18ffb]
  let ci = 0
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
  for (const f of china.default.features) {
    const polys = f.geometry?.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry?.coordinates].filter(Boolean)
    for (const poly of polys) {
      const shape = new THREE.Shape(poly[0].map(([lng, lat]) => new THREE.Vector2(...proj(lng, lat))))
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: false })
      const mat = new THREE.MeshPhongMaterial({ color: palette[ci++ % palette.length], transparent: true, opacity: 0.92, emissive: 0x1a1040, shininess: 30 })
      group.add(new THREE.Mesh(geo, mat))
      poly.forEach(ring => {
        const pts = ring.map(([lng, lat]) => new THREE.Vector3(...proj(lng, lat), 8.2))
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat))
      })
    }
  }

  dots3d = new THREE.Group()
  dots3d.rotation.x = -Math.PI / 2
  scene.add(dots3d)
  const dotGeo = new THREE.SphereGeometry(3.2, 16, 16)
  const all = [...cities.map(c => ({ c, type: 'domestic', sub: c.tag })), ...intl.map(c => ({ c, type: 'intl', sub: c.country }))]
  for (const { c, type, sub } of all) {
    const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: type === 'intl' ? 0x7ef5d0 : 0xffd76e }))
    const [x, y] = proj(c.lng, c.lat)
    m.position.set(x, y, 11)
    m.userData = { name: c.name, sub, slug: c.slug, type }
    m.visible = type === props.mode
    dots3d.add(m)
  }
  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  const pick = (e) => {
    const r2 = renderer.domElement.getBoundingClientRect()
    pointer.set(((e.clientX - r2.left) / r2.width) * 2 - 1, -((e.clientY - r2.top) / r2.height) * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    return raycaster.intersectObjects(dots3d.children)[0]
  }
  renderer.domElement.addEventListener('pointermove', (e) => {
    const hit = pick(e)
    const r2 = renderer.domElement.getBoundingClientRect()
    if (hit) {
      tip.value = { show: true, x: e.clientX - r2.left, y: e.clientY - r2.top, name: hit.object.userData.name, sub: hit.object.userData.sub }
      renderer.domElement.style.cursor = 'pointer'
    } else {
      tip.value.show = false
      renderer.domElement.style.cursor = 'grab'
    }
  })
  renderer.domElement.addEventListener('click', (e) => {
    const hit = pick(e)
    if (hit) emit('select', hit.object.userData)
  })

  const loop = () => {
    if (disposed) return
    raf = requestAnimationFrame(loop)
    dots3d.children.forEach(d => { d.scale.setScalar(1 + 0.25 * Math.sin(Date.now() / 300 + d.position.x)) })
    controls.update()
    renderer.render(scene, camera)
  }
  loop()
}

watch(() => props.mode, (m) => {
  if (dots3d) dots3d.children.forEach(d => { d.visible = d.userData.type === m })
  tip.value.show = false
})

onMounted(async () => {
  try { await build() } catch { fallback.value = true; buildSvg() }
})
onBeforeUnmount(() => { disposed = true; cancelAnimationFrame(raf); renderer?.dispose() })
</script>

<style scoped>
.svg-map { width: 100%; height: 100%; }
.prov { fill: #6c5ce7; fill-opacity: 0.85; stroke: rgba(255, 255, 255, 0.5); stroke-width: 0.6; }
.dot { cursor: pointer; }
.dot.dim { opacity: 0; pointer-events: none; }
.dot:hover { r: 6; }
</style>
