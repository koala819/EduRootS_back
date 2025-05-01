import * as mongoose from 'mongoose'
import { Provider } from '@nestjs/common'

const connectWithRetry = async (
  uri: string,
  options: any,
  retries = 3,
): Promise<typeof mongoose> => {
  try {
    return await mongoose.connect(uri, options)
  } catch (err) {
    if (retries <= 0) throw err
    console.log(`Connexion échouée, nouvelle tentative dans 5s... (${retries} restantes)`)
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return connectWithRetry(uri, options, retries - 1)
  }
}

export const databaseProviders: Provider[] = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> => {
      const dbUri = process.env.MONGODB_URI
      if (!dbUri) {
        throw new Error("La variable d'environnement MONGODB_URI n'est pas définie.")
      }
      const conn = await connectWithRetry(dbUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 30000,
        maxPoolSize: 5,
        maxIdleTimeMS: 60000,
        family: 4,
        autoIndex: false,
        minPoolSize: 0,
      })
      console.log('Connexion MongoDB établie.')
      return conn
    },
  },
]
