//node.js 基于common规范,不能使用在前端
// require优先去node_modules中寻找要加载的模块
var mongoose = require("mongoose");
//通过mongoose定义一个表模型Schema
var Schema  = mongoose.Schema;
//通过new这个模型来定义要获取的集合中文档应该有的结构和属性
var productSchema=new Schema({
    "productId":String,
    "productName":String,
    "salePrice":Number,
    "ProductImage":String,
    "productNum":Number,
    "checked":String,
});
//将模型关联上数据库中的collection(表/集合) goods,因为关联时会自动将good加上s
module.exports=mongoose.model('Good',productSchema);
