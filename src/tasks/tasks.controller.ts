import { Controller, Post, Body, Req, Param, Patch, Delete, HttpCode, UseInterceptors } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryOptions } from './classes/task-query-options';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { RequestId } from '../decorators/request-id.decorator';

@Controller('tasks')
@UseInterceptors(UserInterceptor)
export class TasksController {

    constructor(private readonly tasksService: TasksService) {}

    /**
     * Creates a task for logged-in user and returns task in
     * response
     * @param req Request object
     * @param {CreateTaskDto} createTaskDto Task to be created
     */
    @Post()    
    async createTask(
        @Req() req,
        @RequestId() requestId: string,
        @Body() createTaskDto: CreateTaskDto) {
        createTaskDto.owner = req.user._id;
        return await this.tasksService.create(requestId, createTaskDto);
    }

    /**
     * Finds a task by id belonging to user
     * @param req Request object
     * @param id Id of task to find
     */
    @HttpCode(200)
    @Post('/search/:id')
    async findTask(
        @Req() req,
        @RequestId() requestId: string,
        @Param('id') id: string) {
        const task = await this.tasksService.findTask(requestId, req.user._id, id);
        return task;
    }

    /**
     * Finds and returns a slice of tasks owned by logged-in user
     * @param req Request object
     * @param completed Filter tasks by completion status
     * @param taskQueryOptions Search and pagination criteria for tasks
     */
    @HttpCode(200)
    @Post('/search')
    async paginateTasks(
        @Req() req,
        @RequestId() requestId: string,
        @Body() tqo: TaskQueryOptions) {        
        return await this.tasksService.paginateTasksByUserId(requestId, req.user._id, tqo);
    }

    /**
     * Updates and returns a task belonging to logged-in user
     * @param req Request object
     * @param id Id of task to update
     * @param {UpdateTaskDto} updateTaskDto Task fields to update
     */
    @Patch(':id')
    async updateTask(
        @Req() req,
        @RequestId() requestId: string,
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto) {
        return await this.tasksService.updateTask(requestId, req.user._id, id, updateTaskDto);
    }

    /**
     * Deletes a task belonging to currently logged-in user. Deleted
     * task is returned in the response.
     * @param req Request object
     * @param id Id of task to delete
     */
    @Delete(':id')
    async deleteTask(
        @Req() req,
        @RequestId() requestId: string,
        @Param('id') id: string) {
        return await this.tasksService.deleteTask(requestId, req.user._id, id);
    }

    /**
     * Deletes all tasks belonging to currently logged-in user
     * @param req Request object
     */
    @Delete()
    async deleteAllUserTasks(@Req() req, @RequestId() requestId: string) {
        return await this.tasksService.deleteAllTasksByUserId(requestId, req.user._id);
    }
}
