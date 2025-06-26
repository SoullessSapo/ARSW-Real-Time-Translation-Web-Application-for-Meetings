import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MeetingParticipant } from './meeting-participant.entity';
import { Message } from './message.entity';
import { Summary } from './summary.entity';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
  @Column({ length: 20, default: 'public' }) // valores: 'public', 'private', 'friends'
  type: string;
  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;
  @Column({ type: 'timestamp', nullable: true })
  pendingDeleteAt: Date | null;
  @OneToMany(() => MeetingParticipant, (mp) => mp.meeting)
  participants: MeetingParticipant[];

  @OneToMany(() => Message, (m) => m.meeting)
  messages: Message[];

  @OneToOne(() => Summary, (s) => s.meeting, { nullable: true, cascade: true })
  @JoinColumn({ name: 'summary_id' })
  summary: Summary;

  @CreateDateColumn()
  createdAt: Date;
}
