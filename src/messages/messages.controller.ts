import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { JwtAuthGuard } from '@/auth/jwt-auth.guard'

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() body: any, @Req() req): Promise<any> {
    const senderId = req.user.id || req.user._id
    return this.messagesService.create({ ...body, sender: senderId })
  }

  @Get('conversation/:id')
  async getByConversation(@Param('id') conversationId: string): Promise<any> {
    return this.messagesService.findByConversation(conversationId)
  }
}
