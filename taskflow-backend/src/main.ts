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
    'https://taskflow-app-a9p2.onrender.com',
    /vercel\.app$/i, // Allow all Vercel preview deployments
    /onrender\.com$/i, // Allow all Render deployments
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests without origin (mobile apps, curl, etc)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin matches allowed list
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return origin === allowed;
        }
        return allowed.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    charset: 'utf-8',
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
