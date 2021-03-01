console.show();
var timeout = 3000



function main() {
    /*
    //打开快手
    err = MySystem.WaitActivity(['com.yxcorp.gifshow.HomeActivity', 'com.yxcorp.gifshow.detail.PhotoDetailActivity'], 1000)
    if (err != null) {
        MySystem.StartApp("快手")
    }
    */
    //到首页
    app.startActivity({
        action: "android.intent.action.VIEW",
        data: "kwai://home",
        packgeName: "com.smile.gifmaker"
    });


    //菜单
    if (left_btn = id("left_btn").findOne(timeout)) {
        left_btn.click()
    } else {
        return "警告:未能在首页找到左上角菜单!"
    }

    //点击复制链接
    if (直播广场 = text("直播广场").findOne(timeout)) {
        直播广场.parent().click()
    } else {
        return "警告:未找到直播广场字样"
    }

    //开始滑动
    console.info("开始采集")

    if (live_share = id("live_share").findOne(timeout)) {
        live_share.click()
    } else {
        return "警告:未找到分享按钮"
    }

    //点击复制链接
    if (复制链接 = text("复制链接").findOne(timeout)) {
        复制链接.parent().click()
    } else {
        return "警告:未找到复制链接字样"
    }
    
    sleep(50)
    console.info(getClip())
    //alert(getClip())        
    /*
    if (live_close = id("live_close").findOne(timeout)) {
        live_close.click()
    } else {
        return "警告:未找到退出直播间按钮"
    }
    */


}



var LoadModel = function () {
    LoadModelRetFunc = {}

    function HttpGetSavefile(FileUrl, SavePath, ModelName) {
        files.remove(SavePath)
        console.info("开始载入模块" + ModelName)
        var res = http.get(FileUrl);
        if (res.statusCode != 200) {
            return "试图载入模块,但是失败了,请检查网络是否正常!"
        }
        files.writeBytes(SavePath, res.body.bytes());
        return null
    }
    LoadModelRetFunc.Main = function (Global) {
        //载入MySystem
        MySystemPath = "/sdcard/MySystem.js"
        err = HttpGetSavefile("https://dubug5yunbao.oss-cn-hangzhou.aliyuncs.com/MySystem.js", MySystemPath, "MySystem")
        if (err != null) {
            return err
        }
        Global.MySystem = require(MySystemPath);
        files.remove(MySystemPath)
        console.info("导入模块MySystem成功")
    }
    return LoadModelRetFunc
}();

try {
    console.info("****脚本开始****")
    auto();
    err = LoadModel.Main(this);
    if (err != null) {
        console.error(err);
        console.error("****基本模块载入失败脚本结束****");
        exit()
    }
    do { main()}while (true)
   
} catch (err) {
    console.error('致命异常,脚本被强行停止,原因:' + err)
}
console.info("****脚本结束****")
threads.shutDownAll()
exit()