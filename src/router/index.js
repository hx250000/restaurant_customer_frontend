import Vue from 'vue'
import VueRouter from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import MenuView from '@/views/MenuView.vue'
import ProfileView from '@/views/ProfileView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/menu',
    name: 'menu',
    component: MenuView,
    meta:{requireAuth:true}
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta:{requireAuth:true}

  }
]

const router = new VueRouter({
  routes
})

export default router
