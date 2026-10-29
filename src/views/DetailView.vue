<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import cities from '../data/cities.json'
import intl from '../data/intl.json'

const route = useRoute()
const isIntl = computed(() => intl.some(c => c.slug === route.params.slug))
const p = computed(() => (isIntl.value ? intl : cities).find(c => c.slug === route.params.slug))

const grads = [
  'linear-gradient(140deg,#35247a,#6c5ce7 50%,#e84393)',
  'linear-gradient(140deg,#1f4b7a,#2f7fb8 55%,#5ad1c8)',
  'linear-gradient(140deg,#5a2d3f,#c2416b 55%,#f0a35e)',
  'linear-gradient(140deg,#14342e,#2f8f7a 55%,#9ad86b)',
]
const heroBg = computed(() => !p.value ? '' : grads[[...p.value.slug].reduce((a, c) => a + c.charCodeAt(0), 0) % grads.length])
</script>

<template>
  <div v-if="p">
    <header class="detail-hero" :style="{ background: heroBg }">
      <div class="container">
        <RouterLink :to="isIntl ? '/intl' : '/cities'" class="back-link">← 返回列表</RouterLink>
        <div class="emoji-big">{{ isIntl ? p.flag : p.emoji }}</div>
        <h1>{{ p.name }}<small>{{ isIntl ? p.country : p.province }} · {{ p.tag }}</small></h1>
        <p>{{ p.desc }}</p>
      </div>
    </header>

    <div class="container">
      <div class="detail-grid">
        <div>
          <div class="panel">
            <h3>🎯 必去景点</h3>
            <div v-for="a in p.attractions" :key="a.name" class="attraction">
              <b>{{ a.name }}</b>
              <p>{{ a.desc }}</p>
            </div>
          </div>

          <div class="panel" style="margin-top:24px">
            <h3>🍜 当地美食</h3>
            <div class="chips">
              <span v-for="f in p.foods" :key="f" class="chip">{{ f }}</span>
            </div>
          </div>
        </div>

        <div>
          <div class="panel">
            <h3>🚄 交通指南</h3>
            <div class="transport-row"><span class="ico">✈️</span><span class="k">机场</span><span class="v">{{ p.transport.airport }}</span></div>
            <div class="transport-row"><span class="ico">🚆</span><span class="k">铁路</span><span class="v">{{ p.transport.rail }}</span></div>
            <div class="transport-row"><span class="ico">🚇</span><span class="k">市内</span><span class="v">{{ p.transport.metro }}</span></div>
            <div v-if="p.transport.visa" class="transport-row"><span class="ico">🛂</span><span class="k">签证</span><span class="v">{{ p.transport.visa }}</span></div>
            <div v-if="p.cost" class="transport-row"><span class="ico">💰</span><span class="k">消费</span><span class="v">人均水平 {{ p.cost }}</span></div>
            <div class="tips-box">💡 {{ p.transport.tips }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty">未找到该目的地 🧭</div>
</template>
