import { HttpService, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class Auth0Service {
    constructor(private httpService: HttpService) {}


    public getUserInfo$(token: string): Observable<User> {
        
        
        return;
    }
}
