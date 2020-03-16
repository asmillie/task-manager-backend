import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as config from 'config';
import * as sgMail from '@sendgrid/mail';
import * as bcrypt from 'bcrypt';
import { User } from '../users/interfaces/user.interface';

@Injectable()
export class SignupService {

    private logger = new Logger('SignupService');

    constructor(private readonly usersService: UsersService) {
        sgMail.setApiKey(config.get<string>('sendgrid.key'));
    }
    // TODO: Add email-verified flag to user
    // Generate hash from email? for email verify link, also save to user
    // Compare hash when user follows email link
    async signup(createUserDto: CreateUserDto): Promise<User> {
        try {
            const user = await this.usersService.create(createUserDto);
            await this.sendVerificationEmail(user.id, user.email.address);
            return user;
        } catch (e) {
            this.logger.error(`Failed during signup process. DTO: ${createUserDto}`);
            throw new InternalServerErrorException();
        }
    }

    async verifyEmail(code: string) {
        // Compare code against stored user email token
    }

    private async sendVerificationEmail(id: string, email: string) {
        const baseUrl = config.get<string>('base_url');
        const code = this.createVerificationUrl(id);
        const verifyLink = new URL(`/verifyEmail?id=${id}&code=${code}`, baseUrl);
        // Send email
        const msg = {
            to: email,
            from: '',
            subject: 'Task Manager API Email Verification',
            html: `Welcome to the Task Manager Api. To complete the signup process please <a href="${verifyLink}">click here</a>`,
        };

        try {
            await sgMail.send(msg);
        } catch (e) {
            this.logger.error(`Error sending verification email. Email Details: ${JSON.stringify(msg)}`);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Takes a User Id and combines it with the current datetime
     * into a hash to be used as an email verification code
     * @param id User id
     * @throws { InternalServerErrorException } on error generating hash
     */
    private createVerificationCode(id: string): string {
        const date = new Date().toDateString();
        bcrypt.hash(id + date, 8, (err, hash) => {
            if (err) {
                this.logger.error(`Error generating verification URL for User Id ${id} and DateTime ${date}`);
                throw new InternalServerErrorException();
            }

            return hash;
        });
        return null;
    }
}
