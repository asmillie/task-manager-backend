import { Test, TestingModule } from '@nestjs/testing';
import { take } from 'rxjs/operators';
import { mockUser } from '../../../test/mocks/mock-user';
import { Auth0Service } from './auth0.service';

const mockManagementClient = jest.fn();
const mockGetUser = jest.fn();

jest.mock('auth0', () => {
  return {
    ManagementClient: jest.fn().mockImplementation(
      (opts) => {
        mockManagementClient(opts);

        return {
          getUser: (params) => {
            return mockGetUser(params);
          }
        }
      }
    )
  }
});

describe('Auth0Service', () => {
  let service: Auth0Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Auth0Service],
    }).compile();

    service = module.get<Auth0Service>(Auth0Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser$', () => {
    it('returns user', (done) => {
      mockGetUser.mockReturnValue(
        new Promise((resolve) => {
          resolve(mockUser);
        })
      );

      service
        .getUser$('id')
        .pipe(take(1))
        .subscribe(result => {
          expect(result).toEqual(mockUser);
          done();
        });
    });
  });
});
