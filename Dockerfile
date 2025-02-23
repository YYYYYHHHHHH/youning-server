# 构建阶段
FROM node:18 AS builder

# 安装编译工具
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# 复制依赖文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN npm config set registry https://registry.npmmirror.com
RUN npm install -g pnpm && pnpm install

# 复制源代码并构建
COPY . .
RUN pnpm run build

# 生产阶段
FROM node:18-slim

WORKDIR /usr/src/app

# 复制构建产物和依赖
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3999

CMD ["node", "dist/main.js"] 