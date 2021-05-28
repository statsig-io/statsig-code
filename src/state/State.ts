import * as vsc from 'vscode';

export default abstract class State<T> {
  constructor(
    protected readonly key: string,
    protected ctx: vsc.ExtensionContext,
    protected updateCallback?: () => void,
  ) {
    this._value = ctx.globalState.get(this.key);
    this._updateTime = ctx.globalState.get(`${this.key}.updateTime`);
  }

  private _value: T | undefined;
  public get value(): T | undefined {
    return this._value;
  }

  private _updateTime: number | undefined;
  public get updateTime(): number | undefined {
    return this._updateTime;
  }

  public async setFreshness(): Promise<void> {
    const time = Date.now();
    await this.ctx.globalState.update(`${this.key}.updateTime`, time);
    this._updateTime = time;
    this.updateCallback?.call(void 0);
  }

  public async update(value: T): Promise<void> {
    await this._update(value);
  }

  public async clear(): Promise<void> {
    await this._update(undefined);
  }

  private async _update(value: T | undefined): Promise<void> {
    const time = value !== undefined ? Date.now() : undefined;
    await Promise.all([
      this.ctx.globalState.update(this.key, value),
      this.ctx.globalState.update(`${this.key}.updateTime`, time),
    ]);

    this._value = value;
    this._updateTime = time;
    this.updateCallback?.call(void 0);
  }
}
