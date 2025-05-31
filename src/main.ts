import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)
  // Configuration CORS
  const allowedOrigins = [
    'http://localhost:3000',           // Développement local
    'https://eduroots-git-newmessagerie-xavier819.vercel.app', // Test Vercel
    'https://mosquee-colomiers.vercel.app/',            // Production
  ]

  // Configuration CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  })

  await app.listen(3001)
  logger.log('Application démarrée sur le port: 3001')
}
bootstrap()
