// src/user/user.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(registerDto: RegisterDto) {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Create user entity
    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      passwordHash,
      language: registerDto.language,
    });

    // Save user
    await this.userRepository.save(user);

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  async update(currentUser: User, id: string, dto: UpdateUserDto) {
    if (currentUser.id !== id)
      throw new ForbiddenException('You can only update your own profile');
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.password) {
      dto['passwordHash'] = await bcrypt.hash(dto.password, 10);
      delete dto.password;
    }
    Object.assign(user, dto);
    await this.userRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  async remove(currentUser: User, id: string) {
    if (currentUser.id !== id)
      throw new ForbiddenException('You can only delete your own profile');
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepository.remove(user);
    return { deleted: true };
  }
}
