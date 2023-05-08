import { User } from "../../user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum HttpMethod {
    GET = "GET", HEAD = "HEAD", POST = "POST", PUT = "PUT", DELETE = "DELETE", CONNECT = "CONNECT", OPTIONS = "OPTIONS", TRACE = "TRACE", PATCH = "PATCH"
}
@Entity()
export class Monitor {
    @PrimaryGeneratedColumn('uuid')
    resource_id: string

    @Column({ nullable: false })
    monitor_name: string

    @Column({ nullable: false })
    desired_status_code: number

    @Column({ nullable: false })
    endpoint: string

    @Column({
        type: "enum",
        enum: HttpMethod,
        default: HttpMethod.GET,
        nullable: false
    })
    method: HttpMethod

    @Column({ nullable: true })
    request_options?: string

    @Column({ nullable: true, default: '[]' })
    cron_timestamps: string

    @Column({ nullable: true, default: '[]' })
    current_cron_state: string

    @Column({ type: "boolean", nullable: false, default: false })
    is_cron_job_started: boolean

    @ManyToOne(() => User, user => user.monitors)
    @JoinColumn({ name: "id" })
    user: User;

    @Column({ nullable: false })
    id: string;
}