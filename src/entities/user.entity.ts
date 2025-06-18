import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { MeetingParticipant } from './meeting-participant.entity.ts';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ length: 10, nullable: true })
  language: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MeetingParticipant, (mp) => mp.user)
  meetings: MeetingParticipant[];
}
