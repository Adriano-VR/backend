import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  console.log('\x1b[35m%s\x1b[0m', '🚀 Iniciando servidor...');

  const app = await NestFactory.create(AppModule);
  console.log('\x1b[32m%s\x1b[0m', '✅ Aplicação criada com sucesso!');

  // Aplicar filtro global de exceções para preservar códigos HTTP corretos
  app.useGlobalFilters(new AllExceptionsFilter());
  console.log('\x1b[36m%s\x1b[0m', '🔒 Filtro global de exceções aplicado');

  // Aplicar pipe de validação global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    errorHttpStatusCode: 400, // Garantir que erros de validação sejam 400
  }));
  console.log('\x1b[36m%s\x1b[0m', '🔍 Pipe de validação global aplicado');

  // Removido o prefixo global 'api' para evitar bloqueio por adblock
  // app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Mente Segura API')
    .setDescription('API para o projeto Mente Segura')
    .setVersion('1.0')
    .addTag('mentesegura')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Este nome é usado no @ApiBearerAuth()
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory); // Removido o prefixo 'api' da documentação

  // Handler customizado para a rota raiz '/'
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (req, res) => {
    res.send('Hello World da raiz!');
  });

  // Enable CORS with multiple origins
  const allowedOrigins = [
    'http://localhost:3000', // Local development
    'http://localhost:3004', // Backend local port
    'http://localhost:3005', // Alternative local port
    'http://192.168.100.51:3004', // IP local development
    'https://www.mentesegura.institute',
    'https://mentesegura.institute',
    'https://mentesegura.vercel.app', // Staging environment
    'https://mentesegura-backend.fly.dev',
    'https://mentesegura-git-preview-xbase-app.vercel.app',
  ];

  // Add any additional origins from environment variables
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const allOrigins = [...allowedOrigins, ...envOrigins];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  console.log('\x1b[36m%s\x1b[0m', '🔒 CORS configurado para:', allOrigins);

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log('\x1b[32m%s\x1b[0m', '🎉 Servidor iniciado com sucesso!');
  console.log('\x1b[33m%s\x1b[0m', '📝 Logs disponíveis em:');
  console.log('\x1b[4m\x1b[36m%s\x1b[0m', `http://localhost:${port}`);
  console.log(
    '\x1b[35m%s\x1b[0m',
    '💡 Pressione Ctrl+C para encerrar o servidor',
  );
}
bootstrap();
