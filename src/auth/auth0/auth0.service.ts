import { Injectable } from '@nestjs/common';
import { AppMetadata, ManagementClient, UserMetadata } from 'auth0';
import * as config from 'config';
import { from, Observable } from 'rxjs';

@Injectable()
export class Auth0Service {
    private auth0Client: ManagementClient<AppMetadata, UserMetadata>;

    constructor() {
        this.initAuth0Client();
    }
    // TODO: Handle Auth0 Rate Limits
    getUser$(id: string): Observable<any> {
        return from(this.auth0Client.getUser({id}));
    }

    private initAuth0Client(): void {
        const domain = config.get<string>('auth0.domain');
        const clientId = config.get<string>('auth0.clientId');
        const clientSecret = config.get<string>('auth0.clientSecret');

        this.auth0Client = new ManagementClient({
            domain,
            clientId,
            clientSecret,
            scope: 'read:users read:email_provider'
        });
    }
}
