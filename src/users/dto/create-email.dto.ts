import { IsLowercase, IsEmail, IsOptional } from 'class-validator';

export class CreateEmailDto {
    @IsLowercase()
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly address: string;

    @IsOptional()
    readonly verification?: {
        readonly code: string;
        readonly expiry: Date;
    };
}
