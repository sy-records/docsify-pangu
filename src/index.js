function appendScript() {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://cdn.jsdelivr.net/npm/pangu';
  document.body.appendChild(script);
}

const install = function(hook) {
  hook.init(_ => {
    appendScript();
  });

  hook.doneEach(_ => {
    try {
      pangu.spacingElementByClassName('content');
    } catch (e) {

    }
  });
};

$docsify.plugins = [].concat(install, $docsify.plugins);
