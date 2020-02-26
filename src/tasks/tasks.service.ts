import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryOptions } from './classes/task-query-options';

@Injectable()
export class TasksService {

    private logger = new Logger('TasksService');

    constructor(
        @InjectModel('Task') private readonly taskModel: Model<Task>) {}

    /**
     * Creates a new task
     * @param createTaskDto 
     */
    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        try {
            return await this.taskModel.create({
                ...createTaskDto,
            });
        } catch (e) {
            this.logger.error(
                `Failed to create task for user id ${createTaskDto.owner}. DTO: ${JSON.stringify(createTaskDto)}`,
                e.stack,
                );
            throw new InternalServerErrorException();
        }
    }

    async findAllTasksByUserId(
        userId: string,
        completed: boolean,
        taskQueryOptions?: TaskQueryOptions): Promise<Task[]> {

        const conditions = {
            owner: userId,
            completed,
        };

        let options = null;
        if (taskQueryOptions) {
            options = {
                ...taskQueryOptions,
            };
        }

        try {
            return await this.taskModel.find(conditions, null, options);
        } catch (e) {
            this.logger.error(
                `Failed to find all tasks for user id ${userId}. Conditions: ${JSON.stringify(conditions)}, Options: ${JSON.stringify(options)}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async findTask(userId: string, taskId: string): Promise<Task> {
        try {
            return await this.taskModel.findOne({
                _id: taskId,
                owner: userId,
            });
        } catch (e) {
            this.logger.error(
                `Failed to find task id ${taskId} for user id ${userId}.`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async updateTask(userId: string, taskId: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
        const conditions =  {
            owner: userId,
            _id: taskId,
        };

        try {
            return await this.taskModel.findOneAndUpdate(conditions, updateTaskDto, { new: true });
        } catch (e) {
            this.logger.error(
                `Failed to update task id ${taskId} for user id ${userId}. DTO: ${JSON.stringify(updateTaskDto)}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async deleteTask(userId: string, taskId: string): Promise<Task> {
        const conditions = {
            owner: userId,
            _id: taskId,
        };

        try {
            return await this.taskModel.findOneAndDelete(conditions);
        } catch (e) {
            this.logger.error(
                `Failed to delete task id ${taskId} for user id ${userId}. Conditions: ${JSON.stringify(conditions)}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async deleteAllTasksByUserId(userId: string) {
        try {
            return await this.taskModel.deleteMany({ owner: userId });
        } catch (e) {
            this.logger.error(
                `Failed to delete all tasks for user id ${userId}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }
}
