# Remove-milestone
A Github action to remove a milestone by the milestone's name
[Code of conduct](CODE_OF_CONDUCT.md)

## Inputs
### `milestone_name`
**Required** The name of the milestone, to close.

### `crash_on_missing`
If the milestone should fail if the provided milestone is missing<br>
Default: false


## Outputs
### `milestone_id`
The id of the milestone which has been closed.

## Explanation for usage
- The `uses` keyword specifies which action us used. `Akkjon/close-milestone` specifies which repository is used, the `@v2.0.2` defines which version of the action is used. To always use the latest version, you can change it to `@master`, but please be aware that changes in the action might break your workflow.
- The `env`keyword specifies the environment variables used by and provided to the action. `GITHUB_TOKEN` is the secret access token to authorize to the used repository. Without this keyword, the action would not be able to login and close the milestone. It is not stored in any way or transmitted. As the code is open source, it would be noticed anyways.
- the `with` keyword specifies data you have to specify. Here the input variables are defined. These are specified [above](#inputs) 

## Example minimal usage
```yaml
uses: Akkjon/close-milestone@v2.0.2
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
with:
  milestone_name: milestoneName
```

## Example usage with crash on missing
```yaml
uses: Akkjon/close-milestone@v2.0.2
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
with:
  milestone_name: milestoneName
  crash_on_missing: true
```