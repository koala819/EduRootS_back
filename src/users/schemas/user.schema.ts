import { SubjectNameEnum } from '@/types/course'
import { GenderEnum, UserRoleEnum, UserType } from '@/types/user'

import { rootOptions } from '@/root/schemas/root.schema'

import { StudentStats } from '@/students/schemas/student.schema'
import { TeacherStats } from '@/teachers/schemas/teacher.schema'
import { capitalizeFirstLetter } from '@/lib/utils'
import * as bcrypt from 'bcryptjs'
import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    hasInvalidEmail: { type: Boolean, default: false },
    secondaryEmail: String,
    firstname: {
      type: String,
      required: true,
      trim: true,
      set: capitalizeFirstLetter,
    },
    lastname: { type: String, required: true, trim: true, upperCase: true },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRoleEnum),
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    // Champs spécifiques aux étudiants
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
    },
    type: {
      type: String,
      enum: Object.values(UserType),
    },

    // Champs spécifiques aux professeurs
    // On garde subjects uniquement pour les professeurs
    subjects: [
      {
        type: String,
        enum: Object.values(SubjectNameEnum),
      },
    ],

    // Champs communs
    schoolYear: String,
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    stats: {
      type: Schema.Types.ObjectId,
      refPath: 'statsModel', // Référence dynamique basée sur le champ statsModel
    },
    statsModel: {
      type: String,
      enum: ['StudentStats', 'TeacherStats'],
    },
  },
  {
    ...rootOptions,
    timestamps: true,
  },
)

// Password hashing
userSchema.pre(
  'save',
  async function (
    this: mongoose.Document & { password: string; isModified: (field: string) => boolean },
    next,
  ) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
  },
)

// Définir le modèle de stats basé sur le rôle
userSchema.pre(
  'save',
  function (this: mongoose.Document & { role: string; statsModel: string }, next) {
    if (this.role === UserRoleEnum.Student) {
      this.statsModel = 'StudentStats'
    } else if (this.role === UserRoleEnum.Teacher) {
      this.statsModel = 'TeacherStats'
    }
    next()
  },
)

// Create stats for users
userSchema.pre(
  'save',
  async function (this: mongoose.Document & { role: string; stats: any; _id: any }, next) {
    if (this.role === UserRoleEnum.Teacher && !this.stats) {
      try {
        const newStatsDoc = new TeacherStats({
          userId: this._id,
          type: 'teacher',
          teacherStats: {
            totalStudents: 0,
            genderDistribution: {
              counts: {
                [GenderEnum.Masculin]: 0,
                [GenderEnum.Feminin]: 0,
                undefined: 0,
              },
              percentages: {
                [GenderEnum.Masculin]: '0',
                [GenderEnum.Feminin]: '0',
                undefined: '0',
              },
            },
            minAge: 0,
            maxAge: 0,
            averageAge: 0,
          },
          lastUpdate: new Date(),
        })
        await (newStatsDoc as any).save()
        this.stats = (newStatsDoc as any)._id
      } catch (error: any) {
        console.error('Erreur lors de la création des stats:', error)
      }
    } else if (this.role === UserRoleEnum.Student && !this.stats) {
      try {
        const newStatsDoc = new StudentStats({
          userId: this._id,
          type: 'student',
          studentStats: {
            attendanceRate: 0,
            totalAbsences: 0,
            totalSessions: 0,
            lastAttendance: null,
            lastSession: null,
            behaviorAverage: 0,
            lastBehavior: null,
          },
          lastUpdate: new Date(),
        })
        await (newStatsDoc as any).save()
        this.stats = (newStatsDoc as any)._id
      } catch (error: any) {
        console.error('Erreur lors de la création des stats:', error)
      }
    }
    next()
  },
)

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ role: 1, isActive: 1 })
userSchema.index({ firstname: 1, lastname: 1 })
userSchema.index({ role: 1, subjects: 1 }) // Index pour la recherche des profs par matière

export const User = mongoose.models.userNEW || mongoose.model('userNEW', userSchema)
