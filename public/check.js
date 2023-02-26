
let secrets = {
    "63f5e1bb34f9f7b6e651fa5ae0abeecc82f31e3de17279ccd3b45a8a8efd1": 1,
    "343b447838ccf4243947c62595837a5916c9b159bef5478b0735ceb21fe1dca": 2,
    "97ae3ce49ea8266c41df5371b4ec4e470e032ec10abb85f4f3e76e6e41e9481": 2,
    "02c83d4b8bae85b49a7ee8d7ca02f20a94b786a9f6d1f95d9fedac69921fb53": 2,
    "1b6575be6177a34c4123431a59f9aff42a412a6a7f648c1acf725e625a5f3220": 3
}
let texts = {
    0: "איזה בזבוז!|נחש את האמת|לא ניתן להכחישה!",
    1: "יפה ניחשת,|ולמלך לא התכחשת!",
    2: "חה! בדיחה טובה!|ליצן החצר למד ממך",
    3: "מה עשית? מכשף!|אי אהה - איהה"
}
let wrongHash = "bad2"

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

                if (secrets[precheckHash]) {
                    showResult(imageHash, texts[secrets[precheckHash]]);
                }
                else {
                    showResult(wrongHash, texts[0]);
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

var showResult = function (hash, text) {
    $("#final").css("background-image", "url(./guesses/" + hash + ".png");
    $("#final").css("visibility", "visible");
    $("#correctg").css("display", "inline")
    $("#correctg").html(text.replace(/\|/g, '<br/>'))
    $(".digit-group")
        .find("input").each((i, e) => $(e).val(""))
}

var clearResult = function () {
    $("#final").css("background-image", "");
    $("#final").css("visibility", "hidden");
    $("#correctg").css("display", "none");
    $("#wrongg").css("display", "none");
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
    fetch("/api/status2")
}, 60 * 1000)
fetch("/api/status2")