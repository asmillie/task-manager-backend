import { IsLowercase, IsEmail, IsOptional } from 'class-validator';

export class UpdateEmailDto {
    @IsOptional()
    @IsLowercase()
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly address?: string;
}
