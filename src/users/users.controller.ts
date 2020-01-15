import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard())
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.usersService.create(createUserDto);
    }

    @Get('me')
    async findUserById(@Request() req) {
        return await this.usersService.findUserById(req.user._id);
    }
}
