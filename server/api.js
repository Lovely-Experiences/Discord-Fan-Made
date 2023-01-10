const Express = require("express");
const AccountModule = require("./modules/accounts.js");

/**
 * @param {Express.Application} ExpressApplication
 * @returns {void}
 */
module.exports = function (ExpressApplication) {

    const BaseURL = "/api";

    // Listen for request for account details.
    // NOTE: This is limited, and doesn't include details such as the password hash, for obvious reasons.
    ExpressApplication.get(`${BaseURL}/accounts/:username`, async function (Request, Response) {
        const Data = {
            Success: true,
            Error: null,
            Account: null,
        };

        const Username = Request.params.username ?? "a";

        const AccountData = await AccountModule.GetAccount(Username);

        if (AccountData.Success == true) {
            Data.Account = {
                Username: AccountData.Account.Username,
                UID: AccountData.Account.UID,
                CreatedAt: AccountData.Account.CreatedAt,
                IsBot: AccountData.Account.IsBot,
                IsAdmin: AccountData.Account.IsAdmin
            };
        } else {
            Data.Success = false;
            Data.Error = AccountData.Error;
        }

        Response.send(Data);
    });

    return;
};