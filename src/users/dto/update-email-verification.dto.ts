import { IsDate, IsString } from 'class-validator';

export class UpdateEmailVerificationDto {
    @IsString()
    readonly token: string;

    @IsDate()
    readonly expiry: Date;
}