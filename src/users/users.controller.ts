import { Controller, Get, Body, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard())
@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    /**
     * Returns user profile
     * @param req Request object
     */
    @Get('me')
    async findUserById(@Request() req) {
        return req.user;
    }

    /**
     * Updates user then returns updated user profile
     * @param req Request object
     * @param {UpdateUserDto} updateUserDto User fields to update
     */
    @Patch('me')
    async updateUser(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return await this.usersService.updateUser(req.user._id, updateUserDto);
    }

    /**
     * Deletes logged-in user from the database and returns the profile
     * of the deleted user
     * @param req Request object
     */
    @Delete('me')
    async deleteUser(@Request() req) {
        return await this.usersService.deleteUser(req.user._id);
    }
}
