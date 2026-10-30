import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import CitiesView from './views/CitiesView.vue'
import IntlView from './views/IntlView.vue'
import DetailView from './views/DetailView.vue'
import './styles/main.css'

createApp(App).use(createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/cities', component: CitiesView },
    { path: '/intl', component: IntlView },
    { path: '/place/:slug', component: DetailView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})).mount('#app')
