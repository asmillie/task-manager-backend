import { Test, TestingModule } from '@nestjs/testing';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InternalServerErrorException } from '@nestjs/common';

const mockSignupService = () => ({
  signup: jest.fn(),
  verifyEmail: jest.fn(),
  resendEmail: jest.fn(),
  emailExists: jest.fn(),
});

const mockUser: any = {
  _id : '5e286b8940b3a61cacd8667d',
  name : 'Jenny',
  email : {
    address: 'jenny.email@emailsite.com',
  },
};

describe('Signup Controller', () => {
  let controller: SignupController;
  let signupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignupController],
      providers: [
        {
          provide: SignupService,
          useFactory: mockSignupService,
        },
      ],
    }).compile();

    controller = module.get<SignupController>(SignupController);
    signupService = module.get<SignupService>(SignupService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {

    const userDto: CreateUserDto = {
      ...mockUser,
    };

    it('should call signupService to create and return a user', async () => {
      signupService.signup.mockResolvedValue(mockUser);

      expect(signupService.signup).not.toHaveBeenCalled();
      const result = await controller.signup(userDto);
      expect(signupService.signup).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(mockUser);
    });

    it('should return error when signupService throws error', async () => {
      signupService.signup.mockRejectedValue(new InternalServerErrorException());

      expect(signupService.signup).not.toHaveBeenCalled();
      expect(controller.signup(userDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
        signupService.emailExists.mockResolvedValue(true);

        expect(signupService.emailExists).not.toHaveBeenCalled();
        const result = await controller.emailExists('email');
        expect(signupService.emailExists).toHaveBeenLastCalledWith('email');
        expect(result).toEqual({
          emailExists: true,
        });
    });

    it('should return false if email does not exist', async () => {
        signupService.emailExists.mockResolvedValue(false);

        expect(signupService.emailExists).not.toHaveBeenCalled();
        const result = await controller.emailExists('email');
        expect(signupService.emailExists).toHaveBeenLastCalledWith('email');
        expect(result).toEqual({
          emailExists: false,
        });
    });

    it('should return error thrown by usersService', async () => {
        signupService.emailExists.mockRejectedValue(new InternalServerErrorException());

        expect(signupService.emailExists).not.toHaveBeenCalled();
        expect(controller.emailExists('email')).rejects.toThrow(InternalServerErrorException);
    });
});
});
