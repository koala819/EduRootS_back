import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { ConversationsService } from './conversations.service'
import { Conversation } from './conversations.schema'
import { ChatMessage } from './chatmessage.schema'
import { Types } from 'mongoose'

const validObjectId = '507f1f77bcf86cd799439011'

describe('ConversationsService', () => {
  let service: ConversationsService
  let conversationModel: any
  let chatMessageModel: any

  beforeEach(async () => {
    // Mock du constructeur pour Mongoose
    function ConversationModelMock(this: any, data: any) {
      Object.assign(this, data)
      this.save = jest.fn().mockResolvedValue({ ...data, _id: validObjectId })
    }
    function ChatMessageModelMock(this: any, data: any) {
      Object.assign(this, data)
      this.save = jest.fn().mockResolvedValue({ ...data, _id: validObjectId })
    }
    conversationModel = Object.assign(ConversationModelMock, {
      find: jest.fn(),
      findById: jest.fn(),
      exec: jest.fn(),
    })
    chatMessageModel = Object.assign(ChatMessageModelMock, {
      find: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    })
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: getModelToken(Conversation.name), useValue: conversationModel },
        { provide: getModelToken(ChatMessage.name), useValue: chatMessageModel },
      ],
    }).compile()
    service = module.get<ConversationsService>(ConversationsService)
  })

  it('devrait créer une conversation', async () => {
    const result = await service.create('private', [new Types.ObjectId(validObjectId)], 'test')
    expect(result).toHaveProperty('type', 'private')
    expect(result).toHaveProperty('_id', validObjectId)
  })

  it('devrait créer un message de chat', async () => {
    const result = await service.createChatMessage(validObjectId, validObjectId, 'hello')
    expect(result).toHaveProperty('content', 'hello')
    expect(result).toHaveProperty('_id', validObjectId)
  })

  it("devrait retourner les messages d'une conversation", async () => {
    const execMock = jest.fn().mockResolvedValue([{ content: 'msg1' }, { content: 'msg2' }])
    chatMessageModel.find = jest.fn().mockReturnThis()
    chatMessageModel.sort = jest.fn().mockReturnThis()
    chatMessageModel.exec = execMock
    service['chatMessageModel'] = chatMessageModel
    const result = await service.getChatMessages(validObjectId)
    expect(result).toHaveLength(2)
    expect(result[0]).toHaveProperty('content', 'msg1')
  })
})
