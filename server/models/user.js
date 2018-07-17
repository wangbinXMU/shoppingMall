var mongoose = require("mongoose");
var userSchema=new mongoose.Schema({
    //规定要关联的document应该有的属性或字段
    "userId":String,
    "userName":String,
    "userPwd":String,
    "orderList":Array,
    "cartList": [
         {
            "productId": String,
            "productName": String,
            "salePrice": String,
            "productImage": String,
            "checked": String,
            "productNum": String,
        }
    ],
    "addressList":[
        {
            "addressId": String,
            "userName": String,
            "streetName": String,
            "postCode": Number,
            "tel": Number,
            "isDefault": Boolean
        },

    ],
});

//User为要关联的集合的名称
module.exports=mongoose.model("User",userSchema);