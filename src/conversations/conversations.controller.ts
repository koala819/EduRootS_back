import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import { ConversationsService } from './conversations.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { Types } from 'mongoose'

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async create(@Body() body: { type: 'private' | 'group'; members: string[]; name?: string }) {
    if (!body.members || !Array.isArray(body.members)) {
      throw new BadRequestException('Le champ "members" est requis et doit être un tableau')
    }

    const members = body.members.map((id) => new Types.ObjectId(id))
    return this.conversationsService.create(body.type, members, body.name)
  }

  @Get()
  async findAllForUser(@Req() req) {
    return this.conversationsService.findAllForUser(new Types.ObjectId(req.user._id))
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Req() req) {
    return this.conversationsService.joinConversation(id, new Types.ObjectId(req.user._id))
  }

  @Post(':id/messages')
  async sendMessage(@Param('id') id: string, @Req() req, @Body() body: { content: string }) {
    if (!body.content) {
      throw new BadRequestException('Le champ "content" est requis')
    }

    return this.conversationsService.createChatMessage(id, req.user._id, body.content)
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    return this.conversationsService.getChatMessages(id)
  }
}
