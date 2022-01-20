export const mockAuth0Service = () => ({
    getUser$: jest.fn(),
});

// Example Error from https://github.com/auth0/node-auth0/issues/208
export const mockAuth0RateLimitError = {
    "name": "Too Many Requests",
    "message": {
        "statusCode": 429,
        "error": "Too Many Requests"
    },
    "statusCode": 429,
    "requestInfo": {
        "method": "get",
        "url": "https://<AUTH0 DOMAIN>.auth0.com/api/v2/users"
    },
    "originalError": {
        "status": 429,
        "response": {
            "req": {
                "method": "GET",
                "url": "https://<AUTH0 DOMAIN>.auth0.com/api/v2/users",
                "headers": {
                    "user-agent": "node.js/6.11.2",
                    "content-type": "application/json",
                    "authorization": "Bearer ...",
                    "accept": "application/json"
                }
            },
            "header": {
                "date": "Tue, 17 Oct 2017 15:14:55 GMT",
                "content-type": "application/json; charset=utf-8",
                "transfer-encoding": "chunked",
                "connection": "close",
                "x-ratelimit-limit": "10",
                "x-ratelimit-remaining": "0",
                "x-ratelimit-reset": "1508253300",
                "vary": "origin,accept-encoding",
                "cache-control": "no-cache",
                "content-encoding": "gzip"
            },
            "status": 429,
            "text": "{\"statusCode\":429,\"error\":\"Too Many Requests\"}"
        }
    }
}