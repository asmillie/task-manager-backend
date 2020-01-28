import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryOptions } from './classes/task-query-options';

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

    async findAllTasksByUserId(
        userId: string,
        completed: boolean,
        taskQueryOptions?: TaskQueryOptions): Promise<Task[]> {

        const conditions = {
            owner: userId,
            completed,
        };

        if (taskQueryOptions) {
            const options = {
                ...taskQueryOptions,
            };

            return await this.taskModel.find(conditions, null, options);
        }

        return await this.taskModel.find(conditions);
    }

    async findTask(userId: string, taskId: string): Promise<Task> {
        return await this.taskModel.findOne(new this.taskModel({
            _id: taskId,
            owner: userId,
        }));
    }

    async updateTask(userId: string, taskId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const conditions =  {
            owner: userId,
            _id: taskId,
        };

        return await this.taskModel.findOneAndUpdate(conditions, updateTaskDto, { new: true });
    }

    async deleteTask(userId: string, taskId: string): Promise<Task> {
        const conditions = {
            owner: userId,
            _id: taskId,
        };

        return await this.taskModel.findOneAndDelete(conditions);
    }

    async deleteAllTasksByUserId(userId: string) {
        return await this.taskModel.deleteMany({ owner: userId });
    }
}
