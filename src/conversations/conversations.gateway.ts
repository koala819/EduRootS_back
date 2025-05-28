import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { ConversationsService } from './conversations.service'
import { Types } from 'mongoose'
import { Logger } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private readonly logger = new Logger(ConversationsGateway.name)

  constructor(private readonly conversationsService: ConversationsService) {}

  async handleConnection(client: Socket) {
    try {
      // Récupérer le token depuis les données d'authentification du client
      const token = client.handshake.auth.token
      if (!token) {
        this.logger.error('Token manquant, déconnexion du client')
        client.disconnect()
        return
      }

      // Pour le moment, on accepte simplement l'ID utilisateur envoyé
      // À terme, il faudra vérifier le token NextAuth
      const userId = client.handshake.auth.userId
      if (!userId) {
        this.logger.error('UserId manquant, déconnexion du client')
        client.disconnect()
        return
      }

      // Stocker l'ID utilisateur dans les données du socket
      client.data.userId = userId

      // Rejoindre toutes les conversations de l'utilisateur
      const conversations = await this.conversationsService.findAllForUser(
        new Types.ObjectId(userId),
      )

      // Utiliser le fait que les conversations sont des objets MongoDB avec un _id
      for (const conversation of conversations) {
        // Utilisation du document mongoose directement
        // .id est une méthode getter qui convertit _id en string
        client.join(`conversation-${conversation.id}`)
      }

      this.logger.log(`Client connecté: ${client.id}, User: ${userId}`)
    } catch (error) {
      this.logger.error(`Erreur lors de la connexion: ${error.message}`)
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`)
  }

  // @SubscribeMessage('joinConversation')
  // async joinConversation(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { conversationId: string },
  // ) {
  //   try {
  //     const userId = client.data.userId
  //     await this.conversationsService.joinConversation(
  //       data.conversationId,
  //       new Types.ObjectId(userId),
  //     )
  //     client.join(`conversation-${data.conversationId}`)
  //     return { success: true }
  //   } catch (error) {
  //     this.logger.error(`Erreur lors de l'adhésion à la conversation: ${error.message}`)
  //     return { success: false, error: error.message }
  //   }
  // }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    try {
      const userId = client.data.userId
      const message = await this.conversationsService.createChatMessage(
        data.conversationId,
        userId,
        data.content,
      )

      // Envoyer le message à tous les membres de la conversation
      this.server.to(`conversation-${data.conversationId}`).emit('newMessage', {
        conversationId: data.conversationId,
        message,
      })

      return { success: true, message }
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du message: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  @SubscribeMessage('typing')
  typing(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId

    // Informer les autres membres que l'utilisateur est en train d'écrire
    client.to(`conversation-${data.conversationId}`).emit('userTyping', {
      conversationId: data.conversationId,
      userId,
      isTyping: data.isTyping,
    })

    return { success: true }
  }
}
