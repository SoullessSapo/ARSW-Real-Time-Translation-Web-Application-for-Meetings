// meeting-invitation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Meeting } from './meeting.entity';
import { User } from './user.entity';

@Entity('meeting_invitations')
export class MeetingInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meeting)
  meeting: Meeting;

  @ManyToOne(() => User)
  invited: User;

  @ManyToOne(() => User)
  invitedBy: User;

  @Column({ default: false })
  accepted: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
