import { Monitor } from '../../server-monitor/entities/monitor.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Role {
  User = 'USER',
  Admin = 'ADMIN'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
    nullable: false
  })
  role: Role

  @OneToMany(() => Monitor, monitor => monitor.user)
  monitors: Monitor[];
}
