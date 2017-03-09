# jd自动签到脚本

##安装(ubuntu)
```shell
sudo apt-get install python-pip
pip install phantomjs
pip install casperjs
```

##usage
```shell
/usr/local/bin/casperjs --username=你的jd账号 --password=你的jd密码 /root/checkin.js
```

## auto run
在crontab中加入以下记录，运行策略自定义
```shell
0 5 * * * /usr/local/bin/casperjs --username=你的jd账号 --password=你的jd密码 /root/checkin.js >> /tmp/jdcheckin.log
```

# JD自动抢优惠券

##安装
```shell
pip install requests
pip install beautifulsoup4
```

##usage
因为抢优惠券是在h5页面操作，但是h5登录是需要验证码的，这部分暂时没有做。
现在的做法是提供一个可用的cookie（别问我怎么获取），然后用该cookie抢所有的优惠券
```shell
python getCoupon.py -c ’cookie文件的路径‘
```

## auto run
在crontab中加入以下记录，运行策略自定义
```shell
0 5 * * * python getCoupon.py -c ’cookie文件的路径‘ >> /tmp/jdcoupon.log
```