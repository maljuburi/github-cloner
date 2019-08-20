const inq = require("inquirer");

const request_types = ["HTTPS", "SSH"];

module.exports = {
  askGithubCred: () => {
    const questions = [
      {
        name: "username",
        type: "input",
        message: "Enter your GitHub username or e-mail address:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your username or e-mail address.";
          }
        }
      },
      {
        name: "password",
        type: "password",
        message: "Enter your password:",
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return "Please enter your password.";
          }
        }
      }
    ];
    return inq.prompt(questions);
  },

  selectRequestType: () => {
    const questions = [
      {
        type: "list",
        message: "Select clone type: ",
        name: "request_type",
        choices: request_types
      }
    ];
    return inq.prompt(questions);
  },

  askGithubUserName: () => {
    const questions = [
      {
        type: "input",
        message: "Enter github user/organization name: ",
        name: "user_name"
      }
    ];
    return inq.prompt(questions);
  },

  askReposOwnerType: () => {
    const questions = [
      {
        type: "list",
        message: "Is this a user or an organization?",
        name: "owner_type",
        choices: ["user", "organization"]
      }
    ];
    return inq.prompt(questions);
  },

  askUserReposPrivacy: () => {
    const questions = [
      {
        type: "list",
        message: "What type of repos you want to clone?",
        name: "user_repos_privacy",
        choices: ["all", "member", "owner"]
      }
    ];
    return inq.prompt(questions);
  },
  askOrgReposPrivacy: () => {
    const questions = [
      {
        type: "list",
        message: "What type of repos you want to clone?",
        name: "org_repos_privacy",
        choices: ["all", "private", "public", "member", "forks", "sources"]
      }
    ];
    return inq.prompt(questions);
  },

  selectRepos: repos => {
    const questions = [
      {
        type: "checkbox",
        message: "Select repos",
        name: "selected_repos",
        choices: repos
      },
      {
        type: "list",
        message: "Would you like to docker up your applications?",
        name: "docker_repos",
        choices: ["Yes", "No"]
      }
    ];
    return inq.prompt(questions);
  }
};
