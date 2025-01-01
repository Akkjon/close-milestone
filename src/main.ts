import * as core from '@actions/core';
import { authenticate } from './auth';
import { closeMilestone, getMilestoneId, getMilestones } from './milestones';

/**
 * Implements the main workflow.
 *
 * authenticate -> get milestones -> close milestone
 */
export async function run() {
  const milestoneName = core.getInput('milestone_name');

  try {
    const repoInformation = getRepositoryInformation();

    await authenticate();

    let milestones = await getMilestones(repoInformation);
    let id = getMilestoneId(milestones, milestoneName);
    if (id == null) {
      handleMissingMilestone();
      return;
    }

    await closeMilestone(id, repoInformation);
    console.log(`Successfully closed milestone ${milestoneName} (${id}).`);
    core.setOutput('milestone_id', id);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(
        `Milestone ${milestoneName} cannot be closed. Reason: ${error.message}`,
      );
    }
  }
}

function handleMissingMilestone() {
  if (core.getBooleanInput('crash_on_missing')) {
    core.setFailed('Milestone with provided name not found');
  } else {
    core.warning('Action stopped because no milestone was found');
  }
}

function getRepositoryInformation() {
  const repoUrl = process.env.GITHUB_REPOSITORY;
  if (!repoUrl || !repoUrl.includes('/')) {
    throw new Error(
      `Cannot determine repository owner and name because repository url does not comply with owner/repo and instead is ${repoUrl}`,
    );
  }
  return {
    owner: repoUrl.substring(0, repoUrl.indexOf('/')),
    name: repoUrl.substring(repoUrl.indexOf('/') + 1),
  };
}
