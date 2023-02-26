let correctCheck =
    "4cac50ea60686e392e3e22256cc61ab9a936a39fb01c2a3bf0751c59feaa7e1f";
let wrongs = [

]

let allInput = () => {
    let guessPlain = $(".digit-group")
        .find("input")
        .map((i, e) => $(e).val())
        .get()
        .join("");
    sha256("check", guessPlain, (guessHash) => {
        console.log(`Guess hash\n '${guessPlain}'\n '${guessHash}'`)
        if (guessHash == correctCheck) {
            sha256("img", guessPlain, (correctHash) => {
                showResult(correctHash, true);
                console.log("Correct!\n" + correctHash)
            });
        }
        else {
            if (wrongs.indexOf(guessHash) > -1) {
                showResult(guessHash, false);
            }
            else if (guessPlain.length == 9) {

            }
        }
    });
};

var showResult = function (hash, isCorrect) {
    $("#final").css("background-image", "url(./guesses/" + hash + ".png");
    $("#final").css("visibility", "visible");
    $("#correctg").css("visibility", isCorrect ? "visible" : "hidden");
    $("#wrongg").css("visibility", !isCorrect ? "visible" : "hidden");
    $(".digit-group")
        .find("input").each((i, e) => $(e).val(""))
}

var clearResult = function () {
    $("#final").css("background-image", "");
    $("#final").css("visibility", "hidden");
    $(".digit-group")
        .find("input").each((i, e) => $(e).val(""))
}

async function _sha256(input = "", algorithm = "SHA-256") {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(input);
    const digest = await crypto.subtle.digest(algorithm, encoded);
    const uints = new Uint8Array(digest);
    const parts = Array.from(uints).map((b) => b.toString(16));
    return parts.join("");
}

let sha256 = (salt, text, callback) => {
    _sha256(salt + "|" + text).then((e) => callback((e || "").toLowerCase()));
};

$(".digit-group")
    .find("input")
    .each(function () {
        $(this).attr("maxlength", 1);
        $(this).on("keyup", function (e) {
            var parent = $($(this).parent());

            if (e.keyCode === 8 || e.keyCode === 37) {
                var prev = parent.find("input#" + $(this).data("previous"));

                if (prev.length) {
                    $(prev).val("")
                    $(prev).select();
                }
            } else {
                if ($(this).val().length == 0) return;
                var next = parent.find("input#" + $(this).data("next"));

                if (next.length) {
                    $(next).val("")
                    $(next).select();
                } else {
                    if (parent.data("autosubmit")) {
                        // parent.submit();
                    }
                }
            }
            allInput();
        });
    });


setInterval(() => {
    fetch("/api/status")
}, 60 * 1000)
fetch("/api/status")