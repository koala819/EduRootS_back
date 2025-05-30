import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Conversation, ConversationSchema } from './schemas/conversations.schema'
import { ConversationsService } from './conversations.service'
import { ConversationsController } from './conversations.controller'
import { ChatMessage, ChatMessageSchema } from './schemas/chatmessage.schema'
import { ConversationsGateway } from './conversations.gateway'
import { CoursesModule } from '../courses/course.module'

@Module({
  imports: [CoursesModule,
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ],
  providers: [ConversationsService, ConversationsGateway],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}
