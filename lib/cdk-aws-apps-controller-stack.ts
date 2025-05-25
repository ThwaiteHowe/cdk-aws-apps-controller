import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { CloudFrontConstruct } from './constructs/cloudfront-construct';
import { Route53Construct } from './constructs/route53-construct';

export interface CdkInfraControllerStackProps extends cdk.StackProps {
  domainName: string;
  apiDomainName: string;
  environment: string;
  apiId: string;
}

export class CdkInfraControllerStack extends cdk.Stack {
  public readonly domainName: string;
  public readonly apiDomainName: string;
  public readonly environment: string;
  public readonly apiId: string;
  public readonly env?: cdk.Environment;

  constructor(scope: Construct, id: string, props: CdkInfraControllerStackProps) {
    const account = process.env.CDK_DEFAULT_ACCOUNT || '1430118840082';
    const region = process.env.CDK_DEFAULT_REGION || 'us-east-1';

    super(scope, id, {
      ...props,
      env: { account, region },
    });

    this.domainName = props.domainName;
    this.apiDomainName = props.apiDomainName;
    this.apiId = props.apiId;
    this.env = { account, region };

    // Add tags to all resources in the stack
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Project', 'Thwaite Howe');
    cdk.Tags.of(this).add('Domain', props.domainName);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');

    // Import the existing API Gateway
    const api = apigatewayv2.HttpApi.fromHttpApiAttributes(this, 'ImportedApi', {
      httpApiId: props.apiId,
      apiEndpoint: cdk.Fn.sub(`${this.apiId}.execute-api.${this.region}.amazonaws.com`, {
        apiId: props.apiId,
      }),
    });

    // Create Route53 construct
    const route53Construct = new Route53Construct(this, 'Route53Construct', {
      domainName: props.domainName,
      environment: props.environment,
      env: { account, region },
    });

    // Create CloudFront construct
    const cloudFrontConstruct = new CloudFrontConstruct(this, 'CloudFrontConstruct', {
      domainName: props.domainName,
      apiDomainName: props.apiDomainName,
      api,
      hostedZone: route53Construct.hostedZone,
      environment: props.environment,
      env: { account, region },
    });

    // Output the CloudFront distribution domain name
    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: cloudFrontConstruct.distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
    });
  }
}
