import sh from 'shelljs';
import inquirer from "inquirer";
import CONSTANTS from '../lib/constants.js';
const { APP_NAME, COMMANDS, KEY_NAME } = CONSTANTS;

export default async function destroy() {
  try {
    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "delete",
        message: "Are you sure you want to delete Herald from AWS?"
      }
    ])
    if (confirm.delete) {
      sh.cd(APP_NAME);
      sh.exec(COMMANDS.DESTROY);
      sh.exec(`${COMMANDS.DELETE_KEY} ${KEY_NAME}`);
    }
  } catch (error) {
    console.error(error);
  }
}
