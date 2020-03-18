import { IsNotEmpty, MinLength, ValidateNested } from 'class-validator';
import { Token } from '../interfaces/token.interface';
import { CreateEmailDto } from './create-email.dto';

export class CreateUserDto {
    @IsNotEmpty({ message: 'User name is required' })
    readonly name: string;

    @IsNotEmpty({ message: 'Password is required '})
    @MinLength(7, { message: 'Password must be at least 7 characters' })
    readonly password: string;

    @ValidateNested()
    readonly email: CreateEmailDto;

    readonly avatar?: Buffer;
    readonly tokens?: Token[];
}
