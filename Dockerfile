# 使用官方的 Node.js 作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json 或 pnpm-lock.yaml
COPY package*.json ./
# 如果您使用的是 pnpm，请使用以下行替换上面的行
# COPY pnpm-lock.yaml ./

# 设置 npm 源
RUN npm config set registry https://registry.npm.taobao.org/

# 安装项目依赖
# RUN npm install
# 如果您使用的是 pnpm，请使用以下行替换上面的行
RUN npm install -g pnpm && pnpm install

# 复制项目文件到工作目录
COPY . .

# 构建项目
RUN npm run build
# 如果您使用的是 pnpm，请使用以下行替换上面的行
# RUN pnpm run build

# 暴露应用程序运行的端口
EXPOSE 3000

# 启动应用程序
CMD ["npm", "run", "start:prod"]
# 如果您使用的是 pnpm，请使用以下行替换上面的行
# CMD ["pnpm", "run", "start:prod"] 