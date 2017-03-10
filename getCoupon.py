#coding=utf-8
import json
import requests
import time
import sys, getopt
from bs4 import BeautifulSoup

def getCoupon(categoryId, pagenum, cookies):
   url = 'http://coupon.m.jd.com/center/toCouponList.json?page=' + str(pagenum) + '&categoryId=' + str(categoryId)
   print url
   res=requests.get(url, cookies=cookies)
   result = json.loads(res.text)
   if result['totalCount'] > 0:
      for item in result['couponItem']:
         if item['receiveFlag'] or item['rate'] == 100:
            continue
         info = u'正在领取：' + item['limitStr'] + '[' + item.get('successLabel', '') + ']'
         print info, 
         params = {
            'couponId':  item['id'],
            'roleId': item['roleId'],
            'actId': item['key'],
            'takeRule': 5
         }
         url = 'http://coupon.m.jd.com/center/receiveCoupon.json'
         r = requests.post(url, data=params, cookies=cookies)
         result = json.loads(r.text)
         if result.has_key('status') and result['status'] == 302:
            print u'登陆状态异常'
            exit()
         print '[领取结果]', 
         if result['isSuccess'] == 'T':
            print '\033[1;32m成功\033[0m'
         else:
            print '\033[1;31m失败,[失败原因]', result['desc'], '\033[0m'
         # 喝杯茶，喘喘气
         time.sleep(1)

      pagenum += 1
      getCoupon(categoryId, pagenum, cookies)

def getCookies(file):
   with open(file) as file_object:
      file_context = file_object.read()

   cookie_list = json.loads(file_context)
   cookies = {}
   for item in cookie_list:
      cookies[item['name']]= item['value']
   return cookies

cookie_file_path = '/tmp/jdcheckin/cookies/m.cookie'
if len(sys.argv) > 0:
   opts, args = getopt.getopt(sys.argv[1:], "c:")
   output_file=""
   for op, value in opts:
      if op == "-c":
         cookie_file_path = value

cookies = getCookies(cookie_file_path)

res=requests.get("http://coupon.m.jd.com/center/getCouponCenter.action", cookies=cookies)
html = BeautifulSoup(res.text, 'html.parser')
tabs = html.find(class_='choose-nav-wrap').find_all('li')
for tab in tabs:
   item = tab.find(class_='pos-re')
   if item is not None:
      print u'===========正在爬取分类-', item.text, '============'
      getCoupon(item['cateid'], 1, cookies)