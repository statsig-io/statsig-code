import * as vsc from 'vscode';
import State from './State';

export default class AuthState extends State<string> {
  private static _instance: AuthState;
  public static get instance(): AuthState {
    return this._instance;
  }

  public static init(
    ctx: vsc.ExtensionContext,
    updateCallback?: () => void,
  ): void {
    this._instance = new AuthState('auth', ctx, updateCallback);
  }
}
