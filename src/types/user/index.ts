import { Types } from 'mongoose'

//models
import { User } from 'src/modules/user/user.model/user.model'

export type UserFindOneType = Partial<User> | { _id: Types.ObjectId | string }
