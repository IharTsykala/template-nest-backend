import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModuleOptions } from '@nestjs/mongoose'

const mongooseConfig = (configService: ConfigService): MongooseModuleOptions => ({
  uri: configService.get('MONGO_URI'),
})

export const mongooseAsyncConfig = {
  imports: [ConfigModule],
  useFactory: mongooseConfig,
  inject: [ConfigService],
}
