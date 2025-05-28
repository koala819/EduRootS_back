import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type ConversationDocument = Conversation & Document

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: String, enum: ['private', 'group'], required: true })
    type: 'private' | 'group'

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
    members: Types.ObjectId[]

  @Prop()
    name?: string
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation)
