#### 简介

> - 使用 `puppeteer-cluster` https://github.com/thomasdondorf/puppeteer-cluster
做为一个微服务供其他应用使用，也可以当作是一个单独的渲染服务
> - 使用docker的原因是 [Chromium ](https://download-chromium.appspot.com/)在不同环境安装的时候可能会有大大小小的版本问题或其他类问题，浪费太多时间
>
> `docker pull jonloong123/puppeteer-cluster:1.2`
> 
> `docker run -p 3000:3000 -d jonloong123/puppeteer-cluster:1.2`
> - 而且使用这个是由于业务中需要这么一个渲染服务，只需要简单的返回选然后的页面（或者截图）即可，不需要更多的页面元素操作了，所以 目前只有一个简单的 `server.js` 


#### 详细说明

> 实现渲染页面源码并返回、页面截图并返回、下载图片，而且都会返回对应的headers, 可以通过传参控制等待的实现



##### 使用
1. 启动服务

    `docker run -p 3000:3000 -d jonloong123/puppeteer-cluster:1.2` 或直接
    
    `run server.js`
    

2. 服务调用
- 服务

    `GET /render` 默认端口是 3000
    
- 请求参数
    
    |参数|参数说明|
    |----|----|
    |resultType| 返回数据类型|
    |url|要渲染的网页url|
    |waitType|等待策略|
    |waitExpress|用于等待的xpath或selector或int|
    |isDownload|是否是下载文件|
    |autoScrollY|是否自动向下滚动|
    |autoScrollStep|向下滚动几次|
    |autoScrollDelay|每次滚动之间的间隔|
    |cookies|要设置的cookies|

- 请求头

    `'Content-Type': 'application/json'`
    
    
- 字段说明
>
> 1. resultType 字段(string类型) 的说明
>
>     |枚举|说明|其它|
>     | ---- | ---- | ---- |
>     | 1（或为空） | 返回渲染后的网页源码 |默认 |
>     | 2 | 截图并返回 | -|
>
> 2. url 字段
>     
>     | 字段类型 | 说明 |
>     | ---- | ---- |
>     | string | 要渲染或截图等的网页链接 |
>
> 3. waitType
>
>     等待类型
>     |type|func|express|
>     |----|----|----|
>     |1|waitForXPath|xpath表达式|
>     |2|waitForTimeout|时间（毫秒）|
>     |3|waitForSelector|selector表达式|
>     |4|waitForFunction|pageFunction|
>     
> 4. waitExpress
>     
>     等待表达式(xpath、selector、int(ms) )
>     
> 5. isDownload 字段
>
>     | 字段类型 | 说明 |
>     | ---- | ---- |
>     | boolean | 是否是下载文件。默认false，即返回网页源码 |
>
> 6. autoScrollY
>
>     是否要自动下拉滚动，比如下来加载更多, true/false
>     
> 7. autoScrollStep
>     向下滚动的像素高度，默认250
>
> 8. autoScrollDelay
>     每次滚动之间的间隔时间，单位为毫秒，默认100
>     
> 9. cookies 
>
>     设置cookies，格式如
>     ```javascript
>     cookies = [
>         {
>             "domain": "www.baidu.com",
>             "expirationDate": 1597288045,
>             "hostOnly": false,
>             "httpOnly": false,
>             "name": "key",
>             "path": "/",
>             "sameSite": "no_restriction",
>             "secure": false,
>             "session": false,
>             "storeId": "0",
>             "value": "value",
>             "id": 1
>         }
>     ]
>     ```
