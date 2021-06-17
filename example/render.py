# -*- coding: utf-8 -*-
import requests
import json


def client(url):
    renderUrl = 'http://localhost:3000/render'
    data = {
        'resultType': '1', # 1 page content, 2 screenshot
        'url': url,
        'waitType': 1, # 等待类型
        'waitExpress': '', # 等待表达式
        'isDownload': False, # 是否是下载资源
        'autoScrollY': False, # 是否自动下滑
        'autoScrollStep': 250, # 向下滚动的像素高度，默认250
        'autoScrollDelay': 100, # 每次滚动之间的间隔时间，单位为毫秒，默认100
        'cookies':[
            {
                "domain": "news.sina.cn",
                "name": "custom_token",
                "value": "12345678",
            }
        ]
    }

    headers = {
        'Content-Type': 'application/json'
    }

    resp = requests.post(url=renderUrl, data=json.dumps(data), headers=headers, timeout=180)
    resp.encoding = 'utf-8'

    print(resp.text)

if __name__=='__main__':
    url = 'https://news.sina.cn/'
    client(url)
