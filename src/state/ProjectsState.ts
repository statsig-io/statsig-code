import * as vsc from 'vscode';
import { ProjectsContract } from '../contracts/projects';
import State from './State';

export default class ProjectsState extends State<ProjectsContract> {
  private static _instance: ProjectsState;
  public static get instance(): ProjectsState {
    return this._instance;
  }

  public static init(
    ctx: vsc.ExtensionContext,
    updateCallback?: () => void,
  ): void {
    this._instance = new ProjectsState('projects', ctx, updateCallback);
  }
}
