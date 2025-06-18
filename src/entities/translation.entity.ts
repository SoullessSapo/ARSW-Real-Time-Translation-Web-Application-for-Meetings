import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('translations')
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Message, (m) => m.translations)
  message: Message;

  @Column({ length: 10 })
  toLanguage: string;

  @Column({ type: 'text' })
  translatedText: string;

  @Column({ length: 500, nullable: true })
  ttsUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
