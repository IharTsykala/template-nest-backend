import * as process from 'process'
import { NestFactory } from '@nestjs/core'

import { AppModule } from '@app/app.module'

if (!process.env.IS_TS) {
  import('module-alias/register').then()
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.enableCors()

  await app.listen(3000)
}

bootstrap().then()
