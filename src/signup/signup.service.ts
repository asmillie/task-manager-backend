import { Injectable, Logger, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as config from 'config';
import * as sgMail from '@sendgrid/mail';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { User } from '../users/interfaces/user.interface';
import { UpdateUserDto } from '../users/dto/update-user.dto';

@Injectable()
export class SignupService {

    private logger = new Logger('SignupService');

    constructor(private readonly usersService: UsersService) {
        sgMail.setApiKey(config.get<string>('sendgrid.key'));
    }

    /**
     * Adds email verification data to User DTO before calling
     * [UsersService create method]{@link UsersService#create}
     * to save the user. An email is then sent to the user by
     * calling the [sendVerificationEmail method]{@link SignupService#sendVerificationEmail}.
     * @param userDto User data
     * @throws {InternalServerErrorException} if the create or sendVerificationEmail methods fail
     */
    async signup(userDto: CreateUserDto): Promise<User> {
        const code = this.createVerificationCode();
        const expiry = this.getExpiryDate();
        const createUserDto: CreateUserDto = {
            ...userDto,
            email: {
                ...userDto.email,
                verification: {
                    code,
                    expiry,
                },
            },
        };

        try {
            const user = await this.usersService.create(createUserDto);
            await this.sendVerificationEmail(user.id, user.email.address, code, expiry);
            return user;
        } catch (e) {
            this.logger.error(`Failed during signup process. DTO: ${createUserDto}`);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Verifies provided code belongs to a User id.
     * Expiry date for verification code is also checked
     * before passing. On passing the User email verified
     * field is updated in stored User data.
     *
     * @param id Id of user to verify email for
     * @param code Email verification code
     * @throws {InternalServerErrorException} if no user is found for id
     * @throws {ForbiddenException} if code does not match or has expired
     */
    async verifyEmail(id: string, code: string): Promise<User> {
        const user = await this.usersService.findUserById(id);
        if (!user) {
            this.logger.warn(`Failed to find a user for id ${id} during email verification.`);
            throw new InternalServerErrorException();
        }

        if (user.email.verification.code !== code) {
            this.logger.warn(`Email verification failed for user id ${id} as provided code did not match one stored in user data.`);
            throw new ForbiddenException();
        }

        const userExpiry = user.email.verification.expiry;
        const now = new Date();
        if (userExpiry.valueOf() >= now.valueOf()) {
            this.logger.log(`Email verification failed for User Id ${id} as code has expired.`);
            throw new ForbiddenException();
        }

        const updateUserDto: UpdateUserDto = {
            email: {
                address: user.email.address,
                verified: true,
            },
        };

        return await this.usersService.updateUser(id, updateUserDto);
    }

    /**
     * Creates a link for a User to verify their email address which includes
     * their User Id and Verification Code.
     * @param id User Id
     * @param email User Email Address
     * @param code Email Verification Code
     * @param expiry Expiry Date for Email Verification Code
     */
    private async sendVerificationEmail(id: string, email: string, code: string, expiry: Date) {
        const baseUrl = config.get<string>('base_url');
        const verifyLink = new URL(`/verifyEmail?id=${id}&code=${code}`, baseUrl);
        const dateFormat = moment(expiry.toDateString()).format('MMM Do YYYY, h:mm a');
        // Send email
        const msg = {
            to: email,
            from: 'no-reply@example.com',
            subject: 'Task Manager API Email Verification',
            html:
            `Welcome to the Task Manager Api. To complete the signup process please <a href="${verifyLink}">click here</a>.
            <br /><br />
            This link is valid until ${dateFormat}.`,
        };

        try {
            await sgMail.send(msg);
        } catch (e) {
            this.logger.error(`Error sending verification email. Email Details: ${JSON.stringify(msg)}`);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Creates a hash from the current datetime and a random number
     * to be used as a verification code.
     * @throws { InternalServerErrorException } on error generating hash
     */
    private createVerificationCode(): string {
        const date = Date.now().toString();
        const rand = Math.floor((Math.random() * 1000)).toString();
        bcrypt.hash(rand + date, 8, (err, hash) => {
            if (err) {
                this.logger.error(`Error generating verification URL from DateTime ${date} and ${rand}`);
                throw new InternalServerErrorException();
            }

            return hash;
        });
        return null;
    }

    /**
     * Returns an expiry date of 1 day in the future
     */
    private getExpiryDate(): Date {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    }
}
