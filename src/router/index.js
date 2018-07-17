import Vue from 'vue'
import Router from 'vue-router'
import GoodsList from './../views/GoodsList'
import Cart  from './../views/Cart'
import Address  from './../views/address'
import OrderConfirm  from './../views/OrderConfirm'
import OrderSuccess  from './../views/OrderSuccess'
Vue.use(Router)
export default new Router({
  //设置路由模式，hash模式需要在在服务器地址加#后再添加路由地址，history模式不需要
  mode:'hash',
  //为两个前端页面设置一级路由，注意后端设置一级路由在server的app.js
  routes: [
    {
      path: '/',
      component:GoodsList,
    },
      {
          path: '/cart',
          component:Cart,
      },
      {
          path: '/address',
          component:Address,
      },
      {
          path: '/orderConfirm',
          component:OrderConfirm,
      },
      {
          path: '/orderSuccess',
          component:OrderSuccess,
      },
  ]
})
