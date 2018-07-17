let http=require("http");
let url=require("url");
let util=require("util");
let server=http.createServer((req,res)=>{
    res.statusCode=200;
    res.setHeader=("Content-Type","text/plain;charset=utf-8");
    //只是当前url的相对路径的字符串
    console.log("url:"+req.url);
    //将路径解析输出来，但是只能得到相对路径部分的信息，得不到服务器的部分的信息，返回对象
    console.log("parse:"+url.parse(req.url));
    //将上面的url对象转化成字符串进行输出
    console.log("inspect:"+util.inspect(url.parse(req.url)));

    //将一个对象(其 键值对)转化成字符串进行输出
    res.end();
});
server.listen(3000,'127.0.0.1',()=>{
    console.log(`the server is running ...`);
});