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
      this._instance.updateCallback(false);
    });

    this._instance.updateCallback(true);
  }

  private mainProject: string | undefined;
  public setMainProject(projectName: string): void {
    this.mainProject = projectName;
    this.updateHook?.call(void 0);
  }
  public getMainProject(): string | undefined {
    return this.mainProject;
  }

  private configIndex: Map<string, StatsigConfig[]> = new Map();
  public findConfig(name: string, projectName?: string): StatsigConfig[] {
    const configs = this.configIndex.get(name) ?? [];
    if (projectName) {
      return configs.filter((c) => c.projectName === projectName);
    }
    return configs;
  }

  public getConfigIndex(): Map<string, StatsigConfig[]> {
    return this.configIndex;
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

  private updateCallback(initialLoad: boolean): void {
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

    if (initialLoad && this.value.projects.length > 0) {
      this.setMainProject(this.value.projects[0].name);
    }
  }
}
