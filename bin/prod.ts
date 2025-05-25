#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';

const app = new cdk.App();
new CdkInfraControllerStack(app, 'CdkInfraControllerStack-Prod', {
  domainName: 'api.thwaitehowe.com',
  apiDomainName: 'api.thwaitehowe.com',
  environment: 'prod',
  apiId: 'your-prod-api-gateway-id',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});