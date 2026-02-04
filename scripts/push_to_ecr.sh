#!/bin/bash
set -e

# Load environment variables
source backend/.env

# Constants
REGION="us-east-1"
ACCOUNT_ID="183317995442"
REPO_NAME="propiq-backend"
ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO_NAME"

echo "=== Prop IQ Manual ECR Push ==="
echo "Target: $ECR_URI"

# 1. Login to ECR
echo "Logging in to ECR..."
docker logout $ECR_URI || true
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI

# 2. Build Docker Image (amd64 for App Runner compat)
echo "Building Docker image (platform: linux/amd64)..."
cd backend
docker build --platform linux/amd64 -t $REPO_NAME .

# 3. Tag Image
echo "Tagging image..."
docker tag $REPO_NAME:latest $ECR_URI:latest

# 4. Push Image
echo "Pushing to ECR (this may take a minute)..."
docker push $ECR_URI:latest

echo "✅ Image pushed successfully!"
echo "App Runner should detect this and start deploying shortly."
