import { LogRequestInterceptor } from './log-request.interceptor';

describe('LogRequestInterceptor', () => {
  it('should be defined', () => {
    expect(new LogRequestInterceptor()).toBeDefined();
  });
});
