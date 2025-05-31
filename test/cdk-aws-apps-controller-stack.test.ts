import { describe, test, expect, beforeEach } from 'vitest';
import { App } from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';

describe('CDK Infrastructure Controller Stack', () => {
  let app: App;
  let stack: CdkInfraControllerStack;

  beforeEach(() => {
    app = new App();
    stack = new CdkInfraControllerStack(app, 'TestStack', {
      domainName: 'test.example.com',
      apiDomainName: 'api.test.example.com',
      environment: 'test',
      apiId: 'test-api-id',
      env: {
        account: '1430118840082',
        region: 'us-east-1',
      },
    });
  });

  test('Stack has correct properties', () => {
    expect(stack.domainName).toBe('test.example.com');
    expect(stack.apiDomainName).toBe('api.test.example.com');
    expect(stack.apiId).toBe('test-api-id');
  });

  test('Creates API Gateway with correct configuration', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Find the API Gateway custom domain
    const apiDomain = Object.values(resources).find(
      (resource: any) => resource.Type === 'AWS::ApiGatewayV2::DomainName'
    ) as { Properties: { DomainName: string } };

    expect(apiDomain).toBeDefined();
    expect(apiDomain.Properties.DomainName).toBe('api.test.example.com');
  });

  test('Creates CloudFront distribution', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Find the CloudFront distribution
    const distribution = Object.values(resources).find(
      (resource: any) => resource.Type === 'AWS::CloudFront::Distribution'
    ) as { Properties: { DistributionConfig: { Aliases: string[] } } };

    expect(distribution).toBeDefined();
    expect(distribution.Properties.DistributionConfig.Aliases).toContain('test.example.com');
  });

  test('Creates Route53 records', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Find the Route53 records
    const records = Object.values(resources).filter(
      (resource: any) => resource.Type === 'AWS::Route53::RecordSet'
    ) as Array<{ Properties: { Name: string; Type: string } }>;

    expect(records.length).toBeGreaterThan(0);
    expect(records.some(record => record.Properties.Name.includes('test.example.com'))).toBe(true);
  });

  test('Creates ACM certificates', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Find the ACM certificates
    const certificates = Object.values(resources).filter(
      (resource: any) => resource.Type === 'AWS::CertificateManager::Certificate'
    ) as Array<{ Properties: { DomainName: string; SubjectAlternativeNames: string[] } }>;

    expect(certificates.length).toBeGreaterThan(0);
    expect(certificates.some(cert => 
      cert.Properties.DomainName === 'test.example.com' || 
      cert.Properties.SubjectAlternativeNames?.includes('test.example.com')
    )).toBe(true);
  });

  test('Adds correct tags to resources', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Check tags on a few key resources
    const taggedResources = Object.values(resources).filter(
      (resource: any) => resource.Properties?.Tags
    ) as Array<{ Properties: { Tags: { Key: string; Value: string }[] } }>;

    expect(taggedResources.length).toBeGreaterThan(0);
    expect(taggedResources[0].Properties.Tags).toContainEqual({ Key: 'Domain', Value: 'test.example.com' });
    expect(taggedResources[0].Properties.Tags).toContainEqual({ Key: 'Environment', Value: 'test' });
    expect(taggedResources[0].Properties.Tags).toContainEqual({ Key: 'ManagedBy', Value: 'CDK' });
    expect(taggedResources[0].Properties.Tags).toContainEqual({ Key: 'Project', Value: 'Thwaite Howe' });
  });
});