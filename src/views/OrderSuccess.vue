<template>
    <div>
        <nav-header></nav-header>
        <div class="container">
            <div class="page-title-normal">
                <h2 class="page-title-h2"><span>check out</span></h2>
            </div>
            <!-- 进度条 -->
            <div class="check-step">
                <ul>
                    <li class="cur"><span>Confirm</span> address</li>
                    <li class="cur"><span>View your</span> order</li>
                    <li class="cur"><span>Make</span> payment</li>
                    <li class="cur"><span>Order</span> confirmation</li>
                </ul>
            </div>

            <div class="order-create">
                <div class="order-create-pic"><img src="/static/ok-2.png" alt=""></div>
                <div class="order-create-main">
                    <h3>Congratulations! <br>Your order is under processing!</h3>
                    <p>
                        <span>Order ID：{{ orderId }}</span>
                        <span>Order total：{{ orderTotal | currency("￥") }}</span>
                    </p>
                    <div class="order-create-btn-wrap">
                        <div class="btn-l-wrap">
                            <router-link  href="javascript:;" class="btn btn--m" to="/cart">返回购物车</router-link>
                        </div>
                        <div class="btn-r-wrap">
                            <router-link  href="javascript:;" class="btn btn--m" to="/">返回首页</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <nav-footer></nav-footer>
    </div>
</template>

<script>
    import NavHeader from './../components/NavHeader'
    import NavFooter from './../components/NavFooter'
    import Modal from './../components/Modal'
    //格式化金额，在此处引入只在当前页面生效，currency.js插件实际上导出的是函数，故要用{}，默认保留两位小数
    //要想进行全局生效，需要在main.js 中引入
    import {currency} from './../util/currency'
    import axios from 'axios'
    export default {
        data() {
            return {
                orderId:"",
                orderTotal:0,
            }
        },
        filter:{
            currency,
        },
        components:{
            NavHeader,
            NavFooter,
            Modal
        },
        mounted(){
            // 拿到上个页面的路由传参
            var orderId=this.$route.query.orderId;
            if(!orderId){  //若URL的该参数被人为删除
                return;
            }else{
                axios.get("/users/orderDetail?"+orderId).then(response=>{
                    let res=response.data;
                    console.log(res);
                    if(res.status=="0"){
                        //由于OrderConfirm中的orderId以哈希值传输过来的，传统的local.search是拿不到该值的，此方法只能拿到
                        //#前，？后面的非哈希值参数
                            this.orderId=res.result.orderId;
                            this.orderTotal=res.result.orderTotal;
                            // 支付成功生成订单并且删除购物车中已支付的商品
                    }
                })
            }

        }
    }
</script>

<style scoped>

</style>