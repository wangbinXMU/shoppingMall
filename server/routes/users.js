/*后端路由文件*/
var express = require('express');
var router = express.Router();
var User = require("./../models/user");
//日期格式化插件由于是在Date的原型链上添加的方法故直接引入
require("./../util/util")
/* GET users listing. */
//   后端的  /users 接口
router.get('/', function (req, res, next) {
    if (res) {
        res.json({
            status: "0",
            msg: "当前后端接口为/users",
            result: ""
        });
    }
});

/*------------登陆接口----------*/
//前端设置了访问地址为/users/login,故这里也要指定对应的路由
router.post('/login', function (req, res, next) {
    let param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd,
    };
    User.findOne(param, function (err, doc) {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
            })
        } else {
            if (doc) {
                //将用户名和密码保存的文档的id作为session保存到前端cookie
                res.cookie("userId", doc.userId, {
                    path: "/", //cookie保存路径
                    maxAge: 1000 * 60 * 60  //保存时间
                });
                // 将用户名也保存在前端
                res.cookie("userName", doc.userName, {
                    path: "/",
                    maxAge: 1000 * 60 * 60
                });
                // req.cookie获取客户端发来的cookie;
                res.json({
                    status: "0",
                    msg: "",
                    result: {
                        userName: doc.userName,
                    }
                })
            } else {
                res.json({
                    status: "1",
                    msg: "用户名或密码错误!",
                    result: ""
                })
            }
        }
    })
});

/*-----------------退出接口--------------*/
router.post("/logout", function (req, res, next) {
    //退出后清除cookie, 刷新页面不会清除cookie
    res.cookie("userId", "", {
        path: "/",
        maxAge: -1,//过期
    });
    res.json({
        status: "0",
        msg: "",
        result: ""
    })
});

/*--------用户校验拿到当前用户信息------*/
//避免刷新后，用户退出,登录保持
router.get("/checkLogin", function (req, res, next) {
    //如果已经保存的有该用户名则响应“0”，供前端使用
    if (req.cookies.userId) {
        res.json({
            status: "0",
            msg: "",
            result: req.cookies.userName
        })
    } else {
        res.json({
            status: "1",
            msg: "未登录",
            result: ""
        })
    }
});
/*--------获取当前用户的购物车产品总数量------*/
router.get("/getTotal", function (req, res, next) {
    if (req.cookies && req.cookies.userId) {
        var userId = req.cookies.userId;
        User.findOne({ userId: userId }, function (err, doc) {
            if (err) {
                res.json({
                    status: "1",
                    msg: err.message,
                    result: ""
                })
            } else {
                let cartList = doc.cartList;
                let cartCount = 0;
                //  拿到每件购物车中商品的数量并返回一个数组
                cartList.map(item => {
                    cartCount += parseInt(item.productNum);
                });
                res.json({
                    status: "0",
                    msg: "",
                    result: cartCount,
                })
            }
        })
    } else {
        res.json({
            status: "1",
            msg: "",
            result: ""
        })
    }   
});

/*--------查询当前用户的购物车数据------*/
router.get("/cartList", function (req, res, next) {
    var userId = req.cookies.userId;
    User.findOne({ userId: userId }, function (err, doc) {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            })
        } else {
            if (doc) {
                res.json({
                    status: "0",
                    msg: "",
                    result: doc.cartList,
                })
            }
        }
    })
});
/*--------购物车列表删除------*/
router.post("/cartDel", function (req, res, next) {
    var userId = req.cookies.userId;
    var productId = req.body.productId;
    //mongDB中的删除方法pull,根据条件删除
    User.update({ userId: userId }, {
        // $pull会删除满足条件的字段
        $pull: {
            'cartList': {
                'productId': productId,
            }
        }
    }, function (err, doc) {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            })
        } else {
            res.json({
                status: "0",
                msg: "",
                result: "suc"
            })
        }
    })
});
/*--------前端进行商品数量的更改时，后端进行更新------*/
router.post("/cartEdit", function (req, res, next) {
    // post请求使用req.body获取请求中的参数
    var userId = req.cookies.userId,
        productId = req.body.productId,
        productNum = req.body.productNum;
        checked = req.body.checked;
    //更新子文档：根据userId找到对应的文档，
    // 根据carList.productId:productId定位到产品
    User.update({ userId: userId, "cartList.productId": productId }, {
        //更新该商品的数量和选中状态
        "cartList.$.productNum": productNum,
        "cartList.$.checked": checked,
    }, function (err, doc) {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            })
        } else {
            res.json({
                status: "0",
                msg: "",
                result: "suc"
            })
        }
    })
});
/*--------点击“选中所有”时，对数据库中的checked值进行修改------*/
router.post("/editCheckAll", function (req, res, next) {
    var userId = req.cookies.userId,
    // 将boolean转化为数值
        checkAll = req.body.checkAll ? 1 : 0;
    //  批量更新cartList下的checked属性
    User.findOne({ userId: userId }, function (err, user) {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            })
        } else {
            if (user) {
                user.cartList.forEach(item => {
                    // 将购物车商品的选中标记位与checkAll保持一致
                    item.checked = checkAll;
                });
                // 更新完字段后保存文档
                user.save(function (err1, doc) {
                    if (err1) {
                        res.json({
                            status: "1",
                            msg: err1.message,
                            result: "",
                        })
                    } else {
                        res.json({
                            status: "0",
                            msg: "",
                            result: "suc"
                        })
                    }
                })
            }
        }
    })
});
/*--------查询用户地址 接口------*/
router.get("/addressList", function (req, res, next) {
    // 只需userId即可定位到文档
    var userId = req.cookies.userId;
    User.findOne({ userId: userId }, function (err, doc) {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            })
        } else {
            res.json({
                status: "0",
                msg: "",
                result: doc.addressList,
            })
        }
    })
});
/*--------设置默认地址 接口------*/
router.post("/setDefault", function (req, res, next) {
    var userId = req.cookies.userId,
        addressId = req.body.addressId;
    // 未接受到参数则报错
    if (!addressId) {
        res.json({
            status: "1003",
            msg: "addressId is null",
            result: ""
        })
    } else {
        User.findOne({ userId: userId }, function (err, doc) {
            if (err) {
                res.json({
                    status: "1",
                    msg: err.message,
                    result: ""
                })
            } else {
                var addressList = doc.addressList;
                addressList.forEach(item => {
                    //将id匹配的地址的isDefault字段设为true,其余设为false
                    if (item.addressId == addressId) {
                        item.isDefault = true;
                    } else {
                        item.isDefault = false;
                    }
                });
                // 设置完成后保存文档
                doc.save(function (err1, doc1) {
                    if (err1) {
                        res.json({
                            status: "1",
                            msg: err1.message,
                            result: ""
                        })
                    } else {
                        res.json({
                            status: "0",
                            msg: "",
                            result: ""
                        })
                    }
                })
            }
        });
    }
});
/*--------删除地址 接口------*/
router.post("/delAddress", function (req, res, next) {
    var userId = req.cookies.userId,
        addressId = req.body.addressId;
    //直接删除子文档的简便方式---删除地址
    User.update({ userId: userId },
        {
            $pull: {
                "addressList": { "addressId": addressId, }
            }
        }, function (err, doc) {
            if (err) {
                res.json({
                    status: "1",
                    //系统层面的报错
                    msg: err.message,
                    result: "",
                })
            } else {
                res.json({
                    status: "0",
                    msg: "",
                    result: "地址删除成功",
                })
            }
        });
});
/*--------订单生成 接口------*/
router.post("/payMent", function (req, res, next) {
    var userId = req.cookies.userId,
        addressId = req.body.addressId,
        orderTotal = req.body.orderTotal;
    User.findOne({ userId: userId }, function (err, doc) {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: "",
            })
        } else {
            var address = "",
                goodsList = [];
            //获取当前用户地址信息
            doc.addressList.forEach(item => {
                if (addressId == item.addressId) {
                    address = item;
                }
            })
            //获取用户购买的商品,filter为ES6
            doc.cartList.filter(item => {
                if (item.checked == "1") {
                    goodsList.push(item);
                }
            });
            //通过util.js工具类生成订单号
            var platform = "262";
            var r1 = Math.floor(Math.random() * 10);
            var r2 = Math.floor(Math.random() * 10);
            //生成系统时间
            var sysDate = new Date().Format("yyyyMMddhhmmss");
            //订单创建时间
            var createDate = new Date().Format("yyyy-MM-dd-hh:mm:ss")
            //创建订单ID的方法
            var orderId = platform + r1 + sysDate + r2;
            //创建订单
            var order = {
                orderId: orderId,
                orderToal: orderTotal,
                addressInfo: address,
                goodsList: goodsList,
                orderStatus: "1",
                createDate: createDate,
            };
            //将订单存入数据库
            doc.orderList.push(order);
            doc.save(function (err1, doc1) {
                if (err1) {
                    res.json({
                        status: "1",
                        msg: err.message,
                        result: "",
                    });
                } else {
                    console.log(orderId,orderTotal),
                    res.json({
                        status: "0",
                        msg: "",
                        result: {
                            //把订单号和最终金额传回前端
                            orderId: orderId,
                            orderTotal: orderTotal,
                        },
                    })
                }

            })
        }
    })
});
/*--------根据订单id查询订单信息 接口------*/
router.get("/orderDetail", function (req, res, next) {
    var userId = req.cookies.userId, orderId = req.query.orderId;
    console.log(orderId);
    User.findOne({ userId: userId }, function (err, userInfo) {
        if (err) {
            res.json({
                status: "1",
                msg: err.message,
                result: ""
            })
        } else {
            var orderList = userInfo.orderList;
            let orderTotal = 0;
            //如果订单列表中有订单进行遍历
            if (orderList.length > 0) {
                orderList.forEach(item => {
                    //查询的orderId等于传过来的orderId则
                    if (item.orderId == orderId) {
                        orderTotal = item.orderTotal;
                    }
                })
                //  判断订单是否有金额（不考虑0元订单）
                if (orderTotal > 0) {
                    res.json({
                        status: "0",
                        msg: "",
                        result: {
                            orderId: orderId,
                            orderTotal: orderTotal
                        }
                    })
                } else {
                    res.json({
                        status: "12002",
                        msg: "无此订单！",
                        result: ""
                    })
                }
            } else {
                res.json({
                    status: "12001",
                    msg: "当前未创建订单！",
                    result: ""
                })
            }
        }
    })
})
module.exports = router