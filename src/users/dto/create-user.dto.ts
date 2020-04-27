import { IsNotEmpty, MinLength, ValidateNested, IsOptional } from 'class-validator';
import { Token } from '../interfaces/token.interface';
import { CreateEmailDto } from './create-email.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
    @IsNotEmpty({ message: 'User name is required' })
    readonly name: string;

    @IsNotEmpty({ message: 'Password is required '})
    @MinLength(7, { message: 'Password must be at least 7 characters' })
    readonly password: string;

    @ValidateNested()
    @Type(() => CreateEmailDto)
    readonly email: CreateEmailDto;

    @IsOptional()
    readonly avatar?: Buffer;

    @IsOptional()
    readonly tokens?: Token[];
}
