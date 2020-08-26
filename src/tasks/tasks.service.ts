import { Injectable, BadRequestException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './interfaces/task.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskSortOption } from './classes/task-sort-option';
import { TaskQueryOptions } from './classes/task-query-options';
import { TaskPaginationData } from './interfaces/task-paginate.interface';

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
     * Finds a slice of user tasks based on submitted
     * search criteria. Tasks are returned along with
     * pagination data.
     * @param userId Id of user that owns tasks
     * @param completed Filter tasks by completion status
     * @param taskQueryOptions Search and pagination criteria
     * @throws {InternalServerErrorException} if an error occurs while finding tasks
     */
    async paginateTasksByUserId(
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
        try {
            totalResults = await this.taskModel.countDocuments(conditions);
        } catch (e) {
            this.logger.error(
                `Failed to retrieve document count. Conditions: ${JSON.stringify(conditions)}`,
            );
            throw new InternalServerErrorException();
        }

        let tasks;
        try {
            tasks = await this.taskModel.find(conditions, null, opts).sort(sort);
        } catch (e) {
            this.logger.error(
                `Failed to find all tasks for user id ${userId}. Conditions: ${JSON.stringify(conditions)}, Sort: ${JSON.stringify(sort)}`,
            );
            throw new InternalServerErrorException();
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
