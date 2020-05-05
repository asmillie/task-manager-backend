import { Test, TestingModule } from '@nestjs/testing';
import { SignupController } from './signup.controller';
import { SignupService } from './signup.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InternalServerErrorException } from '@nestjs/common';

const mockSignupService = () => ({
  signup: jest.fn(),
  verifyEmail: jest.fn(),
  resendEmail: jest.fn(),
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

  describe('POST /', () => {

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

  describe('POST /verifyEmail', () => {
    it('should call signupService to verify code', async () => {
      signupService.verifyEmail.mockResolvedValue(true);

      expect(signupService.verifyEmail).not.toHaveBeenCalled();
      await controller.verifyEmail('id', 'valid code');
      expect(signupService.verifyEmail).toHaveBeenCalledWith('id', 'valid code');
    });

    it('should return result from signupService on successful verification', async () => {
      signupService.verifyEmail.mockResolvedValue(true);

      expect(await controller.verifyEmail('id', 'valid code')).toEqual(true);
    });

    it('should return error when signupService throws error', async () => {
      signupService.verifyEmail.mockRejectedValue(new InternalServerErrorException());

      expect(controller.verifyEmail('id', 'invalid code')).rejects.toThrowError(InternalServerErrorException);
    });
  });

  describe('GET /resendEmail', () => {
    it('should call signupService.resendEmail() with user id', async () => {
      signupService.resendEmail.mockResolvedValue(true);

      expect(signupService.resendEmail).not.toHaveBeenCalled();
      await controller.resendEmail('id');
      expect(signupService.resendEmail).toHaveBeenCalledWith('id');
    });

    it('should return error thrown by signupService.resendEmail()', async () => {
      signupService.resendEmail.mockRejectedValue(new InternalServerErrorException());

      expect(signupService.resendEmail).not.toHaveBeenCalled();
      expect(controller.resendEmail('invalid id')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
