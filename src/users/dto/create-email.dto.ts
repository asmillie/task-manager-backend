import { IsLowercase, IsEmail } from 'class-validator';

export class CreateEmailDto {
    @IsLowercase()
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly address: string;

    readonly verification: {
        readonly code: string;
        readonly expiry: Date;
    };
}
