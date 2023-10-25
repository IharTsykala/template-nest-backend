import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose'

//models
import { StripeAccount, StripeAccountModelConfig } from '@app/modules/stripe/StripeAccount.model/StripeAccount.model'

enum SubscriptionPlanEnum {
  Day = 'day',
  Month = 'month',
  Year = 'year',
}

export type StripeSubscriptionDocument = HydratedDocument<StripeSubscription>

@Schema({
  timestamps: true,
})
export class StripeSubscription {
  @Prop()
  subscriptionStripeId: string

  @Prop({ type: String, enum: SubscriptionPlanEnum })
  plan: string

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean

  @Prop({
    type: Types.ObjectId,
    ref: StripeAccountModelConfig.name,
  })
  ownerId: StripeAccount

  @Prop({ default: null })
  currentPeriodEnd: string
}

const StripeSubscriptionSchema: MongooseSchema<StripeSubscription> = SchemaFactory.createForClass(StripeSubscription)

export const StripeSubscriptionModelConfig = {
  name: StripeSubscription.name,
  schema: StripeSubscriptionSchema,
}
