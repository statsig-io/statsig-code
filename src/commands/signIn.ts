import * as vsc from 'vscode';

let ctx: vsc.ExtensionContext;

export default function run(inToken: string): Thenable<void> {
  const token = inToken?.trim();
  if (!token) {
    throw new Error('Invalid auth token!');
  }

  // Attempt an API call to validate the token can auth.
  // TODO

  // Store the token locally.
  return ctx.globalState.update('auth', token);
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
