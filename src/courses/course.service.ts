import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Course } from './schemas/course.schema'
import { CourseDocument } from '@/types/mongoose'

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
  ) {}

  async getTeachersForStudent(studentId: string): Promise<string[]> {
    // console.log('check Collection coursenews :', await this.courseModel.find({}).exec())

    // Recherche des cours où le student est inscrit
    const courses = await this.courseModel.find({
      'sessions.students': new Types.ObjectId(studentId),
    }).select('teacher').exec()

    // console.log('find this course', courses)

    // Extraire tous les profs, aplatir et supprimer les doublons
    const teacherIds = new Set<Types.ObjectId>()
    for (const course of courses) {
      course.teacher.forEach((t) => teacherIds.add(t as Types.ObjectId))
    }
    // console.log('teacherIds :', teacherIds)

    return Array.from(teacherIds).map((id) => id.toString())
  }
}
