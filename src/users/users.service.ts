import { Catch, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { from, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

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
     * Finds user by Auth0 Id
     * @param auth0Id Auth0 Id to search for
     * @throws {InternalServerErrorException} if an error occurs during find operation
     */
    findUserByAuth0Id$(auth0Id: string): Observable<User> {
        return from(this.userModel.findOne({ 'auth0.id': auth0Id }))
            .pipe(
                catchError(e => {
                    this.logger.error(`Error performing find operation: ${e}`);
                    return throwError(() => new InternalServerErrorException());
                })
            );
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
}
