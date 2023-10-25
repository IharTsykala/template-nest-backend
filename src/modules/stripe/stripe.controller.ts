import { Controller, Get, Post, Body, Param, Delete, Req, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common'
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger'

import { Request } from 'express'

import Stripe from 'stripe'

//services
import { UserService } from '@app/modules/user/user.service'
import { StripeService } from './stripe.service'

//models
import { StripeAccount } from '@app/modules/stripe/StripeAccount.model/StripeAccount.model'
import { StripeSubscription } from '@app/modules/stripe/stripeSubscription.model/stripeSubscription.model'
import { UserDocument } from '@app/modules/user/user.model/user.model'

//guards
// import { JwtAuthGuard, UserAccessGuard } from 'src/utils/guards'

//constants
import { START_DELETED_INDEXES, WEBHOOK_TYPES } from '@app/constants'

//dto
import { CreateStripeAccountDto } from './dto/CreateStripeAccountDto'

//exceptions
import { StripeExceptions } from '@app/utils/exceptions'

//types and interface
import { StripeEventType, UserAccessInterface, UserWithSubscriptionsInterface } from '@app/types'

//enum
import { ResponseActionsEnum } from '@app/enum'

//swagger
import { CommonResponseBody, StripeResponseBody } from '@app/documentation'

//variables
const { checkUser } = StripeExceptions
const { session, userSubscriptions, userAccess } = StripeResponseBody
const { commonResponse } = CommonResponseBody

@Controller('stripe')
@ApiTags('Stripe')
@UsePipes(new ValidationPipe({ transform: true }))
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private userService: UserService
  ) {}

  @Post('/postNewStripeAccount')
  @ApiExcludeEndpoint()
  async postNewStripeAccount(@Body() createSubscriptionDto: CreateStripeAccountDto): Promise<Stripe.Customer> {
    const { email } = createSubscriptionDto

    const user: UserDocument | null = await this.userService.findOne({ email })

    checkUser(user)

    return this.stripeService.postNewStripeAccount(email, user.id)
  }

  @Get('/getStripeAccount/:email')
  @ApiExcludeEndpoint()
  async getStripeAccount(@Param() params: CreateStripeAccountDto): Promise<StripeAccount | null> {
    const { email } = params

    return this.stripeService.getStripeAccount(email)
  }

  @Get('/getMonthlyPlan/:email')
  @ApiResponse(session(ResponseActionsEnum.Month, commonResponse))
  // @UseGuards(JwtAuthGuard)
  async getMonthlyPlan(@Param() params: CreateStripeAccountDto): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const { email } = params

    return this.stripeService.getMonthlyPlan(email)
  }

  @Get('/getYearPlan/:email')
  @ApiResponse(session(ResponseActionsEnum.Year, commonResponse))
  // @UseGuards(JwtAuthGuard)
  async getYearPlan(@Param() params: CreateStripeAccountDto): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const { email } = params

    return await this.stripeService.getYearPlan(email)
  }

  @Delete('/deleteSubscription')
  @ApiExcludeEndpoint()
  async deleteSubscription(@Body() body: CreateStripeAccountDto): Promise<Stripe.Response<Stripe.Subscription>[]> {
    const { email } = body

    return await this.stripeService.deleteSubscription(email, START_DELETED_INDEXES.ALL_ITEMS)
  }

  @Get('/getRetrieveCheckoutSession/:email')
  @ApiExcludeEndpoint()
  async getRetrieveCheckoutSession(
    @Param() params: { email: string }
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const { email } = params

    return this.stripeService.getRetrieveCheckoutSession(email)
  }

  @Get('/getBillingSession/:email')
  @ApiResponse(session(ResponseActionsEnum.Billing, commonResponse))
  // @UseGuards(JwtAuthGuard)
  async getBillingSession(
    @Param() params: CreateStripeAccountDto
  ): Promise<Stripe.Response<Stripe.BillingPortal.Session>> {
    const { email } = params

    return this.stripeService.getBillingSession(email)
  }

  @Get('/getUsersWithSubscriptions')
  @ApiExcludeEndpoint()
  async getUsersWithSubscriptions(): Promise<UserWithSubscriptionsInterface[]> {
    return this.stripeService.getUsersWithSubscriptions()
  }

  @Get('/getUserSubscriptions/:email')
  @ApiResponse(userSubscriptions(commonResponse))
  // @UseGuards(JwtAuthGuard)
  // @UseGuards(UserAccessGuard)
  async getUserSubscriptions(@Param() params: CreateStripeAccountDto): Promise<StripeSubscription[]> {
    const { email } = params

    return this.stripeService.getUserSubscriptions(email)
  }

  @Get('/getUserAccess/:email')
  @ApiResponse(userAccess(commonResponse))
  // @UseGuards(JwtAuthGuard)
  async getUserAccess(@Param() params: CreateStripeAccountDto): Promise<UserAccessInterface> {
    const { email } = params

    return { userAccess: await this.stripeService.getUserAccess(email) }
  }

  checkWebHooksEvent(req: Request, secretPath: string): StripeEventType {
    const stripeSignature: string = req.header('Stripe-Signature')

    return this.stripeService.createWebhook(req.body, stripeSignature, secretPath) as StripeEventType
  }

  @Post('/webhook-paid')
  @ApiExcludeEndpoint()
  async getWebHookPaid(@Req() req: Request): Promise<void> {
    const event: StripeEventType = this.checkWebHooksEvent(req, 'STRIPE_WEBHOOK_SECRET_PAID')

    if (event?.type === WEBHOOK_TYPES.CHECKOUT_SESSION_COMPLETED) {
      const { email } = event.data.object.customer_details

      await this.stripeService.getWebHookPaid(email)
    }
  }

  @Post('/webhook-updated')
  @ApiExcludeEndpoint()
  async getWebHookUpdated(@Req() req: Request): Promise<void> {
    const event: StripeEventType = this.checkWebHooksEvent(req, 'STRIPE_WEBHOOK_SECRET_UPDATED')

    if (event?.type === WEBHOOK_TYPES.CHECKOUT_SESSION_UPDATED) {
      const { id: subscriptionStripeId, cancel_at_period_end, current_period_end } = event.data.object

      await this.stripeService.getWebHookUpdated(subscriptionStripeId, cancel_at_period_end, current_period_end)
    }
  }
}
