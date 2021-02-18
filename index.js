const core = require('@actions/core');
const { octokit } = require("@octokit/core");
const milestoneName = core.getInput('milestone_name')
const isAsync = core.getInput('async')
let id = null;

async function runAsync() {
    try {
        run()
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

function run() {
    //var owner = process.env.;
    var repoInfo = process.env.GITHUB_REPOSITORY;
    var owner = repoInfo.substring(0, repoInfo.indexOf("/"))
    var repo = repoInfo.substring(repoInfo.indexOf("/") + 1)

    var response = await octokit.request('GET /repos/{owner}/{repo}/milestones', {
        owner: owner,
        repo: repo
      })
    var jsonResponse = JSON.parse(response);
    for(var i = 0; i<jsonResponse.length; i++) {
        var element = jsonResponse[i];
        if(element.title == milestoneName) {
            id = element.number;
            break;
        }
    }

    if(id == null) {
        //ERROR
    } else {
        var response = await octokit.request("PATCH /repos/{owner}/{repo}/milestones/{milestone_number}", {
            owner: owner,
            repo: repo,
            milestone_number: id,
            state: 'closed'
        })
    }
}

if(isAsync) {
    runAsync()
} else {
    run()
}
