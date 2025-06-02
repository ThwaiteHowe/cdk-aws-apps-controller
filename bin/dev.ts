#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkInfraControllerStack } from '../lib/cdk-aws-apps-controller-stack';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = new cdk.App();
new CdkInfraControllerStack(app, 'CdkInfraControllerStack-Dev', {
  domainName: process.env.DOMAIN_NAME || 'dev.api.thwaitehowe.com',
  apiDomainName: process.env.API_DOMAIN_NAME || 'dev.api.thwaitehowe.com',
  environment: process.env.ENVIRONMENT || 'dev',
  apiId: process.env.API_ID || 'kztm729nk5',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '1430118840082', // Replace with your AWS account ID
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1', // Replace with your desired region
  },
});