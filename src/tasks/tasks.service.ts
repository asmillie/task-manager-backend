import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel('Task') private readonly taskModel: Model<Task>) {}

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        const task = new this.taskModel({
            ...createTaskDto,
        });
        return await this.taskModel.create(task);
    }

    async updateTask(taskId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        return await this.taskModel.findByIdAndUpdate(taskId, updateTaskDto);
    }

    async deleteTask(taskId: string): Promise<Task> {
        return await this.taskModel.findByIdAndDelete(taskId);
    }
}
