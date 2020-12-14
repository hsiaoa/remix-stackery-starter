# Remix Starter for AWS with Stackery

This is a starter repo for deploying [Remix](https://remix.run) with
[Stackery](http://stackery.io/). Stackery is a wrapper around AWS SAM that helps orchetrate the deployment process. 

This repo uses [remix-run-apigateway](https://github.com/m14t/remix-run-apigateway) by [@m14t](https://github.com/m14t). 

## Deployment

To get set up on Stackery, refer to the [Quickstart Guide](https://docs.stackery.io/docs/quickstart/quickstart-nodejs). After the setup, you should have the following template parameters linked: `StackTagName`, `EnvironmentTagName`, `SourceLocation` and `SourceVersion`.

If you have custom domain with *Route53*, set up environmental parameter: `{ "WEB_DOMAIN_NAME": "*.example.com }`, ssl certificate `${CertificateId}`, and hosted zone Ids in the template. 

Once ready, deploy to AWS with

`stackery deploy` 

## Deployment Resources
![Deployed Resources](https://github.com/hsiaoa/remix-stackery-starter/blob/master/stackery.png?raw=true)
- Api Gateway (v2)
- Server Lambda
- EventBridge rule to keep lambda warm every 5 minutes
- Static Asset S3
- CodeBuild to package and upload to S3 & Server Lambda
- Cloudfront CDN 
- Lambda@Edge for host header forwarding
- Route 53 custom domain (optional)

## Known Issues and present solutions

- Server and Static Assets File Hash Mismatch
  - To avoid file hashes mismatch on Lambda and S3 (server and static assets), we deploy a scafold to server lambda before using CodeBuild to package the entire server and upload to it and s3 at the same step.

- When zipping server files for lambda, encounter `ZIP does not support timestamps before 1980` from python zip library, possibly due to Remix's dependency on `Uglify` lib. 
  - Add a postinstall script `find ./node_modules/* -mtime +10950 -exec touch {} \\` to fix this issue

- SAM-CLI generates a permission for API Gateway to invoke lambda: `AWS:SourceArn": "arn:aws:execute-api:REGION:ACCOUNT:httpapi-id/*/*/$default` While it looks [correct](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html#api-gateway-who-can-invoke-an-api-method-using-iam-policies), we ran into "API Gateway has no permission to invoke lambda" issue. 
  - Rewiring the integration in the AWS console solves it, and gives `AWS:SourceArn": "arn:aws:execute-api:REGION:ACCOUNT:httpapi-id/*/$default`
  - May be a SAM-CLI issue with `/$default` path for apigatewayV2. 

- Cloudfront has no native way to pass `hostname` to the origin server
  - Use a lambda@edge to pass host in the header to origin via `x-forwarded-host`