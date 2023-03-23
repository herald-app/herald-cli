import sh from 'shelljs';
import { writeFileSync } from "fs";
import chalk from 'chalk';
import boxen from 'boxen';
import CONSTANTS from '../lib/constants.js';
const {APP_NAME, REPO, KEY_PATH, KEY_NAME, COMMANDS } = CONSTANTS;

const deployBoxOptions = {
  padding: 0.8,
  margin: 1.5,
  borderStyle: "round",
  borderColor: "white",
}

const deployMsg = chalk.cyan("herald deploy");

const msgBox = boxen(deployMsg, deployBoxOptions);

const options = { stdio: "pipe", silent: true };

async function generateKey() {
  let res;
  try {
    console.log(chalk.white("Generating SSH key..."));
    res = sh.exec(`${COMMANDS.CREATE_KEY} ${KEY_NAME}`, options);
    console.log(chalk.green("Done"));
  } catch (error) {
    console.error(
      chalk.red("Failed to create SSH key. Please see error below:")
    );
    console.error(error);
    process.exit();
  }

  try {
    const key = JSON.parse(res).KeyMaterial;
    console.log(chalk.white(`Writing SSH key to ${KEY_PATH}...`));
    writeFileSync(KEY_PATH, key);
  } catch (error) {
    console.error(
      chalk.red("Failed to write key to file. Please see error below:", "red")
    );
    console.error(error);
    process.exit();
  }
}

async function cloneAndInstall(repo) {
  try {
    console.log(chalk.white("Cloning app into herald-app directory..."))
    sh.exec(`git clone ${repo} ${APP_NAME}`, options);
    console.log(chalk.green("Done"));
  } catch (error) {
    console.error(chalk.red("Clone failed. Please see error below: "));
    console.error(error);
    process.exit();
  }

  sh.cd(APP_NAME);

  try {
    console.log(chalk.white("Installing CDK app dependencies..."));
    sh.exec("npm install", options);
    console.log(chalk.green("Done"));
  } catch (error) {
    console.error(chalk.red("Failed to install dependencies. Please see error below:"));
    console.error(error);
    process.exit();
  }
}

async function verifyInstall(args) {
  args.forEach(arg => {
    try {
      sh.exec(`${arg} --version`, options);
    } catch (error) {
      console.error(`"${arg}" command is not available. Please install "${arg}" globally to use Lodge CLI`);
    }
  });
}

export default async function init() {
  try {
    console.log(chalk.white("Verifying installation of AWS CLI and AWS CDK..."));
    await verifyInstall(["aws", "cdk"]);
    console.log(chalk.green("Verified"));
  } catch (error) {
    console.error(error);
  }
  try {
    await cloneAndInstall(REPO);
    await generateKey();
    console.log(
      chalk.white("\nHerald initialization complete.\n\n") + 
      chalk.white("To deploy Herald to aws, use ") +
      msgBox
      // chalk.cyan("'herald deploy'\n\n") // might like this better than msgBox
    );
  } catch (error) {
    console.error(error);
  }
}