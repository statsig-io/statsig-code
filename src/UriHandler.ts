import * as vsc from 'vscode';
import * as querystring from 'querystring';
import signIn from './commands/signIn';

export default class UriHandler {
  handleUri(uri: vsc.Uri): void {
    if (uri.path !== '/auth') {
      return;
    }

    signIn(querystring.decode(uri.query)['token'] as string);
  }
}
