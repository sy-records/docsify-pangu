const pangu = require('pangu');

function install(hook) {
    hook.doneEach(_ => {
        pangu.spacingElementByClassName('content');
    });
}

$docsify.plugins = [].concat(install, $docsify.plugins);