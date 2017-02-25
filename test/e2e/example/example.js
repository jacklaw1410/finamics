var config = require('../../../nightwatch.conf.js');  // Mind the number of levels to get back to root

module.exports = {
  'Testing Example': function(browser) {
    browser
      .url(browser.launchUrl) // replace the url by browser.launchUrl in real testing
      .waitForElementVisible('body')
      .saveScreenshot(browser.globals.screenshotsUrl + '/example.png') // tweaked a bit the path to save screenshots
      .end();
  }
};
