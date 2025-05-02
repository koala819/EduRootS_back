import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Conversation, ConversationDocument } from './conversations.schema'
import { ChatMessage, ChatMessageDocument } from './chatmessage.schema'

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
  ) {}

  async create(type: 'private' | 'group', members: Types.ObjectId[], name?: string) {
    const conversation = new this.conversationModel({ type, members, name })
    return conversation.save()
  }

  async findAllForUser(userId: Types.ObjectId) {
    return this.conversationModel.find({ members: userId }).exec()
  }

  async joinConversation(conversationId: string, userId: Types.ObjectId) {
    const conversation = await this.conversationModel.findById(conversationId)
    if (!conversation) throw new NotFoundException('Conversation non trouvée')
    if (!conversation.members.includes(userId)) {
      conversation.members.push(userId)
      await conversation.save()
    }
    return conversation
  }

  async createChatMessage(conversationId: string, authorId: string, content: string) {
    const message = new this.chatMessageModel({
      conversation: new Types.ObjectId(conversationId),
      author: new Types.ObjectId(authorId),
      content,
    })
    return message.save()
  }

  async getChatMessages(conversationId: string) {
    return this.chatMessageModel
      .find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .exec()
  }
}
