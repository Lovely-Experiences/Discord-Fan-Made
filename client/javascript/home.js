window.onload = function () {
    const SignupButton = document.getElementById("SignupButton");
    const LoginButton = document.getElementById("LoginButton");
    SignupButton.onclick = function () {
        document.location.href = "/login?signup";
    };
    LoginButton.onclick = function () {
        document.location.href = "/login";
    };
    if (window.matchMedia) {
        const BrowserIcon = document.getElementById("BrowserIcon");
        const Result = window.matchMedia("(prefers-color-scheme: dark)");
        function ColorChange(Matches) {
            if (Matches) {
                BrowserIcon.href = "assets/images/icon/zoomed-white.png";
            } else {
                BrowserIcon.href = "assets/images/icon/zoomed-black.png";
            }
        }
        ColorChange(Result.matches);
        Result.onchange = function (EventResult) {
            ColorChange(EventResult.matches);
        };
    }
};