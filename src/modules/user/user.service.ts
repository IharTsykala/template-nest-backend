import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'

import { Model, Types } from 'mongoose'

//models
import { UserModelConfig, UserDocument, User } from '@app/modules/user/user.model/user.model'

//dto
import { CreateUserDto } from '@app/modules/user/dto/create-user.dto'
import { UpdateUserDto } from '@app/modules/user/dto/update-user.dto'

//constants
import { DATES } from '@app/constants'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModelConfig.name)
    private readonly userModel: Model<UserDocument>,
    private configService: ConfigService
  ) {}

  async postUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const daysTrial: number = this.configService.get<number>('DAYS_TRIAL_NEW_USER')

    const endTrial: Date = new Date(new Date().getTime() + daysTrial * DATES.ONE_DAY_MILLISECONDS)

    const createdUser = new this.userModel({ ...createUserDto, endTrial })

    return await createdUser.save()
  }

  findAll() {
    return this.userModel.find().exec()
  }

  findOne(props: Partial<User> | { _id: Types.ObjectId | string }) {
    return this.userModel.findOne({ ...props })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }
}
