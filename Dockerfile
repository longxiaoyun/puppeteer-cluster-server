## 从node 14版本构建
#FROM node:14
## 应用程序工作目录
#WORKDIR /usr/src/we_render
#
#COPY package*.json ./
#
#RUN npm install
#
## 绑定应用程序
#COPY . .
#
## 端口对应
#EXPOSE 3000
#
## 启动服务命令
#CMD [ "node", "server.js" ]

# --------------------------------------------

# 官方文档 https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#running-puppeteer-in-docker
# 从puppeteer 官方镜像
FROM alpine:edge


# 应用程序工作目录
WORKDIR /home/docker/we_render

# 安装最新版 Chromium (89) 包.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# 跳过自动安装chrome包. 使用上面已经安装的chrome.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Puppeteer v6.0.0 works with Chromium 89.
RUN yarn add puppeteer@6.0.0

# 绑定应用程序
COPY . /home/docker/we_render

RUN yarn config set registry 'https://registry.npm.taobao.org' && \
    yarn global add pm2 && \
    yarn install && \
    yarn cache clean

VOLUME ["/logs"]

# 端口对应
EXPOSE 3000

# 启动服务命令
CMD [ "node", "server.js" ]



