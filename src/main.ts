import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API 文档')
    .setDescription('API 文档描述')
    .setVersion('1.0')
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 过滤掉未定义的属性
      forbidNonWhitelisted: true, // 如果出现未定义的属性则抛出错误
      transform: true, // 自动转换类型
    }),
  );

  // 根据环境变量设置端口
  const port = process.env.NODE_ENV === 'production' ? 3999 : 8080;
  await app.listen(port);
}
bootstrap();
