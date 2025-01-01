import * as core from '@actions/core';

export function expectSetFailed(message: string, milestoneName: string) {
  expect(core.setFailed).toHaveBeenCalledWith(
    `Milestone ${milestoneName} cannot be closed. Reason: ${message}`,
  );
}
