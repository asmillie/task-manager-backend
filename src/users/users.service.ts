import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { Token } from './interfaces/token.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>) {}
    // TODO: Handle error on duplicate email address
    async create(userDto: UserDto): Promise<User> {
        const createdUser = new this.userModel({
            ...userDto,
            password: await this.hashPassword(userDto.password),
        });
        return await createdUser.save();
    }

    async findAll(): Promise<User[]> {
        return await this.userModel.find().exec();
    }

    async findUserById(userId: string): Promise<User> {
        return await this.userModel.findById(userId);
    }

    async findUserByEmail(email: string): Promise<User> {
        return await this.userModel.findOne({ email });
    }

    async updateUser(userId: string, userDto: UserDto): Promise<User> {
        return await this.userModel.findByIdAndUpdate(userId, userDto, { new: true });
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

    async hashPassword(password: string) {
        return await bcrypt.hash(password, 8);
    }
}
