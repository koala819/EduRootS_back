import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Conversation, ConversationSchema } from './conversations.schema'
import { ConversationsService } from './conversations.service'
import { ConversationsController } from './conversations.controller'
import { ChatMessage, ChatMessageSchema } from './chatmessage.schema'
import { ConversationsGateway } from './conversations.gateway'

@Module({
  imports: [
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
