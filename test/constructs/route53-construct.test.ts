import { describe, test, expect, beforeEach } from 'vitest';
import { App, Stack } from 'aws-cdk-lib';
import { Route53Construct } from '../../lib/constructs/route53-construct';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';

describe('Route53 Construct', () => {
  let app: App;
  let stack: Stack;
  let api: apigatewayv2.IHttpApi;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, 'TestStack', {
      env: {
        account: '1430118840082',
        region: 'us-east-1',
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
      domainName: 'test.example.com',
      environment: 'test',
      env: {
        account: '1430118840082',
        region: 'us-east-1',
      },
    });

    expect(route53Construct.hostedZone).toBeDefined();
  });

  test('Creates DNS record for API Gateway when provided', () => {
    const route53Construct = new Route53Construct(stack, 'TestRoute53', {
      domainName: 'test.example.com',
      api,
      environment: 'test',
      env: {
        account: '1430118840082',
        region: 'us-east-1',
      },
    });

    // Test that the construct was created
    expect(route53Construct.hostedZone).toBeDefined();

    // Test that the API record was created
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;
    
    // Find the API record resource
    const apiRecord = Object.values(resources).find(
      (resource: any) => resource.Type === 'AWS::Route53::RecordSet' && 
                        resource.Properties?.Name?.includes('api')
    ) as { Properties: { Type: string } };

    expect(apiRecord).toBeDefined();
    expect(apiRecord.Properties.Type).toBe('A');
  });
}); 