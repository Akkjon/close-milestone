import { Endpoints } from '@octokit/types';
import { getAuthorization } from './auth';

type Milestones =
  Endpoints['GET /repos/{owner}/{repo}/milestones']['response']['data'];

export type RepositoryInformation = {
  owner: string;
  name: string;
};

/**
 * Fetches the milestones of the repository and returns them as a JSON-Object
 * @returns Object : the JSON-Object that the github-API returned
 */
export async function getMilestones(
  repository: RepositoryInformation,
): Promise<Milestones> {
  console.log(
    `Fetching milestones from repository ${repository.owner}/${repository.name}...`,
  );

  const { request } = await import('@octokit/request');

  //uses Octokit for request
  const response = await request('GET /repos/{owner}/{repo}/milestones', {
    headers: {
      authorization: getAuthorization(),
    },
    owner: repository.owner,
    repo: repository.name,
  });

  //return data
  console.log(`Found ${response.data.length} milestones in repository`);
  return response.data;
}

/**
 * Returns the milestone-id for the milestone to close
 * @param {Object} milestones JSON-Object from Github-API consisting of the milestones of the repository
 * @param {string} _milestoneName The name to get the id for
 * @returns {number} The id of the requested milestone
 */
export function getMilestoneId(
  milestones: Milestones,
  milestoneName: string,
): number | null {
  //iterates over all milestones
  for (const element of milestones) {
    //if milestone name matches
    if (element.title == milestoneName) {
      //return milestone
      console.log(`Found milestone ${milestoneName} with id ${element.number}`);
      return element.number;
    }
  }

  //no milestone found
  console.warn(`Milestone ${milestoneName} was not found.`);
  return null;
}

/**
 * Closes a milestone by the provided id
 * @param {number} milestoneId The number of the milestone to close
 */
export async function closeMilestone(
  milestoneId: number,
  repository: RepositoryInformation,
): Promise<void> {
  console.log(`Closing milestone  with id ${milestoneId}...`);

  const { request } = await import('@octokit/request');

  //try to close milestone
  await request('PATCH /repos/{owner}/{repo}/milestones/{milestone_number}', {
    headers: {
      authorization: getAuthorization(),
    },
    owner: repository.owner,
    repo: repository.name,
    milestone_number: milestoneId,
    state: 'closed',
  });
}
