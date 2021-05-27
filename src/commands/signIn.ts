import * as vsc from 'vscode';
import * as fetchConfigs from './fetchConfigs';

let ctx: vsc.ExtensionContext;

export default async function run(inToken: string): Promise<void> {
  const token = inToken?.trim();
  if (!token) {
    throw new Error('Invalid auth token!');
  }

  // Perform an initial fetch of all projects. This validates the token and
  // initializes the extension.
  await fetchConfigs.run({ token: token });
  await ctx.globalState.update('auth', token);
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
