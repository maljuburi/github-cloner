const Configstore = require("configstore");
const clone = require("../clone");
const pkg = require("../package.json");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const conf = new Configstore(pkg.name);
const Octokit = require("@octokit/rest");

let octokit;

module.exports = {
  getInstance: (username, password) => {
    return new Octokit({
      auth: {
        username,
        password
      }
    });
  },

  getStoredGithubToken: () => {
    return conf.get("github.token");
  },

  setGithubCred: async () => {
    const { username, password } = await clone.askGithubCred();
    conf.set("username", username);
    conf.set("password", password);
  },

  registerNewToken: async () => {
    const status = new Spinner("Authenticating you, please wait...");
    status.start();
    try {
      octokit = await new Octokit({
        auth: {
          username: conf.get("username"),
          password: conf.get("password")
        }
      });
      const payload = {
        scopes: ["user", "public_repo", "repo", "repo:status"],
        note: "Github Cloner CLI"
      };
      const { data } = await octokit.oauthAuthorizations.createAuthorization(
        payload
      );

      conf.set("github.token", data.token);

      return data.token;
    } catch (err) {
      console.error(err);
    } finally {
      status.stop();
    }
  },

  getRepos: async () => {
    try {
      const status = new Spinner("Searching repos, please wait...");
      const token = conf.get("github.token");
      octokit = await new Octokit({
        auth: token
      });
      const { user_name } = await clone.askGithubUserName();
      const { owner_type } = await clone.askReposOwnerType();
      if (owner_type === "user") {
        const { user_repos_privacy } = await clone.askUserReposPrivacy();
        status.start();
        const { data } = await octokit.repos.listForUser({
          username: user_name,
          type: user_repos_privacy,
          sort: "updated",
          per_page: "100"
        });

        status.stop();
        return {
          repos: data.map(d => {
            return {
              repo_name: d.name,
              https_url: d.clone_url,
              ssh_url: d.ssh_url
            };
          })
        };
      } else {
        const { user_repos_privacy } = await clone.askOrgReposPrivacy();
        status.start();
        const { data } = await octokit.repos.listForOrg({
          org: user_name,
          type: user_repos_privacy,
          sort: "updated",
          per_page: "100"
        });
        status.stop();
        return {
          repos: data.map(d => {
            return {
              repo_name: d.name,
              https_url: d.clone_url,
              ssh_url: d.ssh_url
            };
          })
        };
      }
    } catch (err) {
      throw err;
    }
  }
};
