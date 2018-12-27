const chars = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
const randomLength = 6;
const urlBase = "https://prnt.sc/";

function getCurrentUrl() {
    const buttons = $("#button-pack");
    const inputUrl = $("input[name=start-url]").val();
    if (!inputUrl) {
        buttons.hide();
        log("Please enter an URL", "danger");
        return;
    }

    const match = inputUrl.match(/^(https:\/\/prnt.sc\/)([0-9a-z]+)/);
    if (!match) {
        buttons.hide();
        log("What is this URL?", "danger");
        return;
    }
    const url = match[0];
    const baseUrl = match[1];
    const imageId = match[2];

    buttons.show();

    return [url, baseUrl, imageId];
}

function setCurrentUrl(url) {
    $("input[name=start-url]").val(url);
}

function loadUrl() {
    const inputUrl = getCurrentUrl();
    if (!inputUrl) return;

    const url = inputUrl[0];
    const imageId = inputUrl[2];

    log("Loading: "+url);
    $.get("https://cors.io/?"+url, function(content) {
        const r = content.match(/https:\/\/image\.prntscr\.com\/image\/.*?\.(png|jpeg|jpg)/);

        const container = $("#content-container");

        if (!r) {
            log("Failed to load image "+imageId, "danger");
            return;
        }
        const imageUrl = r[0];

        let img = $("<img/>");

        img.one("load", function() {
            log(false);
            container.empty();
            container.append(img);
        });

        img.attr("src", imageUrl);

    }, "html");


}

function nextId(url) {
    const charsLen = chars.length;
    const str = url.split("");
    const reversed = str.reverse();
    for (const k in reversed) {
        const char = reversed[k];
        const index = chars.indexOf(char);
        if (index == -1) {
            log("What is this sorcery??", "danger");
            return false;
        }
        if (index+1 == charsLen) {
            reversed[k] = chars[0];
            continue;
        }

        reversed[k] = chars[index+1];
        break;
    }
    return reversed.reverse().join("");
}
function prevId(url) {
    const charsLen = chars.length;
    const str = url.split("");
    const reversed = str.reverse();
    for (const k in reversed) {
        const char = reversed[k];
        const index = chars.indexOf(char);
        if (index == -1) {
            log("What is this sorcery??", "danger");
            return false;
        }
        if (index == 0) {
            reversed[k] = chars[charsLen-1];
            continue;
        }

        reversed[k] = chars[index-1];
        break;
    }
    return reversed.reverse().join("");
}

function loadPrev() {
    const inputUrl = getCurrentUrl();
    if (!inputUrl) return;
    const url = inputUrl[1] + prevId(inputUrl[2]);
    setCurrentUrl(url);
    loadUrl();
}

function loadNext() {
    const inputUrl = getCurrentUrl();
    if (!inputUrl) return;
    const url = inputUrl[1] + nextId(inputUrl[2]);
    setCurrentUrl(url);
    loadUrl();
}

// "They did research, you know.. 60% of the time - it work's every time! ;-)"
function randomPage() {
    let random = [];

    for (let i=0; i<randomLength; i++) {
        random[i] = chars[Math.floor(Math.random()*chars.length)];
    }

    const url = urlBase + random.join("");
    setCurrentUrl(url);
    loadUrl();
}

let lastLogClass = null;

function log(str, type) {
    const log = $("#log");
    type = (typeof type !== 'undefined') ? type : "info";

    if (!str) {
        log.hide();
        return;
    }

    const alertClass = "alert-"+type;
    if (!lastLogClass) {
        lastLogClass = alertClass;
        log.addClass(alertClass);
    }
    if (lastLogClass && lastLogClass != alertClass) {
        log.removeClass(lastLogClass);
        lastLogClass = alertClass;
        log.addClass(alertClass);
    }

    log.show();
    log.text(str);
}

$(document).ready(function() {
    log(false);
});

document.onkeydown = function(e) {
    e = e || window.event;
    const key = e.key;

    if (key.toLowerCase() == 'p') {
        loadPrev();
    } else if (key.toLowerCase() == 'n') {
        loadNext();
    }
};