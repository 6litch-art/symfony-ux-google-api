/**
 * Get the submit buttons from the given form
 */

function getSubmitButtons(form)
{

    var buttons = form.querySelectorAll('button, input');
    var submitButtons = [];

    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        if (button.getAttribute('type') == 'submit') {
            submitButtons.push(button);
        }
    }

    return submitButtons;
}

/**
 * Prevent the submit buttons from submitting a form
 * and invoke the challenge for the given widget id
 */

var nChallenges = {};
function bindChallengeToSubmitButtons(form, widgetRender, widgetParameters)
{

    getSubmitButtons(form).forEach(function (button) {

        if (!(form   in nChallenges)) {
            nChallenges[form] = 0;
        }

        button.addEventListener('click', function (e) {

            e.preventDefault();
            nChallenges[form]++;

            grecaptcha.execute(widgetRender);
        });
    });
}

/**
 * Render a reCAPTCHA from the type
 */
var gRecaptchaReady = false;

function renderReCaptcha(widget)
{

    var form = widget.closest('form');
    var submit = form.querySelectorAll('[type="submit"]');

    var widgetApi  = widget.getAttribute('data-api');
    var widgetType = widget.getAttribute('data-type') || "";
    var widgetName = widget.getAttribute('data-name').replace("[", "_").replace("]", "_");
    var widgetParameters = {
        'id': widget.getAttribute('data-id'),
        'sitekey': widget.getAttribute('data-sitekey') || null,
        'type': widgetType,
        'name': widgetName,
        'action': widgetName,
        'api': widgetApi
    };

    console.log(widgetParameters);
    widgetParameters['callback'] = function (token) {
        document.getElementById(widgetParameters["id"]).value = (token + " " + widgetApi).trim();
    };

    if (widgetType == 'invisible') {
        widgetParameters['size'] = "invisible";
        widgetParameters['callback'] = function (token) {
            document.getElementById(widgetParameters["id"]).value = (token + " " + widgetApi).trim();
            if (--nChallenges[form] == 0) {
                form.submit();
            }
        }
    }

    // Avoid rendering in case grecaptcha is not loaded
    if (!gRecaptchaReady) {
        return;
    }

    widget.innerHTML = ""; // Avoid issue in case of re-rendering

    if (widgetType == 'invisible') {
        submit.forEach(function (el) {

            var widgetRender = grecaptcha.render(el, widgetParameters);
            if (widgetType == 'invisible') {
                bindChallengeToSubmitButtons(form, widgetRender, widgetParameters);
            }
        });
    } else {
        grecaptcha.render(widget, widgetParameters);
    }
}

var alreadyRendered = false, onHold = false;
window.onGoogleLoad = function () {

    gRecaptchaReady = true;

    if (onHold) {
        return; // Hold double grecaptcha execution
    }
    if (!onHold) {
        onHold = true;
    }

    onRendering();
    onHold = false;
}

function onRendering()
{

    if (alreadyRendered) {
        return;
    }
    alreadyRendered = true;

    var widgets = document.querySelectorAll('[data-toggle="recaptcha"]');
    for (var i = 0; i < widgets.length; i++) {
        renderReCaptcha(widgets[i]);
    }
}

/**
 * REMOVE EXISTING LISTENERS
 */
window.removeEventListener("onbeforeunload", onUnload);
window.removeEventListener("load", onLoad);

/**
 * METHODS
 */
function onLoad()
{

    // Make sure grecaptcha is loaded
    if (!gRecaptchaReady) {
        return;
    }

    // Make sure a mutex avoid double rendering
    if (onHold) {
        return;
    }
    if (!onHold) {
        onHold = true;
    }

    onRendering();
    onHold = false;
}

function onUnload()
{
    alreadyRendered = false; // Reset rendering
}

/**
 * ADD LISTENERS
 */
window.addEventListener("onbeforeunload", onUnload);
window.addEventListener("load", onLoad);
