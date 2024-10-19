#!/bin/bash

# Check for required arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <ClientName> <SubdomainName> [<SSHKeyPath>]"
    exit 1
fi

# Assign arguments to variables
CLIENT_NAME=$1
YOUR_IP=$(curl -s ifconfig.me)
SUBDOMAIN_NAME=$2
PARENT_DOMAIN_NAME="studioimpress.services"
SSH_KEY_PATH="$HOME/.ssh/id_ed25519.pub"
AMI_ID="ami-030b0cbc9c13f4a50"

# if $4 is set, then override the default SSH_KEY_PATH
if [ -n "$4" ]; then
    SSH_KEY_PATH=$3
fi

# Check CLIENT_NAME is defined in ~/.aws/config
if ! grep -q "\[profile $CLIENT_NAME\]" ~/.aws/config; then
    echo "Error: Profile '$CLIENT_NAME' not defined in ~/.aws/config"
    exit 1
fi

# Check if the SSH key file exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "Error: SSH key file not found at path: $SSH_KEY_PATH"
    exit 1
fi

# Read the SSH public key from the file
SSH_PUBLIC_KEY=$(cat "$SSH_KEY_PATH")

# Check if AWS CLI is installed and configured with credentials
if ! aws sts get-caller-identity --profile "$CLIENT_NAME" > /dev/null; then
    echo "Error: AWS CLI not installed or not configured with credentials"
    exit 1
fi

# Deploy CloudFormation stack in the child account (create ELB first)
STACK_NAME="${CLIENT_NAME}-infrastructure"
DEFAULT_VPC_ID=$(aws ec2 describe-vpcs --profile "$CLIENT_NAME" --filters "Name=is-default,Values=true" --query "Vpcs[0].VpcId" --output text)
SUBNET_IDS=$(aws ec2 describe-subnets --profile "$CLIENT_NAME" --filters "Name=vpc-id,Values=${DEFAULT_VPC_ID}" --query "Subnets[*].SubnetId" --output text)
SUBNET1=$(echo $SUBNET_IDS | cut -d ' ' -f 1)
SUBNET2=$(echo $SUBNET_IDS | cut -d ' ' -f 2)

aws cloudformation create-stack \
    --profile "$CLIENT_NAME" \
    --stack-name "$STACK_NAME" \
    --template-body file://cloudformation.yml \
    --parameters ParameterKey=Client,ParameterValue=$CLIENT_NAME \
                 ParameterKey=AmiId,ParameterValue=$AMI_ID \
                 ParameterKey=YourIP,ParameterValue=$YOUR_IP \
                 ParameterKey=SshPublicKey,ParameterValue="$SSH_PUBLIC_KEY" \
                 ParameterKey=VPC,ParameterValue=$DEFAULT_VPC_ID \
                 ParameterKey=Subnet1,ParameterValue=$SUBNET1 \
                 ParameterKey=Subnet2,ParameterValue=$SUBNET2 \
    --capabilities CAPABILITY_NAMED_IAM

if [ $? -ne 0 ]; then
    echo "Error: Failed to initiate CloudFormation stack creation in child account"
    exit 1
fi

echo "CloudFormation stack '$STACK_NAME' creation initiated."

# Wait for stack creation to complete
aws cloudformation wait stack-create-complete \
    --profile "$CLIENT_NAME" \
    --stack-name "$STACK_NAME"

if [ $? -ne 0 ]; then
    echo "Error: Failed to create CloudFormation stack in child account"
    exit 1
fi

echo "CloudFormation stack '$STACK_NAME' created successfully."

# Retrieve ELB DNS name
ELB_DNS_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --profile "$CLIENT_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNSName'].OutputValue" \
    --output text)

if [ -z "$ELB_DNS_NAME" ]; then
    echo "Error: Failed to retrieve ELB DNS name"
    exit 1
fi

# Create the subdomain in the parent account's Route 53 hosted zone
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name "$PARENT_DOMAIN_NAME" --query "HostedZones[0].Id" --output text | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo "Error: Could not find hosted zone for $PARENT_DOMAIN_NAME in parent account"
    exit 1
fi

SUBDOMAIN_CHANGE_BATCH=$(cat <<EOF
{
  "Comment": "Create subdomain $SUBDOMAIN_NAME.$PARENT_DOMAIN_NAME",
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "$SUBDOMAIN_NAME.$PARENT_DOMAIN_NAME",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "$ELB_DNS_NAME"
          }
        ]
      }
    }
  ]
}
EOF
)

aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "$SUBDOMAIN_CHANGE_BATCH"

if [ $? -ne 0 ]; then
    echo "Error: Failed to create subdomain $SUBDOMAIN_NAME in parent account"
    exit 1
fi

echo "Subdomain $SUBDOMAIN_NAME.$PARENT_DOMAIN_NAME created successfully."

# Create the ACM certificate
ACM_CERT_ARN=$(aws acm request-certificate \
    --domain-name "$SUBDOMAIN_NAME.$PARENT_DOMAIN_NAME" \
    --validation-method DNS \
    --subject-alternative-names "$SUBDOMAIN_NAME.$PARENT_DOMAIN_NAME" \
    --query "CertificateArn" \
    --output text \
    --profile "$CLIENT_NAME")

if [ -z "$ACM_CERT_ARN" ]; then
    echo "Error: Failed to request ACM certificate"
    exit 1
fi

echo "ACM certificate requested successfully with ARN: $ACM_CERT_ARN"

# Wait for DNS validation fields to be available
while true; do
    echo "Waiting 10 seconds for DNS validation fields to be available..."
    sleep 10
    CERTIFICATE_NAME=$(aws acm describe-certificate \
        --certificate-arn "$ACM_CERT_ARN" \
        --query "Certificate.DomainValidationOptions[0].ResourceRecord.Name" \
        --profile "$CLIENT_NAME" \
        --output text)
    CERTIFICATE_VALUE=$(aws acm describe-certificate \
        --certificate-arn "$ACM_CERT_ARN" \
        --query "Certificate.DomainValidationOptions[0].ResourceRecord.Value" \
        --profile "$CLIENT_NAME" \
        --output text)

    if [ -n "$CERTIFICATE_NAME" ] && [ -n "$CERTIFICATE_VALUE" ] && [ "$CERTIFICATE_NAME" != "None" ] && [ "$CERTIFICATE_VALUE" != "None" ]; then
        echo "DNS validation fields available:"
        echo "Domain: $CERTIFICATE_NAME"
        echo "Value: $CERTIFICATE_VALUE"
        break
    fi

    echo "DNS validation fields not available yet. Trying again..."
done

# Add certificate validation record to Route 53
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name \
    --dns-name "$PARENT_DOMAIN_NAME" \
    --query "HostedZones[0].Id" \
    --output text | cut -d'/' -f3)
CERTIFICATE_CHANGE_BATCH=$(cat <<EOF
{
  "Comment": "Add ACM certificate validation record",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${CERTIFICATE_NAME}",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "${CERTIFICATE_VALUE}"
          }
        ]
      }
    }
  ]
}
EOF
)

echo "CERTIFICATE_CHANGE_BATCH:\n$CERTIFICATE_CHANGE_BATCH"

aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch "$CERTIFICATE_CHANGE_BATCH"

# Wait for DNS validation to complete
aws acm wait certificate-validated --certificate-arn "$ACM_CERT_ARN" --profile "$CLIENT_NAME"

if [ $? -ne 0 ]; then
    echo "Error: DNS validation for ACM certificate failed"
    exit 1
fi

echo "ACM certificate validated successfully."

# Update the CloudFormation stack to add HTTPS Listener with ACM certificate
aws cloudformation update-stack \
    --profile "$CLIENT_NAME" \
    --stack-name "$STACK_NAME" \
    --use-previous-template \
    --parameters ParameterKey=Client,UsePreviousValue=true \
                 ParameterKey=AmiId,UsePreviousValue=true \
                 ParameterKey=YourIP,UsePreviousValue=true \
                 ParameterKey=SshPublicKey,UsePreviousValue=true \
                 ParameterKey=SubdomainName,ParameterValue=$SUBDOMAIN_NAME \
                 ParameterKey=ACMCertificateArn,ParameterValue=$ACM_CERT_ARN \
                 ParameterKey=Subnet1,UsePreviousValue=true \
                 ParameterKey=Subnet2,UsePreviousValue=true \
                 ParameterKey=VPC,UsePreviousValue=true \
    --capabilities CAPABILITY_NAMED_IAM

if [ $? -ne 0 ]; then
    echo "Error: Failed to update CloudFormation stack with ACM certificate"
    exit 1
fi

echo "CloudFormation stack '$STACK_NAME' updated successfully with ACM certificate."

# Wait for the stack update to complete
aws cloudformation wait stack-update-complete \
    --profile "$CLIENT_NAME" \
    --stack-name "$STACK_NAME"

if [ $? -ne 0 ]; then
    echo "Error: Failed to complete CloudFormation stack update"
    exit 1
fi

echo "CloudFormation stack '$STACK_NAME' update completed successfully."
