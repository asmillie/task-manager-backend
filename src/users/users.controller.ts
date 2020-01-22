import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard())
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async signup(@Body() userDto: UserDto) {
        // TODO: Restrict to admin-level account
        return await this.usersService.create(userDto);
    }

    @Get('me')
    async findUserById(@Request() req) {
        return await this.usersService.findUserById(req.user._id);
    }
}
