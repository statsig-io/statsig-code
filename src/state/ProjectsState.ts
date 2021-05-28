import * as vsc from 'vscode';
import {
  APIConfigEntity,
  DeveloperProject,
  ProjectsContract,
} from '../contracts/projects';
import State from './State';

export type ConfigType = 'feature_gate' | 'dynamic_config';
export type StatsigConfig = {
  projectID: string;
  projectName: string;
  type: ConfigType;
  data: APIConfigEntity;
};

export default class ProjectsState extends State<ProjectsContract> {
  private static _instance: ProjectsState;
  public static get instance(): ProjectsState {
    return this._instance;
  }

  public static init(ctx: vsc.ExtensionContext, updateHook?: () => void): void {
    this._instance = new ProjectsState('projects', ctx, () => {
      updateHook?.call(void 0);
      this._instance.updateCallback();
    });

    this._instance.updateCallback();
  }

  private configIndex: Map<string, StatsigConfig[]> = new Map();
  public findConfig(name: string): StatsigConfig[] | null {
    return this.configIndex.get(name) ?? null;
  }

  private addConfigToIndex(
    proj: DeveloperProject,
    ent: APIConfigEntity,
    type: ConfigType,
  ): void {
    const config: StatsigConfig = {
      projectID: proj.id,
      projectName: proj.name,
      type: type,
      data: ent,
    };

    this.configIndex.has(ent.name)
      ? this.configIndex.get(ent.name)?.push(config)
      : this.configIndex.set(ent.name, [config]);
  }

  private updateCallback(): void {
    this.configIndex = new Map();
    if (this.value === undefined) {
      return;
    }

    this.value.projects.forEach((p) => {
      p.feature_gates.forEach((c) =>
        this.addConfigToIndex(p, c, 'feature_gate'),
      );

      p.dynamic_configs.forEach((c) =>
        this.addConfigToIndex(p, c, 'dynamic_config'),
      );
    });
  }
}
