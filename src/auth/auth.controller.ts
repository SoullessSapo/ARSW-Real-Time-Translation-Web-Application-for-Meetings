import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GetUser } from './get-user.decorator';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto'; // Ajusta el path según tu estructura
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.authService.login(user);
  }

  // Protected route example
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@GetUser() user: User) {
    return user;
  }
}
