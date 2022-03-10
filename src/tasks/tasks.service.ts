import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskSortOption } from './classes/task-sort-option';
import { TaskQueryOptions } from './classes/task-query-options';
import { TaskPaginationData } from './interfaces/task-paginate.interface';
import { LoggerService } from '../logs/logger/logger.service';
import { DBOperation } from '../constants';

@Injectable()
export class TasksService {

    constructor(
        @InjectModel('Task') private readonly taskModel: Model<Task>,
        private logger: LoggerService) {}
 
    /**
     * Creates a new task
     * @param {string} requestId ID of Request for logging
     * @param {CreateTaskDto} createTaskDto Task to be created
     * @throws {InternalServerErrorException} if an error occurs while creating task
     */
    async create(requestId: string, createTaskDto: CreateTaskDto): Promise<Task> {
        const startTime = this.logger.logDbOperationStart(requestId, TasksService.name, DBOperation.Create);
        try {
            return await this.taskModel.create({
                ...createTaskDto,
                owner: createTaskDto.owner,
            });
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to create task for user id ${createTaskDto.owner}. DTO: ${JSON.stringify(createTaskDto)}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, TasksService.name, DBOperation.Create, startTime);
        }
    }

    /**
     * Finds a slice of user tasks based on submitted
     * search criteria. Tasks are returned along with
     * pagination data.
     * @param {string} requestId ID of Request for logging
     * @param {string} userId Id of user that owns tasks
     * @param {TaskQueryOptions} tqo Search and pagination criteria
     * @throws {InternalServerErrorException} if an error occurs while finding tasks
     */
    async paginateTasksByUserId(
        requestId: string,
        userId: string,
        tqo: TaskQueryOptions): Promise<TaskPaginationData> {

        const conditions = {
            owner: userId,
        };

        if (tqo.startCreatedAt && tqo.endCreatedAt) {
            conditions['createdAt'] = { $gte: tqo.startCreatedAt, $lte: tqo.endCreatedAt };
        } else if (tqo.startCreatedAt) {
            conditions['createdAt'] = { $gte: tqo.startCreatedAt };
        } else if (tqo.endCreatedAt) {
            conditions['createdAt'] = { $lte: tqo.endCreatedAt };
        }

        if (tqo.startUpdatedAt && tqo.endUpdatedAt) {
            conditions['updatedAt'] = { $gte: tqo.startUpdatedAt, $lte: tqo.endUpdatedAt };
        } else if (tqo.startUpdatedAt) {
            conditions['updatedAt'] = { $gte: tqo.startUpdatedAt };
        } else if (tqo.endUpdatedAt) {
            conditions['updatedAt'] = { $lte: tqo.endUpdatedAt };
        }

        if (tqo.completed !== undefined) {
            conditions['completed'] = tqo.completed;
        }

        const sort = {};
        if (tqo.sort) {
            tqo.sort.forEach((sortOpt: TaskSortOption) => {
                if (sortOpt.direction === 'asc') {
                    sort[sortOpt.field] = -1;
                } else {
                    sort[sortOpt.field] = 1;
                }
            });
        } else {
            sort['createdAt'] = 1;
        }

        const opts = {
            limit: tqo.limit,
            skip: (tqo.page - 1) * tqo.limit,
        };

        let totalResults = 0;
        const startTimeCount = this.logger.logDbOperationStart(requestId, TasksService.name, DBOperation.Count);
        try {
            totalResults = await this.taskModel.countDocuments(conditions);
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to retrieve document count. Conditions: ${JSON.stringify(conditions)}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, TasksService.name, DBOperation.Count, startTimeCount);
        }

        let tasks;
        const startTimeFind = this.logger.logDbOperationStart(requestId, TasksService.name, DBOperation.Find);
        try {
            tasks = await this.taskModel.find(conditions, null, opts).sort(sort);
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to find all tasks for user id ${userId}. Conditions: ${JSON.stringify(conditions)}, Sort: ${JSON.stringify(sort)}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, TasksService.name, DBOperation.Find, startTimeFind);
        }

        const pageSize = tqo.limit;
        const totalPages = Math.ceil(totalResults / pageSize);
        const currentPage = tqo.page;

        const data: TaskPaginationData = {
            totalResults,
            totalPages,
            currentPage,
            pageSize,
            tasks,
        };

        return new Promise((resolve, reject) => {
            resolve(data);
        });
    }

    /**
     * Finds a task by id
     * @param {string} requestId ID of Request for logging
     * @param {string} userId Id of user that owns task
     * @param {string} taskId Id of task to find
     * @throws {InternalServerErrorException} if an error occurs while finding task
     */
    async findTask(requestId: string, userId: string, taskId: string): Promise<Task> {
        const startTime = this.logger.logDbOperationStart(requestId, TasksService.name, DBOperation.Find);
        try {
            return await this.taskModel.findOne({
                _id: taskId,
                owner: userId,
            });
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to find task id ${taskId} for user id ${userId}.`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, TasksService.name, DBOperation.Find, startTime);
        }
    }

    /**
     * Updates a task
     * @param {string} requestId ID of Request for logging
     * @param {string} userId Id of user that owns task
     * @param {string} taskId Id of task to update
     * @param {UpdateTaskDto} updateTaskDto Task fields to update
     * @throws {InternalServerErrorException} if an error occurs while updating task
     */
    async updateTask(
        requestId: string,
        userId: string,
        taskId: string,
        updateTaskDto: UpdateTaskDto): Promise<Task> {
        const conditions =  {
            owner: userId,
            _id: taskId,
        };

        const startTime = this.logger.logDbOperationStart(requestId, TasksService.name, DBOperation.Update);
        try {
            return await this.taskModel.findOneAndUpdate(conditions, updateTaskDto, { new: true });
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to update task id ${taskId} for user id ${userId}. DTO: ${JSON.stringify(updateTaskDto)}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, TasksService.name, DBOperation.Update, startTime);
        }
    }

    /**
     * Deletes a task
     * @param {string} requestId ID of Request for logging
     * @param {string} userId Id of user that owns task
     * @param {string} taskId Id of task to delete
     * @throws {InternalServerErrorException} if an error occurs while deleting task
     */
    async deleteTask(requestId: string, userId: string, taskId: string): Promise<Task> {
        const conditions = {
            owner: userId,
            _id: taskId,
        };

        const startTime = this.logger.logDbOperationStart(requestId, TasksService.name, DBOperation.Delete);
        try {
            return await this.taskModel.findOneAndDelete(conditions);
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to delete task id ${taskId} for user id ${userId}. Conditions: ${JSON.stringify(conditions)}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, TasksService.name, DBOperation.Delete, startTime);
        }
    }

    /**
     * Delete all tasks belonging to a user
     * @param {string} requestId ID of Request for logging
     * @param {string} userId Id of user that owns tasks
     * @throws {InternalServerErrorException} if an error occurs while deleting tasks
     */
    async deleteAllTasksByUserId(requestId: string, userId: string) {
        const startTime = this.logger.logDbOperationStart(requestId, TasksService.name, DBOperation.Delete);
        try {
            return await this.taskModel.deleteMany({ owner: userId });
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to delete all tasks for user id ${userId}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, TasksService.name, DBOperation.Delete, startTime);
        }
    }
}
