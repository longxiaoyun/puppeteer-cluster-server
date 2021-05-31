##### 1. 使用 `puppeteer-cluster` https://github.com/thomasdondorf/puppeteer-cluster
做为一个微服务供其他应用使用，也可以当作是一个单独的渲染服务,具体渲染逻辑还再继续优化



##### 2. 使用docker的原因是 [Chromium ](https://download-chromium.appspot.com/)在不同环境安装的时候可能会有大大小小的版本问题或其他类问题，浪费太多时间

`docker pull jonloong123/puppeteer-cluster:1.1`

`docker run -p 3000:3000 -d jonloong123/puppeteer-cluster:1.1`



##### 3. 而且使用这个是由于业务中需要这么一个渲染服务，只需要简单的返回选然后的页面（或者截图）即可，不需要更多的页面元素操作了，所以 目前只有一个简单的 `server.js` 



