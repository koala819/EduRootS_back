import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

class Session {
  @Prop([{ type: Types.ObjectId, ref: 'userNEW' }])
    students: Types.ObjectId[]
}

@Schema({ timestamps: true, collection: 'coursenews' })
export class Course {
  @Prop([{ type: Types.ObjectId, ref: 'userNEW', required: true }])
    teacher: Types.ObjectId[]

  @Prop([Session])
    sessions: Session[]
}

export type CourseDocument = Course & Document
export const CourseSchema = SchemaFactory.createForClass(Course)
