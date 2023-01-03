// Variables & Required Modules
const Express = require("express");
const FileSystem = require("fs");
const Bcrypt = require('bcrypt');
const Configuration = require("./configuration.json");
const ExpressApplication = Express();

/**
 * This functions validates the username and password of an account.
 * @param {{Username: string, Password: string}} ValidateObject 
 * @returns {{Passed: boolean, FailureReason: string|null}} ValidateResult
 */
function ValidateAccount(ValidateObject) {
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
    let ContainsSpecialCharacters = false;
    for (I = 0; I < Password.length; I++) {
        const Character = Password.charAt(I);
        if (Characters.indexOf(Character.toUpperCase()) == -1) {
            ContainsSpecialCharacters = true;
        }
    }
    if (ContainsSpecialCharacters == false) {
        return { Passed: false, FailureReason: "Password must contain a special character." };
    }

    // Return passed as true if no checks failed.
    return { Passed: true, FailureReason: null };
}

/**
 * This functions creates an account. Uses the validator function to validate everything.
 * @param {string} Username 
 * @param {string} Password
 * @returns {Promise<{Success: boolean, Error: string|null, Account: {Username: string, PasswordHash: string}|null}>} SuccessResult 
 */
async function CreateAccount(Username, Password) {
    // Validate the account details, and handle failure accordingly.
    const ValidateResult = ValidateAccount({ Username: Username, Password: Password });
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

    // If nothing went wrong, the account is created.
    if (PasswordHashSuccess == true) {
        return { Success: true, Error: false, Account: { Username: Username, PasswordHash: PasswordHash } };
    } else {
        return { Success: false, Error: "An unexpected error occurred.", Account: null };
    }
}

// This functions retrieves an account object.
function GetAccount() {

}

// Start listening to requests made to the provided port.
ExpressApplication.listen(Configuration.Port, async function () {
    console.log(`Listening to port ${Configuration.Port}.`);
    console.log(await CreateAccount("Billy", "test!!!"));
    return;
});