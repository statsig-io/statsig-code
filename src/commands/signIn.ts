import * as vsc from 'vscode';
import axios from 'axios';

let ctx: vsc.ExtensionContext;

export default async function run(inToken: string): Promise<void> {
  const token = inToken?.trim();
  if (!token) {
    throw new Error('Invalid auth token!');
  }

  // Perform an initial fetch of all projects. This validates the token and initializes the extension.
  const projectsResponse = await axios.post(
    'https://latest.api.statsig.com/developer/v1/projects',
    {},
    { headers: { 'statsig-api-key': token } },
  );

  if (projectsResponse.status >= 300) {
    throw new Error(
      `Could not use the provided token.  Status Code: ${projectsResponse.status}`,
    );
  }

  await Promise.all([
    ctx.globalState.update('projects', projectsResponse.data),
    ctx.globalState.update('auth', token),
  ]);
}

export function register(context: vsc.ExtensionContext): vsc.Disposable {
  ctx = context;
  return vsc.commands.registerCommand('statsig.signIn', async () => {
    const token = await vsc.window.showInputBox({
      title: 'Sign In to Statsig',
      prompt:
        'You can get an Access Token from the Integrations tab at console.statsig.com.',
      placeHolder: 'Access Token',
      validateInput: (value: string) => {
        const [d, t, e] = value.split(':');
        if (!d || !t || e !== undefined) {
          return 'Invalid token format.  Please ensure you copied a valid token from console.statsig.com/integrations';
        }

        return null;
      },
    });

    if (token === undefined) {
      return;
    }

    await run(token);
  });
}
