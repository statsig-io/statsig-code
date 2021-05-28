import * as vsc from 'vscode';
import AuthState from '../state/AuthState';
import * as fetchConfigs from './fetchConfigs';

export default async function run(inToken: string): Promise<void> {
  const token = inToken?.trim();
  if (!token) {
    void vsc.window.showErrorMessage(`Invalid auth token!`);
    return;
  }

  // Perform an initial fetch of all projects. This validates the token and
  // initializes the extension.
  const success = await fetchConfigs.run({ token: token });
  if (success) {
    await AuthState.instance.update(token);
  }
}

export function register(): vsc.Disposable {
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
