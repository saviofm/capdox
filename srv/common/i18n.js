const TextBundle = require('@sap/textbundle').TextBundle;

function getBundle(locale){
    const bundle = new TextBundle('../../_i18n/i18n', locale);
    return bundle;
}

module.exports = {
    getBundle
}