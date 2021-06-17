const express = require('express');
const app = express();
// 解析post参数
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const { Cluster } = require('puppeteer-cluster');

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const scrollPageToBottom = require('puppeteer-autoscroll-down')

const launchOptions = {
    headless: false,
    ignoreHTTPSErrors: true,        // 忽略证书错误
    userDataDir: 'user_data_dir',
    waitUntil: ['domcontentloaded', 'networkidle0'],
    defaultViewport: {
        width: 1920,
        height: 1080
    },
    args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-xss-auditor',    // 关闭 XSS Auditor
        '--no-zygote',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--allow-running-insecure-content',     // 允许不安全内容
        '--disable-webgl',
        '--disable-popup-blocking',
        '--single-process', // 单进程，优化
        // '--proxy-server=http://ip:port'      // 配置代理
    ],
    // executablePath: 'xxxx\\chrome.exe',
};


(async () => {
    // 隐藏无头浏览器的特征
    puppeteer.use(StealthPlugin())

    const cluster = await Cluster.launch({
        puppeteer,
        // concurrency: Cluster.CONCURRENCY_CONTEXT,
        concurrency: Cluster.CONCURRENCY_PAGE, // 单Chrome多tab模式, 能共享数据的模式
        maxConcurrency: 10, // 并发的workers数
        retryLimit: 2, // 重试次数
        monitor: false,  // 显示性能消耗
        puppeteerOptions: launchOptions
    });

    await cluster.task(async ({ page, data }) => {
        const url = data.url
        console.log('render url:' + url)

        if (data.cookies && data.cookies instanceof Array && data.cookies.length > 0) {
            // set cookies
            await page.setCookie(...data.cookies)
        }

        // 把超时时间禁用，否则下拉的时候，如果页数比较多，会导致超时问题
        await page.setDefaultNavigationTimeout(0)

        const _response = await page.goto(url);

        const statusCode = await _response.status()
        const headers = await _response.headers()


        if (data.isDownload) {
            // download image、pdf...
            const buffer = await _response.buffer()
            return {
                'statusCode': statusCode,
                'content': buffer,
                'headers': headers
            }
        }

        // wait strategy
        if (data.waitType && data.waitExpress) {
            switch (data.waitType) {
                case '1':
                    await page.waitForXPath(data.waitExpress)
                    break
                case '2':
                    await page.waitForTimeout(data.waitExpress)
                    break
                case '3':
                    await page.waitForSelector(data.waitExpress)
                    break
                case '4':
                    await page.waitForFunction(data.waitExpress)
                    break
            }
        }
        console.log(await page.cookies())

        // 是否自动下拉
        if (data.autoScrollY) {
            console.info('自动下拉...')
            // await autoScroll(page);
            const scrollStep = data.autoScrollStep || 250 // Number of pixels to scroll on each step, default 250
            const scrollDelay = data.autoScrollDelay || 100 // A delay between each scroll step in ms, default 100ms
            const lastPosition  = await scrollPageToBottom(page, scrollStep, scrollDelay)
            console.info('scroll last position: ' + lastPosition)
        }

        const resultType = data.resultType || 1
        if (resultType === 1) {
            // screenshot
            const screenshot = await page.screenshot()
            return {
                'statusCode': statusCode,
                'content': screenshot,
                'headers': headers
            }
        } else {
            // html page content
            const content = await page.content()
            return {
                'statusCode': statusCode,
                'content': content,
                'headers': headers
            }
        }

    });
    app.get('/', async function(req, res) {
        console.debug('ping.')
        res.json({status: 'pong'})
    })

    // setup server
    app.post('/render', async function (req, res) {
        const formdata = req.body
        if (formdata === undefined || formdata.url === undefined) {
            return res.end('Please specify url')
        }

        try {
            const response = await cluster.execute(formdata);

            const _headers = lowerCaseHeadersKey(response.headers)
            const headers = {
                'Content-Length': response.content.length
            }
            if (_headers.hasOwnProperty('content-type')) {
                headers['Content-Type'] = _headers['content-type']
            }

            res.writeHead(response.statusCode, headers);

            return res.end(response.content);
        }catch (err) {
            // catch error
            return res.end('Error: ' + err.message);
        }
    });

    app.listen(3000, '0.0.0.0', function () {
        console.log('Render server listening on port 3000.');
    });
})();

async function lowerCaseHeadersKey(h) {
    const headers = {}
    Object.getOwnPropertyNames(h).forEach(function(key){
        headers[key.toLowerCase()] = h[key]
    });

    return headers

}
