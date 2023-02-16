#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CloudResumeBackendStack } from '../lib/cloud-resume-backend-stack';

const app = new cdk.App();
new CloudResumeBackendStack(app, 'CloudResumeBackendStack');
