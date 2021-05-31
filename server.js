const express = require('express');
const app = express();
const { Cluster } = require('puppeteer-cluster');

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')


const launchOptions = {
    headless: true,
    ignoreHTTPSErrors: true,        // 忽略证书错误
    waitUntil: 'networkidle2',
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
        // '--proxy-server='      // 配置代理
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
    await cluster.task(async ({ page, data: url }) => {
        await page.goto(url);
        const content = await page.content()
        // const screen = await page.screenshot();
        return content;
    });
    app.get('/', async function(req, res) {
        console.log('ping.')
        res.json({status: 'pong'})
    })

    // setup server
    app.get('/render', async function (req, res) {
        if (!req.query.url) {
            return res.end('Please specify url like this: ?url=example.com');
        }
        try {
            const url = req.query.url;
            console.log('参数:' + url)
            const html = await cluster.execute(url);

            // respond with content
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=UTF-8',
                'Content-Length': html.length
            });
            res.end(html);
        } catch (err) {
            // catch error
            res.end('Error: ' + err.message);
        }
    });

    app.listen(3000, '0.0.0.0', function () {
        console.log('Render server listening on port 3000.');
    });
})();
