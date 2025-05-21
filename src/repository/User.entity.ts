import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { City } from './City.entity';
import { Provider } from './Provider.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  age: number;
  @Column()
  sex: string;
  @Column({ nullable: true })
  email: string;
  @Column()
  phone: string;
  @Column({ nullable: true })
  password: string;
  @Column()
  cityId: number;
  @ManyToOne(() => City)
  @JoinColumn({ name: 'cityId' })
  city: City;
  @Column({ nullable: true, default: null })
  providerId: number;
  @ManyToMany(() => Provider, (provider) => provider.users)
  @JoinTable()
  providers: Provider[];
  @Column({ type: 'boolean', default: false })
  isEmailConfirmed: boolean;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updateAt: Date;
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;
}
