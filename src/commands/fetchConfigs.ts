import axios from 'axios';
import * as vsc from 'vscode';
import { ProjectsContract } from '../contracts/projects';
import AuthState from '../state/AuthState';
import ProjectsState from '../state/ProjectsState';

export async function run(params?: {
  throttle?: boolean;
  token?: string;
  incremental?: boolean;
  silent?: boolean;
}): Promise<void> {
  const token = params?.token ?? AuthState.instance.value;
  if (!token) {
    if (params?.silent) {
      return;
    }

    throw new Error('Not signed in.');
  }

  let sinceTime = params?.incremental
    ? ProjectsState.instance.value?.time
    : undefined;

  let contract = ProjectsState.instance.value;
  if (sinceTime && !contract) {
    // Can't do an incremental update since there's no baseline.
    sinceTime = undefined;
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

  const data = projectsResponse.data as ProjectsContract;
  data.projects?.sort((a, b) => a.name.localeCompare(b.name));
  data.projects?.forEach((p) => {
    p?.dynamic_configs?.sort((a, b) => a.name.localeCompare(b.name));
    p?.feature_gates?.sort((a, b) => a.name.localeCompare(b.name));
  });

  // This could all be linear, but not necessary while # of projects is small.
  let hasUpdates = false;
  if (sinceTime === undefined) {
    contract = data;
    hasUpdates = true;
  } else {
    // Type correctness is enforced above.
    contract = contract as ProjectsContract;

    // Update projects.
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
  }

  if (hasUpdates) {
    await ProjectsState.instance.update(contract);
  } else {
    await ProjectsState.instance.setFreshness();
  }
}

export function register(): vsc.Disposable {
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
