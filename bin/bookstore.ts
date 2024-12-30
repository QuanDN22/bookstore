#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BookstoreStack } from '../lib/bookstore-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();
new BookstoreStack(app, 'BookstoreStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

});