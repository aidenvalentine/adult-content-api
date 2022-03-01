function translate(event, apiKey, callback) {
  console.log(event);
  const request = require('request');
  const uuidv4 = require('uuid/v4');
  /* Checks to see if the subscription key is available
  as an environment variable. If you are setting your subscription key as a
  string, then comment these lines out.

  If you want to set your subscription key as a string, replace the value for
  the Ocp-Apim-Subscription-Key header as a string. */
  const subscriptionKey = apiKey;
  if (!subscriptionKey) {
    throw new Error('Environment variable for your subscription key is not set.')
  };
  let options = {
    method: 'POST',
    baseUrl: 'https://api.cognitive.microsofttranslator.com/',
    url: 'translate',
    qs: {
      'api-version': '3.0',
      'to': event.lang
    },
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-type': 'application/json',
      'X-ClientTraceId': uuidv4().toString()
    },
    body: [{
      'text': event.text
    }],
    json: true,
  };
  request(options, function(err, res, body) {
    if (err) {
      console.log(err);
      callback(err, err.msg);
    } else {
      console.log(JSON.stringify(body, null, 4));
      callback(null, body);
    }
  });
};

module.exports = {
  translate: translate,
};
