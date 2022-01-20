import { Auth0Dto } from "../../auth/dto/auth0.dto";

export class CreateUserDto {
    readonly auth0: Auth0Dto;
    readonly email: string;
}
