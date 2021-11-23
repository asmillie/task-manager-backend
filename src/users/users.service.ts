import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as sharp from 'sharp';

@Injectable()
export class UsersService {

    private logger = new Logger('UsersService');

    constructor(
        @InjectModel('User') private readonly userModel: Model<User>) {}

    /**
     * Creates a new user in the database
     * @param {CreateUserDto} createUserDto User to be created
     * @throws {InternalServerErrorException} if an error occurs while saving user
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            return await this.userModel.create(createUserDto);
        } catch (e) {
            this.logger.error(
                `Failed to create user. DTO: ${JSON.stringify(createUserDto)}`,
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Finds user by id
     * @param userId Id to search for
     * @throws {InternalServerErrorException} if an error occurs while finding user
     */
    async findUserById(userId: string): Promise<User> {
        try {
            return await this.userModel.findById(userId);
        } catch (e) {
            this.logger.error(
                `Failed to find user by id ${userId}.`,
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Finds user by email address
     * @param email Email to search for
     * @throws {InternalServerErrorException} if an error occurs while finding user
     */
    async findUserByEmail(email: string): Promise<User> {
        try {
            return await this.userModel.findOne({ 'email': email });
        } catch (e) {
            this.logger.error(
                `Failed to find user by email ${email}.`,
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Updates user fields
     * @param userId Id of user being updated
     * @param {UpdateUserDto} updateUserDto Object containing updated fields
     * @throws {InternalServerErrorException} if an error occurs during update
     */
    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            return await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
        } catch (e) {
            this.logger.error(
                `Failed to update user. Error: ${e}. User Id ${userId}, DTO: ${JSON.stringify(updateUserDto)}`,
            );
            throw new InternalServerErrorException();
        }
    }
    // TODO: Test cascade deletion of tasks owned by user
    /**
     * Deletes a user by id
     * @param userId Id of user to be deleted
     * @throws {InternalServerErrorException} if an error occurs during deletion
     */
    async deleteUser(userId: string): Promise<User> {
        try {
            return await this.userModel.findByIdAndDelete(userId);
        } catch (e) {
            this.logger.error(
                `Failed to delete user for id ${userId}`,
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Resizes avatar image before saving it to user
     * @param userId Id of user to save avatar to
     * @param {Buffer} file Avatar image
     * @throws {BadRequestException} if file is empty
     * @throws {InternalServerErrorException} if an error occurs while resizing image
     * @throws {InternalServerErrorException} if an error occurs while saving image
     */
    async addAvatar(userId: string, file: Buffer): Promise<User> {
        if (!file) {
            throw new BadRequestException('Missing avatar image');
        }

        let avatar: Buffer;
        try {
            avatar = await sharp(file)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        } catch (e) {
            this.logger.error(`Failed to resize avatar image.`);
            throw new InternalServerErrorException();
        }

        const updateUserDto: UpdateUserDto = {
            avatar,
        };

        try {
            return await this.updateUser(userId, updateUserDto);
        } catch (e) {
            this.logger.error(
                `Failed to save avatar image for user id ${userId}.`,
            );
            throw new InternalServerErrorException();
        }
    }

    /**
     * Retrieves user avatar and returns as a Buffer
     * @param userId Id of user to get avatar for
     * @throws {InternalServerErrorException} if an error occurs during find operation
     */
    async getAvatar(userId: string): Promise<Buffer> {
        try {
            return await this.userModel.findById(userId, 'avatar')
                .then(user => {
                    return Buffer.from(user.avatar);
                });
        } catch (e) {
            this.logger.error(`Failed to find avatar for user id ${userId}. Error: ${e}`);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Deletes user avatar
     * @param userId Id of user to delete avatar from
     * @throws {InternalServerErrorException} if an error occurs while deleting image
     */
    async deleteAvatarByUserId(userId: string): Promise<User> {
        const updateUserDto: UpdateUserDto = {
            avatar: undefined,
        };
        try {
            return await this.updateUser(userId, updateUserDto);
        } catch (e) {
            this.logger.error(
                `Failed to delete avatar for user id ${userId}`,
            );
            throw new InternalServerErrorException();
        }
    }
}
