import { Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model, Types } from 'mongoose'
import { Course } from './schemas/course.schema'
import { CourseDocument } from '@/types/mongoose'




@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async getTeachersForStudent(studentId: string): Promise<string[]> {
    console.log('Nom de la base actuelle (via mongoose):', this.connection.name)
    console.log('studentId :', studentId)


    console.log('check Collection coursenews :', await this.courseModel.find({}))
    const objectTest = {
      teacher: [new Types.ObjectId('682dc0449bebc4c9ddbefaad')],
      sessions: [
        {
          students: [new Types.ObjectId(studentId)],
        },
      ],
    }
    await this.courseModel.create(objectTest)

    // Afficher toutes les collections de la base courante

    // const courses = await this.courseModel.find()
    // const courses = await this.courseModel.find({
    //   'sessions.students': new Types.ObjectId(studentId),
    // }).select('teacher')

    // console.log('Collection coursenews :', courses)

    // Extraire tous les profs, aplatir et supprimer les doublons
    // const teacherIds = new Set<Types.ObjectId>()
    // for (const course of courses) {
    //   course.teacher.forEach((t) => teacherIds.add(t as Types.ObjectId))
    // }

    // console.log('teacherIds :', teacherIds)

    // return Array.from(teacherIds).map((id) => id.toString())
    return ['null']
  }
}
