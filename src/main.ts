import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { INestApplication } from '@nestjs/common'

import { setupSwagger } from './swagger'

import * as bodyParser from 'body-parser'

//modules
import { AppModule } from '@app/app.module'

//constants
import { isTs, rowBodyPaths } from '@app/constants'

if (!isTs) {
  import('module-alias/register').then()
}

async function bootstrap(): Promise<void> {
  const app: INestApplication<any> = await NestFactory.create(AppModule)

  app.use(rowBodyPaths, bodyParser.raw({ type: 'application/json' }))

  const configService: ConfigService<unknown, boolean> = app.get(ConfigService)
  const port: number = configService.get<number>('PORT')

  app.setGlobalPrefix('api')
  app.enableCors()
  setupSwagger(app)

  await app.listen(port)
}

bootstrap().then()
