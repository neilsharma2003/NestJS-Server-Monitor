import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CoreResolver } from './core.resolver';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';

@Module({
  imports: [ConfigModule.forRoot(), GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    playground: true
  }), TypeOrmModule.forRoot({
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
    entities: [],
    synchronize: false
  }), CoreResolver]
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
