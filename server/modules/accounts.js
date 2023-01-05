const Keyv = require("keyv");
const { v4: CreateUUID } = require("uuid");
const Bcrypt = require("bcrypt");
const AccountsDatabase = new Keyv("sqlite://database/accounts.sqlite");
const SessionsDatabase = new Keyv("sqlite://database/sessions.sqlite");
const Configuration = require("../configuration.json");

module.exports = {
    /**
     * This functions validates the username and password of an account.
     * @param {{Username: string, Password: string}} ValidateObject
     * @returns {Promise<{Passed: boolean, FailureReason: string|null}>} ValidateResult
     */
    ValidateAccount: async function (ValidateObject) {
        // Username and password variables.
        const Username = ValidateObject.Username;
        const Password = ValidateObject.Password;

        // Characters variable. A-Z 0-9
        const Characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

        // Check if username and password are null or undefined.
        if ((Username == null || Username == undefined) || (Password == null || Password == undefined)) {
            return { Passed: false, FailureReason: "Accounts require a username and password." };
        }

        // Check to make sure name and password are a string.
        if (typeof (Username) != "string" || typeof (Password) != "string") {
            return { Passed: false, FailureReason: "Account credentials must be strings." };
        }

        // Check username and password length.
        if ((Username.length < 3 || Username.length > 20) || (Password.length < 5 || Password.length > 100)) {
            return { Passed: false, FailureReason: "Username must be between 3-20 characters long and password must be between 8-100 characters long." };
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

        // Check if the username is only letters and numbers.
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
     * @returns {Promise<{Success: boolean, Error: string|null, Account: {Username: string, PasswordHash: string, UID: string}|null}>} SuccessResult 
     */
    CreateAccount: async function (Username, Password) {
        // Validate the account details, and handle failure accordingly.
        const ValidateResult = await this.ValidateAccount({ Username: Username, Password: Password });
        if (ValidateResult.Passed == false) {
            return { Success: false, Error: `Invalid account details: ${ValidateResult.FailureReason}`, Account: null };
        }

        // Hash password.
        let PasswordHash = null;
        let PasswordHashSuccess = true;
        try {
            const Hash = await Bcrypt.hash(Password, Configuration.Salt);
            PasswordHash = Hash;
        } catch (Error) {
            PasswordHashSuccess = false;
        }

        // Create account's user ID.
        const UID = CreateUUID();

        // Save the account to the database, note that the plain text password is NOT saved.
        // Accounts are saved by username in all lowercase.
        let AccountSaveSuccess = true;
        if (PasswordHashSuccess == true) {
            try {
                await AccountsDatabase.set(Username.toLowerCase(), { Username: Username, PasswordHash: PasswordHash, UID: UID });
            } catch (Error) {
                AccountSaveSuccess = false;
            }
        }

        // If nothing went wrong, the account is created.
        if (PasswordHashSuccess == true && AccountSaveSuccess == true) {
            return { Success: true, Error: false, Account: { Username: Username, PasswordHash: PasswordHash, UID: UID } };
        } else {
            return { Success: false, Error: "An unexpected error occurred.", Account: null };
        }
    }
};