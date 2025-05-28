import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import  { Connection } from 'mongoose'

@Injectable()
export class LogDbService implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    // Log immédiat si déjà connecté (recommandé)
    if (this.connection.readyState === 1) {
      console.log('✅ Déjà connecté à la base MongoDB :', this.connection.name)
      console.log('📦 Collections:', Object.keys(this.connection.collections))
      console.log('🔍 Nom base Mongoose :', this.connection.name)
      console.log('🔗 URI utilisé :', process.env.MONGODB_URI)

    }

    // Sinon on attend l’événement "connected"
    this.connection.on('connected', () => {
      console.log('✅ Connexion MongoDB établie :', this.connection.name)
      console.log('📦 Collections:', Object.keys(this.connection.collections))
    })

    this.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB (service) :', err)
    })
  }
}

