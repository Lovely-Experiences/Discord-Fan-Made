// Variables & required modules
const Express = require("express");
const Keyv = require("keyv");
const ConsolePrompt = require('prompt-sync')();
const FileSystem = require("fs");
const Configuration = require("./configuration.json");
const ExpressApplication = Express();
const AccountsDatabase = new Keyv("sqlite://database/accounts.sqlite");

//////////////////////////////////////////////////////////////////////////////////////////////////////

// Server modules.
const Modules = {
    Accounts: require("./modules/accounts.js")
};

//////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Listen for asset get requests.
 * @param {string} BasePath
 * @param {string} Path 
 * @returns {void}
 */
function AssetRequests(BasePath, Path) {
    for (const File of FileSystem.readdirSync(BasePath)) {
        const IsFolder = File.split(".")[1] == undefined;
        if (IsFolder == true) {
            AssetRequests(BasePath + File + "/", Path + File + "/");
        } else {
            ExpressApplication.get(Path + File, function (Request, Response) {
                Response.sendFile(BasePath + File, { root: "./" });
            });
        }
    }
    return;
}

AssetRequests("client/assets/public/", "/assets/");

//////////////////////////////////////////////////////////////////////////////////////////////////////

// Start listening to requests made to the provided port.
ExpressApplication.listen(Configuration.Port, async function () {
    console.log(`Listening to port ${Configuration.Port}.`);
    return;
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Ask to create an admin account if the account "admin" does not already exist.
 * @returns {Promise<void>}
 */
async function AdminAccountPrompt() {
    try {
        const UsernameTaken = await AccountsDatabase.has("admin");
        if (UsernameTaken == true) {
            console.log("[Admin Creation]: Admin account creation skipped, username 'admin' is already in use.");
        } else {
            const Password = ConsolePrompt("[Admin Creation]: Please enter a password for the new admin account: ", { echo: "*" });
            const Account = await Modules.Accounts.CreateAccount("admin", Password);
            if (Account.Success == true) {
                console.log("[Admin Creation]: Success!");
            } else {
                throw Account.Error;
            }
        }
    } catch (Error) {
        console.log(`[Admin Creation]: Something went wrong: ${Error}`);
        process.exit();
    }
    return;
}

AdminAccountPrompt();

//////////////////////////////////////////////////////////////////////////////////////////////////////