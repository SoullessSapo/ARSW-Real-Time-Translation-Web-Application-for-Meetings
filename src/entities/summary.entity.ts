import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  CreateDateColumn,
} from 'typeorm';
import { Meeting } from './meeting.entity';

@Entity('summaries')
export class Summary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Meeting, (m) => m.summary)
  meeting: Meeting;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 20 })
  generatedBy: 'AI' | 'user';

  @CreateDateColumn()
  createdAt: Date;
}
