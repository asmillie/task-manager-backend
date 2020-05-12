import { IsNotEmpty, MinLength, IsEmail, IsLowercase, IsOptional, ValidateNested } from 'class-validator';
import { UpdateEmailDto } from './update-email.dto';
import { Type } from 'class-transformer';

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty({ message: 'User name is required' })
    readonly name?: string;

    @IsOptional()
    @IsNotEmpty({ message: 'Password is required '})
    @MinLength(7, { message: 'Password must be at least 7 characters' })
    readonly password?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => UpdateEmailDto)
    readonly email?: UpdateEmailDto;

    readonly avatar?: Buffer;
}
