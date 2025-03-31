# 防水项目管理系统后端

## 项目介绍

本项目是一个基于NestJS框架开发的防水项目管理系统后端服务，提供了项目管理、合同管理、人员管理、材料管理、仓库管理等功能的API接口。系统集成了Swagger文档，方便API的查看和测试。

## 环境要求

- Node.js >= 18.x
- pnpm >= 8.x
- MariaDB/MySQL

## 安装依赖

```bash
# 使用pnpm安装依赖
pnpm install
```

## 启动方式

### Mac环境下启动（开发环境）

```bash
# 开发模式
pnpm run start:dev

# 调试模式
pnpm run start:debug

# 生产模式
pnpm run start:prod
```

### Windows环境下启动

由于本项目在Mac环境下开发，Windows环境需要安装cross-env来解决跨平台环境变量设置问题：

```bash
# 安装cross-env
pnpm add -D cross-env
```

然后修改package.json中的scripts部分：

```json
"scripts": {
  "start": "cross-env NODE_ENV=production node dist/main",
  "start:dev": "cross-env NODE_ENV=development nest start --watch",
  "start:debug": "cross-env NODE_ENV=development nest start --debug --watch",
  "start:prod": "cross-env NODE_ENV=production node dist/main"
}
```

之后可以使用与Mac相同的命令启动项目。

## 项目结构及其作用

```
├── src/                        # 源代码目录
│   ├── common/                 # 公共模块
│   │   ├── exceptions/         # 自定义异常
│   │   └── filters/            # 全局过滤器
│   ├── contract/               # 合同管理模块
│   ├── contract-media/         # 合同媒体文件模块
│   ├── follow-up/              # 跟进记录模块
│   ├── follow-up-media/        # 跟进记录媒体文件模块
│   ├── material/               # 材料管理模块
│   ├── media/                  # 媒体文件管理模块
│   ├── person/                 # 人员管理模块
│   ├── project/                # 工地施工项目管理模块
│   ├── project-media-relation/ # 工地施工项目媒体关联模块
│   ├── project-photos/         # 工地施工项目照片模块
│   ├── project-report/         # 工地施工项目每日汇报模块
│   ├── project-report-media/   # 工地施工项目每日汇报媒体模块
│   ├── project-report-person/  # 每日汇报人员工时记录关联模块
│   ├── sales-project/          # 销售项目模块
│   ├── store/                  # 仓库管理模块
│   ├── store-history-record/   # 仓库动库记录模块
│   ├── store-material/         # 仓库材料关联模块
│   ├── app.controller.ts       # 应用控制器
│   ├── app.module.ts           # 应用模块（根模块）
│   ├── app.service.ts          # 应用服务
│   └── main.ts                 # 应用入口文件
├── test/                       # 测试目录
├── Dockerfile                  # Docker配置文件，方便部署到服务器
├── nest-cli.json              # NestJS CLI配置
├── package.json               # 项目依赖配置
├── tsconfig.json              # TypeScript配置
└── README.md                  # 项目说明文档
```

### 主要模块说明

- **person**: 人员管理，包括用户认证、权限管理等
- **project**: 施工工地项目管理，核心业务模块
- **contract**: 合同管理，处理项目合同相关业务
- **material**: 材料管理，处理防水材料相关业务
- **store**: 仓库管理，处理材料入库、出库等业务
- **follow-up**: 跟进记录，处理项目跟进相关业务
- **media**: 媒体文件管理，处理系统中的图片、文档等文件上传与存储

## FTP媒体文件上传

系统使用FTP服务器存储上传的媒体文件（如图片、文档等），相关实现在`src/media/media.service.ts`中：

### 主要功能

- FTP服务器连接管理：系统启动时自动连接FTP服务器，并在连接断开时自动重连
- 文件上传：将用户上传的文件通过FTP协议传输到指定服务器
- 文件命名：使用时间戳和随机数生成唯一文件名，避免文件名冲突
- 异常处理：对FTP连接和上传过程中的异常进行捕获和处理

### FTP配置

```typescript
// FTP服务器连接配置
private async connectToFtp() {
  try {
    await this.ftpClient.access({
      host: '192.168.11.100',  // FTP服务器地址
      user: 'image-server',    // FTP用户名
      password: 'Asd1234567',  // FTP密码
      secure: false,           // 是否使用FTPS
    });
    console.log('Connected to FTP server.');
  } catch (error: any) {
    throw new BusinessException(
      'Failed to connect to FTP server: ' + error.message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

### 文件上传流程

1. 接收上传的文件（包含文件类型、原始文件名、文件内容）
2. 确保FTP连接可用
3. 生成唯一文件名（时间戳_随机数_原始文件名）
4. 创建文件流并将文件内容写入
5. 通过FTP上传到服务器指定目录
6. 保存文件URI到数据库

## 数据库配置

项目使用MariaDB（mysql的分支）数据库，配置信息在`src/app.module.ts`文件中：

```typescript
TypeOrmModule.forRoot({
  type: 'mariadb',
  host: '192.168.11.102',  // 数据库主机地址
  port: 3306,              // 数据库端口
  username: 'root',        // 数据库用户名
  password: '000719',      // 数据库密码
  database: 'youning',     // 数据库名称
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,       // 自动同步实体到数据库（生产环境建议关闭）
})
```

## API文档

项目集成了Swagger文档，启动项目后可通过以下地址访问：

```
http://localhost:8080/api-docs  # 开发环境
http://localhost:3999/api-docs  # 生产环境
```

## Docker部署

项目提供了Dockerfile，可以通过以下命令构建和运行Docker容器：

```bash
# 构建Docker镜像
docker build -t waterproof-project-management .

# 运行Docker容器
docker run -p 3999:3999 waterproof-project-management
```

## 代码作者与时间

- **作者**：叶朝辉
- **编写时间**：2025.3.30
