import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ConversationsModule } from './conversations/conversations.module'
import { LogDbService } from './log-db.service'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true,validate: (env) => {
      if (!env.MONGODB_URI) throw new Error('MONGODB_URI is not defined')
      return env
    } }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConversationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, LogDbService],
})
export class AppModule {}
