import { describe, test, expect, beforeEach } from 'vitest';
import { App } from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('Dev Stack Configuration', () => {
  let app: App;
  let stack: CdkInfraControllerStack;

  beforeEach(() => {
    app = new App();
    stack = new CdkInfraControllerStack(app, 'CdkInfraControllerStack-Dev', {
      domainName: process.env.DOMAIN_NAME || 'xxxxxx',
      apiDomainName: process.env.API_DOMAIN_NAME || 'xxxxx',
      environment: process.env.ENVIRONMENT || 'dev',
      apiId: process.env.API_ID || 'dev-api-id',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
        region: process.env.CDK_DEFAULT_REGION || 'xxxx',
      },
    });
  });

  test('Stack has correct domain name', () => {
    expect(stack.domainName).toBe(process.env.DOMAIN_NAME);
  });

  test('Stack has correct API domain name', () => {
    expect(stack.apiDomainName).toBe(process.env.API_DOMAIN_NAME);
  });

  test('Stack has correct environment', () => {
    expect(stack.environment).toBe(`aws://${stack.env?.account}/${stack.env?.region}`);
  });

  test('Stack has correct API name', () => {
    expect(stack.apiId).toBe(process.env.API_ID);
  });
}); 