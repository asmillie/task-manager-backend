import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskSchema } from './schemas/task.schema';

@Module({
  imports: [      
      MongooseModule.forFeature([
          { name: 'Task', schema: TaskSchema },
      ]),
  ],
  providers: [
    TasksService,
  ],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
