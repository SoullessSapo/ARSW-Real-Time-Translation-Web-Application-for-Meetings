// src/user/user.controller.ts
import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyProfile(@GetUser() user: User) {
    return this.userService.findOne(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMyProfile(@GetUser() user: User, @Body() dto: UpdateUserDto) {
    return this.userService.update(user, user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteMyProfile(@GetUser() user: User) {
    return this.userService.remove(user, user.id);
  }
}
