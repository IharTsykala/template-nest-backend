export const ERRORS_REQUEST = {
  EMAIL_IS_NOT_PROVIDED: 'Email is not provided',
  EMAIL_IS_NOT_EXIST: 'Email is not exist',
  USER_IS_NOT_EXIST_IN_STRIPE_USER: 'User is not exist in stripe account table',
  USER_IS_NOT_EXIST_IN_STRIPE_SERVICE: 'User is not exist in stripe service',
  SESSION_IS_OPENED: 'Session already is opened',
  USER_DONT_HAVE_SUBSCRIPTIONS: "User don't have subscriptions",
  SESSION_IS_NOT_EXIST: 'Session is not exist',
  STRIPE_SUBSCRIPTION_IS_NOT_EXIST: 'Stripe subscription is not exist',
  MONTH_SUBSCRIPTION_ALREADY_EXIST: 'User already has a month subscription',
  YEAR_SUBSCRIPTION_ALREADY_EXIST: 'User already has a year subscription',
}

export const PLANS = {
  MONTH: 'month',
  YEAR: 'year',
}

export const WEBHOOK_TYPES = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CHECKOUT_SESSION_UPDATED: 'customer.subscription.updated',
}

export const START_DELETED_INDEXES = {
  ALL_ITEMS: 0,
  OLD_ITEMS: 1,
}

export const rowBodyPaths = ['/api/stripe/webhook-paid', '/api/stripe/webhook-updated', '/api/stripe/webhook-canceled']

export const prohibitedFieldsReturn = ['password', 'previousPassword']
