importClass(android.widget.Toast);
importClass(android.animation.ObjectAnimator);
importClass(android.animation.AnimatorSet);
importClass(android.view.animation.BounceInterpolator);
/***用户可修改参数 */
var api_url = "http://aiqinet.oss-cn-shanghai.aliyuncs.com/ks%E5%BC%80%E5%BF%83/ks.js"
var luanchStr


//悬浮按钮初始化位置 0-1 数值越小越靠近顶部
var btn_z = 0.3;
//悬浮按钮初始化左右停靠方向 false:左 true:右
var btn_ott = true;
//悬浮按钮 菜单展开间距
var btn_space = 50;
//btn_R:按钮大小
const btn_R = 40;
//ico_R:图标大小
const ico_R = 28;
//alpha:主按钮按钮透明度
const alpha = 1;
//按钮停靠主按钮隐藏到屏幕X值
const port_x = 10;
//菜单展开动画播放时间 可自行修改
const animation_time = 100;  //100
//按钮停靠动画播放时间 可自行修改
const animation_time_1 = 300; //300
//开始结束按钮动画时间 
const o2sTime = 300; //300
//菜单自动隐藏时间 1=1秒 设置为0则不隐藏
const menu_hide = 5;
//"@drawable/ic_android_black_48dp"原始logo图标

var data = {
    //{ico:按钮图标 bg:背景颜色 tint:图标颜色}
    //logo:主按钮
    logo: {
        ico: "http://aiqinet.oss-cn-shanghai.aliyuncs.com/ks%E5%BC%80%E5%BF%83/ico.png",
        bg: "#77ffffff",
        tint: "#00000000"
    },
    //open:开始按钮
    open: { ico: "@drawable/ic_play_arrow_black_48dp", bg: "#40a5f3", tint: "#ffffff" },
    //stop:停止按钮
    stop: { ico: "@drawable/ic_stop_black_48dp", bg: "#ee534f", tint: "#ffffff" },
    //menu:日志按钮
    menu: { ico: "@drawable/ic_assignment_black_48dp", bg: "#009687", tint: "#ffffff" },
    //close:关闭按钮
    close: { ico: "@drawable/ic_clear_black_48dp", bg: "#fbd834", tint: "#ffffff" }
}
//系统初始化参数
//动画播放状态
var animation_state = false;
//悬浮按钮展开状态 false:收起 true:展开
var menu_state = false;
//开始结束判定值
var o2s = false;
//显示隐藏判定值
var s2h = false;
//按钮view视图信息
var dataView = new Array();
var openview = {};
var logoView = {};
//menuview展开坐标
var menu_X = new Array();
//屏幕w,h值
const w = device.width;
const h = device.height;
//菜单关闭计时
var menu_time = 0;
var commState = false;
//构造自定义控件
var butLogoLayout = (function () {
    util.extend(butLogoLayout, ui.Widget);
    function butLogoLayout() {
        ui.Widget.call(this);
        this.defineAttr("src", (view, attr, value, defineSetter) => {
            view._img.attr("src", value);
        });
        this.defineAttr("tint", (view, attr, value, defineSetter) => {
            view._img.attr("tint", value);
        });
        this.defineAttr("bg", (view, attr, value, defineSetter) => {
            view._bg.attr("cardBackgroundColor", value);
        });
        this.defineAttr("onClick", (view, name, defaultGetter) => {
            return this._onClick;
        }, (view, name, value, defaultSetter) => {
            this._onClick = value;
            value == "logo" ? logoView = view : dataView[dataView.length] = view;
            if (value == "open") openview = view;
        });
    }
    butLogoLayout.prototype.render = function () {
        return (
            <frame id="_on" w="{{btn_R}}" h="{{btn_R}}">
                <card id="_bg" w="{{btn_R}}" h="{{btn_R}}" cardCornerRadius="{{btn_R/2}}" cardBackgroundColor="#99ffffff"
                    cardElevation="0" foreground="?selectableItemBackground" gravity="center" >
                    <img id="_img" w="{{ico_R}}" src="#ffffff" circle="true" />
                </card>
            </frame>
        );
    };
    butLogoLayout.prototype.onViewCreated = function (view) {
        view.on("click", () => {
            if (this._onClick == "open" && !o2s) animation_menu();
            if (this._onClick == "menu") animation_menu();
            if (this._onClick == "open") open2stop(view);
            if (this._onClick == "open") {
                o2s ? comm("open") : comm("stop");
            } else {
                comm(this._onClick);
            };
            if (this._onClick == "close") exit();
        });
    };
    ui.registerWidget("butLogo-layout", butLogoLayout);
    return butLogoLayout;
})();



//系统运行前功能函数



/**
 * dp px 互转函数
 */
//获取dp转px值
const scale = context.getResources().getDisplayMetrics().density;
//DP转PX
var dp2px = function (dp) {
    return Math.floor(dp * scale + 0.5);
}
//PX转DP
var px2dp = function (px) {
    return Math.floor(px / scale + 0.5);
}
if (data.btn_R % 2 == 1) data.btn_R++;
const _x = dp2px(port_x);

//接收广播信息
events.broadcast.on("comm", function (da) {
    if (da == "隐藏") {
        show2hide(false)
    } else if (da == "显示") {
        show2hide(true)
    }
});

//构建菜单悬浮窗
var w_menu = floaty.rawWindow(
    <frame id="menu" w="{{btn_space*7}}" h="{{btn_R}}" clipChildren="false" visibility="gone" >
        <butLogo-layout src="{{data.close.ico}}" bg="{{data.close.bg}}" tint="{{data.close.tint}}" onClick="close" layout_gravity="center" />
        <butLogo-layout src="{{data.menu.ico}}" bg="{{data.menu.bg}}" tint="{{data.menu.tint}}" onClick="menu" layout_gravity="center" />
        <butLogo-layout src="{{data.open.ico}}" bg="{{data.open.bg}}" tint="{{data.open.tint}}" onClick="open" layout_gravity="center" />
    </frame>
)
//构建logo悬浮窗
var w_logo = floaty.rawWindow(
    <butLogo-layout id="_btn" src="{{data.logo.ico}}" bg="{{data.logo.bg}}" tint="{{data.logo.tint}}" onClick="logo" alpha="{{alpha}}" visibility="invisible" />
)
//构建logo动画悬浮窗
var w_logo_a = floaty.rawWindow(
    <butLogo-layout id="_btn" src="{{data.logo.ico}}" bg="{{data.logo.bg}}" tint="{{data.logo.tint}}" onClick="logo" alpha="0" />
)
w_logo_a.setSize(-1, -1)
w_logo_a.setTouchable(false)

menu_X[0] = []
menu_X[0][0] = parseInt(dp2px(btn_space * 3));
menu_X[0][1] = parseInt(dp2px(btn_space * 2));
menu_X[0][2] = parseInt(dp2px(btn_space * 1));
menu_X[1] = []
menu_X[1][0] = 0 - menu_X[0][2]
menu_X[1][1] = 0 - menu_X[0][1]
menu_X[1][2] = 0 - menu_X[0][0]

//悬浮窗初始化数据
var data__ = false
var id_time_0 = setInterval(() => {
    if (w_logo._btn.getWidth() && !data__) {
        data__ == true;
        getScreenDirection();
        setTimeout(() => {
            ui.run(() => { w_logo._btn.attr("visibility", "visible") });
            //show2hide(true);
        }, 50)
        clearInterval(id_time_0);
    }
}, 100);


function getScreenDirection() {
    let X = 0;
    btn_ott ? X = w - dp2px(btn_R) + _x : X = 0 - _x;
    setTimeout(function () {
        ui.run(() => {
            w_logo.setPosition(X, h * btn_z)
        })
    }, 50);
}

/**
 * 菜单展开动画
 * @param {*} event 
 * @param {*} E 
 */
function animation_menu(event, E) {
    //如果展开状态为假  则重新定位菜单menu位置 
    if (!menu_state && E == undefined) {
        //Y值定位
        let X = 0
        let Y = w_logo.getY()
        //X值定位
        btn_ott ? X = w - dp2px(btn_space * 3.5 + (btn_R / 2)) + _x : X = 0 - dp2px(btn_space * 3.5) + dp2px(btn_R / 2) - _x
        //定位悬浮窗
        w_menu.setPosition(X, Y)
        ui.run(() => {
            w_logo._btn.attr("alpha", "1")
        })
    }
    setTimeout(function () {
        let animationX = []
        animation_state = true;
        ui.run(() => {
            E != undefined ? w_menu.menu.attr("alpha", "0") : w_menu.menu.attr("visibility", "visible")
        });
        btn_ott ? e = 1 : e = 0;
        if (menu_state) {
            // log("关闭动画")
            for (let i = 0; i < dataView.length; i++) {
                animationX[i] = ObjectAnimator.ofFloat(dataView[i]._on, "translationX", menu_X[e][i], 0);
            }
        } else {
            for (let i = 0; i < dataView.length; i++) {
                animationX[i] = ObjectAnimator.ofFloat(dataView[i]._on, "translationX", 0, menu_X[e][i]);
            }
        }
        //集合所有动画数据到animation数组里面
        let animation = []
        for (let i = 0; i < animationX.length; i++) {
            animation[animation.length] = animationX[i];
        }
        set = new AnimatorSet();
        //动画集合
        set.playTogether(animation);
        //动画执行时间
        set.setDuration(animation_time);
        set.start();
        //创建一个定时器 在动画执行完毕后 解除动画的占用
        setTimeout(function () {
            ui.run(() => {
                if (menu_state) w_logo._btn.attr("alpha", alpha)
                animation_state = false;
                menu_state ? (menu_state = false, w_menu.menu.attr("visibility", "gone"), w_menu.menu.attr("alpha", "1")) : menu_state = true
            })
        }, animation_time);
    }, 50);
}

/**
 * 按钮停靠动画
 * @param {\} event 
 */
function animation_port(event) {
    animation_state = true;
    let X = []; PX = 0; animator = {}, animatorY = {}, animatorA = {};
    //如果but_orientation值为真 则停靠在右边 否则停靠在左边
    btn_ott ? (PX = w - dp2px(btn_R) + dp2px(parseInt((px2dp(w_logo._btn.getWidth())) / 2)) - dp2px(btn_R / 2) + _x, X = [windowX + (event.getRawX() - x), PX]) : (PX = 0 + dp2px(parseInt((px2dp(w_logo._btn.getWidth())) / 2)) - dp2px(btn_R / 2) - _x, X = [windowX + (event.getRawX() - x), PX])
    //动画信息
    w_logo_a._btn.attr("visibility", "visible")
    animator = ObjectAnimator.ofFloat(w_logo_a._btn, "translationX", X);
    animatorY = ObjectAnimator.ofFloat(w_logo_a._btn, "translationY", w_logo.getY(), w_logo.getY());
    animatorA = ObjectAnimator.ofFloat(w_logo._btn, "alpha", 0, 0);
    animatorA1 = ObjectAnimator.ofFloat(w_logo_a._btn, "alpha", alpha, alpha);
    mTimeInterpolator = new BounceInterpolator();
    animator.setInterpolator(mTimeInterpolator);
    set = new AnimatorSet();
    set.playTogether(
        animator, animatorY, animatorA, animatorA1
    )
    set.setDuration(animation_time_1);
    set.start();
    setTimeout(function () {
        w_logo.setPosition(PX, windowY + (event.getRawY() - y))
    }, animation_time_1 / 2);
    setTimeout(function () {
        ui.run(() => {
            w_logo._btn.attr("alpha", alpha)
            w_logo_a._btn.attr("alpha", "0")
            w_logo_a._btn.attr("visibility", "invisible")
            //记录Y值所在百分比
            z = (Math.round(w_logo.getY() / h * 100) / 100)
            setTimeout(function () {
                ui.run(() => {
                    w_logo._btn.attr("alpha", alpha)
                });
            }, 10);
            animation_state = false;
        })
    }, animation_time_1 + 10);
}


//记录按键被按下时的触摸坐标
var x = 0,
    y = 0;
//记录按键被按下时的悬浮窗位置
var windowX, windowY;
//记录按键被按下的时间以便判断长按等动作
var yd = false;
w_logo._btn.setOnTouchListener(function (view, event) {
    //如果动画正在播放中 则退出该事件
    if (animation_state) { return true }
    switch (event.getAction()) {
        //手指按下
        case event.ACTION_DOWN:
            x = event.getRawX();
            y = event.getRawY();
            windowX = w_logo.getX();
            windowY = w_logo.getY();
            downTime = new Date().getTime();
            return true
        //手指移动
        case event.ACTION_MOVE:
            //如果展开为真 则退出,展开时禁止触发移动事件
            if (menu_state) { return true }
            if (!yd) {
                //如果移动的距离大于30值 则判断为移动 yd为真
                if (Math.abs(event.getRawY() - y) > 30 || Math.abs(event.getRawX() - x) > 30) { view.attr("alpha", "1"); yd = true }
            } else {
                //移动手指时调整主按钮logo悬浮窗位置
                w_logo.setPosition(windowX + (event.getRawX() - x), windowY + (event.getRawY() - y));
            }
            return true
        //手指弹起
        case event.ACTION_UP:
            //如果在动画正在播放中则退出事件 无操作           
            if (animation_state) { return }
            //如果控件移动小于 30 则判断为点击 否则为点击
            if (Math.abs(event.getRawY() - y) < 30 && Math.abs(event.getRawX() - x) < 30) {
                //点击动作 执行菜单 展开 关闭 动作
                animation_menu(event)
                //否则如果展开为真 则退出,展开时禁止触发停靠动画事件
            } else if (!menu_state) {
                //移动弹起  判断要停靠的方向
                windowX + (event.getRawX() - x) < w / 2 ? btn_ott = false : btn_ott = true;
                animation_port(event)
            }
            yd = false
            return true
    }
    return true
});

//开始停止按钮图标切换
function open2stop(view, da) {
    //log("comm open2stop=" + o2s)
    if (da != undefined) {
        da ? o2s = false : o2s = true;
    }
    //log("comm后 open2stop=" + o2s)
    let _data
    let animatior
    if (o2s) {
        _data = data["open"]
        o2s = false
        animatior = ObjectAnimator.ofInt(
            view._bg, "cardBackgroundColor", colors.parseColor(data.stop.bg), colors.parseColor(data.open.bg)
        );
    } else {
        _data = data["stop"]
        o2s = true
        animatior = ObjectAnimator.ofInt(
            view._bg, "cardBackgroundColor", colors.parseColor(data.open.bg), colors.parseColor(data.stop.bg)
        );
    }
    animatior.setDuration(o2sTime);
    animatior.setEvaluator(new android.animation.ArgbEvaluator());
    animatior.start();
    ui.run(() => {
        view._img.attr("src", _data.ico);
        view._img.attr("tint", _data.tint);
    });
}

function show2hide(value) {
    let X
    var ani
    let s_time = 50;
    if (menu_state) {
        animation_menu();
        s_time += animation_time;
    }
    setTimeout(function () {
        btn_ott ? X = dp2px(btn_R) - _x : X = 0 - dp2px(btn_R) - _x;
        s2h = value;
        if (value) {
            ani = ObjectAnimator.ofFloat(w_logo._btn, "translationX", X, 0);
        } else {
            ani = ObjectAnimator.ofFloat(w_logo._btn, "translationX", 0, X);
        }
        ani.setDuration(300);
        ani.start();
    }, s_time);
}

function comm(msg) {
    switch (msg) {
        case "open":
            启动脚本()
            break;
        case "stop":
            停止脚本()
            break;
        case "menu":
            app.startActivity("console")
            break;
        case "close":
            强制退出脚本()
            engines.stopAll()
            exit()
            break;
    }
}

function 启动脚本() {
    http.get(api_url, {}, function (res, err) {
        if (err) {
            console.error(err);
            exit()
            return;
        }
        if (res.statusCode == 200) {
            execution = engines.execScript("控制端", res.body.string());
            //device.vibrate(1000)
        } else {
            log("请求失败功能: " + res.statusCode + " " + res.statusMessage)
            return;
        }
    });

}

function 停止脚本() {
    execution.getEngine().forceStop();
    //device.vibrate(1000)

}

function 强制退出脚本() {
    engines.stopAll()
    var nowPid = android.os.Process.myPid();
    var am = context.getSystemService(java.lang.Class.forName("android.app.ActivityManager"));
    var list = am.getRunningAppProcesses();
    for (var i = 0; i < list.size(); i++) {
        var info = list.get(i);
        if (info.pid != nowPid) {
            android.os.Process.killProcess(info.pid)
        }
    }
    android.os.Process.killProcess(nowPid)
}

setInterval(function () { }, 10000);