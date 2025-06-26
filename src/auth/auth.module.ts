import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { EntitiesModule } from '../entities/entities.module'; // Ajusta según tu estructura
import { AuthController } from './auth.controller'; // Asegúrate de tener un controlador si es necesario

@Module({
  imports: [
    EntitiesModule,
    PassportModule,
    JwtModule.register({
      secret: 'MY_JWT_SECRET', // ponlo en variables de entorno en producción
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController], // Aquí puedes agregar tus controladores si los tienes
  exports: [AuthService],
})
export class AuthModule {}
