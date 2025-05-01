import { Schema, Types } from 'mongoose'

export const MessageSchema = new Schema({
  content: { type: String, required: true },
  sender: { type: Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Types.ObjectId, ref: 'User' }, // null si message de groupe
  conversation: { type: Types.ObjectId, ref: 'Conversation', required: true },
  sentAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  attachments: [{ type: String }], // URLs ou chemins de fichiers
})
