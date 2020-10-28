import { IsNotEmpty, IsString } from 'class-validator';

export class RecaptchaTokenDto {
    @IsNotEmpty({ message: 'Missing Recaptcha Verification Token'})
    @IsString()
    readonly token: string;
}
