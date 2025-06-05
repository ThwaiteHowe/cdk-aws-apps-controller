import { describe, test, expect, beforeEach } from 'vitest';
import { App, Stack } from 'aws-cdk-lib';
import { CloudFrontConstruct } from '../../lib/constructs/cloudfront-construct';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('CloudFront Construct', () => {
  let app: App;
  let stack: Stack;
  let hostedZone: route53.IHostedZone;
  let api: apigatewayv2.IHttpApi;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
        region: process.env.CDK_DEFAULT_REGION || 'xxxx',
      },
    });

    // Create a mock hosted zone
    hostedZone = route53.HostedZone.fromLookup(stack, 'TestHostedZone', {
      domainName: process.env.DOMAIN_NAME || 'xxxxxx',
      privateZone: false,
    });

    // Create a mock API
    api = apigatewayv2.HttpApi.fromHttpApiAttributes(stack, 'TestApi', {
      httpApiId: 'test-api-id',
      apiEndpoint: 'https://test-api.execute-api.us-east-1.amazonaws.com',
    });
  });

  test('Creates CloudFront distribution with correct properties', () => {
    const cloudfront = new CloudFrontConstruct(stack, 'TestCloudFront', {
      domainName: process.env.DOMAIN_NAME || 'xxxxxx',
      apiDomainName: process.env.API_DOMAIN_NAME || 'xxxxx',
      api,
      hostedZone,
      environment: 'test',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
        region: process.env.CDK_DEFAULT_REGION || 'xxxx',
      },
    });

    // Test distribution properties
    expect(cloudfront.distribution).toBeDefined();
    expect(cloudfront.distribution.distributionDomainName).toBeDefined();
    expect(cloudfront.distribution.distributionId).toBeDefined();
  });

  test('Creates CORS response headers policy', () => {
    // Create the CloudFront construct
    const cloudfront = new CloudFrontConstruct(stack, 'TestCloudFront', {
      domainName: process.env.DOMAIN_NAME || 'xxxxxx',
      apiDomainName: process.env.API_DOMAIN_NAME || 'xxxxx',
      api,
      hostedZone,
      environment: process.env.ENVIRONMENT || 'xxxx',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
        region: process.env.CDK_DEFAULT_REGION || 'xxxx',
      },
    });

    // Test CORS policy
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;
    
    expect(cloudfront.distribution).toBeDefined();
    expect(resources).toBeDefined();
    
    // Find the CORS policy resource
    const corsPolicy = Object.values(resources || {}).find(
      (resource): resource is { Type: string; Properties: { ResponseHeadersPolicyConfig: { Name: string } } } => 
        typeof resource === 'object' && 
        resource !== null && 
        'Type' in resource && 
        resource.Type === 'AWS::CloudFront::ResponseHeadersPolicy'
    )!;

    expect(corsPolicy).toBeDefined();
    expect(corsPolicy.Properties.ResponseHeadersPolicyConfig.Name).toContain('cors-policy');
  });
}); 