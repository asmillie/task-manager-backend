import { IsNotEmpty, MinLength, IsEmail, IsLowercase, IsOptional } from 'class-validator';
import { UpdateEmailDto } from './update-email.dto';

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty({ message: 'User name is required' })
    readonly name?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Password is required '})
    @MinLength(7, { message: 'Password must be at least 7 characters' })
    readonly password?: string;

    @IsOptional()
    @IsLowercase()
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly email?: UpdateEmailDto;

    readonly avatar?: Buffer;
}
