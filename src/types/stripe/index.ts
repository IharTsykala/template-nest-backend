import Stripe from 'stripe'

import { Types } from 'mongoose'

//models
import { User } from '@app/modules/user/user.model/user.model'
import { StripeSubscription } from '@app/modules/stripe/stripeSubscription.model/stripeSubscription.model'

export interface CreateSubscriptionInterface {
  subscriptionStripeId: string
  plan: string
  currentPeriodEnd: string
  ownerId: Types.ObjectId
}

export interface StripeSubscriptionInterface extends Stripe.Subscription {
  plan: { interval: string }
}

export interface UserWithSubscriptionsInterface extends User {
  createdAt: string
  subscriptions: StripeSubscription[]
}

export interface SessionExampleInterface {
  url: string
}

export type StripeEventType = Stripe.Event & {
  data: {
    object: {
      id: string
      cancel_at_period_end: boolean
      current_period_end: number
      customer_details: { email: string }
    }
  }
}
