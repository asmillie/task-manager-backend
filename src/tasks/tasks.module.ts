import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskSchema } from './schemas/task.schema';
import { Auth0Service } from '../auth/auth0/auth0.service';
import { UsersModule } from '../users/users.module';
import { LoggerService } from '../logs/logger/logger.service';

@Module({
  imports: [ 
      UsersModule,     
      MongooseModule.forFeature([
          { name: 'Task', schema: TaskSchema },
      ]),
  ],
  providers: [
    TasksService,
    Auth0Service,
    LoggerService
  ],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
