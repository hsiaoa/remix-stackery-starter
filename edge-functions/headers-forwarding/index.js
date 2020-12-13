exports.handler = (event, context, callback) => {
  const { request } = event.Records[0].cf;
  const { headers, origin } = request;
  const host = (origin.s3 || origin.custom).domainName;

  // set x-forwarded-host to host header
  headers['x-forwarded-host'] = [{
    key: 'X-Forwarded-Host',
    value: headers.host[0].value,
  }];

  // host header should match the origin domain name
  headers['host'] = [{
    key: 'Host',
    value: host,
  }];

  callback(null, request);
};
