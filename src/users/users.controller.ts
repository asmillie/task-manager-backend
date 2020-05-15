import { Controller, Get, Post, Body, UseGuards, Request, Patch, Delete, UseInterceptors, UploadedFile, HttpCode, BadRequestException, Header } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokenOwnershipGuard } from '../auth/token-ownership.guard';

@UseGuards(
    AuthGuard(),
    TokenOwnershipGuard,
)
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

            cb(undefined, true);
        },
    };

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

    /**
     * Saves user avatar to database and then returns user profile
     * @param req Request object
     * @param avatar Uploaded avatar file
     * @throws {BadRequestException} if avatar is missing from request
     */
    @Post('me/avatar')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('avatar', this.multerOptions))
    async saveAvatar(
        @Request() req,
        @UploadedFile() avatar) {
        if (!avatar || !avatar.buffer) {
            throw new BadRequestException('Missing Avatar Image');
        }
        return this.usersService.addAvatar(req.user._id, avatar.buffer);
    }

    /**
     * Returns user avatar in .png format
     * @param req Request object
     */
    @Get('me/avatar')
    @HttpCode(200)
    @Header('Content-Type', 'image/png')
    async getAvatar(@Request() req) {
        return await this.usersService.getAvatar(req.user._id);
    }

    /**
     * Deletes logged-in user avatar
     * @param req Request object
     */
    @Delete('me/avatar')
    async deleteAvatar(@Request() req) {
        return this.usersService.deleteAvatarByUserId(req.user._id);
    }
}
