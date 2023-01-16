import Conf from "conf";
import readlineSync from "readline-sync";
import { globals } from "../config/globals";
import axios from "axios";
import { AuthorCredentials } from "../types/index";

const config = new Conf();

export const login = () => {
  const key = readlineSync.question("Paste your key here and press Enter: ", {
    hideEchoBack: true,
  });
  const match = key.match(/(.*)_(.*)_(.*)/);
  if (match === null || match.length !== 4) {
    throw "Error: Invalid API key.";
  }
  const apiKey = match[1];
  const apiUrl = match[2];
  const username = match[3];

  // TODO: Actually verify the creds once things are locked down
  axios
    .get(`${apiUrl}/users.profile`, {
      params: { username },
    })
    .then((res) => {
      let greeting = "";
      if (res.data.firstName) {
        greeting = `Hello, ${res.data.firstName}. `;
      } else {
        greeting = `Hello, ${res.data.email}. `;
      }
      console.log(`${greeting}You have been logged in successfully.`);
      saveCredentials({ apiUrl, username, apiKey });
    });
};

export const authorizeUser = () => {
  if (!config.get(globals.USERNAME_STORAGE_KEY)) {
    console.log("Please log in first.");
    process.exit();
  }
};

export const logout = () => {
  config.delete(globals.API_URL_STORAGE_KEY);
  config.delete(globals.USERNAME_STORAGE_KEY);
  config.delete(globals.API_KEY_STORAGE_KEY);
  console.log("Logged out successfully.");
};

function saveCredentials(params: AuthorCredentials) {
  config.set(globals.API_URL_STORAGE_KEY, params.apiUrl);
  config.set(globals.USERNAME_STORAGE_KEY, params.username);
  config.set(globals.API_KEY_STORAGE_KEY, params.apiKey);
}
