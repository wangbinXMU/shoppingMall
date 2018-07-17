let http=require("http");
let url=require("url");
let fs=require("fs");
let server=http.createServer((req,res)=>{
    //从路径中获取文件名
    var pathname=url.parse(req.url).pathname;
   // 去掉文件名前的”/“
   fs.readFile(pathname.substring(1),function(err,data){
        if(err){
            res.writeHead(404,{
                'Content-Type':'text/html'
            })
        }else{
            //写入头信息
            res.writeHead(200,{
                'Content-Type':'text/html'
            });
            res.write(data.toString());
        }
       res.end();//结束本次响应,读取文件时，end要放在readFile的内部
   });

});
server.listen(3000,'127.0.0.1',()=>{
    console.log(`the server is running ...`);
});