export type Token = {
  type: 'token';
  token: string;
  tokenType: string;
};

let token: Token | null = null;

/**
 * Creates the authentication token for the repository to close the milestone
 */
export async function authenticate(): Promise<void> {
  const { createActionAuth } = await import('@octokit/auth-action');
  //uses Octokit for getting the authentication codes
  const auth = createActionAuth();
  token = await auth();
}

export function getAuthorization(): string {
  if (token === null) {
    throw new Error('Autorization is not ready, token has not been retreived');
  }
  return 'Bearer ' + token.token;
}
