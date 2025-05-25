import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';

export interface CloudFrontConstructProps {
  domainName: string;
  apiDomainName: string;
  api: apigatewayv2.IHttpApi;
  hostedZone: route53.IHostedZone;
  environment: string;
  env?: cdk.Environment;
}

export class CloudFrontConstruct extends Construct {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontConstructProps) {
    super(scope, id);

    // Create ACM certificate for the domain
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName: props.domainName,
      validation: acm.CertificateValidation.fromDns(props.hostedZone),
    });

    // Create custom domain for API Gateway
    const apiDomain = new apigatewayv2.DomainName(this, 'ApiDomain', {
      domainName: props.apiDomainName,
      certificate: certificate,
    });

    // Create API mapping
    new apigatewayv2.ApiMapping(this, 'ApiMapping', {
      api: props.api,
      domainName: apiDomain,
      stage: apigatewayv2.HttpStage.fromHttpStageAttributes(this, 'DefaultStage', {
        stageName: '$default',
        api: props.api,
      }),
    });

    // Create CORS response headers policy
    const corsResponseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'CorsResponseHeadersPolicy', {
      responseHeadersPolicyName: `${props.environment}-cors-policy`,
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['*'],
        accessControlAllowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        accessControlAllowOrigins: ['*'],
        accessControlExposeHeaders: ['*'],
        accessControlMaxAge: cdk.Duration.seconds(600),
        originOverride: true,
      },
    });

    // Create CloudFront distribution
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(props.api.apiEndpoint, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
        responseHeadersPolicy: corsResponseHeadersPolicy,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      },
      domainNames: [props.domainName],
      certificate: certificate,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: '/error.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/error.html',
        },
      ],
    });

    // Create DNS record for CloudFront distribution
    new route53.ARecord(this, 'CloudFrontAliasRecord', {
      zone: props.hostedZone,
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(this.distribution)
      ),
      recordName: props.domainName,
      comment: `DNS record for CloudFront distribution in ${props.environment} environment`,
    });

    // Add tags to all resources
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Project', 'Thwaite Howe');
    cdk.Tags.of(this).add('Domain', props.domainName);
    cdk.Tags.of(this).add('ManagedBy', 'CDK');
  }
}