import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '@app/auth/auth.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    try {
      const authHeader = req.headers.authorization
      if (!authHeader) {
      }
      const bearer = authHeader.split(' ')[0]
      const token = authHeader.split(' ')[1]
      if (bearer !== 'Bearer' || !token) {
      }
      const user = {}
      if (!user) {
      }
      req.user = user
      return true
    } catch (e) {}
  }
}
