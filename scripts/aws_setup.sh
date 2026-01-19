#!/bin/bash

# AWS Setup & Verification Script for Prop IQ Migration
# Usage: ./scripts/aws_setup.sh

set -e

# Configuration
APP_NAME="propiq"
BACKEND_REPO_NAME="propiq-backend"
REGION="${AWS_REGION:-us-east-1}"
ECR_URI=""

echo "=== Prop IQ AWS Migration Setup ==="
echo "Region: $REGION"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it."
    exit 1
fi

# Check Credentials
echo "Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    echo "✅ AWS credentials valid."
else
    echo "❌ Validate AWS credentials failed. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
    echo "For local dev, add them to your .env file or export them in your shell."
    exit 1
fi

# 1. ECR Repository
echo "--- Checking ECR Repository ($BACKEND_REPO_NAME) ---"
if aws ecr describe-repositories --repository-names "$BACKEND_REPO_NAME" --region "$REGION" &> /dev/null; then
    echo "✅ ECR Repository '$BACKEND_REPO_NAME' already exists."
else
    echo "Creating ECR Repository '$BACKEND_REPO_NAME'..."
    aws ecr create-repository --repository-name "$BACKEND_REPO_NAME" --region "$REGION"
    echo "✅ ECR Repository created."
fi

# Get ECR URI
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$BACKEND_REPO_NAME"
echo "ECR URI: $ECR_URI"

# 2. App Runner Service (Check only, creation is complex via CLI without config file, usually better in Console or Terraform)
echo "--- App Runner Service ---"
echo "Note: For the initial setup, we recommend using the AWS Console or the 'deploy-aws-backend' workflow once ECR is populated."
echo "You can create an App Runner service linked to the ECR image: $ECR_URI"

echo "=== Setup Verification Complete ==="
echo "Next Steps:"
echo "1. Ensure 'backend/.env' contains your AWS credentials for local development."
echo "2. Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to GitHub Repo Secrets for CI/CD."
echo "3. Run the deployment workflow."
