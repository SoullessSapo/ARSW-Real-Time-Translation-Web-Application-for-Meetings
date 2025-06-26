import { IsString, IsEmail, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsString()
  @Length(2, 10)
  language: string;
}
