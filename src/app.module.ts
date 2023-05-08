import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServerMonitorModule } from './server-monitor/server-monitor.module';
import { Monitor } from './server-monitor/entities/monitor.entity';
import { NotificationModule } from './notification/email.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      context: ({ req }: any) => ({ headers: req?.headers })
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST_NAME,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: true, // enable SSL/TLS
      extra: {
        ssl: {
          rejectUnauthorized: false, // ignore self-signed certificates
        },
      },
      entities: [User, Monitor],
      synchronize: false,
    }),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    ServerMonitorModule,
    NotificationModule
  ],
})
export class AppModule {
  constructor(private readonly dataSource: DataSource) { }
}
