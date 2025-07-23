import { Module } from '@nestjs/common';
import { TranslationGateway } from './translation.gateway';
import { NotificationsGateway } from './notifications.gateway';
import { SignalingGateway } from './SignalingGateway.gateway';

@Module({
  providers: [TranslationGateway, NotificationsGateway, SignalingGateway],
  exports: [TranslationGateway, NotificationsGateway, SignalingGateway],
})
export class GatewayModule {}
