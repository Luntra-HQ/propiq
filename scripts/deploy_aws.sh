#!/bin/bash

# ==============================================================================
# Prop IQ - AWS App Runner Deployment Script
# 
# This script automates the deployment of the Prop IQ backend to AWS App Runner.
# It handles:
# 1. Loading credentials and secrets from backend/.env
# 2. Creating necessary IAM roles (ECR Access & Instance Role for Bedrock)
# 3. configuring the App Runner service with all required environment variables
# ==============================================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."
ENV_FILE="$PROJECT_ROOT/backend/.env"

echo -e "${BLUE}=== Prop IQ AWS Deployer ===${NC}"

# 1. Load Environment Variables
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: backend/.env file not found at $ENV_FILE${NC}"
    exit 1
fi

echo "Loading secrets from backend/.env..."
set -a
source "$ENV_FILE"
set +a

# Verify AWS Credentials are loaded from .env
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${RED}Error: AWS credentials not found in .env files.${NC}"
    exit 1
fi

# Verify Identity
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="${AWS_REGION:-us-east-1}"
SERVICE_NAME="propiq-backend"
REPO_NAME="propiq-backend"

echo -e "Using AWS Account: ${GREEN}$ACCOUNT_ID${NC}"
echo -e "Region: ${GREEN}$REGION${NC}"

# 2. Ensure IAM Roles Exist

# Role 1: ECR Access Role (Allows App Runner to pull images)
ECR_ROLE_NAME="AppRunnerECRAccessRole-$ACCOUNT_ID"
echo -n "Checking ECR Access Role ($ECR_ROLE_NAME)... "

if ! aws iam get-role --role-name "$ECR_ROLE_NAME" &> /dev/null; then
    echo "Creating..."
    aws iam create-role --role-name "$ECR_ROLE_NAME" \
        --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"build.apprunner.amazonaws.com"},"Action":"sts:AssumeRole"}]}' > /dev/null
    aws iam attach-role-policy --role-name "$ECR_ROLE_NAME" --policy-arn "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
    echo -e "${GREEN}Created.${NC}"
else
    echo -e "${GREEN}Exists.${NC}"
fi
ECR_ROLE_ARN=$(aws iam get-role --role-name "$ECR_ROLE_NAME" --query Role.Arn --output text)

# Role 2: Instance Role (Allows App Runner to call Bedrock)
INSTANCE_ROLE_NAME="AppRunnerInstanceRole-$ACCOUNT_ID"
echo -n "Checking Instance Role ($INSTANCE_ROLE_NAME)... "

if ! aws iam get-role --role-name "$INSTANCE_ROLE_NAME" &> /dev/null; then
    echo "Creating..."
    aws iam create-role --role-name "$INSTANCE_ROLE_NAME" \
        --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"tasks.apprunner.amazonaws.com"},"Action":"sts:AssumeRole"}]}' > /dev/null
    
    # Create inline policy for Bedrock
    aws iam put-role-policy --role-name "$INSTANCE_ROLE_NAME" \
        --policy-name "BedrockAccess" \
        --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["bedrock:InvokeModel","bedrock:InvokeModelWithResponseStream"],"Resource":"*"}]}'
    
    echo -e "${GREEN}Created.${NC}"
else
    echo -e "${GREEN}Exists.${NC}"
fi
INSTANCE_ROLE_ARN=$(aws iam get-role --role-name "$INSTANCE_ROLE_NAME" --query Role.Arn --output text)

# 3. Check Service Status & Prepare Config
IMAGE_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME:latest"

echo "Checking service status..."
SERVICE_ARN=$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$SERVICE_NAME'].ServiceArn" --output text)

# 4. Deploy or Update
echo "Deploying to App Runner (this may take 5-10 minutes)..."

if [ -z "$SERVICE_ARN" ]; then
    echo "Creating NEW service..."
    cat > apprunner_create.json <<EOF
{
    "ServiceName": "$SERVICE_NAME",
    "SourceConfiguration": {
        "AuthenticationConfiguration": {
            "AccessRoleArn": "$ECR_ROLE_ARN"
        },
        "ImageRepository": {
            "ImageIdentifier": "$IMAGE_URI",
            "ImageConfiguration": {
                "Port": "8000",
                "RuntimeEnvironmentVariables": {
                    "ENVIRONMENT": "production",
                    "JWT_SECRET": "$JWT_SECRET",
                    "SUPABASE_URL": "$SUPABASE_URL",
                    "SUPABASE_SERVICE_KEY": "$SUPABASE_SERVICE_KEY",
                    "AZURE_OPENAI_KEY": "$AZURE_OPENAI_KEY",
                    "AZURE_OPENAI_ENDPOINT": "$AZURE_OPENAI_ENDPOINT",
                    "LLM_PROVIDER": "bedrock",
                    "AWS_REGION": "$REGION",
                    "BEDROCK_MODEL_ID": "anthropic.claude-3-haiku-20240307-v1:0",
                    "STRIPE_SECRET_KEY": "$STRIPE_SECRET_KEY",
                    "STRIPE_WEBHOOK_SECRET": "$STRIPE_WEBHOOK_SECRET",
                    "WANDB_API_KEY": "$WANDB_API_KEY"
                }
            },
            "ImageRepositoryType": "ECR"
        },
        "AutoDeploymentsEnabled": true
    },
    "InstanceConfiguration": {
        "Cpu": "1 vCPU",
        "Memory": "2 GB",
        "InstanceRoleArn": "$INSTANCE_ROLE_ARN"
    }
}
EOF
    aws apprunner create-service --cli-input-json file://apprunner_create.json > deployment_output.json
    rm apprunner_create.json

else
    echo "Updating EXISTING service ($SERVICE_ARN)..."
    cat > apprunner_update.json <<EOF
{
    "SourceConfiguration": {
        "AuthenticationConfiguration": {
            "AccessRoleArn": "$ECR_ROLE_ARN"
        },
        "ImageRepository": {
            "ImageIdentifier": "$IMAGE_URI",
            "ImageConfiguration": {
                "Port": "8000",
                "RuntimeEnvironmentVariables": {
                    "ENVIRONMENT": "production",
                    "JWT_SECRET": "$JWT_SECRET",
                    "SUPABASE_URL": "$SUPABASE_URL",
                    "SUPABASE_SERVICE_KEY": "$SUPABASE_SERVICE_KEY",
                    "AZURE_OPENAI_KEY": "$AZURE_OPENAI_KEY",
                    "AZURE_OPENAI_ENDPOINT": "$AZURE_OPENAI_ENDPOINT",
                    "LLM_PROVIDER": "bedrock",
                    "AWS_REGION": "$REGION",
                    "BEDROCK_MODEL_ID": "anthropic.claude-3-haiku-20240307-v1:0",
                    "STRIPE_SECRET_KEY": "$STRIPE_SECRET_KEY",
                    "STRIPE_WEBHOOK_SECRET": "$STRIPE_WEBHOOK_SECRET",
                    "WANDB_API_KEY": "$WANDB_API_KEY"
                }
            },
            "ImageRepositoryType": "ECR"
        },
        "AutoDeploymentsEnabled": true
    },
    "InstanceConfiguration": {
        "Cpu": "1 vCPU",
        "Memory": "2 GB",
        "InstanceRoleArn": "$INSTANCE_ROLE_ARN"
    }
}
EOF
    aws apprunner update-service --service-arn "$SERVICE_ARN" --cli-input-json file://apprunner_update.json > deployment_output.json
    rm apprunner_update.json
fi

echo -e "${GREEN}✅ Deployment triggered!${NC}"
SERVICE_URL=$(cat deployment_output.json | grep '"ServiceUrl":' | awk -F'"' '{print $4}')
SERVICE_STATUS=$(cat deployment_output.json | grep '"Status":' | awk -F'"' '{print $4}')

echo "Service URL: https://$SERVICE_URL"
echo "Current Status: $SERVICE_STATUS"
echo ""
echo "Monitor progress here: https://$REGION.console.aws.amazon.com/apprunner/home?region=$REGION#/services"
