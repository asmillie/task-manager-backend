import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { from, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggerService } from '../logs/logger/logger.service';
import { DBOperation } from '../constants';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private logger: LoggerService) {}

    /**
     * Creates a new user in the database
     * @param {string} requestId ID of Request for logging
     * @param {CreateUserDto} createUserDto User to be created
     * @throws {InternalServerErrorException} if an error occurs while saving user
     */
    async create(requestId: string, createUserDto: CreateUserDto): Promise<User> {
        const startTime = this.logger.logDbOperationStart(requestId, UsersService.name, DBOperation.Create);
        try {
            return await this.userModel.create(createUserDto);
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to create user. DTO: ${JSON.stringify(createUserDto)}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, UsersService.name, DBOperation.Create, startTime);
        }
    }

    /**
     * Finds user by id
     * @param {string} requestId ID of Request for logging
     * @param userId Id to search for
     * @throws {InternalServerErrorException} if an error occurs while finding user
     */
    async findUserById(requestId: string, userId: string): Promise<User> {
        const startTime = this.logger.logDbOperationStart(requestId, UsersService.name, DBOperation.Find);
        try {
            return await this.userModel.findById(userId);
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to find user by id ${userId}.`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, UsersService.name, DBOperation.Find, startTime);
        }
    }

    /**
     * Finds user by Auth0 Id
     * @param {string} requestId ID of Request for logging
     * @param auth0Id Auth0 Id to search for
     * @throws {InternalServerErrorException} if an error occurs during find operation
     */
    findUserByAuth0Id$(requestId: string, auth0Id: string): Observable<User> {
        const startTime = this.logger.logDbOperationStart(requestId, UsersService.name, DBOperation.Find);
        return from(this.userModel.findOne({ 'auth0.id': auth0Id }))
            .pipe(
                catchError(e => {
                    this.logger.getLogger().error({
                        message: `Error performing find operation: ${e}`,
                        requestId
                    });
                    return throwError(() => new InternalServerErrorException());
                }),
                tap(() => {
                    this.logger.logDbOperationEnd(requestId, UsersService.name, DBOperation.Find, startTime);
                })
            );
    }

    /**
     * Finds user by email address
     * @param {string} requestId ID of Request for logging
     * @param email Email to search for
     * @throws {InternalServerErrorException} if an error occurs while finding user
     */
    async findUserByEmail(requestId: string, email: string): Promise<User> {
        const startTime = this.logger.logDbOperationStart(requestId, UsersService.name, DBOperation.Find);
        try {
            return await this.userModel.findOne({ 'email': email });
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to find user by email ${email}.`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, UsersService.name, DBOperation.Find, startTime);
        }
    }

    /**
     * Updates user fields
     * @param {string} requestId ID of Request for logging
     * @param userId Id of user being updated
     * @param {UpdateUserDto} updateUserDto Object containing updated fields
     * @throws {InternalServerErrorException} if an error occurs during update
     */
    async updateUser(requestId: string, userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        const startTime = this.logger.logDbOperationStart(requestId, UsersService.name, DBOperation.Update);
        try {
            return await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true });
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to update user. Error: ${e}. User Id ${userId}, DTO: ${JSON.stringify(updateUserDto)}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, UsersService.name, DBOperation.Update, startTime);
        }
    }
    // TODO: Test cascade deletion of tasks owned by user
    /**
     * Deletes a user by id
     * @param {string} requestId ID of Request for logging
     * @param userId Id of user to be deleted
     * @throws {InternalServerErrorException} if an error occurs during deletion
     */
    async deleteUser(requestId:string, userId: string): Promise<User> {
        const startTime = this.logger.logDbOperationStart(requestId, UsersService.name, DBOperation.Delete);
        try {
            return await this.userModel.findByIdAndDelete(userId);
        } catch (e) {
            this.logger.getLogger().error({
                message: `Failed to delete user for id ${userId}`,
                requestId
            });
            throw new InternalServerErrorException();
        } finally {
            this.logger.logDbOperationEnd(requestId, UsersService.name, DBOperation.Delete, startTime);
        }
    }
}
