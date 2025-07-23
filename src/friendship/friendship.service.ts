import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Friendship } from '../entities/friendship.entity';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Friendship)
    private friendshipRepo: Repository<Friendship>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async addFriend(requesterId: string, addresseeName: string) {
    const requester = await this.userRepo.findOne({
      where: { id: requesterId },
    });
    console.log('Requester:', requester);
    console.log('Addressee Name:', addresseeName);
    const addressee = await this.userRepo.findOne({
      where: { name: addresseeName },
    });
    console.log('Addressee:', addressee);
    if (!requester || !addressee) {
      throw new NotFoundException('Requester or addressee not found');
    }
    if (requester.id === addressee.id)
      throw new BadRequestException('Cannot add yourself');
    const existing = await this.friendshipRepo.findOne({
      where: [
        { requester: { id: requester.id }, addressee: { id: addressee.id } },
        { requester: { id: addressee.id }, addressee: { id: requester.id } },
      ],
    });
    if (existing) throw new BadRequestException('Friendship already exists');
    const friendship = this.friendshipRepo.create({
      requester: requester,
      addressee: addressee,
      accepted: false,
    });
    const saved = await this.friendshipRepo.save(friendship);
    this.notificationsGateway.notifyFriendRequest(addressee.id, requester.name);
    return saved;
  }

  async acceptFriendship(requesterId: string, addresseeId: string) {
    const friendship = await this.friendshipRepo.findOne({
      where: {
        requester: { id: requesterId },
        addressee: { id: addresseeId },
        accepted: false,
      },
    });
    if (!friendship)
      throw new NotFoundException('Friendship request not found');
    friendship.accepted = true;
    return this.friendshipRepo.save(friendship);
  }

  async listFriends(userId: string) {
    const friendships = await this.friendshipRepo.find({
      where: [
        { requester: { id: userId }, accepted: true },
        { addressee: { id: userId }, accepted: true },
      ],
      relations: ['requester', 'addressee'],
    });
    return friendships.map((f) => {
      const friend = f.requester.id === userId ? f.addressee : f.requester;
      return {
        id: friend.id, // <---- AGREGADO
        name: friend.name,
        email: friend.email,
        language: friend.language,
      };
    });
  }

  async listPendingFriendRequests(userId: string) {
    const requests = await this.friendshipRepo.find({
      where: { addressee: { id: userId }, accepted: false },
      relations: ['requester'],
    });
    return requests.map((f) => ({
      name: f.requester.name,
      email: f.requester.email,
      language: f.requester.language,
    }));
  }
}
