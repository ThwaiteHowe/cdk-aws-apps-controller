import { App } from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';

describe('Prod Stack Configuration', () => {
  let app: App;
  let stack: CdkInfraControllerStack;

  beforeEach(() => {
    app = new App();
    stack = new CdkInfraControllerStack(app, 'CdkInfraControllerStack-Prod', {
      domainName: 'api.thwaitehowe.com',
      apiDomainName: 'api.thwaitehowe.com',
      environment: 'prod',
      apiId: 'your-prod-api-gateway-id',
      env: {
        account: '1430118840082',
        region: 'us-east-1',
      },
    });
  });

  test('Stack has correct domain name', () => {
    expect(stack.domainName).toBe('api.thwaitehowe.com');
  });

  test('Stack has correct API domain name', () => {
    expect(stack.apiDomainName).toBe('api.thwaitehowe.com');
  });

  test('Stack has correct environment', () => {
    expect(stack.environment).toBe('prod');
  });

  test('Stack has correct API ID', () => {
    expect(stack.apiId).toBe('your-prod-api-gateway-id');
  });
}); 