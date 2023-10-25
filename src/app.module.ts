import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'

//modules
import { UserModule } from '@app/modules/user/user.module'
import { StripeModule } from '@app/modules/stripe/stripe.module'
import { AuthModule } from '@app/auth/auth.module'
import { ReviewModule } from '@app/review/review.module'
import { ProductModule } from '@app/product/product.module'

//controllers
import { AppController } from '@app/app.controller'

//services
import { AppService } from '@app/app.service'

//guards
import { UserAccessGuard } from 'src/utils/guards'

//configs
import { environmentConfig, mongooseAsyncConfig } from '@app/config'

@Module({
  imports: [
    ConfigModule.forRoot(environmentConfig),
    MongooseModule.forRootAsync(mongooseAsyncConfig),
    UserModule,
    AuthModule,
    ReviewModule,
    ProductModule,
    StripeModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserAccessGuard],
})
export class AppModule {}
