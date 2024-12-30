#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BookstoreStack } from '../lib/bookstore-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();
new BookstoreStack(app, 'BookstoreStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});