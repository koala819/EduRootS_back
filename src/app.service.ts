import { Injectable } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection } from 'mongoose'

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {
    this.connection.once('open', () => {
      console.log('✅ Connecté à MongoDB')
      console.log('Nom de la base réellement utilisée :', this.connection.name)
    })
  }

  getHello(): string {
    return 'Hello World!'
  }
}
