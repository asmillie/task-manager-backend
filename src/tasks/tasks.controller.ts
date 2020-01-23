import { Controller, UseGuards, Post, Body, UsePipes, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksService } from './tasks.service';

@UseGuards(AuthGuard())
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    async createTask(@Req() req, @Body() createTaskDto: CreateTaskDto) {
        createTaskDto.owner = req.user._id;
        return await this.tasksService.create(createTaskDto);
    }
}
