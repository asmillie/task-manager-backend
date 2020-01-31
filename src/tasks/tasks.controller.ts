import { Controller, UseGuards, Post, Body, Req, Get, Param, Query, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { TaskQueryOptions } from './classes/task-query-options';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(AuthGuard())
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    async createTask(@Req() req, @Body() createTaskDto: CreateTaskDto) {
        createTaskDto.owner = req.user._id;
        return await this.tasksService.create(createTaskDto);
    }

    @Get(':id')
    async findTask(@Req() req, @Param('id') id: string) {
        const task = await this.tasksService.findTask(req.user._id, id);
        return task;
    }

    @Get()
    async findAllTasks(
        @Req() req,
        @Query('completed') completed: boolean,
        @Body() taskQueryOptions?: TaskQueryOptions) {
        return await this.tasksService.findAllTasksByUserId(req.user._id, completed, taskQueryOptions);
    }

    @Patch(':id')
    async updateTask(
        @Req() req,
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto) {
        return await this.tasksService.updateTask(req.user._id, id, updateTaskDto);
    }

    @Delete(':id')
    async deleteTask(
        @Req() req,
        @Param('id') id: string) {
        return await this.tasksService.deleteTask(req.user._id, id);
    }

    @Delete()
    async deleteAllUserTasks(@Req() req) {
        return await this.tasksService.deleteAllTasksByUserId(req.user._id);
    }
}
