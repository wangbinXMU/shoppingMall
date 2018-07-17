let  http = require("http");
let util=require("util");
//调用慕课网的接口
http.get("http://www.imooc.com/u/card",function(res){
    let data=" ";
    //监听数据并逐段接受数据流，累加到data
    res.on("data",function(chunk){
        data+=chunk;
    });
    //监听end,看是否请求完成
    res.on("end",function(){
        let result=JSON.parse(data);
        //util的inspect一半用于调试
        console.log("result:"+ util.inspect(result));
    })
});