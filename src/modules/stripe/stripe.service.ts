import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'

import { Model, UpdateWriteOpResult } from 'mongoose'

import Stripe from 'stripe'

//services
import { UserService } from '@app/modules/user/user.service'

//models
import {
  StripeSubscription,
  StripeSubscriptionDocument,
  StripeSubscriptionModelConfig,
} from '@app/modules/stripe/stripeSubscription.model/stripeSubscription.model'
import {
  StripeAccount,
  StripeAccountDocument,
  StripeAccountModelConfig,
} from '@app/modules/stripe/StripeAccount.model/StripeAccount.model'
import { User, UserDocument } from '@app/modules/user/user.model/user.model'

//constants
import { prohibitedFieldsReturn, START_DELETED_INDEXES } from '@app/constants'

//exceptions
import { StripeExceptions } from 'src/utils/exceptions'

//types and interface
import { CreateSubscriptionInterface, StripeSubscriptionInterface, UserWithSubscriptionsInterface } from '@app/types'

//variables
const {
  checkUser,
  checkStripeAccount,
  checkCheckoutSession,
  checkStripeSubscription,
  checkUserInStripeService,
  checkMonthStripeSubscription,
  checkYearStripeSubscription,
  checkUserSubscriptions,
} = StripeExceptions

@Injectable()
export class StripeService {
  private readonly stripe: Stripe
  constructor(
    @InjectModel(StripeAccountModelConfig.name)
    private readonly stripeAccountModel: Model<StripeAccountDocument>,
    @InjectModel(StripeSubscriptionModelConfig.name)
    private readonly stripeSubscriptionModel: Model<StripeSubscriptionDocument>,
    private userService: UserService,
    private configService: ConfigService
  ) {
    const stripeSecretKey: string = this.configService.get<string>('STRIPE_SECRET_KEY') ?? ''

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })
  }

  async postNewStripeAccount(email: string, ownerId: string): Promise<Stripe.Customer> {
    const customer: Stripe.Customer = await this.stripe.customers.create({
      email,
      description: 'New Customer',
    })

    checkUserInStripeService(customer as Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>)

    const createdStripeAccount = new this.stripeAccountModel({ ownerId, stripeId: customer.id })

    await createdStripeAccount.save()

    return customer
  }

  async getStripeAccount(email: string, additionally?: true): Promise<StripeAccount> {
    const getQuery = (user: UserDocument): Promise<StripeAccount | null> =>
      this.stripeAccountModel.findOne({ ownerId: user._id }).exec()

    const user: UserDocument | null = await this.userService.findOne({ email })

    checkUser(user)

    let stripeAccount: StripeAccount | null = await getQuery(user)

    if (!stripeAccount && additionally) {
      await this.postNewStripeAccount(email, user.id)

      stripeAccount = await getQuery(user)
    } else {
      checkStripeAccount(stripeAccount)
    }

    return stripeAccount
  }

  getSubscriptions(stripeAccount: StripeAccountDocument): Promise<StripeSubscription[]> {
    return this.stripeSubscriptionModel.find({ ownerId: stripeAccount._id })
  }

  getEnvProperty(path: string): string {
    return (
      this.configService.get<string>(path, {
        infer: true,
      }) ?? ''
    )
  }

  async createCheckoutSession(
    customerID: string,
    price: string,
    trialEnd?: number
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const domain: string = this.getEnvProperty('FRONTEND_DOMAIN')

    return await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerID,
      line_items: [
        {
          price,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_end: trialEnd,
      },

      success_url: `${domain}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}`,
    })
  }

  updateStripeAccount(stripeAccount: StripeAccount, props: Partial<StripeAccount>): Promise<UpdateWriteOpResult> {
    const { stripeId } = stripeAccount

    return this.stripeAccountModel.updateOne({ stripeId }, { $set: { ...props } }).exec()
  }

  async deleteStripeAccountSubscriptions(
    stripeAccount: StripeAccount,
    startDeletedIndex: number
  ): Promise<Stripe.Response<Stripe.Subscription>[]> {
    const deletedSubscriptions: Stripe.Response<Stripe.Subscription>[] = []

    const subscriptionsStripeService: Stripe.Response<Stripe.ApiList<Stripe.Subscription>> =
      await this.stripe.subscriptions.list({ customer: stripeAccount.stripeId })

    for (const subscription of subscriptionsStripeService.data.slice(startDeletedIndex)) {
      const deletedSubscription: Stripe.Response<Stripe.Subscription> = await this.stripe.subscriptions.cancel(
        subscription.id
      )

      deletedSubscriptions.push(deletedSubscription)
    }

    return deletedSubscriptions
  }

  async deleteSubscriptions(subscriptionsToDelete: StripeSubscriptionDocument[]): Promise<void> {
    for (const subscription of subscriptionsToDelete) {
      await this.stripeSubscriptionModel.deleteOne({ _id: subscription._id })
    }
  }

  transferDataToString(timestamp: number): string {
    return new Date(timestamp * 1000).toISOString()
  }

  transferDataToNumber(dateString: string): number {
    return new Date(dateString).getTime() / 1000
  }

  async serviceGetPlans(
    email: string,
    product: string,
    checkCallback: (subscription: StripeSubscription) => void
  ): Promise<{ planKey: string; stripeAccount: StripeAccount; currentPeriodEnd: number | undefined }> {
    const planKey: string = this.getEnvProperty(product)
    let currentPeriodEnd: number | undefined

    const stripeAccount: StripeAccount = await this.getStripeAccount(email, true)

    const subscriptions: StripeSubscription[] = await this.getSubscriptions(stripeAccount as StripeAccountDocument)

    checkCallback(subscriptions[0])

    const currentPeriodEndToString: string = subscriptions[0]?.currentPeriodEnd

    if (currentPeriodEndToString) {
      currentPeriodEnd = this.transferDataToNumber(currentPeriodEndToString)
    }

    return {
      planKey,
      stripeAccount,
      currentPeriodEnd,
    }
  }

  async serviceGetSession(
    stripeAccount: StripeAccount,
    planKey: string,
    currentPeriodEnd?: number
  ): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const session: Stripe.Response<Stripe.Checkout.Session> = await this.createCheckoutSession(
      stripeAccount.stripeId,
      planKey,
      currentPeriodEnd
    )

    await this.updateStripeAccount(stripeAccount, { checkoutSessionId: session.id })

    return session
  }

  async getMonthlyPlan(email: string): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const { planKey, stripeAccount, currentPeriodEnd } = await this.serviceGetPlans(
      email,
      'PRODUCT_MONTHLY',
      checkMonthStripeSubscription
    )

    return this.serviceGetSession(stripeAccount, planKey, currentPeriodEnd)
  }

  async getYearPlan(email: string): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const { planKey, stripeAccount, currentPeriodEnd } = await this.serviceGetPlans(
      email,
      'PRODUCT_YEAR',
      checkYearStripeSubscription
    )

    return this.serviceGetSession(stripeAccount, planKey, currentPeriodEnd)
  }

  async deleteSubscription(
    email: string,
    startDeletedIndex: number,
    stripeAccount?: StripeAccount
  ): Promise<Stripe.Response<Stripe.Subscription>[]> {
    if (!stripeAccount) {
      stripeAccount = await this.getStripeAccount(email)
    }

    const deletedStripeAccountSubscriptions: Stripe.Response<Stripe.Subscription>[] =
      await this.deleteStripeAccountSubscriptions(stripeAccount, startDeletedIndex)

    const subscriptions: StripeSubscription[] = await this.getSubscriptions(stripeAccount as StripeAccountDocument)

    checkUserSubscriptions(subscriptions)

    await this.deleteSubscriptions(subscriptions.reverse().slice(startDeletedIndex) as StripeSubscriptionDocument[])

    return deletedStripeAccountSubscriptions
  }

  async getRetrieveCheckoutSession(email: string): Promise<Stripe.Response<Stripe.Checkout.Session>> {
    const stripeAccount: StripeAccount = await this.getStripeAccount(email)

    return await this.stripe.checkout.sessions.retrieve(stripeAccount.checkoutSessionId)
  }

  async getBillingSession(email: string): Promise<Stripe.Response<Stripe.BillingPortal.Session>> {
    const domain: string = this.getEnvProperty('FRONTEND_DOMAIN')

    const stripeAccount: StripeAccount = await this.getStripeAccount(email)

    return await this.stripe.billingPortal.sessions.create({
      customer: stripeAccount.stripeId,
      return_url: domain,
    })
  }

  createWebhook(rawBody: Buffer, sig: string, secretPath: string): Stripe.Event {
    const stripeWebHookSecret: string = this.getEnvProperty(secretPath)

    return this.stripe.webhooks.constructEvent(rawBody, sig, stripeWebHookSecret)
  }

  async getUserSubscriptionId(email: string): Promise<string> {
    const session: Stripe.Response<Stripe.Checkout.Session> = await this.getRetrieveCheckoutSession(email)

    checkCheckoutSession(session)

    return session.subscription as string
  }

  async getCurrentSubscription(subscriptionId: string): Promise<Stripe.Response<StripeSubscriptionInterface>> {
    const subscription: Stripe.Response<Stripe.Subscription> = await this.stripe.subscriptions.retrieve(subscriptionId)

    return subscription as Stripe.Response<StripeSubscriptionInterface>
  }

  async createUserSubscription(subscriptionData: CreateSubscriptionInterface): Promise<StripeSubscription> {
    const newSubscription: StripeSubscriptionDocument = new this.stripeSubscriptionModel(subscriptionData)

    await newSubscription.save()

    return newSubscription
  }

  async getWebHookPaid(email: string): Promise<void> {
    const stripeAccount: StripeAccount = await this.getStripeAccount(email)

    const subscriptionStripeId: string = await this.getUserSubscriptionId(email)

    const subscription: Stripe.Response<StripeSubscriptionInterface> =
      await this.getCurrentSubscription(subscriptionStripeId)

    checkStripeSubscription(subscription)

    const currentPeriodEndSeconds: number = subscription.current_period_end

    const currentPeriodEnd: string = this.transferDataToString(currentPeriodEndSeconds)

    const plan: string = subscription.plan.interval

    await this.createUserSubscription({
      subscriptionStripeId,
      plan,
      currentPeriodEnd,
      ownerId: (stripeAccount as StripeAccountDocument)._id,
    })

    await this.deleteSubscription(email, START_DELETED_INDEXES.OLD_ITEMS, stripeAccount)
  }

  async getWebHookUpdated(
    subscriptionStripeId: string,
    cancel_at_period_end: boolean,
    current_period_end: number
  ): Promise<void> {
    const subscription: StripeSubscriptionDocument = await this.stripeSubscriptionModel.findOne({
      subscriptionStripeId,
    })

    const isChangedCancelAtPeriodEnd: boolean = cancel_at_period_end !== subscription.cancelAtPeriodEnd
    const isChangedCurrentPeriodEnd: boolean =
      current_period_end !== this.transferDataToNumber(subscription.currentPeriodEnd)

    if ([isChangedCancelAtPeriodEnd, isChangedCurrentPeriodEnd].some(Boolean)) {
      subscription.cancelAtPeriodEnd = cancel_at_period_end
      subscription.currentPeriodEnd = this.transferDataToString(current_period_end)

      await subscription.save()
    }
  }

  async getUsersWithSubscriptions(): Promise<UserWithSubscriptionsInterface[]> {
    const usersWithSubscriptions: UserWithSubscriptionsInterface[] = []

    const users: User[] = await this.userService.findAll()

    for (const user of users) {
      if (!user.email) {
        continue
      }

      const stripeAccount: StripeAccount = await this.getStripeAccount(user.email)

      const subscriptions: StripeSubscription[] = await this.getSubscriptions(stripeAccount as StripeAccountDocument)

      for (const field of prohibitedFieldsReturn) {
        delete user[field]
      }

      if (subscriptions.length) {
        usersWithSubscriptions.push({
          ...user,
          subscriptions,
        } as UserWithSubscriptionsInterface)
      }
    }

    return usersWithSubscriptions
  }

  async getUserSubscriptions(email: string): Promise<StripeSubscription[]> {
    const stripeAccount: StripeAccount = await this.getStripeAccount(email, true)

    return await this.getSubscriptions(stripeAccount as StripeAccountDocument)
  }

  async getUserAccess(email: string): Promise<boolean> {
    const user: User = await this.userService.findOne({ email })
    const userSubscriptions: StripeSubscription[] = await this.getUserSubscriptions(email)

    const userEndTrial: Date = new Date(user.endTrial)

    const currentPeriodEnd: Date = new Date(userSubscriptions[0]?.currentPeriodEnd)

    const currentDate: Date = new Date()

    return !![userEndTrial, currentPeriodEnd].find((date: Date): boolean => date > currentDate)
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCronCheckUsersStatus(): Promise<void> {
    console.log('cron')
  }
}
