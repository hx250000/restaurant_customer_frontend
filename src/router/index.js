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

router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录
  if (to.matched.some(record => record.meta.requireAuth)) {
    const token = localStorage.getItem('jwt_token'); // 从 localStorage 获取 token
    if (!token) {
      // 如果没有 token，跳转到登录页面
      next('/login');
    } else {
      // 如果有 token，继续访问目标页面
      next();
    }
  } else {
    // 如果路由不需要登录，直接继续
    next();
  }
});

export default router
