import { describe, test, expect, beforeEach } from 'vitest';
import { App, Stack } from 'aws-cdk-lib';
import { Route53Construct } from '../../lib/constructs/route53-construct';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('Route53 Construct', () => {
  let app: App;
  let stack: Stack;
  let api: apigatewayv2.IHttpApi;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack', {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
        region: process.env.CDK_DEFAULT_REGION || 'xxxx',
      },
    });

    // Create a mock API
    api = apigatewayv2.HttpApi.fromHttpApiAttributes(stack, 'TestApi', {
      httpApiId: 'test-api-id',
      apiEndpoint: 'https://test-api.execute-api.us-east-1.amazonaws.com',
    });
  });

  test('Creates hosted zone lookup', () => {
    const route53Construct = new Route53Construct(stack, 'TestRoute53', {
      domainName: process.env.DOMAIN_NAME || 'xxxxxx',
      environment: process.env.ENVIRONMENT || 'xxxx',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
        region: process.env.CDK_DEFAULT_REGION || 'xxxx',
      },
    });

    expect(route53Construct.hostedZone).toBeDefined();
  });

  test('Creates DNS record for API Gateway when provided', () => {
    const route53Construct = new Route53Construct(stack, 'TestRoute53', {
      domainName: process.env.DOMAIN_NAME || 'xxxxxx',
      api,
      environment: process.env.ENVIRONMENT || 'xxxx',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
        region: process.env.CDK_DEFAULT_REGION || 'xxxx',
      },
    });

    // Test that the construct was created
    expect(route53Construct.hostedZone).toBeDefined();

    // Test that the API record was created
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;
    
    // Find the API record resource
    const apiRecord = Object.values(resources).find(
      (resource): resource is { 
        Type: string; 
        Properties: { 
          Name: string; 
          Type: string;
          [key: string]: unknown;
        } 
      } => {
        if (typeof resource !== 'object' || resource === null) return false;
        if (!('Type' in resource) || !('Properties' in resource)) return false;
        if (resource.Type !== 'AWS::Route53::RecordSet') return false;
        const props = resource.Properties as { Name?: string };
        return typeof props.Name === 'string' && props.Name.includes('api');
      }
    )!;

    expect(apiRecord).toBeDefined();
    expect(apiRecord.Properties.Type).toBe('A');
  });
}); 