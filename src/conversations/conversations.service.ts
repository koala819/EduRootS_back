import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Conversation, ConversationDocument } from './schemas/conversations.schema'
import { ChatMessage, ChatMessageDocument } from './schemas/chatmessage.schema'

function toObjectId(id: string | Types.ObjectId): Types.ObjectId {
  return typeof id === 'string' ? new Types.ObjectId(id) : id
}

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
  ) {}

  create(type: 'private' | 'group', members: (string | Types.ObjectId)[], name?: string) {
    const membersObjIds = members.map(toObjectId)
    const conversation = new this.conversationModel({ type, members: membersObjIds, name })
    return conversation.save()
  }

  findAllForUser(userId: string | Types.ObjectId) {
    return this.conversationModel.find({ members: toObjectId(userId) }).exec()
  }



  createChatMessage(
    conversationId: string | Types.ObjectId,
    authorId: string | Types.ObjectId,
    content: string,
  ) {
    const message = new this.chatMessageModel({
      conversation: toObjectId(conversationId),
      author: toObjectId(authorId),
      content,
    })
    return message.save()
  }

  getChatMessages(conversationId: string | Types.ObjectId) {
    return this.chatMessageModel
      .find({ conversation: toObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .exec()
  }

  async ensureDefaultGroupsForParent(
    parentId: string | Types.ObjectId,
    profId: string | Types.ObjectId,
  ) {
    //1. Parent <-> Prof
    await this.findOrCreateConversation({
      type: 'private',
      members: [parentId, profId],
      name: 'parent-prof',
    })

    if (!process.env.BUREAU_USER_ID) {
      throw new Error('BUREAU_USER_ID is not defined')
    }

    // 2. Parent <-> Bureau
    await this.findOrCreateConversation({
      type: 'private',
      members: [parentId, process.env.BUREAU_USER_ID],
      name: 'parent-bureau',
    })
    //3. Parent <-> Prof <-> Bureau
    await this.findOrCreateConversation({
      type: 'group',
      members: [parentId, profId, process.env.BUREAU_USER_ID],
      name: 'parent-prof-bureau',
    })
  }

  async findOrCreateConversation({
    type,
    members,
    name,
  }: {
    type: 'private' | 'group',
    members: (string | Types.ObjectId)[],
    name: string
  }) {
    const membersObjIds = members.map(toObjectId)
    //chercher une conversation existante avec ces membres et ce type
    const existingConversation = await this.conversationModel.findOne({
      type,
      members: { $all: membersObjIds, $size: membersObjIds.length },
      name,
    }).exec()
    if (existingConversation) {
      // console.log('conversation existante trouvée')
      return existingConversation
    }

    //si pas de conversation existante, en créer une
    // console.log('pas de conversation existante, en créer une')
    return this.create(type, membersObjIds, name)
  }

  async findById(conversationId: string | Types.ObjectId) {
    return this.conversationModel.findById(toObjectId(conversationId)).exec()
  }
}
