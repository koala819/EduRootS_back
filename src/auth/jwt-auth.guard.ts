import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtPayload, verify } from 'jsonwebtoken'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = await context.switchToHttp().getRequest()
    const authHeader = req.headers['authorization']
    if (!authHeader) throw new UnauthorizedException('No token provided')

    // const token = authHeader.split(' ')[1]
    const token = authHeader && authHeader.split(' ')[1]
    console.log('Token reçu:', token)
    console.log('Secret utilisé:', process.env.MY_CUSTOM_JWT_SECRET)
    try {
      // Vérifie le token avec le même secret que NextAuth
      //   console.log('Token reçu:', token)
      //   console.log('totot', req.headers['authorization'])
      //   console.log('Secret utilisé:', process.env.MY_CUSTOM_JWT_SECRET)
      //   const payload = verify(token, process.env.MY_CUSTOM_JWT_SECRET as string) as JwtPayload
      const payload = verify(token, process.env.MY_CUSTOM_JWT_SECRET as string)
      console.log('Payload décodé:', payload)
      req.user = payload.user || payload // Ajoute l'utilisateur à la requête
      return true
    } catch (err) {
      console.error('Erreur JWT:', err)
      console.log(
        'Secret utilisé:',
        process.env.MY_CUSTOM_JWT_SECRET,
        'Longueur:',
        process.env.MY_CUSTOM_JWT_SECRET?.length,
      )
      throw new UnauthorizedException('Invalid token')
    }
  }
}
