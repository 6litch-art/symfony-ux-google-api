/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*****************************!*\
  !*** ./assets/recaptcha.js ***!
  \*****************************/
/**
 * Get the submit buttons from the given form
 */

function getSubmitButtons(form) {
  var buttons = form.querySelectorAll('button, input');
  var submitButtons = [];
  for (var i = 0; i < buttons.length; i++) {
    var button = buttons[i];
    if (button.getAttribute('type') == 'submit') submitButtons.push(button);
  }
  return submitButtons;
}

/**
 * Prevent the submit buttons from submitting a form
 * and invoke the challenge for the given widget id
 */

var nChallenges = {};
function bindChallengeToSubmitButtons(form, widgetRender, widgetParameters) {
  getSubmitButtons(form).forEach(function (button) {
    if (!(form in nChallenges)) nChallenges[form] = 0;
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
function renderReCaptcha(widget) {
  var form = widget.closest('form');
  var submit = form.querySelectorAll('[type="submit"]');
  var widgetApi = widget.getAttribute('data-api');
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
  widgetParameters['callback'] = function (token) {
    document.getElementById(widgetParameters["id"]).value = (token + " " + widgetApi).trim();
  };
  if (widgetType == 'invisible') {
    widgetParameters['size'] = "invisible";
    widgetParameters['callback'] = function (token) {
      document.getElementById(widgetParameters["id"]).value = (token + " " + widgetApi).trim();
      if (--nChallenges[form] == 0) form.submit();
    };
  }

  // Avoid rendering in case grecaptcha is not loaded
  if (!gRecaptchaReady) return;
  widget.innerHTML = ""; // Avoid issue in case of re-rendering

  if (widgetType == 'invisible') {
    submit.forEach(function (el) {
      var widgetRender = grecaptcha.render(el, widgetParameters);
      if (widgetType == 'invisible') bindChallengeToSubmitButtons(form, widgetRender, widgetParameters);
    });
  } else {
    grecaptcha.render(widget, widgetParameters);
  }
}
var alreadyRendered = false,
  onHold = false;
window.onGoogleLoad = function () {
  gRecaptchaReady = true;
  if (onHold) return; // Hold double grecaptcha execution
  if (!onHold) onHold = true;
  onRendering();
  onHold = false;
};
function onRendering() {
  if (alreadyRendered) return;
  alreadyRendered = true;
  var widgets = document.querySelectorAll('[data-toggle="recaptcha"]');
  for (var i = 0; i < widgets.length; i++) renderReCaptcha(widgets[i]);
}

/**
 * REMOVE EXISTING LISTENERS
 */
window.removeEventListener("onbeforeunload", onUnload);
window.removeEventListener("load", onLoad);

/**
 * METHODS
 */
function onLoad() {
  // Make sure grecaptcha is loaded
  if (!gRecaptchaReady) return;

  // Make sure a mutex avoid double rendering
  if (onHold) return;
  if (!onHold) onHold = true;
  onRendering();
  onHold = false;
}
function onUnload() {
  alreadyRendered = false; // Reset rendering
}

/**
 * ADD LISTENERS
 */
window.addEventListener("onbeforeunload", onUnload);
window.addEventListener("load", onLoad);
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjYXB0Y2hhLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBOztBQUVBLFNBQVNBLGdCQUFnQkEsQ0FBQ0MsSUFBSSxFQUFFO0VBRTVCLElBQUlDLE9BQU8sR0FBR0QsSUFBSSxDQUFDRSxnQkFBZ0IsQ0FBQyxlQUFlLENBQUM7RUFDcEQsSUFBSUMsYUFBYSxHQUFHLEVBQUU7RUFFdEIsS0FBSyxJQUFJQyxDQUFDLEdBQUUsQ0FBQyxFQUFFQSxDQUFDLEdBQUdILE9BQU8sQ0FBQ0ksTUFBTSxFQUFFRCxDQUFDLEVBQUUsRUFBRTtJQUVwQyxJQUFJRSxNQUFNLEdBQUdMLE9BQU8sQ0FBQ0csQ0FBQyxDQUFDO0lBQ3ZCLElBQUlFLE1BQU0sQ0FBQ0MsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFFBQVEsRUFDdkNKLGFBQWEsQ0FBQ0ssSUFBSSxDQUFDRixNQUFNLENBQUM7RUFDbEM7RUFFQSxPQUFPSCxhQUFhO0FBQ3hCOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQUlNLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDcEIsU0FBU0MsNEJBQTRCQSxDQUFDVixJQUFJLEVBQUVXLFlBQVksRUFBRUMsZ0JBQWdCLEVBQUU7RUFFeEViLGdCQUFnQixDQUFDQyxJQUFJLENBQUMsQ0FBQ2EsT0FBTyxDQUFDLFVBQVVQLE1BQU0sRUFBRTtJQUU3QyxJQUFHLEVBQUVOLElBQUksSUFBTVMsV0FBVyxDQUFDLEVBQ3ZCQSxXQUFXLENBQUNULElBQUksQ0FBQyxHQUFHLENBQUM7SUFFekJNLE1BQU0sQ0FBQ1EsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVVDLENBQUMsRUFBRTtNQUUxQ0EsQ0FBQyxDQUFDQyxjQUFjLEVBQUU7TUFDbEJQLFdBQVcsQ0FBQ1QsSUFBSSxDQUFDLEVBQUU7TUFFbkJpQixVQUFVLENBQUNDLE9BQU8sQ0FBQ1AsWUFBWSxDQUFDO0lBQ3BDLENBQUMsQ0FBQztFQUNOLENBQUMsQ0FBQztBQUNOOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUlRLGVBQWUsR0FBRyxLQUFLO0FBRTNCLFNBQVNDLGVBQWVBLENBQUNDLE1BQU0sRUFBRTtFQUU3QixJQUFJckIsSUFBSSxHQUFHcUIsTUFBTSxDQUFDQyxPQUFPLENBQUMsTUFBTSxDQUFDO0VBQ2pDLElBQUlDLE1BQU0sR0FBR3ZCLElBQUksQ0FBQ0UsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUM7RUFFckQsSUFBSXNCLFNBQVMsR0FBSUgsTUFBTSxDQUFDZCxZQUFZLENBQUMsVUFBVSxDQUFDO0VBQ2hELElBQUlrQixVQUFVLEdBQUdKLE1BQU0sQ0FBQ2QsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7RUFDdkQsSUFBSW1CLFVBQVUsR0FBR0wsTUFBTSxDQUFDZCxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUNvQixPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDQSxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztFQUNyRixJQUFJZixnQkFBZ0IsR0FBRztJQUNuQixJQUFJLEVBQUVTLE1BQU0sQ0FBQ2QsWUFBWSxDQUFDLFNBQVMsQ0FBQztJQUNwQyxTQUFTLEVBQUVjLE1BQU0sQ0FBQ2QsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUk7SUFDdEQsTUFBTSxFQUFFa0IsVUFBVTtJQUNsQixNQUFNLEVBQUVDLFVBQVU7SUFDbEIsUUFBUSxFQUFFQSxVQUFVO0lBQ3BCLEtBQUssRUFBRUY7RUFDWCxDQUFDO0VBRURaLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLFVBQVVnQixLQUFLLEVBQUU7SUFDNUNDLFFBQVEsQ0FBQ0MsY0FBYyxDQUFDbEIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQ21CLEtBQUssR0FBRyxDQUFDSCxLQUFLLEdBQUcsR0FBRyxHQUFHSixTQUFTLEVBQUVRLElBQUksRUFBRTtFQUM1RixDQUFDO0VBRUQsSUFBSVAsVUFBVSxJQUFJLFdBQVcsRUFBRTtJQUUzQmIsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEdBQUcsV0FBVztJQUN0Q0EsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFBVWdCLEtBQUssRUFBRTtNQUM1Q0MsUUFBUSxDQUFDQyxjQUFjLENBQUNsQixnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDbUIsS0FBSyxHQUFHLENBQUNILEtBQUssR0FBRyxHQUFHLEdBQUdKLFNBQVMsRUFBRVEsSUFBSSxFQUFFO01BQ3hGLElBQUcsRUFBRXZCLFdBQVcsQ0FBQ1QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFQSxJQUFJLENBQUN1QixNQUFNLEVBQUU7SUFDOUMsQ0FBQztFQUNMOztFQUVBO0VBQ0EsSUFBRyxDQUFDSixlQUFlLEVBQUU7RUFFckJFLE1BQU0sQ0FBQ1ksU0FBUyxHQUFHLEVBQUUsQ0FBQyxDQUFDOztFQUV2QixJQUFJUixVQUFVLElBQUksV0FBVyxFQUFFO0lBQzNCRixNQUFNLENBQUNWLE9BQU8sQ0FBQyxVQUFTcUIsRUFBRSxFQUFFO01BRXhCLElBQUl2QixZQUFZLEdBQUdNLFVBQVUsQ0FBQ2tCLE1BQU0sQ0FBQ0QsRUFBRSxFQUFFdEIsZ0JBQWdCLENBQUM7TUFDMUQsSUFBSWEsVUFBVSxJQUFJLFdBQVcsRUFDekJmLDRCQUE0QixDQUFDVixJQUFJLEVBQUVXLFlBQVksRUFBRUMsZ0JBQWdCLENBQUM7SUFDMUUsQ0FBQyxDQUFDO0VBRU4sQ0FBQyxNQUFNO0lBQ0hLLFVBQVUsQ0FBQ2tCLE1BQU0sQ0FBQ2QsTUFBTSxFQUFFVCxnQkFBZ0IsQ0FBQztFQUMvQztBQUNKO0FBRUEsSUFBSXdCLGVBQWUsR0FBRyxLQUFLO0VBQUVDLE1BQU0sR0FBRyxLQUFLO0FBQzNDQyxNQUFNLENBQUNDLFlBQVksR0FBRyxZQUFXO0VBRTdCcEIsZUFBZSxHQUFHLElBQUk7RUFFdEIsSUFBSWtCLE1BQU0sRUFBRSxPQUFPLENBQUM7RUFDcEIsSUFBRyxDQUFDQSxNQUFNLEVBQUVBLE1BQU0sR0FBRyxJQUFJO0VBRXpCRyxXQUFXLEVBQUU7RUFDYkgsTUFBTSxHQUFHLEtBQUs7QUFDbEIsQ0FBQztBQUVELFNBQVNHLFdBQVdBLENBQUEsRUFBRztFQUVuQixJQUFHSixlQUFlLEVBQUU7RUFDcEJBLGVBQWUsR0FBRyxJQUFJO0VBRXRCLElBQUlLLE9BQU8sR0FBR1osUUFBUSxDQUFDM0IsZ0JBQWdCLENBQUMsMkJBQTJCLENBQUM7RUFDcEUsS0FBSyxJQUFJRSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdxQyxPQUFPLENBQUNwQyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUNuQ2dCLGVBQWUsQ0FBQ3FCLE9BQU8sQ0FBQ3JDLENBQUMsQ0FBQyxDQUFDO0FBQ25DOztBQUVBO0FBQ0E7QUFDQTtBQUNBa0MsTUFBTSxDQUFDSSxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRUMsUUFBUSxDQUFDO0FBQ3RETCxNQUFNLENBQUNJLG1CQUFtQixDQUFDLE1BQU0sRUFBRUUsTUFBTSxDQUFDOztBQUUxQztBQUNBO0FBQ0E7QUFDQyxTQUFTQSxNQUFNQSxDQUFBLEVBQUc7RUFFZjtFQUNBLElBQUcsQ0FBQ3pCLGVBQWUsRUFBRTs7RUFFckI7RUFDQSxJQUFJa0IsTUFBTSxFQUFFO0VBQ1osSUFBRyxDQUFDQSxNQUFNLEVBQUVBLE1BQU0sR0FBRyxJQUFJO0VBRXpCRyxXQUFXLEVBQUU7RUFDYkgsTUFBTSxHQUFHLEtBQUs7QUFDbEI7QUFFQSxTQUFTTSxRQUFRQSxDQUFBLEVBQ2pCO0VBQ0lQLGVBQWUsR0FBRyxLQUFLLENBQUMsQ0FBQztBQUM3Qjs7QUFFQTtBQUNBO0FBQ0E7QUFDQUUsTUFBTSxDQUFDeEIsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUU2QixRQUFRLENBQUM7QUFDbkRMLE1BQU0sQ0FBQ3hCLGdCQUFnQixDQUFDLE1BQU0sRUFBRThCLE1BQU0sQ0FBQyxDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vYXNzZXRzL3JlY2FwdGNoYS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEdldCB0aGUgc3VibWl0IGJ1dHRvbnMgZnJvbSB0aGUgZ2l2ZW4gZm9ybVxuICovXG5cbmZ1bmN0aW9uIGdldFN1Ym1pdEJ1dHRvbnMoZm9ybSkge1xuXG4gICAgdmFyIGJ1dHRvbnMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoJ2J1dHRvbiwgaW5wdXQnKTtcbiAgICB2YXIgc3VibWl0QnV0dG9ucyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaT0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICB2YXIgYnV0dG9uID0gYnV0dG9uc1tpXTtcbiAgICAgICAgaWYgKGJ1dHRvbi5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSA9PSAnc3VibWl0JylcbiAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbnMucHVzaChidXR0b24pO1xuICAgIH1cblxuICAgIHJldHVybiBzdWJtaXRCdXR0b25zO1xufVxuXG4vKipcbiAqIFByZXZlbnQgdGhlIHN1Ym1pdCBidXR0b25zIGZyb20gc3VibWl0dGluZyBhIGZvcm1cbiAqIGFuZCBpbnZva2UgdGhlIGNoYWxsZW5nZSBmb3IgdGhlIGdpdmVuIHdpZGdldCBpZFxuICovXG5cbnZhciBuQ2hhbGxlbmdlcyA9IHt9O1xuZnVuY3Rpb24gYmluZENoYWxsZW5nZVRvU3VibWl0QnV0dG9ucyhmb3JtLCB3aWRnZXRSZW5kZXIsIHdpZGdldFBhcmFtZXRlcnMpIHtcblxuICAgIGdldFN1Ym1pdEJ1dHRvbnMoZm9ybSkuZm9yRWFjaChmdW5jdGlvbiAoYnV0dG9uKSB7XG5cbiAgICAgICAgaWYoIShmb3JtICAgaW4gbkNoYWxsZW5nZXMpKVxuICAgICAgICAgICAgbkNoYWxsZW5nZXNbZm9ybV0gPSAwO1xuXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIG5DaGFsbGVuZ2VzW2Zvcm1dKys7XG5cbiAgICAgICAgICAgIGdyZWNhcHRjaGEuZXhlY3V0ZSh3aWRnZXRSZW5kZXIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgYSByZUNBUFRDSEEgZnJvbSB0aGUgdHlwZVxuICovXG52YXIgZ1JlY2FwdGNoYVJlYWR5ID0gZmFsc2U7XG5cbmZ1bmN0aW9uIHJlbmRlclJlQ2FwdGNoYSh3aWRnZXQpIHtcblxuICAgIHZhciBmb3JtID0gd2lkZ2V0LmNsb3Nlc3QoJ2Zvcm0nKTtcbiAgICB2YXIgc3VibWl0ID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKCdbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gICAgdmFyIHdpZGdldEFwaSAgPSB3aWRnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWFwaScpO1xuICAgIHZhciB3aWRnZXRUeXBlID0gd2lkZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS10eXBlJykgfHwgXCJcIjtcbiAgICB2YXIgd2lkZ2V0TmFtZSA9IHdpZGdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbmFtZScpLnJlcGxhY2UoXCJbXCIsIFwiX1wiKS5yZXBsYWNlKFwiXVwiLCBcIl9cIik7XG4gICAgdmFyIHdpZGdldFBhcmFtZXRlcnMgPSB7XG4gICAgICAgICdpZCc6IHdpZGdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSxcbiAgICAgICAgJ3NpdGVrZXknOiB3aWRnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXNpdGVrZXknKSB8fCBudWxsLFxuICAgICAgICAndHlwZSc6IHdpZGdldFR5cGUsXG4gICAgICAgICduYW1lJzogd2lkZ2V0TmFtZSwgXG4gICAgICAgICdhY3Rpb24nOiB3aWRnZXROYW1lLCBcbiAgICAgICAgJ2FwaSc6IHdpZGdldEFwaVxuICAgIH07XG5cbiAgICB3aWRnZXRQYXJhbWV0ZXJzWydjYWxsYmFjayddID0gZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHdpZGdldFBhcmFtZXRlcnNbXCJpZFwiXSkudmFsdWUgPSAodG9rZW4gKyBcIiBcIiArIHdpZGdldEFwaSkudHJpbSgpO1xuICAgIH07XG5cbiAgICBpZiAod2lkZ2V0VHlwZSA9PSAnaW52aXNpYmxlJykge1xuXG4gICAgICAgIHdpZGdldFBhcmFtZXRlcnNbJ3NpemUnXSA9IFwiaW52aXNpYmxlXCI7XG4gICAgICAgIHdpZGdldFBhcmFtZXRlcnNbJ2NhbGxiYWNrJ10gPSBmdW5jdGlvbiAodG9rZW4pIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHdpZGdldFBhcmFtZXRlcnNbXCJpZFwiXSkudmFsdWUgPSAodG9rZW4gKyBcIiBcIiArIHdpZGdldEFwaSkudHJpbSgpO1xuICAgICAgICAgICAgaWYoLS1uQ2hhbGxlbmdlc1tmb3JtXSA9PSAwKSBmb3JtLnN1Ym1pdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXZvaWQgcmVuZGVyaW5nIGluIGNhc2UgZ3JlY2FwdGNoYSBpcyBub3QgbG9hZGVkXG4gICAgaWYoIWdSZWNhcHRjaGFSZWFkeSkgcmV0dXJuO1xuXG4gICAgd2lkZ2V0LmlubmVySFRNTCA9IFwiXCI7IC8vIEF2b2lkIGlzc3VlIGluIGNhc2Ugb2YgcmUtcmVuZGVyaW5nXG5cbiAgICBpZiAod2lkZ2V0VHlwZSA9PSAnaW52aXNpYmxlJykge1xuICAgICAgICBzdWJtaXQuZm9yRWFjaChmdW5jdGlvbihlbCkge1xuXG4gICAgICAgICAgICB2YXIgd2lkZ2V0UmVuZGVyID0gZ3JlY2FwdGNoYS5yZW5kZXIoZWwsIHdpZGdldFBhcmFtZXRlcnMpO1xuICAgICAgICAgICAgaWYgKHdpZGdldFR5cGUgPT0gJ2ludmlzaWJsZScpXG4gICAgICAgICAgICAgICAgYmluZENoYWxsZW5nZVRvU3VibWl0QnV0dG9ucyhmb3JtLCB3aWRnZXRSZW5kZXIsIHdpZGdldFBhcmFtZXRlcnMpO1xuICAgICAgICB9KTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIGdyZWNhcHRjaGEucmVuZGVyKHdpZGdldCwgd2lkZ2V0UGFyYW1ldGVycyk7XG4gICAgfVxufVxuXG52YXIgYWxyZWFkeVJlbmRlcmVkID0gZmFsc2UsIG9uSG9sZCA9IGZhbHNlO1xud2luZG93Lm9uR29vZ2xlTG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgZ1JlY2FwdGNoYVJlYWR5ID0gdHJ1ZTtcblxuICAgIGlmIChvbkhvbGQpIHJldHVybjsgLy8gSG9sZCBkb3VibGUgZ3JlY2FwdGNoYSBleGVjdXRpb25cbiAgICBpZighb25Ib2xkKSBvbkhvbGQgPSB0cnVlO1xuICAgIFxuICAgIG9uUmVuZGVyaW5nKCk7XG4gICAgb25Ib2xkID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIG9uUmVuZGVyaW5nKCkge1xuXG4gICAgaWYoYWxyZWFkeVJlbmRlcmVkKSByZXR1cm47XG4gICAgYWxyZWFkeVJlbmRlcmVkID0gdHJ1ZTtcblxuICAgIHZhciB3aWRnZXRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdG9nZ2xlPVwicmVjYXB0Y2hhXCJdJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB3aWRnZXRzLmxlbmd0aDsgaSsrKVxuICAgICAgICByZW5kZXJSZUNhcHRjaGEod2lkZ2V0c1tpXSk7XG59XG5cbi8qKlxuICogUkVNT1ZFIEVYSVNUSU5HIExJU1RFTkVSU1xuICovXG53aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm9uYmVmb3JldW5sb2FkXCIsIG9uVW5sb2FkKTtcbndpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCBvbkxvYWQpO1xuXG4vKipcbiAqIE1FVEhPRFNcbiAqL1xuIGZ1bmN0aW9uIG9uTG9hZCgpIHtcblxuICAgIC8vIE1ha2Ugc3VyZSBncmVjYXB0Y2hhIGlzIGxvYWRlZFxuICAgIGlmKCFnUmVjYXB0Y2hhUmVhZHkpIHJldHVybjtcblxuICAgIC8vIE1ha2Ugc3VyZSBhIG11dGV4IGF2b2lkIGRvdWJsZSByZW5kZXJpbmdcbiAgICBpZiAob25Ib2xkKSByZXR1cm47XG4gICAgaWYoIW9uSG9sZCkgb25Ib2xkID0gdHJ1ZTtcbiAgICBcbiAgICBvblJlbmRlcmluZygpO1xuICAgIG9uSG9sZCA9IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBvblVubG9hZCgpXG57XG4gICAgYWxyZWFkeVJlbmRlcmVkID0gZmFsc2U7IC8vIFJlc2V0IHJlbmRlcmluZ1xufVxuXG4vKipcbiAqIEFERCBMSVNURU5FUlNcbiAqL1xud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvbmJlZm9yZXVubG9hZFwiLCBvblVubG9hZCk7XG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgb25Mb2FkKTtcbiJdLCJuYW1lcyI6WyJnZXRTdWJtaXRCdXR0b25zIiwiZm9ybSIsImJ1dHRvbnMiLCJxdWVyeVNlbGVjdG9yQWxsIiwic3VibWl0QnV0dG9ucyIsImkiLCJsZW5ndGgiLCJidXR0b24iLCJnZXRBdHRyaWJ1dGUiLCJwdXNoIiwibkNoYWxsZW5nZXMiLCJiaW5kQ2hhbGxlbmdlVG9TdWJtaXRCdXR0b25zIiwid2lkZ2V0UmVuZGVyIiwid2lkZ2V0UGFyYW1ldGVycyIsImZvckVhY2giLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsInByZXZlbnREZWZhdWx0IiwiZ3JlY2FwdGNoYSIsImV4ZWN1dGUiLCJnUmVjYXB0Y2hhUmVhZHkiLCJyZW5kZXJSZUNhcHRjaGEiLCJ3aWRnZXQiLCJjbG9zZXN0Iiwic3VibWl0Iiwid2lkZ2V0QXBpIiwid2lkZ2V0VHlwZSIsIndpZGdldE5hbWUiLCJyZXBsYWNlIiwidG9rZW4iLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwidmFsdWUiLCJ0cmltIiwiaW5uZXJIVE1MIiwiZWwiLCJyZW5kZXIiLCJhbHJlYWR5UmVuZGVyZWQiLCJvbkhvbGQiLCJ3aW5kb3ciLCJvbkdvb2dsZUxvYWQiLCJvblJlbmRlcmluZyIsIndpZGdldHMiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib25VbmxvYWQiLCJvbkxvYWQiXSwic291cmNlUm9vdCI6IiJ9