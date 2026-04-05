import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://taskflow.christophervaldivia.me',
    'https://taskflow-app.vercel.app',
    'https://taskflow-app-production-ffc8.up.railway.app',
    'https://taskflow-app-a9p2.onrender.com',
    /vercel\.app$/i,
    /rail\.app$/i,
    /onrender\.com$/i,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        return allowed.test(origin);
      });

      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,Accept,X-Requested-With',
    optionsSuccessStatus: 200,
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`TaskFlow API running on port ${port}`);
}
bootstrap();
