import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ChatMessageDocument = ChatMessage & Document

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
    conversation: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author: Types.ObjectId

  @Prop({ required: true })
    content: string
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage)
