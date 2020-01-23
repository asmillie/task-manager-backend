import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
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
})
export class TasksModule {}
