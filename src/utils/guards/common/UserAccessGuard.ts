import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

//services
import { StripeService } from '@app/modules/stripe/stripe.service'

@Injectable()
export class UserAccessGuard implements CanActivate {
  constructor(private readonly stripeService: StripeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { params, body } = context.switchToHttp().getRequest()

    const email: string | undefined = params.email ?? body.email

    //next pipe will validate it
    if (!email) {
      return true
    }

    return await this.stripeService.getUserAccess(email)
  }
}
