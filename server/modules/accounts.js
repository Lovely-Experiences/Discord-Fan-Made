const Keyv = require("keyv");
const { v4: CreateUUID } = require("uuid");
const Bcrypt = require("bcrypt");
const AccountsDatabase = new Keyv("sqlite://database/accounts.sqlite");
const SessionsDatabase = new Keyv("sqlite://database/sessions.sqlite");
const Configuration = require("../configuration.json");

module.exports = {
    /**
     * AccountObject 
     * @typedef {{Username: string, PasswordHash: string, UID: string, CreatedAt: Date, IsAdmin: boolean, IsBot: boolean, ProfilePicture: string|undefined}} AccountObject
     */

    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * This functions validates the username and password of an account.
     * @param {string} Username
     * @param {string} Password
     * @returns {Promise<{Passed: boolean, FailureReason: string|null}>}
     */
    ValidateAccount: async function (Username, Password) {
        // Characters variable. A-Z 0-9 _
        const Characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "_"];

        // Check if username and password are null or undefined.
        if ((Username == null || Username == undefined) || (Password == null || Password == undefined)) {
            return { Passed: false, FailureReason: "Accounts require a username and password." };
        }

        // Check to make sure name and password are a string.
        if (typeof (Username) != "string" || typeof (Password) != "string") {
            return { Passed: false, FailureReason: "Account credentials must be strings." };
        }

        // Check username and password length.
        if ((Username.length < 3 || Username.length > 20) || Password.length < 5) {
            return { Passed: false, FailureReason: "Username must be between 3-20 characters long and password must be between at least 8 characters long." };
        }

        // Check to make sure the password isn't too long.
        if (Buffer.byteLength(Password, "utf-8") > 70) {
            return { Passed: false, FailureReason: "Password is too long, must be under ~70 characters." };
        }

        // Check if the password is not just letters and numbers.
        let PasswordContainsSpecialCharacters = false;
        for (I = 0; I < Password.length; I++) {
            const Character = Password.charAt(I);
            if (Characters.indexOf(Character.toUpperCase()) == -1) {
                PasswordContainsSpecialCharacters = true;
            }
        }
        if (PasswordContainsSpecialCharacters == false) {
            return { Passed: false, FailureReason: "Password must contain a special character." };
        }

        // Check if the username is only letters and numbers. (Also includes '_'.)
        let UsernameContainsSpecialCharacters = false;
        for (I = 0; I < Username.length; I++) {
            const Character = Username.charAt(I);
            if (Characters.indexOf(Character.toUpperCase()) == -1) {
                UsernameContainsSpecialCharacters = true;
            }
        }
        if (UsernameContainsSpecialCharacters == true) {
            return { Passed: false, FailureReason: "Username can only be letters and numbers." };
        }

        // Check to make sure the username does not start or end with an underscore.
        if (Username.startsWith("_") || Username.endsWith("_")) {
            return { Passed: false, FailureReason: "Username cannot begin or end with an underscore." };
        }

        // Check if account username is already being used.
        let AccountAlreadyBeingUsed = false;
        try {
            AccountAlreadyBeingUsed = await AccountsDatabase.has(Username.toLowerCase());
        } catch (Error) {
            AccountAlreadyBeingUsed = true;
        }
        if (AccountAlreadyBeingUsed == true) {
            return { Passed: false, FailureReason: "Username is already being used." };
        }

        // Return passed as true if no checks failed.
        return { Passed: true, FailureReason: null };
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * This functions creates an account. Uses the validator function to validate everything.
     * @param {string} Username 
     * @param {string} Password
     * @param {{IsAdmin: boolean?, IsBot: boolean?}?} ExtraInfo
     * @returns {Promise<{Success: boolean, Error: string|null, Account: AccountObject|null}>} SuccessResult 
     */
    CreateAccount: async function (Username, Password, ExtraInfo) {
        // Validate the account details, and handle failure accordingly.
        const ValidateResult = await this.ValidateAccount(Username, Password);
        if (ValidateResult.Passed == false) {
            return { Success: false, Error: `Invalid account details: ${ValidateResult.FailureReason}`, Account: null };
        }

        // Setting the default values if they are not provided.
        ExtraInfo = ExtraInfo ?? {};
        const IsBot = ExtraInfo.IsBot ?? false;
        const IsAdmin = ExtraInfo.IsAdmin ?? false;

        // Hash password.
        let PasswordHash = null;
        let PasswordHashSuccess = true;
        try {
            const Hash = await Bcrypt.hash(Password, Configuration.BcryptSalt);
            PasswordHash = Hash;
        } catch (Error) {
            PasswordHashSuccess = false;
        }

        // Create account's user ID.
        const UID = CreateUUID();

        // Create account 'CreatedAt' date.
        const CreatedAt = new Date();

        // Save the account to the database, note that the plain text password is NOT saved.
        // Accounts are saved by username in all lowercase.
        let AccountSaveSuccess = true;
        if (PasswordHashSuccess == true) {
            try {
                await AccountsDatabase.set(Username.toLowerCase(), { Username: Username, PasswordHash: PasswordHash, UID: UID, CreatedAt: CreatedAt, IsAdmin: IsAdmin, IsBot: IsBot });
            } catch (Error) {
                AccountSaveSuccess = false;
            }
        }

        // If nothing went wrong, the account is created.
        if (PasswordHashSuccess == true && AccountSaveSuccess == true) {
            return { Success: true, Error: false, Account: { Username: Username, PasswordHash: PasswordHash, UID: UID, CreatedAt: CreatedAt, IsAdmin: IsAdmin, IsBot: IsBot } };
        } else {
            return { Success: false, Error: "An unexpected error occurred.", Account: null };
        }
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get the account details of a user by username.
     * @param {string} Username
     * @returns {Promise<{Success: boolean, Error: string|null, Account: AccountObject|null}>} 
     */
    GetAccount: async function (Username) {
        let Success = true;
        let Error = null;
        let Account = {};
        try {
            Account = await AccountsDatabase.get(Username.toLowerCase());
            if (Account == null || Account == undefined) {
                Error = "Account does not exist.";
            } else {
                Account.CreatedAt = new Date(Account.CreatedAt);
            }
        } catch (ErrorResult) {
            Error = ErrorResult;
        }
        if (Error != null) {
            Success = false;
            Account = null;
        }
        return { Success: Success, Error: Error, Account: Account };
    }

};