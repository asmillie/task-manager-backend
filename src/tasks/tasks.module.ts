import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskSchema } from './schemas/task.schema';

@Module({
  imports: [      
      MongooseModule.forFeature([
          { name: 'Task', schema: TaskSchema },
      ]),
      PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [
    TasksService,
  ],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
