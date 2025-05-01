import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class MessagesService {
  constructor(@InjectModel('Message') private readonly messageModel: Model<any>) {}

  async create(data: any) {
    const message = new this.messageModel(data)
    return await message.save()
  }

  async findByConversation(conversationId: string) {
    return this.messageModel.find({ conversation: conversationId }).sort({ sentAt: 1 })
  }

  // Ajoute d'autres méthodes métier selon les besoins
}
