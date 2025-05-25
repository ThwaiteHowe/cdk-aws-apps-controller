#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';

const app = new cdk.App();
new CdkInfraControllerStack(app, 'CdkInfraControllerStack-Dev', {
  domainName: 'dev.api.thwaitehowe.com',
  apiDomainName: 'dev.api.thwaitehowe.com',
  environment: 'dev',
  apiId: 'kztm729nk5',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '1430118840082', // Replace with your AWS account ID
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1', // Replace with your desired region
  },
});