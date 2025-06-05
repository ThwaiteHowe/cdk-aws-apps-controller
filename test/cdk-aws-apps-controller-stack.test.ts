import { describe, test, expect, beforeEach } from 'vitest';
import { App } from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

describe('CDK Infrastructure Controller Stack', () => {
  let app: App;
  let stack: CdkInfraControllerStack;

  beforeEach(() => {
    app = new App();
    stack = new CdkInfraControllerStack(app, 'TestStack', {
      domainName: process.env.DOMAIN_NAME || 'xxxxxx',
      apiDomainName: process.env.API_DOMAIN_NAME || 'xxxxx',
      environment: process.env.ENVIRONMENT || 'xxxx',
      apiId: 'test-api-id',
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
        region: process.env.CDK_DEFAULT_REGION || 'xxxx',
      },
    });
  });

  test('Stack has correct properties', () => {
    expect(stack.domainName).toBe(process.env.DOMAIN_NAME);
    expect(stack.apiDomainName).toBe(process.env.API_DOMAIN_NAME);
    expect(stack.apiId).toBe('test-api-id');
  });

  test('Creates API Gateway with correct configuration', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Find the API Gateway custom domain
    const apiDomain = Object.values(resources).find(
      (resource): resource is { Type: string; Properties: { DomainName: string } } => {
        if (typeof resource !== 'object' || resource === null) return false;
        if (!('Type' in resource) || !('Properties' in resource)) return false;
        return resource.Type === 'AWS::ApiGatewayV2::DomainName';
      }
    )!;

    expect(apiDomain).toBeDefined();
    expect(apiDomain.Properties.DomainName).toBe(process.env.API_DOMAIN_NAME);
  });

  test('Creates CloudFront distribution', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Find the CloudFront distribution
    const distribution = Object.values(resources).find(
      (resource): resource is { Type: string; Properties: { DistributionConfig: { Aliases: string[] } } } => {
        if (typeof resource !== 'object' || resource === null) return false;
        if (!('Type' in resource) || !('Properties' in resource)) return false;
        return resource.Type === 'AWS::CloudFront::Distribution';
      }
    )!;

    expect(distribution).toBeDefined();
    expect(distribution.Properties.DistributionConfig.Aliases).toContain(process.env.DOMAIN_NAME);
  });

  test('Creates Route53 records', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Find the Route53 records
    const records = Object.values(resources).filter(
      (resource): resource is { Type: string; Properties: { Name: string; Type: string } } => {
        if (typeof resource !== 'object' || resource === null) return false;
        if (!('Type' in resource) || !('Properties' in resource)) return false;
        return resource.Type === 'AWS::Route53::RecordSet';
      }
    );

    expect(records.length).toBeGreaterThan(0);
    expect(records.some(record => record.Properties.Name.includes(process.env.DOMAIN_NAME || ''))).toBe(true);
  });

  test('Creates ACM certificates', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Find the ACM certificates
    const certificates = Object.values(resources).filter(
      (resource): resource is { Type: string; Properties: { DomainName: string; SubjectAlternativeNames?: string[] } } => {
        if (typeof resource !== 'object' || resource === null) return false;
        if (!('Type' in resource) || !('Properties' in resource)) return false;
        return resource.Type === 'AWS::CertificateManager::Certificate';
      }
    );

    expect(certificates.length).toBeGreaterThan(0);
    expect(certificates.some(cert => 
      cert.Properties.DomainName === process.env.DOMAIN_NAME || 
      cert.Properties.SubjectAlternativeNames?.includes(process.env.DOMAIN_NAME || '')
    )).toBe(true);
  });

  test('Adds correct tags to resources', () => {
    const template = app.synth().getStackByName(stack.stackName).template;
    const resources = template.Resources;

    // Check tags on a few key resources
    const taggedResources = Object.values(resources).filter(
      (resource): resource is { Type: string; Properties: { Tags: { Key: string; Value: string }[] } } => {
        if (typeof resource !== 'object' || resource === null) return false;
        if (!('Type' in resource) || !('Properties' in resource)) return false;
        const props = resource.Properties as { Tags?: { Key: string; Value: string }[] };
        return Array.isArray(props.Tags);
      }
    );

    expect(taggedResources.length).toBeGreaterThan(0);
    expect(taggedResources[0].Properties.Tags).toContainEqual({ Key: 'Domain', Value: process.env.DOMAIN_NAME || '' });
    expect(taggedResources[0].Properties.Tags).toContainEqual({ Key: 'Environment', Value: process.env.ENVIRONMENT || '' });
    expect(taggedResources[0].Properties.Tags).toContainEqual({ Key: 'ManagedBy', Value: 'CDK' });
    expect(taggedResources[0].Properties.Tags).toContainEqual({ Key: 'Project', Value: 'Thwaite Howe' });
  });
});