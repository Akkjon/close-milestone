import * as core from '@actions/core';
import * as auth from '../src/auth';
import { run } from '../src/main';
import * as milestones from '../src/milestones';

jest.mock('../src/auth');
jest.mock('../src/milestones');
jest.mock('@actions/core');

beforeEach(() => {
  jest.clearAllMocks();
  (core.getInput as jest.Mock).mockImplementation(key => {
    if (key === 'milestone_name') {
      return MOCK_MILESTONE_NAME;
    } else {
      return null;
    }
  });
});

const MOCK_MILESTONE_NAME = 'milestone';

describe('main', () => {
  test('run fails if no repository information is supplied', async () => {
    process.env.GITHUB_REPOSITORY = undefined;
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(
      `Milestone ${MOCK_MILESTONE_NAME} cannot be closed. Reason: Cannot determine repository owner and name because repository url does not comply with owner/repo and instead is undefined`,
    );
  });

  test('run fails if incorrect repository information is supplied', async () => {
    process.env.GITHUB_REPOSITORY = 'thisshouldneverhappen';
    await run();
    expect(core.setFailed).toHaveBeenCalledWith(
      `Milestone ${MOCK_MILESTONE_NAME} cannot be closed. Reason: Cannot determine repository owner and name because repository url does not comply with owner/repo and instead is thisshouldneverhappen`,
    );
  });

  test('run calls authenticate', async () => {
    process.env.GITHUB_REPOSITORY = 'Akkjon/close-milestone';
    await run();

    expect(auth.authenticate).toHaveBeenCalled();
  });

  test('run calls getMilestones with correct repo information', async () => {
    process.env.GITHUB_REPOSITORY = 'Akkjon/close-milestone';
    await run();

    expect(milestones.getMilestones).toHaveBeenCalledWith({
      owner: 'Akkjon',
      name: 'close-milestone',
    });
  });

  test('run calls getMilestoneId with response of getMilestones', async () => {
    process.env.GITHUB_REPOSITORY = 'Akkjon/close-milestone';
    (milestones.getMilestones as jest.Mock).mockResolvedValue([]);

    await run();

    expect(milestones.getMilestoneId).toHaveBeenCalledWith(
      [],
      MOCK_MILESTONE_NAME,
    );
  });

  test('run does not find milestone with given name and crash_on_missing is true should fail', async () => {
    process.env.GITHUB_REPOSITORY = 'Akkjon/close-milestone';
    (milestones.getMilestones as jest.Mock).mockResolvedValue([]);
    (milestones.getMilestoneId as jest.Mock).mockReturnValue(null);
    (core.getBooleanInput as jest.Mock).mockReturnValue(true);

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(
      'Milestone with provided name not found',
    );
  });

  test('run does not find milestone with given name and crash_on_missing is false should log warning', async () => {
    process.env.GITHUB_REPOSITORY = 'Akkjon/close-milestone';
    (milestones.getMilestones as jest.Mock).mockResolvedValue([]);
    (milestones.getMilestoneId as jest.Mock).mockReturnValue(null);
    (core.getBooleanInput as jest.Mock).mockReturnValue(false);

    await run();

    expect(core.warning).toHaveBeenCalledWith(
      'Action stopped because no milestone was found',
    );
  });

  test('run calls closeMilestone with id of getMilestoneId', async () => {
    process.env.GITHUB_REPOSITORY = 'Akkjon/close-milestone';
    (milestones.getMilestones as jest.Mock).mockResolvedValue([]);
    (milestones.getMilestoneId as jest.Mock).mockReturnValue(1);

    await run();

    expect(milestones.closeMilestone).toHaveBeenCalledWith(1, {
      owner: 'Akkjon',
      name: 'close-milestone',
    });
  });

  test('run sets milestone_id on successfull closing of milestone', async () => {
    process.env.GITHUB_REPOSITORY = 'Akkjon/close-milestone';
    (milestones.getMilestones as jest.Mock).mockResolvedValue([]);
    (milestones.getMilestoneId as jest.Mock).mockReturnValue(1);

    await run();

    expect(core.setOutput).toHaveBeenCalledWith('milestone_id', 1);
  });
});
