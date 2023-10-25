import { HttpStatus } from '@nestjs/common'

//enum
import { ResponseActionsEnum } from '@app/enum'

export interface UserAccessInterface {
  userAccess: boolean
}

export interface CommonArgumentsInterface<T> {
  status: HttpStatus
  condition?: ResponseActionsEnum
  description: string
  example: T
}

export interface CommonResponseInterface<T> {
  status: HttpStatus
  description: string
  schema: {
    example: T
  }
}
export type CommonResponseType = (args: CommonArgumentsInterface<unknown>) => CommonResponseInterface<unknown>
