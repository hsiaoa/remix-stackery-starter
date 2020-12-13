const { createRequestHandler } = require('remix-run-apigateway');
const warmer = require('lambda-warmer');

exports.handler = async (event, context) => {

  // bypass function if a warming event
  if (await warmer(event)) return { statusCode: 200, body: 'warmed' };

  const host = event.headers['x-forwarded-host'];
  event.headers.host = host;
  return createRequestHandler({
    getLoadContext() {
      return {};
    },
  })(event, context);
};
