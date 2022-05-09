import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskSchema } from './schemas/task.schema';
import { LoggerService } from '../logs/logger/logger.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [     
      MongooseModule.forFeature([
          { name: 'Task', schema: TaskSchema },
      ]),
      forwardRef(() => UsersModule)
  ],
  providers: [
    TasksService,
    LoggerService
  ],
  controllers: [TasksController],
  exports: [
    TasksService,
  ],
})
export class TasksModule {}
