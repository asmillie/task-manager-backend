import { Controller, Get, Post, Body, UseGuards, Request, Patch, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(AuthGuard())
@Controller('users')
export class UsersController {

    private multerOptions = {
        limits: {
            fileSize: 1000000,
        },
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
               return cb(new Error('Avatar image must be of the type .jpg, .jpeg or .png'));
            }

            cb(undefined, true)
        },
    };

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

    @Post('me/avatar')
    @UseInterceptors(FileInterceptor('avatar', this.multerOptions))
    async saveAvatar(
        @Request() req,
        @UploadedFile() avatar) {
        return this.usersService.addAvatar(req.user._id, avatar.buffer);
    }

    @Delete('me/avatar')
    async deleteAvatar(@Request() req) {
        return this.usersService.deleteAvatarByUserId(req.user._id);
    }
}
