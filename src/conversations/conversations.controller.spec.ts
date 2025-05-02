import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { MongooseModule } from '@nestjs/mongoose'
import { ConversationsModule } from './conversations.module'
import { disconnect } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// Mock JWT guard pour bypasser l'authentification
jest.mock('../auth/jwt-auth.guard', () => ({
  JwtAuthGuard: class {
    canActivate(ctx: any) {
      const req = ctx.switchToHttp().getRequest()
      req.user = { _id: '507f1f77bcf86cd799439011' }
      return true
    }
  },
}))

describe('ConversationsController (e2e)', () => {
  let app: INestApplication
  let mongod: MongoMemoryServer
  let uri: string

  jest.setTimeout(20000)

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    uri = mongod.getUri()
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), ConversationsModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
    await mongod.stop()
    await disconnect()
  })

  let conversationId: string

  it('POST /conversations crée une conversation', async () => {
    const res = await request(app.getHttpServer())
      .post('/conversations')
      .send({ type: 'private', members: ['507f1f77bcf86cd799439011'] })
      .expect(201)
    expect(res.body).toHaveProperty('_id')
    expect(res.body).toHaveProperty('type', 'private')
    conversationId = res.body._id
  })

  it('POST /conversations/:id/messages envoie un message', async () => {
    const res = await request(app.getHttpServer())
      .post(`/conversations/${conversationId}/messages`)
      .send({ content: 'Hello world!' })
      .expect(201)
    expect(res.body).toHaveProperty('content', 'Hello world!')
    expect(res.body).toHaveProperty('conversation', conversationId)
  })
})
