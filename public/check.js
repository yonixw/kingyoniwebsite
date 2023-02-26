let correctCheck =
    "63f5e1bb34f9f7b6e651fa5ae0abeecc82f31e3de17279ccd3b45a8a8efd1";
let secrets = [

]
let wrongHash = "63f5e1bb34f9f7b6e651fa5ae0abeecc82f31e3de17279ccd3b45a8a8efd1"

let allInput = () => {
    let guessPlain = $(".digit-group")
        .find("input")
        .map((i, e) => $(e).val())
        .get()
        .join("");

    if (guessPlain.length == 10) {

        sha256("check", guessPlain, (precheckHash) => {


            sha256("img", guessPlain, (imageHash) => {
                console.table({ guessPlain, precheckHash, imageHash })

                if (precheckHash == correctCheck) {
                    showResult(imageHash, true);
                    console.log("Correct!\n" + imageHash)
                }
                else if (secrets.indexOf(precheckHash) > -1) {
                    showResult(imageHash, false);
                }
                else {
                    showResult(wrongHash, false);
                }

                let guessParams = new URLSearchParams()
                guessParams.append("guess", guessPlain)
                guessParams.append("precheckHash", precheckHash)
                guessParams.append("imageHash", imageHash)

                fetch("/api/guess?" + guessParams.toString())
            });

        });
    }
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
    $("#correctg").css("visibility", "hidden");
    $("#wrongg").css("visibility", "hidden");
    $(".digit-group")
        .find("input").each((i, e) => $(e).val(""))
    $("#input-dot").val(".")
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