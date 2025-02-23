# 使用官方的 Node.js 作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 先复制 package.json 和 lock 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 设置 npm 源
RUN npm config set registry  https://registry.npmmirror.com

# 安装 pnpm 和项目依赖
RUN npm install -g pnpm && pnpm install

# 然后再复制其他项目文件
COPY . .

# 构建项目
RUN pnpm run build

# 暴露应用程序运行的端口
EXPOSE 3999

# 启动应用程序
CMD ["pnpm", "run", "start:prod"] 