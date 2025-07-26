import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EntitiesModule } from './entities/entities.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { typeOrmConfig } from './config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { MeetingsModule } from './meeting/meeting.module';
import { UserModule } from './user/user.module';
import { FriendshipModule } from './friendship/friendship.module';
import { GatewayModule } from './gateways/gateway.module';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    EntitiesModule,
    AuthModule,
    MeetingsModule,
    UserModule,
    AuthModule,
    FriendshipModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
