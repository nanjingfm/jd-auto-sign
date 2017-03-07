# jd自动签到脚本

##安装(ubuntu)
```shell
sudo apt-get install python-pip
pip install phantomjs
pip install casperjs
```

##usage
```shell
/usr/local/bin/casperjs --username=你的jd账号 --password=你的jd密码 /root/login.js
```

## auto run
在crontab中加入以下记录，运行策略自定义
```shell
0 5 * * * /usr/local/bin/casperjs --username=你的jd账号 --password=你的jd密码 /root/login.js >> /tmp/jdcheckin.log
```