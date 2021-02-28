var userID
console.show();
log('版本1.0.3')




mian()
function mian() {
    threads.start(follow)
    while (true) {
        if (textContains('请稍微休息一').visibleToUser(true).exists()) {
            log('操作过快停止脚本')
            threads.shutDownAll()
            sleep(3000)
        }
        else if (text('重新登录').visibleToUser(true).exists()) {
            log('重新登录 停止脚本')
            threads.shutDownAll()
            sleep(3000)
        }
        else if (textStartsWith('当前登录失败').visibleToUser(true).exists()) {
            log('重新登录 停止脚本')
            threads.shutDownAll()
            sleep(3000)
        }
        sleep(1000)
    }
}
function follow() {
    while (true) {
        if (KSback()) {
            if (getuid()) {
                let node = id('editor').visibleToUser(true).findOne(10000)
                if (node) {
                    node.click()
                    sleep(1000)
                    setText(userID)
                    sleep(1000)
                    node = id('right_tv').text('搜索').visibleToUser(true).findOne(10000)
                    if (node) {
                        node.click()
                        sleep(1000)
                        node = id('user_root_layout').visibleToUser(true).findOne(10000)
                        if (node) {
                            node.click()
                            sleep(1000)
                            node = id('more_btn').visibleToUser(true).findOne(10000)
                            if (node) {
                                node.click()
                                sleep(1000)
                                node = id('qlist_alert_dialog_item_text').visibleToUser(true).findOne(10000)
                                if (node) {
                                    node.parent().click()
                                    sleep(2000)
                                    node = id('lead_follow_button').visibleToUser(true).findOne(10000)
                                    if (node) {
                                        node.click()
                                        sleep(3000)
                                        node = id('right_btn').visibleToUser(true).findOne()
                                        if (node) {
                                            node.click()
                                            sleep(2000)
                                            if (id('follow_button').visibleToUser(true).findOne(20000)) {
                                                log('今日关注上限')
                                                exit()
                                                return true
                                            } else {
                                                log('关注成功')
                                            }
                                        }
                                    } else { log('没找到关注'); log('重新登录 停止脚本'); exit() }
                                } else { log('没找到发私信') }
                            } else { log('没找到菜单') }
                        } else { log('没找到用户') }
                    } else { log('没找到搜索') }
                } else { log('没找到输入框') }
            }
        }
    }
}
function getuid() {
    while (true) {
        try {
            let res = http.get('http://121.4.219.101:8080/getuid')
            if (res.statusCode != 200) {
                log("请求失败: " + res.statusCode + " " + res.statusMessage);
            } else {
                let data = res.body.json();
                if (data.code == 0) {
                    log(data.msg)
                    userID = data.data.userID
                    log(userID)
                    return true
                } else {
                    log(data.msg)
                    sleep(5000)
                }
            }
        } catch (error) {
            log(error)
            sleep(5000)
        }
    }
}

function KSback() {
    while (true) {
        if (desc('查找').id('microphone').exists()) {
            return true
        } else {
            // let node = id('left_btn').visibleToUser(true).findOne(1000)
            // if (node) {
            //     node.click()
            //     sleep(1000)
            // }
            back()
            sleep(2000)
        }
        sleep(1000)
    }
}

