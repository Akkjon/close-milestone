"use strict";
exports.id = 95;
exports.ids = [95];
exports.modules = {

/***/ 95:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  createActionAuth: () => (/* binding */ createActionAuth)
});

;// CONCATENATED MODULE: ./node_modules/@octokit/auth-action/node_modules/@octokit/auth-token/dist-bundle/index.js
// pkg/dist-src/auth.js
var REGEX_IS_INSTALLATION_LEGACY = /^v1\./;
var REGEX_IS_INSTALLATION = /^ghs_/;
var REGEX_IS_USER_TO_SERVER = /^ghu_/;
async function auth(token) {
  const isApp = token.split(/\./).length === 3;
  const isInstallation = REGEX_IS_INSTALLATION_LEGACY.test(token) || REGEX_IS_INSTALLATION.test(token);
  const isUserToServer = REGEX_IS_USER_TO_SERVER.test(token);
  const tokenType = isApp ? "app" : isInstallation ? "installation" : isUserToServer ? "user-to-server" : "oauth";
  return {
    type: "token",
    token,
    tokenType
  };
}

// pkg/dist-src/with-authorization-prefix.js
function withAuthorizationPrefix(token) {
  if (token.split(/\./).length === 3) {
    return `bearer ${token}`;
  }
  return `token ${token}`;
}

// pkg/dist-src/hook.js
async function hook(token, request, route, parameters) {
  const endpoint = request.endpoint.merge(
    route,
    parameters
  );
  endpoint.headers.authorization = withAuthorizationPrefix(token);
  return request(endpoint);
}

// pkg/dist-src/index.js
var createTokenAuth = function createTokenAuth2(token) {
  if (!token) {
    throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  }
  if (typeof token !== "string") {
    throw new Error(
      "[@octokit/auth-token] Token passed to createTokenAuth is not a string"
    );
  }
  token = token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
};


;// CONCATENATED MODULE: ./node_modules/@octokit/auth-action/dist-src/index.js

const createActionAuth = function createActionAuth2() {
  if (!process.env.GITHUB_ACTION) {
    throw new Error(
      "[@octokit/auth-action] `GITHUB_ACTION` environment variable is not set. @octokit/auth-action is meant to be used in GitHub Actions only."
    );
  }
  const definitions = [
    process.env.GITHUB_TOKEN,
    process.env.INPUT_GITHUB_TOKEN,
    process.env.INPUT_TOKEN
  ].filter(Boolean);
  if (definitions.length === 0) {
    throw new Error(
      "[@octokit/auth-action] `GITHUB_TOKEN` variable is not set. It must be set on either `env:` or `with:`. See https://github.com/octokit/auth-action.js#createactionauth"
    );
  }
  if (definitions.length > 1) {
    throw new Error(
      "[@octokit/auth-action] The token variable is specified more than once. Use either `with.token`, `with.GITHUB_TOKEN`, or `env.GITHUB_TOKEN`. See https://github.com/octokit/auth-action.js#createactionauth"
    );
  }
  const token = definitions.pop();
  return createTokenAuth(token);
};



/***/ })

};
;
//# sourceMappingURL=95.index.js.map