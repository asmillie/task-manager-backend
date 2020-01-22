import { Controller, Get, Post, Body, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(AuthGuard())
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        // TODO: Restrict to admin-level account
        return await this.usersService.create(createUserDto);
    }

    @Get('me')
    async findUserById(@Request() req) {
        return await this.usersService.findUserById(req.user._id);
    }

    @Patch('me')
    async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.updateUser(req.user._id, updateUserDto);
    }

    @Delete('me')
    async deleteUser(@Request() req) {
        return await this.usersService.deleteUser(req.user._id);
    }
}
