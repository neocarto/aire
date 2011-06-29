
var spinnerCount = 0;
function enableSpinner()
{
  console.log('enable: '+spinnerCount);
  var spinner = $('spinner');
  if (spinner)
    spinner.style.display = 'inline';
  spinnerCount++;
}
function disableSpinner()
{
  console.log('disable: '+spinnerCount);
  spinnerCount--;
  var spinner = $('spinner');
  if (spinner && !spinnerCount)
    spinner.style.display = 'none';
}

var Ploomap = {
  ajaxUpdate: function(element, url, options) {
    if (!options) options = {};
    var onComplete = options.onComplete;
    var onLoading = options.onLoading;
    new Ajax.Updater
    (element, url,
     Object.extend(options, { onLoading: function() {
				enableSpinner();
				if (onLoading)
				  onLoading();
			      },
			      onComplete: function() {
				disableSpinner();
				if (onComplete)
				  onComplete();
			      } }));
  },

  ajaxRequest: function(url, options) {
    new Ajax.Request
    (url, Object.extend(options, { onLoading: enableSpinner, onComplete: disableSpinner }));
  }
};
