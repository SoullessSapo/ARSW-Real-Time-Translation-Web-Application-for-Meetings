import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'MY_JWT_SECRET', // igual que en el módulo
    });
  }

  async validate(payload: any) {
    // Aquí puedes traer el usuario completo y agregarlo al request
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) return null;
    // lo que retornes aquí va a req.user en el controlador
    const { passwordHash, ...result } = user;
    return result;
  }
}
