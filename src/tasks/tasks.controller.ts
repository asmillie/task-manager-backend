import { Controller, UseGuards, Post, Body, Req, Get, Param, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';
import { TaskQueryOptions } from './classes/task-query-options';

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
        const task = await this.tasksService.findTask(req.user_id, id);
        return task;
    }

    @Get()
    async findAllTasks(
        @Req() req,
        @Query('completed') completed: boolean,
        @Body() taskQueryOptions?: TaskQueryOptions) {
        // TODO: Options for pagination
        return await this.tasksService.findAllTasksByUserId(req.user._id, completed, taskQueryOptions);
    }
}
