import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common'
import { ConversationsService } from './conversations.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
// import { Types } from 'mongoose'
import { CoursesService } from '@/courses/course.service'

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly coursesService: CoursesService,
  ) {}

  @Post()
  async create(@Body() body: {
    type: 'private' | 'group'
    members: string[]
    name?: string
    studentId: string
  }) {
    console.log('Contenu reçu du front:', body)

    if (!body.studentId) {
      throw new Error('Le champ "studentId" est requis')
    }

    const studentId = body.studentId
    // const bureauId = process.env.BUREAU_USER_ID || ''

    // 1. Récupérer les profs associés à l'élève
    const profIds = await this.coursesService.getTeachersForStudent(studentId)
    console.log('Prof IDs:', profIds)

    // 2. Créer/chercher les groupes pour chaque prof
    for (const profId of profIds) {
      await this.conversationsService.ensureDefaultGroupsForParent(
        studentId,
        profId,
        process.env.BUREAU_USER_ID!)
    }

    // 3. Retourner toutes les conversations où l'élève est membre
    // return this.conversationsService.findAllForUser(new Types.ObjectId(studentId))
  }
}
