import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryOptions } from './classes/task-query-options';
import { TaskSortOption } from './classes/task-sort-option';
import { TaskSearchOptions } from './classes/task-search-options';

@Injectable()
export class TasksService {

    private logger = new Logger('TasksService');

    constructor(
        @InjectModel('Task') private readonly taskModel: Model<Task>) {}

    /**
     * Creates a new task
     * @param {CreateTaskDto} createTaskDto Task to be created
     * @throws {InternalServerErrorException} if an error occurs while creating task
     */
    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        try {
            return await this.taskModel.create({
                ...createTaskDto,
                owner: createTaskDto.owner,
            });
        } catch (e) {
            this.logger.error(
                `Failed to create task for user id ${createTaskDto.owner}. DTO: ${JSON.stringify(createTaskDto)}`,
                );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Finds all tasks for a user based on submitted
     * search criteria
     * @param userId Id of user that owns tasks
     * @param completed Filter tasks by completion status
     * @param taskQueryOptions Task fields search criteria
     * @throws {InternalServerErrorException} if an error occurs while finding tasks
     */
    async findAllTasksByUserId(
        userId: string,
        taskSearchOptions: TaskSearchOptions): Promise<Task[]> {

        const conditions = {
            owner: userId,
        };

        if (taskSearchOptions.startCreatedAt && taskSearchOptions.endCreatedAt) {
            conditions['createdAt'] = { $gte: taskSearchOptions.startCreatedAt, $lte: taskSearchOptions.endCreatedAt };
        } else if (taskSearchOptions.startCreatedAt) {
            conditions['createdAt'] = { $gte: taskSearchOptions.startCreatedAt };
        } else if (taskSearchOptions.endCreatedAt) {
            conditions['createdAt'] = { $lte: taskSearchOptions.endCreatedAt };
        }

        if (taskSearchOptions.startUpdatedAt && taskSearchOptions.endUpdatedAt) {
            conditions['updatedAt'] = { $gte: taskSearchOptions.startUpdatedAt, $lte: taskSearchOptions.endUpdatedAt };
        } else if (taskSearchOptions.startUpdatedAt) {
            conditions['updatedAt'] = { $gte: taskSearchOptions.startUpdatedAt };
        } else if (taskSearchOptions.endUpdatedAt) {
            conditions['updatedAt'] = { $lte: taskSearchOptions.endUpdatedAt };
        }

        if (taskSearchOptions.completed !== undefined) {
            conditions['completed'] = taskSearchOptions.completed;
        }

        let sort = '';
        if (taskSearchOptions.tqo.sort) {
            taskSearchOptions.tqo.sort.forEach((tso: TaskSortOption) => {
                if (tso.direction === 'asc') {
                    sort += `'-${tso.field}', `;
                } else {
                    sort += `'${tso.field}', `;
                }
            });
        } else {
            sort = 'createdAt';
        }

        try {
            return await this.taskModel.find(conditions, null, { ...taskSearchOptions.tqo, sort });
        } catch (e) {
            this.logger.error(
                `Failed to find all tasks for user id ${userId}. Conditions: ${JSON.stringify(conditions)}, Sort: ${JSON.stringify(sort)}`,
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Finds a task by id
     * @param userId Id of user that owns task
     * @param taskId Id of task to find
     * @throws {InternalServerErrorException} if an error occurs while finding task
     */
    async findTask(userId: string, taskId: string): Promise<Task> {
        try {
            return await this.taskModel.findOne({
                _id: taskId,
                owner: userId,
            });
        } catch (e) {
            this.logger.error(
                `Failed to find task id ${taskId} for user id ${userId}.`,
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Updates a task
     * @param userId Id of user that owns task
     * @param taskId Id of task to update
     * @param {UpdateTaskDto} updateTaskDto Task fields to update
     * @throws {InternalServerErrorException} if an error occurs while updating task
     */
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
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Deletes a task
     * @param userId Id of user that owns task
     * @param taskId Id of task to delete
     * @throws {InternalServerErrorException} if an error occurs while deleting task
     */
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
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Delete all tasks belonging to a user
     * @param userId Id of user that owns tasks
     * @throws {InternalServerErrorException} if an error occurs while deleting tasks
     */
    async deleteAllTasksByUserId(userId: string) {
        try {
            return await this.taskModel.deleteMany({ owner: userId });
        } catch (e) {
            this.logger.error(
                `Failed to delete all tasks for user id ${userId}`,
            );
            throw new InternalServerErrorException();
        }
    }
}
