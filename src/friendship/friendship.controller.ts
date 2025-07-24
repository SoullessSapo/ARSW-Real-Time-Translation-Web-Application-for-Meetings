import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendshipService } from './friendship.service';
import { AddFriendDto, AcceptFriendshipDto } from '../meeting/dto/meeting.dto';

@UseGuards(JwtAuthGuard)
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('request')
  async addFriend(
    @Request() req: { user: { id: string } },
    @Body() dto: AddFriendDto,
  ) {
    return this.friendshipService.addFriend(
      String(req.user.id),
      String(dto.addresseeName),
    );
  }

  @Post('accept')
  async acceptFriendship(
    @Request() req: { user: { id: string } },
    @Body() dto: AcceptFriendshipDto,
  ) {
    return this.friendshipService.acceptFriendship(
      String(dto.requesterId),
      String(req.user.id),
    );
  }
  @Post('reject')
  async rejectFriendship(
    @Request() req: { user: { id: string } },
    @Body() dto: { requesterName: string },
  ) {
    return this.friendshipService.rejectFriendship(
      dto.requesterName,
      req.user.id,
    );
  }

  @Get('list')
  async listFriends(@Request() req: { user: { id: string } }) {
    return this.friendshipService.listFriends(req.user.id);
  }

  @Get('requests')
  async listPendingFriendRequests(@Request() req: { user: { id: string } }) {
    return this.friendshipService.listPendingFriendRequests(req.user.id);
  }
}
