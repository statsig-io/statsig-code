import axios from 'axios';
import * as vsc from 'vscode';
import { ProjectsContract } from '../contracts/projects';
import ProjectsProvider from '../providers/projects';

let ctx: vsc.ExtensionContext;
let prov: ProjectsProvider;

export async function run(params?: {
  throttle?: boolean;
  token?: string;
  stateless?: boolean;
  silent?: boolean;
}): Promise<void> {
  const token: string | undefined =
    params?.token ?? ctx.globalState.get('auth');

  if (!token) {
    if (params?.silent) {
      return;
    }

    throw new Error('Not signed in.');
  }

  let sinceTime = params?.stateless
    ? undefined
    : (ctx.globalState.get('projects') as ProjectsContract)?.time;

  let contract: ProjectsContract | undefined;
  if (sinceTime) {
    contract = await ctx.globalState.get('projects');
    if (!contract) {
      sinceTime = undefined;
    }
  }

  const projectsResponse = await axios.post(
    'https://latest.api.statsig.com/developer/v1/projects',
    { sinceTime: sinceTime },
    { headers: { 'statsig-api-key': token } },
  );

  if (projectsResponse.status >= 300) {
    if (params?.silent) {
      return;
    }

    throw new Error(
      `Could not fetch Statsig data.  Status Code: ${
        projectsResponse.status
      }. Response: ${JSON.stringify(projectsResponse.data)}`,
    );
  }

  const proUpdateTime = ctx.globalState.update(
    'projects.updateTime',
    Date.now(),
  );

  // This could all be linear, but not necessary while # of projects is small.
  let hasUpdates = false;
  let proUpdateProjects: Thenable<void>;
  if (sinceTime === undefined) {
    hasUpdates = true;
    proUpdateProjects = ctx.globalState.update(
      'projects',
      projectsResponse.data,
    );
  } else {
    // Type correctness is enforced above.
    contract = contract as ProjectsContract;

    // Update projects.
    const data = projectsResponse.data as ProjectsContract;
    contract.time = data.time;
    for (const project of data.projects) {
      if (project.has_updates) {
        hasUpdates = true;
        const i = contract.projects.findIndex((p) => p.id === project.id);
        if (i >= 0) {
          contract.projects[i] = project;
        } else {
          contract.projects.push(project);
        }
      }
    }

    // Remove any deleted projects.
    if (contract.projects.length !== data.projects.length) {
      hasUpdates = true;
    }

    contract.projects = contract.projects.filter((p) =>
      data.projects.find((pp) => pp.id === p.id),
    );

    proUpdateProjects = ctx.globalState.update('projects', contract);
  }

  await Promise.all([proUpdateTime, proUpdateProjects]);
  if (hasUpdates) {
    // Reloads the entire view instead of just the entries that changed. We
    // could optimize to refresh specific projects.
    prov.refresh();
  }
}

export function register(
  context: vsc.ExtensionContext,
  provider: ProjectsProvider,
): vsc.Disposable {
  ctx = context;
  prov = provider;
  return vsc.commands.registerCommand(
    'statsig.fetchConfigs',
    async (params?: {
      throttle?: boolean;
      token?: string;
      stateless?: boolean;
    }) => {
      await run(params);
    },
  );
}
