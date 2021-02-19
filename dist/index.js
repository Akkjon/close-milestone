const core = require('@actions/core');
const { Octokit } = require("@octokit/core");
const { createActionAuth } = require("@octokit/auth");
const milestoneName = core.getInput('milestone_name')
const octokit = new Octokit();

let auth;
let token;

const repoInfo = process.env.GITHUB_REPOSITORY;
const owner = repoInfo.substring(0, repoInfo.indexOf("/"))
const repo = repoInfo.substring(repoInfo.indexOf("/") + 1)

async function authenticate() {
    return new Promise(async (resolve) => {
        auth = createActionAuth();
        token = await auth();

        resolve();
    })
}

async function getMilestones() {
    return new Promise(async (resolve, reject) => {
        console.log("Fetching milestones...")
        var response = await octokit.request('GET /repos/{owner}/{repo}/milestones', {
            headers: {
                authorization: "Bearer " + token.token,
            },
            owner: owner,
            repo: repo
          })
        if(response.status != 200) {
            reject();
            return;
        }
        console.log(`Found ${response.data.length} milestones in this repository.`)
        resolve(response.data);
    })
}

function getMilestoneId(milestones) {
    for(var i = 0; i<milestones.length; i++) {
        var element = milestones[i];
        if(element.title == milestoneName) {
            console.log(`Found milestone ${milestoneName} with id ${element.number}`);
            return element.number;
        }
    }
    console.warn(`Milestone ${milestoneName} was not found.`)
    return null;
}

async function deleteMilestone(milestoneNumber) {
    return new Promise(async (resolve, reject) => {
        console.log(`Closing milestone ${milestoneName}(${milestoneNumber})...`)
        var response = await octokit.request("PATCH /repos/{owner}/{repo}/milestones/{milestone_number}", {
            headers: {
                authorization: "Bearer " + token.token,
              },
            owner: owner,
            repo: repo,
            milestone_number: milestoneNumber,
            state: 'closed'
        })
        if(response.status != 200) {
            reject();
            console.warn(`Milestone ${milestoneName}(${milestoneNumber}) cannot be closed.`)
            core.setFailed(`Milestone cannot be closed, github responded with an invalid status (${response.status}).`)
            return;
        }

        console.log(`Successfully closed milestone ${milestoneName}(${milestoneNumber}).`);
        resolve();
    })
}

async function run() {
    await authenticate();
    let milestones = await getMilestones();
    let id = getMilestoneId(milestones);
    if(id == null) {
        core.warning("Action stopped because no milestone was found");
        return;
    }
    await deleteMilestone(id)
}

run()
