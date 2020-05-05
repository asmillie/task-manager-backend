import { Test, TestingModule } from '@nestjs/testing';
import { SignupService } from './signup.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { mocked } from 'ts-jest/utils';

import * as sgMail from '@sendgrid/mail';
jest.mock('@sendgrid/mail');

import * as bcrypt from 'bcrypt';
jest.mock('bcrypt');

const mockUsersService = () => ({
  create: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
});

const mockVerificationCode = 'valid-code';

const mockExpiryDate = new Date('01-01-2200');

const mockUser: any = {
  _id : '5e286b8940b3a61cacd8667d',
  name : 'Jenny',
  email : {
    address: 'jenny.email@emailsite.com',
    verification: {
      code: mockVerificationCode,
      expiry: mockExpiryDate,
    },
  },
};

const mockUserTwo: any = {
  ...mockUser,
  email: {
    ...mockUser.email,
    verification: {
      ...mockUser.email.verification,
      expiry: new Date('02-10-1999'),
    },
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

    let sendEmailSpy;

    beforeEach(() => {
      jest.spyOn(signupService as any, 'createVerificationCode').mockReturnValue(mockVerificationCode);
      jest.spyOn(signupService as any, 'getExpiryDate').mockReturnValue(mockExpiryDate);
      sendEmailSpy = jest.spyOn(signupService as any, 'sendVerificationEmail');
    });

    it('should add verification code and expiry date to user DTO', async () => {
      usersService.create.mockResolvedValue(mockUser);
      sendEmailSpy.mockImplementation(() => true);

      expect(usersService.create).not.toHaveBeenCalled();
      await signupService.signup(mockUserDto);
      expect(usersService.create).toHaveBeenCalledWith({
        ...mockUserDto,
        email: {
          ...mockUserDto.email,
          verification: {
            code: mockVerificationCode,
            expiry: mockExpiryDate,
          },
        },
      });
    });

    it('should call usersService to create user and then return user', async () => {
      usersService.create.mockResolvedValue(mockUser);
      sendEmailSpy.mockImplementation(() => true);

      expect(usersService.create).not.toHaveBeenCalled();
      const result = await signupService.signup(mockUserDto);
      expect(usersService.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should call sendVerificationEmail with user id and email', async () => {
      usersService.create.mockResolvedValue(mockUser);
      sendEmailSpy.mockImplementation(() => true);

      expect(sendEmailSpy).not.toHaveBeenCalled();
      await signupService.signup(mockUserDto);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email.address,
        mockVerificationCode,
        mockExpiryDate,
      );
    });

    it('should throw error on failure to create user', async () => {
      usersService.create.mockRejectedValue(new InternalServerErrorException());

      expect(usersService.create).not.toHaveBeenCalled();
      expect(signupService.signup(mockUserDto)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error on failure to send verification email', async () => {
      usersService.create.mockResolvedValue(mockUser);
      sendEmailSpy.mockRejectedValue(new InternalServerErrorException());

      expect(sendEmailSpy).not.toHaveBeenCalled();
      expect(signupService.signup(mockUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('verifyEmail', () => {
    it('should throw error if user is not returned by usersService', async () => {
      usersService.findUserById.mockResolvedValue(undefined);

      expect(usersService.findUserById).not.toHaveBeenCalled();
      expect(signupService.verifyEmail(mockUser._id, mockVerificationCode)).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw error if verification code does not match', async () => {
      usersService.findUserById.mockResolvedValue(mockUser);

      expect(signupService.verifyEmail(mockUser._id, 'invalid code')).rejects.toThrow(ForbiddenException);
    });

    it('should throw error if verification code has expired', async () => {
      usersService.findUserById.mockResolvedValue(mockUserTwo);

      expect(signupService.verifyEmail(mockUserTwo._id, mockVerificationCode)).rejects.toThrow(ForbiddenException);
    });

    it('should call usersService to get user by id', async () => {
      usersService.findUserById.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue(true);

      expect(usersService.findUserById).not.toHaveBeenCalled();
      await signupService.verifyEmail(mockUser._id, mockVerificationCode);
      expect(usersService.findUserById).toHaveBeenCalledWith(mockUser._id);
    });

    it('should call usersService to update user as verified and return true', async () => {
      usersService.findUserById.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue(mockUser);

      const updateUserDto: UpdateUserDto = {
        email: {
          address: mockUser.email.address,
          verified: true,
        },
      };

      expect(usersService.updateUser).not.toHaveBeenCalled();
      const result = await signupService.verifyEmail(mockUser._id, mockVerificationCode);
      expect(usersService.updateUser).toHaveBeenCalledWith(mockUser._id, updateUserDto);
      expect(result).toEqual(true);
    });
  });

  describe('sendVerificationEmail', () => {

    let sendEmailSpy;

    beforeEach(() => {
      sendEmailSpy = jest.spyOn(signupService as any, 'sendVerificationEmail');
    });

    it('should create and send verification email through sendgrid api', async () => {
      expect(sendEmailSpy).not.toHaveBeenCalled();
      await sendEmailSpy(
        mockUser._id,
        mockUser.email.address,
        mockUser.email.verification.code,
        mockUser.email.verification.expiry);

      expect(mocked(sgMail).send).toHaveBeenCalled();
    });

    it('should throw on error sending email', async () => {
      mocked(sgMail).send.mockRejectedValue('error');

      expect(
        (signupService as any)
          .sendVerificationEmail(
            mockUser._id,
            mockUser.email.address,
            mockUser.email.verification.code,
            mockUser.email.verification.expiry,
          ),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('createVerificationCode', () => {

    it('should return a code', async () => {
      const code = '$2b$08$BEbLwyctJEsY4556MaX.gegwdJirDdPparz/mrMm9H2MhnTAMF2yG';
      mocked(bcrypt).hash.mockResolvedValue(code);

      expect((signupService as any).createVerificationCode()).resolves.toEqual(code);
    });

    it('should throw on error creating hash', async () => {
      mocked(bcrypt).hash.mockRejectedValue('error');

      expect((signupService as any).createVerificationCode()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('resendEmail', () => {
    let createCodeSpy;
    let getExpiryDateSpy;
    let sendEmailSpy;
    const code = 'code';
    const date = new Date('01-01-2200');

    beforeEach(() => {
      createCodeSpy = jest.spyOn((signupService as any), 'createVerificationCode');
      getExpiryDateSpy =  jest.spyOn((signupService as any), 'getExpiryDate');
      sendEmailSpy = jest.spyOn((signupService as any), 'sendVerificationEmail');
    });

    describe('success', () => {

      beforeEach(() => {
        createCodeSpy.mockResolvedValue(code);
        getExpiryDateSpy.mockReturnValue(date);
        usersService.findUserById.mockResolvedValue(mockUser);
        usersService.updateUser.mockResolvedValue(mockUser);
        sendEmailSpy.mockResolvedValue(true);
      });

      it('should call usersService.updateUser() with new email verification details', async () => {
        const updateUserDto: UpdateUserDto = {
          ...mockUser,
          email: {
            ...mockUser.email,
            verification: {
              token: code,
              expiry: date,
            },
          },
        };

        expect(usersService.updateUser).not.toHaveBeenCalled();
        await signupService.resendEmail(mockUser._id);
        expect(usersService.updateUser).toHaveBeenCalledWith(mockUser._id, updateUserDto);

      });

      it('should send email to user with new email verification details', async () => {
        expect(sendEmailSpy).not.toHaveBeenCalled();
        await signupService.resendEmail(mockUser._id);
        expect(sendEmailSpy).toHaveBeenCalledWith(
          mockUser._id,
          mockUser.email.address,
          code,
          date);
      });
    });

    describe('error handling', () => {

      beforeEach(() => {
        createCodeSpy.mockResolvedValue(code);
        getExpiryDateSpy.mockReturnValue(date);
        usersService.findUserById.mockResolvedValue(mockUser);
        usersService.updateUser.mockResolvedValue(mockUser);
        sendEmailSpy.mockResolvedValue(true);
      });

      it('should throw when no user is found', async () => {
        usersService.findUserById.mockRejectedValue(null);
        expect(signupService.resendEmail('id')).rejects.toThrow(InternalServerErrorException);
      });

      it('should throw on failure to update user', async () => {
        usersService.updateUser.mockRejectedValue('error');
        expect(signupService.resendEmail('id')).rejects.toThrow(InternalServerErrorException);
      });

      it('should throw on failure to send email', async () => {
        sendEmailSpy.mockRejectedValue(false);
        expect(signupService.resendEmail('id')).rejects.toThrow(InternalServerErrorException);
      });
    });
    
  });
});
