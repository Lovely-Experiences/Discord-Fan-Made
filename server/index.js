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

// Listen for css and javascript requests.
for (const File of FileSystem.readdirSync("client/css/")) {
    ExpressApplication.get("/web/css/" + File, function (Request, Response) {
        Response.sendFile("client/css/" + File, { root: "./" });
    });
}

for (const File of FileSystem.readdirSync("client/javascript/")) {
    ExpressApplication.get("/web/javascript/" + File, function (Request, Response) {
        Response.sendFile("client/javascript/" + File, { root: "./" });
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

// Listen for user profile picture requests.
// If the user doesn't have a profile picture, a random template one is provided instead.
ExpressApplication.get("/assets/private/images/user/:username", async function (Request, Response) {
    const AccountData = await Modules.Accounts.GetAccount(Request.params.username);
    let ImageName = null;
    if (AccountData.Success) {
        ImageName = AccountData.Account.ProfilePicture;
    }
    const FileExists = FileSystem.existsSync("./client/assets/private/images/user/provided/" + ImageName);
    if (FileExists == true) {
        Response.sendFile(`client/assets/private/images/user/provided/` + ImageName, { root: "./" });
    } else {
        Response.sendFile(`client/assets/private/images/user/${Math.floor(Math.random() * 3) + 1}.png`, { root: "./" });
    };
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

// Require the api file to execute and listen for api requests.
require("./api.js")(ExpressApplication);

//////////////////////////////////////////////////////////////////////////////////////////////////////

// Listen for home page requests.
ExpressApplication.get("/", function (Request, Response) {
    Response.sendFile("client/pages/public/home.html", { root: "./" });
});

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
        const UsernameTaken = await AccountsDatabase.has(Configuration.AdminAccountName.toLowerCase());
        // Note that if the account (username) somehow gets taken before you set the password, the account that was made will NOT get admin privileges.
        if (UsernameTaken == true) {
            // console.log("[Admin Creation]: Admin account creation skipped, admin username is already in use.");
            // @jacobhumston - I feel like this gets annoying sometimes, so it will be commented out for now.
        } else {
            const Password = ConsolePrompt("[Admin Creation]: Please enter a password for the new admin account: ", { echo: "*" });
            const ReEnterPassword = ConsolePrompt("[Admin Creation]: Please re-enter the same password for the new admin account: ", { echo: "*" });
            if (Password != ReEnterPassword) {
                throw "Passwords do not match.";
            }
            const Account = await Modules.Accounts.CreateAccount(Configuration.AdminAccountName, Password, { IsAdmin: true });
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