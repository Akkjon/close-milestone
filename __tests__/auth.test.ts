import { authenticate, getAuthorization } from '../src/auth';

const mockCreateActionAuth = jest.fn();
jest.mock('@octokit/auth-action', () => ({
  createActionAuth: mockCreateActionAuth,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auth', () => {
  test('getAutorization fails if not initialized', () => {
    expect(getAuthorization).toThrow(
      new Error('Autorization is not ready, token has not been retreived'),
    );
  });

  test('authenticate calls method returned by createActionAuth', async () => {
    const authMethod = jest.fn();
    mockCreateActionAuth.mockReturnValue(authMethod);

    await authenticate();
    expect(mockCreateActionAuth).toHaveBeenCalled();
    expect(authMethod).toHaveBeenCalled();
  });

  test('authentication is correctly returned', async () => {
    const authMethod = jest.fn();
    mockCreateActionAuth.mockReturnValue(authMethod);
    authMethod.mockResolvedValue({
      type: 'token',
      token: 'dummytoken',
      tokenType: 'oauth',
    });

    await authenticate();
    const authorization = getAuthorization();

    expect(authorization).toBe('Bearer dummytoken');
  });
});
