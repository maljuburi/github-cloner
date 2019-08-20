#!/usr/bin/env node

const fs = require("fs");
const program = require("commander");
const inq = require("inquirer");
const { execSync } = require("child_process");
const appInfo = require("./package.json");
const colors = require("colors");
const clone = require("./clone");
const github = require("./lib/github");

program
  .option("-v, --version", `output ${appInfo.name} version`, () => {
    const result = execSync(`cat ${__dirname}/logo.txt`).toString();
    console.log(result.green);
    console.log("v" + appInfo.version);
  })
  .description(appInfo.description);

// Available Apps/Folders in current directory
const appsInCD = fs
  .readdirSync(process.cwd(), { withFileTypes: true })
  .filter(a => a.isDirectory())
  .map(a => a.name);

// Github repositories

// Cloning action
program
  .command("clone")
  .alias("c")
  .description("Clone Github Repositories")
  .action(async () => {
    let token = github.getStoredGithubToken();

    if (!token) {
      try {
        await github.setGithubCred();
        token = await github.registerNewToken();
      } catch (err) {
        throw err;
      }
    }

    let { repos } = await github.getRepos();
    const repos_list = repos.map(r => r.repo_name);
    const { selected_repos, docker_repos } = await clone.selectRepos(
      repos_list
    );
    repos = repos.filter(repo => selected_repos.includes(repo.repo_name));

    const { request_type } = await clone.selectRequestType();

    cloneRepo(repos, request_type, docker_repos);
  });

// Docker action
program
  .command("docker")
  .alias("d")
  .description("Docker apps in the current directory")
  .action(() => {
    inq
      .prompt([
        {
          type: "checkbox",
          message: "Select apps you want to docker up:",
          name: "docker_apps",
          choices: appsInCD
        }
      ])
      .then(res => {
        handleDockerResult(res);
      });
  });

const cloneRepo = (repos, req_type, docker_repos) => {
  for (const repo of repos) {
    const url = req_type === "HTTPS" ? repo.https_url : repo.ssh_url;
    execSync(`git clone ${url}`, {
      stdio: "inherit"
    });
    console.log(`cloning ${repo.repo_name} is done!`.green);
    if (docker_repos === "Yes") {
      const found = fs
        .readdirSync(`${process.cwd()}/${repo.repo_name}`)
        .filter(file => file.match(/docker-compose.yml/));
      if (found.length > 0) {
        execSync(
          `cd ${process.cwd()}/${repo.repo_name} && docker-compose up -d `,
          {
            stdio: "inherit"
          }
        );

        console.log(`Docker for ${repo.repo_name} is running!`.green);
      } else {
        console.log(`${repo.repo_name} doesn't have docker setup!`.red);
      }
    }
    console.log("...".gray);
  }
};

const handleDockerResult = res => {
  for (const app of res.docker_apps) {
    const found = fs
      .readdirSync(`${process.cwd()}/${app}`)
      .filter(file => file.match(/docker-compose.yml/));
    if (found.length > 0) {
      execSync(`cd ${process.cwd()}/${app} && docker-compose up -d`, {
        stdio: "inherit"
      });

      console.log(`Docker for ${app} is running..!`.green);
    } else {
      console.log(`${app} doesn't have docker setup!`.red);
    }
    console.log("...".gray);
  }
  console.log("Docker up completed successfully!".green);
};

program.parse(process.argv);
