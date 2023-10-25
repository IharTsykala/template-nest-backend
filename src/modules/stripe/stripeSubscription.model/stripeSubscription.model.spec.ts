import { StripeSubscription } from './stripeSubscription.model'

describe('SubscriptionModel', () => {
  it('should be defined', () => {
    expect(new StripeSubscription()).toBeDefined()
  })
})
