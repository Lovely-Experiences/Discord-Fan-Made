window.onload = function () {
    const SignupButton = document.getElementById("SignupButton");
    const LoginButton = document.getElementById("LoginButton");
    SignupButton.onclick = function () {
        document.location.href = "/login?signup";
    };
    LoginButton.onclick = function () {
        document.location.href = "/login";
    };
};