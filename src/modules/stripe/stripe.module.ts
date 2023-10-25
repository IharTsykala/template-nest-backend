import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

//models
import { StripeSubscriptionModelConfig } from '@app/modules/stripe/stripeSubscription.model/stripeSubscription.model'
import { StripeAccountModelConfig } from '@app/modules/stripe/StripeAccount.model/StripeAccount.model'

//controllers
import { StripeController } from './stripe.controller'

//services
import { UserModule } from '@app/modules/user/user.module'
import { StripeService } from './stripe.service'

@Module({
  imports: [UserModule, MongooseModule.forFeature([StripeAccountModelConfig, StripeSubscriptionModelConfig])],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
