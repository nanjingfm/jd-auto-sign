/**
 * Created by FM on 2017/3/7.
 */
var utils = require('utils');
var fs = require('fs');

var standalone = false;
if(typeof(casper) == 'undefined') {
    standalone = true;
    var casper = require('casper').create();
}

// removing default options passed by the Python executable
casper.cli.drop("cli");
casper.cli.drop("casper-path");

if ((typeof(options) == 'undefined') && Object.keys(casper.cli.options).length === 0) {
    casper.echo("Usage: --username=<username> --password=<password> --captcha=<captcha code> --cookie=<cookie in string format>");
    if(standalone) casper.exit(1);
}

// don't use var options here as it will undefine pass-in options variable
options  = (typeof(options) == 'undefined') ? casper.cli.options : options;

var username = options["username"];
var password = options["password"];
var phonecode = options["phonecode"];
var action = options["action"];
var cookie = options["cookie"];
var captcha = options["captcha"];

var storepath = '/tmp/jdcheckin/cookies/';
var cookiefile = storepath + username + '.cookie';
printDate();
if (!cookie) {
    var storecookie = getCookies();
    if (storecookie) {
        cookie = storecookie;
    }
}

if (cookie) {
    phantom.cookies = JSON.parse(cookie);
}

casper.on('resource.requested', function (requestData, request) {
    
    if (/(\.gif|\.png|\.jpg)\?*/.test(requestData.url)) {
        request.abort();
    } else {
        // casper.echo(requestData.url, 'ERROR');
    }
});

casper.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36';
casper.start('https://order.jd.com/center/list.action').then(function() {
    if (checkLogin()) {
        saveCookies(phantom.cookies);
        checkIn();
    } else {
        login();
    }
});


function login() {
    casper.thenOpen('https://passport.jd.com/new/login.aspx', function() {
        casper.waitForSelector('.login-tab-r', function() {
            this.click('.login-tab-r');
        });
    });

    casper.then(function() {
        casper.capture('/tmp/1.png');
        if (casper.exists('.verify-code') && casper.visible('.verify-code')) {
            var captcha_url = this.getElementAttribute('.verify-code', 'src');
            casper.echo(captcha_url);
            casper.thenOpen(captcha_url, function(){
                this.capture('/tmp/captcha.png');
                casper.echo(JSON.stringify({
                    'status': 'find-captcha',
                    'cookie': phantom.cookies
                })).exit(1);
            })
        } else {
            this.fill('form#formlogin', {
                'loginname': username,
                'nloginpwd': password
            }, false);
        }
    });

    casper.then(function() {
        this.click('#loginsubmit');
        this.wait(3000, function() {
            if (checkLogin()) {
                saveCookies(phantom.cookies);
                checkIn();
            }
        });
    });
}

function checkLogin() {
    var currenturl = casper.getCurrentUrl();
    if (/passport\.jd\.com/g.exec(currenturl)) {
        console.log('login error');
        return false;
    } else if (/safe\.jd\.com/g.exec(currenturl)) {
        casper.echo('visit this url for security verify:' + currenturl);
        casper.echo('login error, need phonecode for security', 'ERROR').exit(1);
    } else {
        console.log('login success');
        return true;
    }
}

// 签到
function checkIn() {
    casper.viewport(1920, 1080).thenOpen('https://vip.jd.com', function(){
        var token = casper.evaluate(function() {
            return pageConfig.token;
        });
        var url = 'https://vip.jd.com/common/signin.html?token=' + token;

        var result = this.evaluate(function(url) {
            return JSON.parse(__utils__.sendAJAX(url, 'GET', null, false));
        }, url);

        if (result.success) {
            casper.echo('签到成功');
        } else if (result.resultCode == '1603') {
            casper.echo('今日已经签到');
        } else {
            casper.echo('resultTips');
        }
        casper.exit(1);
    });
}

function saveCookies(cookies) {
    if (!fs.isFile) {
        fs.touch(cookiefile);
    }
    fs.write(cookiefile, JSON.stringify(cookies), 'w');
}

function getCookies() {
    if (!fs.isDirectory(storepath)) {
        fs.makeTree(storepath);
    }
    if (fs.isFile(cookiefile)) {
        return fs.read(cookiefile);
    } else {
        return false;
    }
}

function printDate() {
    var date = new Date();
    casper.echo('当前时间：' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
}

casper.run();