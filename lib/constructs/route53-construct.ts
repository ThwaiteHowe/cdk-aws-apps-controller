import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

export interface Route53ConstructProps {
  domainName: string;
  api?: apigatewayv2.IHttpApi;
  environment: string;
  env?: cdk.Environment;
}

export class Route53Construct extends Construct {
  public readonly hostedZone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props: Route53ConstructProps) {
    super(scope, id);

    // Extract parent domain (e.g., 'thwaitehowe.com' from 'dev.api.thwaitehowe.com')
    const parentDomain = props.domainName.split('.').slice(-2).join('.');

    // Import existing hosted zone
    this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: parentDomain,
    });

    // Create DNS record for API Gateway if provided
    if (props.api) {
      new route53.ARecord(this, 'ApiAliasRecord', {
        zone: this.hostedZone,
        target: route53.RecordTarget.fromAlias(
          new targets.ApiGatewayv2DomainProperties(props.api.apiEndpoint, props.api.apiId)
        ),
        recordName: 'api', // This will create api.your-domain.com
        comment: `DNS record for API Gateway in ${props.environment} environment`,
      });
    }

    // Add tags to all resources
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Project', 'Thwaite Howe');
    cdk.Tags.of(this).add('Domain', props.domainName);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}