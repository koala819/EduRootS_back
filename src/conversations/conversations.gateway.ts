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
import * as jwt from 'jsonwebtoken'

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',           // Développement local
      'https://eduroots-git-newmessagerie-xavier819.vercel.app', // Test Vercel
      'https://mosquee-colomiers.vercel.app/',            // Production
    ],
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

      //Décoder le token pour récupérer l'id utilisateur
      let payload: any
      try {
        payload = jwt.verify(token, process.env.MY_CUSTOM_JWT_SECRET)
      } catch (e) {
        this.logger.error('Token invalide, déconnexion du client', e)
        client.disconnect()
        return
      }


      const userId = payload.id
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
        // Log avant de rejoindre la room
        this.logger.log(
          `Ajout du client ${client.id} à la
           room conversation-${conversation.id} (user: ${userId})`,
        )
        //ajoute client à la room
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

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: { conversationId: string; content: string; authorId: string },
  ) {
    try {
      const message = await this.conversationsService.createChatMessage(
        data.conversationId,
        data.authorId,
        data.content,
      )
      this.logger.log(
        `Envoi de newMessage à conversation-${data.conversationId}
       (user: ${data.authorId}) : ${JSON.stringify(message)}`,
      )
      // TEST : broadcast à tous les clients, pas seulement à la room
      // this.server.emit('newMessage', {
      //   conversationId: data.conversationId,
      //   message,
      // })

      // this.logger.log(
      //   `Envoi de newMessage à conversation-${data.conversationId}
      //    (user: ${data.authorId}) : ${JSON.stringify(message)}`,
      // )

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

  @SubscribeMessage('amIInRoom')
  amIInRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    const room = `conversation-${data.conversationId}`
    const isInRoom = this.server.sockets.adapter.rooms.get(room)?.has(client.id) ?? false
    client.emit('amIInRoomResult', { room, isInRoom })
  }

  @SubscribeMessage('joinChildRooms')
  async joinChildRooms(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { childId: string },
  ) {
    // Récupère toutes les conversations de l'enfant
    const conversations = await this.conversationsService.findAllForUser(
      new Types.ObjectId(data.childId),
    )
    for (const conversation of conversations) {
      client.join(`conversation-${conversation.id}`)
      this.logger.log(
        `Ajout du client ${client.id} à la room conversation-${conversation.id}
         (child: ${data.childId}) via joinChildRooms`,
      )
    }
    client.emit('joinedChildRooms', { childId: data.childId })
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
