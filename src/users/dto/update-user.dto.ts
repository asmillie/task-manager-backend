import { Auth0Dto } from "../../auth/dto/auth0.dto";

export class UpdateUserDto {
    readonly auth0?: Auth0Dto;
    readonly email?: string;
}
