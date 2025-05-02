import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Conversation, ConversationSchema } from './conversations.schema'
import { ConversationsService } from './conversations.service'
import { ConversationsController } from './conversations.controller'
import { ChatMessage, ChatMessageSchema } from './chatmessage.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
  ],
  providers: [ConversationsService],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}
