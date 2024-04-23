import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth, { IBasicAuthedRequest } from 'express-basic-auth';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const result =
          errors[0].constraints[Object.keys(errors[0].constraints)[0]];
        return new BadRequestException(result);
      },
    }),
  );

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    // allowed headers
    allowedHeaders: [
      'Content-Type',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Authorization',
    ],
    // headers exposed to the client
    exposedHeaders: ['Authorization'],
    credentials: true, // Enable credentials (cookies, authorization headers) cross-origin
  });
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const getUnauthorizedResponse = (req: IBasicAuthedRequest): string => {
    return req.auth
      ? 'Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected'
      : 'No credentials provided';
  };
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('XBILL-WALLET')
    .setVersion('0.0.1')
    .addBearerAuth(
      {
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT Token',
      },
      'Bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.use(
    '/api/doc',
    basicAuth({
      challenge: true,
      users: { [process.env.SWAGGER_USERNAME]: process.env.SWAGGER_PASSWORD },
      unauthorizedResponse: getUnauthorizedResponse,
    }),
  );

  SwaggerModule.setup('/api/doc', app, document);

  const port = process.env.PORT || 4007;

  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix} 🚀 `,
  );
}
bootstrap();
