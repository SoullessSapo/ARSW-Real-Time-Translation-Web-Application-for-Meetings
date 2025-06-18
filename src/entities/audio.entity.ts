import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('audio')
export class Audio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (m) => m.audios)
  message: Message;

  @Column({ length: 500 })
  url: string;

  @CreateDateColumn()
  createdAt: Date;
}
