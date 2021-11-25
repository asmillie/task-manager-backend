import { HttpService, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as config from 'config';

interface IUserInfoResponse {
    name: string;
    email: string;
}

@Injectable()
export class Auth0Service {
    private domain;

    constructor(private httpService: HttpService) {
        this.domain = config.get<string>('auth0.domain');
    }

    public getUserInfo$(token: string): Observable<any> {  
        const userInfo = config.get<string>('auth0.endpoints.userinfo');
        return this.httpService
            .get<IUserInfoResponse>(`https://${this.domain}/${userInfo}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .pipe(
                tap(res => console.log(res))
            );
    }
}
