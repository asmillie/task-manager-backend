import { IsLowercase, IsEmail, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { UpdateEmailVerificationDto } from './update-email-verification.dto';

export class UpdateEmailDto {
    @IsOptional()
    @IsLowercase()
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly address?: string;

    @IsOptional()
    @IsBoolean()
    readonly verified?: boolean;

    @IsOptional()
    @ValidateNested()
    readonly verification?: UpdateEmailVerificationDto;
}
