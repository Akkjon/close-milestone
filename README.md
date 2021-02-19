# Remove-milestone
A Github action to remove a milestone by the milestone's name
[Code of conduct](CODE_OF_CONDUCT.md)

## Inputs
### `milestone_name`
**Required** The name of the milestone, to close.


## Outputs
None

## Example usage
```yaml
uses: Akkjon/close-milestone@v1
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
with:
  milestone_name: milestoneName
```
