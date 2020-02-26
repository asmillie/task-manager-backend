import { Injectable, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Token } from './interfaces/token.interface';
import * as sharp from 'sharp';

@Injectable()
export class UsersService {

    private logger = new Logger('UsersService');

    constructor(
        @InjectModel('User') private readonly userModel: Model<User>) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const password = await this.hashPassword(createUserDto.password);
        try {
            return await this.userModel.create({
                ...createUserDto,
                password,
            });
        } catch (e) {
            this.logger.error(
                `Failed to create user. DTO: ${JSON.stringify(createUserDto)}`,
            )
            throw new InternalServerErrorException();
        }
    }

    async findUserById(userId: string): Promise<User> {
        try {
            return await this.userModel.findById(userId);
        } catch (e) {
            this.logger.error(
                `Failed to find user by id ${userId}.`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async findUserByEmail(email: string): Promise<User> {
        try {
            return await this.userModel.findOne({ email });
        } catch (e) {
            this.logger.error(
                `Failed to find user by email ${email}.`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            return await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
        } catch (e) {
            this.logger.error(
                `Failed to update user. User Id ${userId}, DTO: ${JSON.stringify(updateUserDto)}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }
    // TODO: Test cascade deletion of tasks owned by user
    async deleteUser(userId: string): Promise<User> {
        try {
            return await this.userModel.findByIdAndDelete(userId);
        } catch (e) {
            this.logger.error(
                `Failed to delete user for id ${userId}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async addToken(user: User, newToken: string): Promise<User> {
        const userTokens: Token[] = (user.tokens === undefined) ? [] : user.tokens;
        userTokens.push({ token: newToken });

        try {
            return await this.userModel.findByIdAndUpdate(user._id, { tokens: userTokens }, { new: true });
        } catch (e) {
            this.logger.error(
                `Failed to save token to user. User: ${JSON.stringify(user)},
                 New Auth Token: ${newToken}, User Tokens: ${JSON.stringify(userTokens)}`,
                 e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async removeToken(user: User, tokenToRemove: string): Promise<User> {
        if (user.tokens === undefined) {
            throw new BadRequestException('User is already logged out');
        }

        const userTokens: Token[] = user.tokens.filter(token => token.token !== tokenToRemove);
        try {
            return await this.userModel.findByIdAndUpdate(user._id, { tokens: userTokens }, { new: true });
        } catch (e) {
            this.logger.error(
                `Failed to remove token from user. User: ${JSON.stringify(user)}, Auth Token: ${tokenToRemove}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async hashPassword(password: string): Promise<string> {
        try {
            return await bcrypt.hash(password, 8);
        } catch (e) {
            this.logger.error(
                `Failed to hash password.`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

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
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }

    async deleteAvatarByUserId(userId: string): Promise<User> {
        const updateUserDto: UpdateUserDto = {
            avatar: undefined,
        };
        try {
            return await this.updateUser(userId, updateUserDto);
        } catch (e) {
            this.logger.error(
                `Failed to delete avatar for user id ${userId}`,
                e.stack,
            );
            throw new InternalServerErrorException();
        }
    }
}
