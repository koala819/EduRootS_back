import { Types } from 'mongoose'
import { Course } from '../courses/schemas/course.schema'

export interface CourseDocument extends Omit<Course, 'id'>, MongooseDocument {
  _id: Types.ObjectId
  updateStats: () => Promise<void>
  teacher: (Types.ObjectId | {_id: Types.ObjectId} | string)[]
}
