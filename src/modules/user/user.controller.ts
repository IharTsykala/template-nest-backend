import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, UseGuards } from '@nestjs/common'

//services
import { UserService } from '@app/modules/user/user.service'

// dto
import { CreateUserDto } from '@app/modules/user/dto/create-user.dto'
import { UpdateUserDto } from '@app/modules/user/dto/update-user.dto'

@Controller('user')
@UsePipes(new ValidationPipe({ transform: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  postUser(@Body() createUserDto: CreateUserDto) {
    try {
      return this.userService.postUser(createUserDto)
    } catch (err) {
      console.log(err)
    }
  }

  @Get()
  findAll() {
    try {
      return this.userService.findAll()
    } catch (err) {
      console.log(err)
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne({ _id: id })
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id)
  }
}
