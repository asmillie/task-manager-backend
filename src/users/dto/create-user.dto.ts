import { IsNotEmpty, IsLowercase, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'User name is required' })
    readonly name: string;

    @IsLowercase()
    @IsEmail({}, { message: 'Must be a valid email address' })
    readonly email: string;

    @IsOptional()
    readonly avatar?: Buffer;
}
