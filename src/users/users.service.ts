import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>) {}
    // TODO: Handle error on duplicate email address
    async create(createUserDto: CreateUserDto): Promise<User> {
        if (!createUserDto.password) {
            throw new InternalServerErrorException();
        }

        return await this.userModel.create({
            ...createUserDto,
            password: await this.hashPassword(createUserDto.password),
        });
    }

    async findUserById(userId: string): Promise<User> {
        return await this.userModel.findById(userId);
    }

    async findUserByEmail(email: string): Promise<User> {
        return await this.userModel.findOne({ email });
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        return await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
    }
    // TODO: Test cascade deletion of tasks owned by user
    async deleteUser(userId: string): Promise<User> {
        return await this.userModel.findByIdAndDelete(userId);
    }

    async addToken(userId: string, newToken: string): Promise<User> {
        const user = await this.findUserById(userId);
        const userTokens: Token[] = (user.tokens === undefined) ? [] : user.tokens;
        userTokens.push({ token: newToken });

        return await this.userModel.findByIdAndUpdate(userId, { tokens: userTokens }, { new: true });
    }

    async removeToken(userId: string, tokenToRemove: string): Promise<User> {
        const user = await this.findUserById(userId);
        if (user.tokens === undefined) {
            return;
        }

        const userTokens: Token[] = user.tokens.filter(token => token.token !== tokenToRemove);
        return await this.userModel.findByIdAndUpdate(userId, { tokens: userTokens }, { new: true });
    }

    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 8);
    }

    async addAvatar(userId: string, file: Buffer): Promise<User> {
        const avatar: Buffer = await sharp(file)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();

        const updateUserDto: UpdateUserDto = {
            avatar,
        };

        return await this.updateUser(userId, updateUserDto);
    }

    async deleteAvatarByUserId(userId: string): Promise<User> {
        const updateUserDto: UpdateUserDto = {
            avatar: undefined,
        };

        return await this.updateUser(userId, updateUserDto);
    }
}
