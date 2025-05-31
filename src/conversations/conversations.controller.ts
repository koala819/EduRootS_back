import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  ForbiddenException,
  Query,
} from '@nestjs/common'
import { ConversationsService } from './conversations.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CoursesService } from '../courses/course.service'
import { Types } from 'mongoose'

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly coursesService: CoursesService,
  ) {}

  @Get(':id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Query('author') author: string,
  ) {
    // console.log('Tentative d\'accès aux messages:', { conversationId, author })
    const conversation = await this.conversationsService.findById(conversationId)
    // console.log('Conversation trouvée:', conversation)

    if (!conversation) {
      // console.log('Conversation non trouvée')
      throw new ForbiddenException('Conversation non trouvée')
    }

    const childObjectId = new Types.ObjectId(author)
    const isMember = conversation.members.some((member) => member.equals(childObjectId))
    // console.log('Vérification des membres:', {
    //   members: conversation.members,
    //   author: childObjectId,
    //   isMember,
    // })

    if (!isMember) {
      throw new ForbiddenException('Accès interdit à cette conversation')
    }
    return this.conversationsService.getChatMessages(conversationId)
  }

  @Post()
  async create(@Body() body: {
    studentId: string
  }) {
    // console.log('Contenu reçu du front:', body)

    if (!body.studentId) {
      throw new Error('Le champ "studentId" est requis')
    }

    const studentId = body.studentId

    // 1. Récupérer les profs associés à l'élève
    const profIds = await this.coursesService.getTeachersForStudent(studentId)
    // console.log('Prof IDs:', profIds)

    // 2. Créer/chercher les groupes pour chaque prof
    for (const profId of profIds) {
      await this.conversationsService.ensureDefaultGroupsForParent(
        studentId,
        profId)
    }

    // 3. Retourner toutes les conversations où l'élève est membre
    return this.conversationsService.findAllForUser(new Types.ObjectId(studentId))
  }
}
