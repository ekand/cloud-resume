import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as sns from "aws-cdk-lib/aws-sns";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as iam from "aws-cdk-lib/aws-iam";

import { Construct } from "constructs";

export class CloudResumeBackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const oai = new cloudfront.OriginAccessIdentity(this, "MyOAI");

    const assetsBucket = new s3.Bucket(this, "CloudResumeBackendBucket", {
      websiteIndexDocument: "index.html",
    });

    assetsBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [assetsBucket.arnForObjects("*")],
        principals: [oai.grantPrincipal],
        conditions: {
          StringLike: { "aws:Referer": `https://*.cloudfront.net/*` },
        },
        effect: iam.Effect.ALLOW,
      })
    );

    new s3deploy.BucketDeployment(this, "DeployWebsite", {
      sources: [s3deploy.Source.asset("./website-dist")],
      destinationBucket: assetsBucket,
    });

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      // found using aws acm list-certificates --region us-east-1
      "arn:aws:acm:us-east-1:212702451742:certificate/abf2dd8b-3651-4fe1-9452-56ade04917e1"
    );
    const cf = new cloudfront.CloudFrontWebDistribution(
      this,
      "MyDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: assetsBucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                allowedMethods:
                  cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                cachedMethods:
                  cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD,
              },
            ],
          },
        ],
      }
    );

    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "erikresume-zone",
      {
        zoneName: "erikresume.com",
        hostedZoneId: "Z0110113OR9PYKNKIA91",
      }
    );

    new route53.ARecord(this, "CDNARecord", {
      zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
    });

    new route53.AaaaRecord(this, "AliasRecord", {
      zone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(cf)),
    });
  }
}
