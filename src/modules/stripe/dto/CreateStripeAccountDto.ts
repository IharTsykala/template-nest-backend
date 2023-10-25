import { IsEmail, IsNotEmpty } from 'class-validator'

export class CreateStripeAccountDto {
  @IsEmail()
  @IsNotEmpty()
  email: string
}
