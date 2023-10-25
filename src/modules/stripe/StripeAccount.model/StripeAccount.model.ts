import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

//models
import { User, UserModelConfig } from '@app/modules/user/user.model/user.model'

export type StripeAccountDocument = HydratedDocument<StripeAccount>

@Schema({
  timestamps: true,
})
export class StripeAccount {
  @Prop()
  stripeId: string

  @Prop({ default: null })
  checkoutSessionId: string

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: UserModelConfig.name })
  ownerId: User
}

const StripeAccountSchema: MongooseSchema<StripeAccount> = SchemaFactory.createForClass(StripeAccount)

export const StripeAccountModelConfig = { name: StripeAccount.name, schema: StripeAccountSchema }
