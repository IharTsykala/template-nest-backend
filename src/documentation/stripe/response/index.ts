import { HttpStatus } from '@nestjs/common'

import { Types } from 'mongoose'

//enum
import { ResponseActionsEnum } from 'src/enum'

//constants
import { COMMON_PROPERTIES_RESPONSE, DESCRIPTIONS_RESPONSE, PLANS, URLS_RESPONSE } from 'src/constants'

//types
import {
  CommonArgumentsInterface,
  CommonResponseInterface,
  CommonResponseType,
  CreateSubscriptionInterface,
  SessionExampleInterface,
  UserAccessInterface,
} from 'src/types'

export class StripeResponseBody {
  static session(
    actionName: ResponseActionsEnum,
    commonResponse: CommonResponseType
  ): CommonResponseInterface<SessionExampleInterface> {
    const actions: CommonArgumentsInterface<SessionExampleInterface>[] = [
      {
        status: HttpStatus.OK,
        condition: ResponseActionsEnum.Month,
        description: DESCRIPTIONS_RESPONSE[ResponseActionsEnum.Month],
        example: {
          url: URLS_RESPONSE[ResponseActionsEnum.Month],
        },
      },
      {
        status: HttpStatus.OK,
        condition: ResponseActionsEnum.Year,
        description: DESCRIPTIONS_RESPONSE[ResponseActionsEnum.Year],
        example: {
          url: URLS_RESPONSE[ResponseActionsEnum.Year],
        },
      },
      {
        status: HttpStatus.OK,
        condition: ResponseActionsEnum.Billing,
        description: DESCRIPTIONS_RESPONSE[ResponseActionsEnum.Billing],
        example: {
          url: URLS_RESPONSE[ResponseActionsEnum.Billing],
        },
      },
    ]

    const currentAction: CommonArgumentsInterface<SessionExampleInterface> = actions.find(
      ({ condition }): boolean => condition === actionName
    ) as CommonArgumentsInterface<SessionExampleInterface>

    return commonResponse(currentAction) as CommonResponseInterface<SessionExampleInterface>
  }

  static userSubscriptions(commonResponse: CommonResponseType): CommonResponseInterface<CreateSubscriptionInterface[]> {
    const currentAction: CommonArgumentsInterface<CreateSubscriptionInterface[]> = {
      status: HttpStatus.OK,
      description: DESCRIPTIONS_RESPONSE.USER_SUBSCRIPTIONS,
      example: [
        {
          subscriptionStripeId: COMMON_PROPERTIES_RESPONSE.SUBSCRIPTION_ID,
          plan: PLANS.MONTH,
          currentPeriodEnd: COMMON_PROPERTIES_RESPONSE.CURRENT_PERIOD_END,
          ownerId: new Types.ObjectId(COMMON_PROPERTIES_RESPONSE.OBJECT_ID),
        },
      ],
    }

    return commonResponse(currentAction) as CommonResponseInterface<CreateSubscriptionInterface[]>
  }

  static userAccess(commonResponse: CommonResponseType): CommonResponseInterface<UserAccessInterface> {
    const currentAction: CommonArgumentsInterface<UserAccessInterface> = {
      status: HttpStatus.OK,
      description: DESCRIPTIONS_RESPONSE.USER_ACCESS,
      example: {
        userAccess: true,
      },
    }

    return commonResponse(currentAction) as CommonResponseInterface<UserAccessInterface>
  }
}
