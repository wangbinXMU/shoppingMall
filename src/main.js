// express项目的入口文件

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
//定义全局插件，并定义使用
import Vue from 'vue'
import App from './App'
import router from './router'
//由于导出是具名函数，而不是默认导出，需要进行对象解构
import { currency } from "./util/currency"
//图片懒加载插件
import VueLazyLoad from 'vue-lazyload'
//滚动加载插件
import infiniteScroll from 'vue-infinite-scroll'
//Vuex插件
import Vuex from "vuex"
Vue.use(Vuex);
Vue.use(infiniteScroll);
Vue.use(VueLazyLoad, {
  loading: "/static/loading-svg/loading-bars.svg",
  try: 3 //default 1
});
Vue.config.productionTip = false;
Vue.filter("currency", currency);

import storeFunc from "./store/vuex"
const store = storeFunc(Vuex);
//所有组件都是挂载到此Vue实例中的,只要将store注册到这里的Vue实例中，
//则所有页面都能使用Vuex中的状态
new Vue({
  // 将单页面app.vue组件与Vue实例相关联
  el: '#app',
  //使得Vue实例的所有子组件都能使用通过this调用store
  store: store,
  router: router,
  components: { App },
  template: '<App/>'
});
