import { Endpoints } from '@octokit/types';
import * as auth from '../src/auth';
import {
  closeMilestone,
  getMilestoneId,
  getMilestones,
} from '../src/milestones';

const mockRequest = jest.fn();
jest.mock('@octokit/request', () => ({
  request: mockRequest,
}));
jest.mock('../src/auth');

beforeEach(() => {
  jest.clearAllMocks();
});

type Milestones =
  Endpoints['GET /repos/{owner}/{repo}/milestones']['response']['data'];

describe('milestones', () => {
  test('getMilestones calls request', async () => {
    (auth.getAuthorization as jest.Mock).mockReturnValue('Bearer token');
    mockRequest.mockResolvedValue({
      status: 200,
      data: [],
    });

    await getMilestones({
      owner: 'Akkjon',
      name: 'close-milestone',
    });

    expect(mockRequest).toHaveBeenLastCalledWith(
      'GET /repos/{owner}/{repo}/milestones',
      {
        headers: {
          authorization: 'Bearer token',
        },
        owner: 'Akkjon',
        repo: 'close-milestone',
      },
    );
  });

  test('getMilestones status 500 throws error', async () => {
    (auth.getAuthorization as jest.Mock).mockReturnValue('Bearer token');

    mockRequest.mockResolvedValue({
      status: 500,
      data: null,
    });
    expect(
      getMilestones({
        owner: 'Akkjon',
        name: 'close-milestone',
      }),
    ).rejects.toThrow(
      'Milestones cannot be requested for repository, GitHub responded with status code 500',
    );
  });

  test('getMilestones returns data', async () => {
    (auth.getAuthorization as jest.Mock).mockReturnValue('Bearer token');

    mockRequest.mockResolvedValue({
      status: 200,
      data: [],
    });
    expect(
      await getMilestones({
        owner: 'Akkjon',
        name: 'close-milestone',
      }),
    ).toStrictEqual([]);
  });

  test('getMilestoneId returns null when no milestones are given', () => {
    expect(getMilestoneId([], 'milestone')).toBeNull();
  });

  test('getMilestoneId returns id of milestone', () => {
    const milestones = [
      {
        number: 1,
        title: 'test',
      },
      {
        number: 2,
        title: 'test2',
      },
    ];

    expect(getMilestoneId(milestones as Milestones, 'test2')).toBe(2);
  });

  test('closeMilestone calls api to close milestone', async () => {
    (auth.getAuthorization as jest.Mock).mockReturnValue('Bearer token');

    mockRequest.mockResolvedValue({
      status: 200,
    });
    await closeMilestone(1, {
      owner: 'Akkjon',
      name: 'close-milestone',
    });
    expect(mockRequest).toHaveBeenLastCalledWith(
      'PATCH /repos/{owner}/{repo}/milestones/{milestone_number}',
      {
        headers: {
          authorization: 'Bearer token',
        },
        owner: 'Akkjon',
        repo: 'close-milestone',
        milestone_number: 1,
        state: 'closed',
      },
    );
  });

  test('closeMilestone throws if api does not response with 200', async () => {
    (auth.getAuthorization as jest.Mock).mockReturnValue('Bearer token');

    mockRequest.mockResolvedValue({
      status: 500,
    });
    expect(
      closeMilestone(1, {
        owner: 'Akkjon',
        name: 'close-milestone',
      }),
    ).rejects.toThrow(
      'Milestone with id 1 Cannot close Milestone, GitHub responded with status code 500',
    );
  });
});
