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

/**
 * Creates the authentication token for the repository to close the milestone
 */
async function authenticate() {
    return new Promise(async (resolve) => {
        //uses Octokit for getting the authentication codes
        auth = createActionAuth();
        token = await auth();

        //signal that authentication was finished
        resolve();
    })
}

/**
 * Fetches the milestones of the repository and returns them as a JSON-Object
 * @returns Object : the JSON-Object that the github-API returned
 */
async function getMilestones() {
    return new Promise(async (resolve, reject) => {
        console.log(`Fetching milestones from repository ${repoInfo}...`)
        //uses Octokit for request
        var response = await octokit.request('GET /repos/{owner}/{repo}/milestones', {
            headers: {
                authorization: "Bearer " + token.token,
            },
            owner: owner,
            repo: repo
          })
        //if request failed
        if(response.status != 200) {
            console.warn(`Milestones cannot be requested for repository ${repoInfo}`)
            reject();
            return;
        }

        //return data
        console.log(`Found ${response.data.length} milestones in repository ${repoInfo}.`)
        resolve(response.data);
    })
}

/**
 * Returns the milestone-id for the milestone to close
 * @param {Object} milestones JSON-Object from Github-API consisting of the milestones of the repository
 * @param {string} _milestoneName The name to get the id for
 * @returns {number} The id of the requested milestone
 */
function getMilestoneId(milestones, _milestoneName) {
    //iterates over all milestones
    for(var i = 0; i<milestones.length; i++) {
        var element = milestones[i];
        //if milestone name matches
        if(element.title == _milestoneName) {
            //return milestone
            console.log(`Found milestone ${_milestoneName} with id ${element.number}`);
            return element.number;
        }
    }

    //no milestone found
    console.warn(`Milestone ${_milestoneName} was not found.`)
    return null;
}

/**
 * Closes a milestone by the provided id
 * @param {number} milestoneNumber The number of the milestone to close
 */
async function closeMilestone(milestoneNumber) {
    return new Promise(async (resolve, reject) => {
        console.log(`Closing milestone ${milestoneName} (${milestoneNumber})...`)
        //try to close milestone
        var response = await octokit.request("PATCH /repos/{owner}/{repo}/milestones/{milestone_number}", {
            headers: {
                authorization: "Bearer " + token.token,
              },
            owner: owner,
            repo: repo,
            milestone_number: milestoneNumber,
            state: 'closed'
        })

        //if request failed
        if(response.status != 200) {
            reject();
            console.warn(`Milestone ${milestoneName} (${milestoneNumber}) cannot be closed.`)
            core.setFailed(`Milestone cannot be closed, github responded with an invalid status (${response.status}).`)
            return;
        }

        //success
        console.log(`Successfully closed milestone ${milestoneName} (${milestoneNumber}).`);
        resolve();
    })
}

/**
 * Implements the main workflow.<br>
 * authenticate -> get milestones -> close milestone
 */
async function run() {
    await authenticate();
    let milestones = await getMilestones();
    let id = getMilestoneId(milestones, milestoneName);
    if(id == null) {
        core.warning("Action stopped because no milestone was found");
        return;
    }
    await closeMilestone(id)
}

//starts the workflow
run()
