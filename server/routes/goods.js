/*后端路由文件*/
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
//models下的goods.js 发布的Goods模型
var Goods = require('../models/goods');
//连接mongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/db_demo');
//监听连接成功的状态
mongoose.connection.on("connected",function(){
    console.log("MongoDB connected success");
});
//监听连接失败的状态
mongoose.connection.on("error",function(){
    console.log("MongoDB connected failed")
});
//监听连接断开的状态
mongoose.connection.on("disconnected",function(){
    console.log("MongoDB disconnected")
});

  /*-------查询商品列表接口-------*/
//二级路由的执行文件，这里的“/”指的是"/goods"因为在app.js 中已经设置了一级路由，在路由文件设置的地址中会默认加上一级路由
router.get("/list", function(req,res,next){
    //获取由前端发来的请求中的各类数据实现分页功能，get请求通过param方法拿到的都是字符串
    //获取分页码
    let page=parseInt(req.param("page"));
    //每页要展示多少条数据
    let pageSize=parseInt(req.param("pageSize"));
    //排序，sort=1升序，-1降序
    let sort = req.param("sort");
    // 前端价格区间
    // let priceFilter = req.params.priceFilter;
    // console.log(JSON.parse(priceFilter));
    //要跳过多少条数据
    let skip = (page-1)*pageSize;
    let priceLevel=req.param("priceLevel");
    let priceGt="", //大于...
        priceLte=""; //小于等于...
    let params={};
    if(priceLevel!="all"){ //默认priceAll为all,否则是其他价格区间
        switch(priceLevel){
            case "0":priceGt=0;priceLte=100; break;
            case "1":priceGt=100;priceLte=500; break;
            case "2":priceGt=500;priceLte=1000; break;
            case "3":priceGt=1000;priceLte=2000; break;
        }
    //用来放入mongDB的find方法中进行条件查询，然后将查询结果返回
    params={
            salePrice:{
                $gt:priceGt,
                $lte:priceLte,
            }
    }
    }else{
        params={};
    }
    //根据params参数条件查询(find)，跳过(skip)，分页(limit)
    let goodsModel=Goods.find(params).skip(skip).limit(pageSize);
    //排序 （MongDB的sort方法，按salePrice字段排序,sort为1表示正序，sort为-1表示逆序）
    goodsModel.sort({'salePrice':sort});
    //doc查询返回的文档
    goodsModel.exec(function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
            });
        }else{
            res.json({
                status:'0',
                msg:'',
                result:{
                    //记录每页的文档数
                    count:doc.length,
                    list:doc,
                },
            })
        }
    });
});
/*-------加入到购物车-------*/
//一般传输数据用post
router.post("/addCart",function(req,res,next){
    //获取请求中的用户ID和用户选中的商品ID
    var userId=req.cookies.userId,productId=req.body.productId;
    //获取User模型,可用来操作其内部属性
    var  User=require("../models/user");
    //根据userId查到出对应document
    User.findOne({userId:userId},function(err,userDoc){
        if(err){
            res.json({
                status:"1",
                msg:err.message,
            })
        }else{
            //如果数据库中存在该用户，遍历他的购物车列表
            if(userDoc){
                let goodsItem="";
                userDoc.cartList.forEach(item=>{
                    //如果要加入的商品已存在，则增加数量即可
                    if(item.productId===productId){
                        goodsItem=item;
                        item.productNum++;
                    }
                });
                // 这里是可以取到forEach中的goodsItem
                if(goodsItem){
                    //上面已经完成了++，在这里保存文档即可
                    userDoc.save(function(err2,doc2){
                        //向响应中添加数据
                        if(err2){
                            res.json({
                                status:"1",
                                msg:err2.message,
                            })
                        }else{
                            res.json({
                                status:'0',
                                msg:' ',
                                result:'suc',
                            })
                        }
                    })
                }else{
                    //如果该商品不存在，则在商品库中查询该商品然后保存到购物车列表中
                    Goods.findOne({productId:productId},function(err1,doc){
                        if(err1){
                            res.json({
                                status:"1",
                                msg:err1.message,
                            })
                        }else{
                            if(doc){
                                //在goods模型中为两个属性设置初始值，但是首先要在goods的表模型中添加上此两个属性
                                doc.productNum=1;
                                doc.checked=1;
                                //push完后保存
                                userDoc.cartList.push(doc);
                                userDoc.save(function(err2,doc2){
                                    if(err2){
                                        res.json({
                                            status:"1",
                                            msg:err2.message
                                        })
                                    }else{
                                        //成功
                                        res.json({
                                            status:'0',
                                            msg:' ',
                                            result:'suc',
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
                //根据productId查询对应的商品的文档

            }
        }
    })
});

module.exports=router