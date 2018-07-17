//定义一个vuex实例
//由于NavHeader组件中购物车标记的数量显示需要与Cart,GoodList组件进行通信，故将其数据统一纳入
//store进行管理
function storeFunc(Vuex) {
    return new Vuex.Store({
        state: {
            //nickName为登录后昵称
            nickName: "",
            cartCount: 0,
        },
        getters: {
           
        },
        mutations: {
            // 
            updateUserInfo(state, nickName) {
                state.nickName = nickName;
            },
            updateCartCount(state, cartCount) {
                state.cartCount += cartCount;
            },
            //由于在页面刷新执行了getCartCount方法而又进行了请求，将res.result再次加到cartCount上，故将执getCartCount的
            //调用换成此函数的调用，不进行+= 而其他地方仍旧采用+=
            initCartCount(state, cartCount) {
                state.cartCount = cartCount;
            }
        }
    });
}
export default storeFunc;