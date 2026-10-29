import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import CitiesView from './views/CitiesView.vue'
import IntlView from './views/IntlView.vue'
import DetailView from './views/DetailView.vue'
import './styles/main.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/cities', component: CitiesView },
    { path: '/intl', component: IntlView },
    { path: '/place/:slug', component: DetailView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() { return { top: 0 } },
})

createApp(App).use(router).mount('#app')
