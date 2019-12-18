import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>) {}
    // TODO: Handle error on duplicate email address
    async create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = new this.userModel(createUserDto);
        // await this.authService.generateAuthToken(createdUser.id.toString()).then(token => {
        //     createdUser.tokens.concat([{ token }]);
        // }).catch(err => {
        //     throw new UnauthorizedException();
        // });

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
}
