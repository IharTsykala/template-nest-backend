import { HttpException, HttpStatus } from '@nestjs/common'

import Stripe from 'stripe'

//entities
import { User } from '@app/modules/user/user.model/user.model'
import { StripeAccount } from '@app/modules/stripe/StripeAccount.model/StripeAccount.model'
import { StripeSubscription } from '@app/modules/stripe/stripeSubscription.model/stripeSubscription.model'

//types and interfaces
import { StripeSubscriptionInterface } from '@app/types'

//constants
import { ERRORS_REQUEST, PLANS } from '@app/constants'

export class StripeExceptions {
  static checkUser(user: User | null): void {
    if (!user) {
      throw new HttpException(ERRORS_REQUEST.EMAIL_IS_NOT_EXIST, HttpStatus.BAD_REQUEST)
    }
  }

  static checkStripeAccount(stripeAccount: StripeAccount | null): void {
    if (!stripeAccount) {
      throw new HttpException(ERRORS_REQUEST.USER_IS_NOT_EXIST_IN_STRIPE_USER, HttpStatus.BAD_REQUEST)
    }
  }

  static checkUserInStripeService(customerUser: Stripe.Response<Stripe.Customer | Stripe.DeletedCustomer>): void {
    if (!customerUser) {
      throw new HttpException(ERRORS_REQUEST.USER_IS_NOT_EXIST_IN_STRIPE_SERVICE, HttpStatus.BAD_REQUEST)
    }
  }

  static checkCheckoutSessionId(checkoutSessionId: string | null | undefined): void {
    if (checkoutSessionId) {
      throw new HttpException(ERRORS_REQUEST.SESSION_IS_OPENED, HttpStatus.BAD_REQUEST)
    }
  }

  static checkCheckoutSession(session: Stripe.Response<Stripe.Checkout.Session>): void {
    if (!session) {
      throw new HttpException(ERRORS_REQUEST.SESSION_IS_NOT_EXIST, HttpStatus.BAD_REQUEST)
    }
  }

  static checkUserSubscriptions(subscriptions: StripeSubscription[]): void {
    if (!subscriptions.length) {
      throw new HttpException(ERRORS_REQUEST.USER_DONT_HAVE_SUBSCRIPTIONS, HttpStatus.BAD_REQUEST)
    }
  }

  static checkIsProvidedEmail(email: string): void {
    if (!email) {
      throw new HttpException(ERRORS_REQUEST.EMAIL_IS_NOT_PROVIDED, HttpStatus.BAD_REQUEST)
    }
  }

  static checkStripeSubscription(subscription: Stripe.Response<StripeSubscriptionInterface>): void {
    if (!subscription) {
      throw new HttpException(ERRORS_REQUEST.STRIPE_SUBSCRIPTION_IS_NOT_EXIST, HttpStatus.BAD_REQUEST)
    }
  }

  static checkMonthStripeSubscription(subscription: StripeSubscription): void {
    if (subscription?.plan === PLANS.MONTH) {
      throw new HttpException(ERRORS_REQUEST.MONTH_SUBSCRIPTION_ALREADY_EXIST, HttpStatus.BAD_REQUEST)
    }
  }

  static checkYearStripeSubscription(subscription: StripeSubscription): void {
    if (subscription?.plan === PLANS.YEAR) {
      throw new HttpException(ERRORS_REQUEST.YEAR_SUBSCRIPTION_ALREADY_EXIST, HttpStatus.BAD_REQUEST)
    }
  }
}
