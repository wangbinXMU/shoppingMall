<template>
    <div>
        <nav-header></nav-header>
        <!--面包屑组件，span使用的是具名插槽-->
        <nav-bread><span slot="bread" style="font-famliy:Mocrosoft Yahei;font-weight:bold">商品列表</span></nav-bread>
        <div class="accessory-result-page accessory-page">
            <div class="container">
                <div class="filter-nav">
                    <span class="sortby">Sort by:</span>
                    <a href="javascript:void(0)" class="default cur">Default</a>
                    <a href="javascript:void(0)" class="price" @click="sortGoods">Price <span class='price-arrow-container'><img :class="arrowFlag?'arrow-up':'arrow-down'" src="../assets/arrow-price.svg" alt="升序"></span></a>
                    <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
                </div>
                <div class="accessory-result">
                    <!-- 价格区段选择区，窗口较小时，此部分会被隐藏掉，需要点击Filter by来弹出 -->
                    <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
                        <dl class="filter-price">
                            <dt>Price:</dt>
                                                                     <!--点击后触发两个事件，用逗号隔开-->
                            <dd><a href="javascript:void(0)" :class="{'cur':priceChecked=='all'}" @click="priceChecked='all';showAll() " >All</a></dd>
                            <!--点击某个价格区间时，将索引赋给priceChecked-->
                            <dd v-for="(price,index) in priceFilter" :key='index'>
                                <!--点击使cur生效-->
                                <a href="javascript:void(0)"  @click="setPriceFilter(index)" :class="{'cur':priceChecked==index}" >{{price.startPrice}} - {{price.endPrice}}</a>
                            </dd>
                        </dl>
                    </div>

                    <!-- search result accessories list -->
                    <div class="accessory-list-wrap">
                        <div class="accessory-list col-4">
                            <!--商品列表-->
                            <ul class="list-wrap">
                                <li v-for="(item,index) in goodsList" :key='index'>
                                    <div class="pic">
                                        <!--图片路径的拼接-->
                                        <a href="javascript:;"><img  v-lazy=" '/static/' +item.productImage"  :alt="item.productName"></a>
                                    </div>
                                    <div class="main">
                                        <div class="name">{{ item.productName }}</div>
                                        <div class="price">{{ item.salePrice }}</div>
                                        <div class="btn-area">
                                            <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <!--infinite-scroll插件实现滚动条下拉加载-->
                            <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="20" class="load-more">
                                <img src="./../assets\loading-spinning-bubbles.svg" alt="" v-show="loading">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--遮罩-->
        <div class="md-overlay" v-show="overLayFlag" @click="closePop()" ></div>
        <!-- mdShow控制模态框显示-->
        <modal :mdShow="mdShow" @close="closeModal()">
        
            <p slot="message">
                请先登录，否则无法加入到购物车中！
            </p>
            <div slot="btnGroup">
                <a href="javascript:;" class="btn btn--m" @click="mdShow=false">关闭</a>
            </div>
        </modal>
        <!--引入模态组件：加入购物车成功后的提示，并进行引导操作-->
        <modal :mdShow="mdShowCart"  @close="closeModal">
            <p slot="message">
                <svg class="icon-status-ok">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
                </svg>
                <span>加入购物车成功</span>
            </p>
            <div slot="btnGroup">
                <a href="javascript:;" class="btn btn--m" @click="mdShowCart=false">继续购物</a>
                <!--点击后跳到购物车页面-->
                <router-link href="javascript:;" class="btn btn--m" to="/cart">查看购物车</router-link>
            </div>
        </modal>
        <!--底部组件-->
        <nav-footer></nav-footer>
    </div>
</template>

<script>
//导入外部CSS
import "./../assets/css/base.css";
import "./../assets/css/product.css";
//导入各组件
import NavHeader from "@/components/NavHeader.vue";
import NavFooter from "@/components/NavFooter.vue";
import NavBread from "@/components/NavBread.vue";
import Modal from "./../components/Modal";
import axios from "axios";
export default {
  components: {
    NavHeader,
    NavFooter,
    NavBread,
    Modal
  },
  data: function() {
    return {
      arrowFlag: false,
      goodsList: [],
      //排序
      sortFlag: true,
      //筛选后，默认显示一页最多8件商品，只有滚动加载才会显示更多页的更多条内容
      page: 1,
      pageSize: 8,
      //控制  加载中  样式是否显示
      loading: false,
      //默认时，priceChecked值为all
      priceChecked: "all",
      //控制 未登录 提示框
      mdShow: false,
      // 控制 加入购物车成功 提示框
      mdShowCart: false,
      // 价格筛选区间
      priceFilter: [
        {
          startPrice: "0.0",
          endPrice: "100.0"
        },
        {
          startPrice: "100.0",
          endPrice: "500.0"
        },
        {
          startPrice: "500.0",
          endPrice: "1000.0"
        },
        {
          startPrice: "1000.0",
          endPrice: "2000.0"
        }
      ],
      //窗口缩小时点击filterBy控制价格筛选窗口
      filterBy: false,
      //价格筛选窗口弹出时，控制遮罩
      overLayFlag: false
    };
  },
  mounted: function() {
    this.getGoodsList();
  },
  methods: {
    getGoodsList(flag) {
      //axios本身不能跨域，需要配置代理转发
      let param = {
        page: this.page,
        pageSize: this.pageSize,
        sort: this.sortFlag ? 1 : -1,
        //控制滚动加载是否生效
        busy: true,
        // 默认价格区筛选为 “All”
        priceLevel: this.priceChecked,
        // 将价格区间一起发给后台
        priceFilter:this.priceFilter
      };
      this.loading = true; //请求前显示
      //请求商品列表
      axios.get("/goods/list", { params: param }).then(response => {
        let res = response.data;
        this.loading = false; //请求完成隐藏
        if (res.status === "0") {
          //请求成功
          if (flag) {
            //每加载一个页面就要请求一次，每次请求到的内容都进行累加显示，如果调用getGoodsList方法有
            //有传入flag说明这是滚动条滑动触发的调用
            this.goodsList = this.goodsList.concat(res.result.list);
            if (res.result.count == 0) {
              //文档数量为0时，说明正在请求，要禁止滚动加载功能
              this.busy = true;
            } else {
              this.busy = false;
            }
          } else {
            this.goodsList = res.result.list; //滚动前，默认加载第一个页面，并且开启滚动加载
            this.busy = true;
          }
        } else {
          this.goodsList = []; //请求失败，则此数组为空，页面不显示商品信息
        }
      });
    },
    //点击“all”时，显示所有列表，但是采用滚动加载显示
    showAll() {
      this.getGoodsList();
    },
    sortGoods() {
      this.arrowFlag = !this.arrowFlag;
      this.sortFlag = !this.sortFlag;
      this.page = 1;
      //点击price后要重新刷新页面
      this.getGoodsList();
    },
    //鼠标滚动触发的事件
    loadMore() {
      //禁止滚动加载，等待请求加载，因为每次请求都有大量的请求加载，故需要设置延时
      this.busy = true;
      setTimeout(() => {
        this.page++;
        this.getGoodsList(true);
      }, 500);
    },
    //点击"加入购物车"将请求商品信息并加入购物车
    addCart(productId) {
      axios
        .post("/goods/addCart", {
          productId: productId
        })
        .then(res => {
          // var res=res.data;
          if (res.data.status == 0) {
            //添加成功，则成功模态框显示
            this.mdShowCart = true;
            //每添加一件商品，购物车数量标记+1
            this.$store.commit("updateCartCount", 1);
          } else {
            //未添加成功则错误提示模态框显示
            this.mdShow = true;
          }
        });
    },
    //1.点击价格该价格样式改变  2.点击价格后取消遮罩
    setPriceFilter(index) {
      this.priceChecked = index;
      this.closePop();
      this.page = 1;
      this.getGoodsList();
    },
    //弹出价格过滤区间
    showFilterPop() {
      this.filterBy = true;
      this.overLayFlag = true;
    },
    closePop() {
      this.filterBy = false;
      this.overLayFlag = false;
    },
    //自定义的close事件让属性closeModal变为false
    closeModal() {
      this.mdShowCart = false;
      this.mdShow = false;
    }
  }
};
</script>
<style scoped>
.load-more {
  height: 30px;
  margin: 20px auto;
  line-height: 30px;
  text-align: center;
}
.icon-arrow-short {
  width: 11px;
  height: 11px;
  transition: all 0.3s ease-out;
}
.filter-nav .sort-up {
  transform: rotate(180deg);
  transition: all 0.3s ease-out;
}
.price-arrow-container {
  text-align: center;
}
.arrow-up {
  width: 15px;
  height: 15px;
}
.arrow-down {
  width: 15px;
  height: 15px;
  transform: rotate(180deg);
}
.btn:hover {
  background-color: #f93;
  transition: all 0.3s ease-out;
}
</style>
