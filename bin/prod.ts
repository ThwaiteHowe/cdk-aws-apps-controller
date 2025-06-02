#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = new cdk.App();
new CdkInfraControllerStack(app, 'CdkInfraControllerStack-Prod', {
  domainName: process.env.DOMAIN_NAME || 'api.thwaitehowe.com',
  apiDomainName: process.env.API_DOMAIN_NAME || 'api.thwaitehowe.com',
  environment: process.env.ENVIRONMENT || 'prod',
  apiId: process.env.API_ID || 'your-prod-api-gateway-id',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || 'xxxx',
    region: process.env.CDK_DEFAULT_REGION || 'xxxx',
  },
});