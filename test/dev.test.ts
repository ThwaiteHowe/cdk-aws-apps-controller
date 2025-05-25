import { App } from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';

describe('Dev Stack Configuration', () => {
  let app: App;
  let stack: CdkInfraControllerStack;

  beforeEach(() => {
    app = new App();
    stack = new CdkInfraControllerStack(app, 'CdkInfraControllerStack-Dev', {
      domainName: 'dev.api.thwaitehowe.com',
      apiDomainName: 'dev.api.thwaitehowe.com',
      environment: 'dev',
      apiId: 'kztm729nk5',
      env: {
        account: '1430118840082',
        region: 'us-east-1',
      },
    });
  });

  test('Stack has correct domain name', () => {
    expect(stack.domainName).toBe('dev.api.thwaitehowe.com');
  });

  test('Stack has correct API domain name', () => {
    expect(stack.apiDomainName).toBe('dev.api.thwaitehowe.com');
  });

  test('Stack has correct environment', () => {
    expect(stack.environment).toBe(`aws://${stack.env?.account}/${stack.env?.region}`);
  });

  test('Stack has correct API ID', () => {
    expect(stack.apiId).toBe('kztm729nk5');
  });
}); 