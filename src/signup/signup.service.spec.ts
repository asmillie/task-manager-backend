import { Test, TestingModule } from '@nestjs/testing';
import { SignupService } from './signup.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InternalServerErrorException } from '@nestjs/common';

const mockUsersService = () => ({
  create: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  findUserByEmail: jest.fn(),
});

const mockVerificationCode = 'valid-code';

const mockExpiryDate = new Date('01-01-2200');

const mockUser: any = {
  _id : '5e286b8940b3a61cacd8667d',
  name : 'Jenny',
  email : {
    address: 'jenny.email@emailsite.com',
  },
};

const mockUserDto: CreateUserDto = {
  name: mockUser.name,
  password: 'passwordhash',
  email: {
    address: mockUser.email.address,
  },
};

describe('SignupService', () => {
  let signupService: SignupService;
  let usersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupService,
        {
          provide: UsersService,
          useFactory: mockUsersService,
        },
      ],
    }).compile();

    signupService = module.get<SignupService>(SignupService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(signupService).toBeDefined();
  });

  describe('signup', () => {

    it('should call usersService to create user and then return user', async () => {
      usersService.create.mockResolvedValue(mockUser);

      expect(usersService.create).not.toHaveBeenCalled();
      const result = await signupService.signup(mockUserDto);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw error on failure to create user', async () => {
      usersService.create.mockRejectedValue(new InternalServerErrorException());

      expect(usersService.create).not.toHaveBeenCalled();
      expect(signupService.signup(mockUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('emailExists', () => {
    it('should return true if an account exists for provided email address', async () => {
        usersService.findUserByEmail.mockResolvedValue(mockUser);

        expect(usersService.findUserByEmail).not.toHaveBeenCalled();
        const result = await signupService.emailExists(mockUser.email.address);
        expect(usersService.findUserByEmail).toHaveBeenCalledWith(mockUser.email.address);
        expect(result).toEqual(true);

    });

    it('should return false if an account does not exists for provided email address', async () => {
        usersService.findUserByEmail.mockResolvedValue(undefined);

        expect(usersService.findUserByEmail).not.toHaveBeenCalled();
        const result = await signupService.emailExists('email');
        expect(usersService.findUserByEmail).toHaveBeenCalledWith('email');
        expect(result).toEqual(false);
    });

    it('should throw on error during find operation', async () => {
        usersService.findUserByEmail.mockRejectedValue('error');

        expect(usersService.findUserByEmail).not.toHaveBeenCalled();
        expect(signupService.emailExists('email')).rejects.toThrow(InternalServerErrorException);
    });
});

});
