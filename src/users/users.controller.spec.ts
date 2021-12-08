import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { mockUsersService } from '../../test/mocks/mockUsersService';

const mockUser: any = {
    _id : '5e286b8940b3a61cacd8667d',
    email : 'jenny.email@emailsite.com',
};

const mockReq = {
    user: {
        _id: 'id',
    },
};

describe('UsersController', () => {
    let usersController: UsersController;
    let usersService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useFactory: mockUsersService,
                },
            ],
        })
        .overrideGuard(AuthGuard())
        .useValue({ canActivate: () => true })
        .compile();

        usersController = module.get<UsersController>(UsersController);
        usersService = module.get<UsersService>(UsersService);
    });

    describe('findUserById', () => {
        it('should return user request object provided by JWT strategy', async () => {
            const result = await usersController.findUserById(mockReq);
            expect(result).toEqual(mockReq.user);
        });
    });

    describe('updateUser', () => {
        it('should update a user', async () => {
            usersService.updateUser.mockResolvedValue(mockUser);
            const updateUserDto: UpdateUserDto = {
                email: 'new.email@addr.co',
            };

            expect(usersService.updateUser).not.toHaveBeenCalled();
            const result = await usersController.updateUser(mockReq, updateUserDto);
            expect(usersService.updateUser).toHaveBeenCalledWith(mockReq.user._id, updateUserDto);
            expect(result).toEqual(mockUser);
        });

        it('should return error thrown by usersService', async () => {
            usersService.updateUser.mockRejectedValue(new InternalServerErrorException());
            const updateUserDto: UpdateUserDto = {
                email: 'new.email@addr.co',
            };

            expect(usersService.updateUser).not.toHaveBeenCalled();
            expect(usersController.updateUser(mockReq, updateUserDto))
                .rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            usersService.deleteUser.mockResolvedValue('success');

            expect(usersService.deleteUser).not.toHaveBeenCalled();
            const result = await usersController.deleteUser(mockReq);
            expect(usersService.deleteUser).toHaveBeenCalledWith(mockReq.user._id);
            expect(result).toEqual('success');
        });

        it('should return error thrown by usersService', async () => {
            usersService.deleteUser.mockRejectedValue(new InternalServerErrorException());

            expect(usersService.deleteUser).not.toHaveBeenCalled();
            expect(usersController.deleteUser(mockReq)).rejects.toThrow(InternalServerErrorException);
        });
    });

});
