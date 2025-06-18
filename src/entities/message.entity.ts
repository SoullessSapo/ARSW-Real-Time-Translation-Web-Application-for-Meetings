import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Meeting } from './meeting.entity';
import { User } from './user.entity';
import { Translation } from './translation.entity';
import { Audio } from './audio.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meeting, (m) => m.messages)
  meeting: Meeting;

  @ManyToOne(() => User)
  user: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 20 })
  type: 'text' | 'voice' | 'system';

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Translation, (t) => t.message)
  translations: Translation[];

  @OneToMany(() => Audio, (a) => a.message)
  audios: Audio[];
}
