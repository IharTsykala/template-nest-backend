import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  firstName: string

  @Prop()
  lastName: string

  @Prop({ unique: true })
  email: string

  @Prop({ default: null })
  endTrial: Date
}

const UserSchema: MongooseSchema<User> = SchemaFactory.createForClass(User)

export const UserModelConfig = { name: User.name, schema: UserSchema }
