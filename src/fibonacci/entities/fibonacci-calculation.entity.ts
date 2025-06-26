export class Fibonacci {}
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('fibonacci_calculations')
@Index(['userId', 'index'], { unique: true }) // Prevent duplicate calculations for same user and index
export class FibonacciCalculation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  index: number;

  @Column('text')
  result: string; // Store as string to handle large numbers

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.calculations)
  @JoinColumn({ name: 'userId' })
  user: User;
}
