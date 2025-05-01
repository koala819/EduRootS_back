import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { MessageSchema } from './schemas/message.schema'

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }])],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
