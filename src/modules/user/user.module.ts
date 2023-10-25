import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

//models
import { UserModelConfig } from '@app/modules/user/user.model/user.model'

//controllers
import { UserController } from '@app/modules/user/user.controller'

//services
import { UserService } from '@app/modules/user/user.service'

@Module({
  imports: [MongooseModule.forFeature([UserModelConfig])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
