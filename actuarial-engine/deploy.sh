#!/bin/bash

# Cloud Run Deployment Script for Valuact Actuarial Engine
# This script builds and deploys the Python FastAPI service to Google Cloud Run

set -e

# Configuration
PROJECT_ID="valuact-platform"
SERVICE_NAME="valuact-actuarial-engine"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying Valuact Actuarial Engine to Cloud Run"
echo "Project ID: ${PROJECT_ID}"
echo "Service Name: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Image: ${IMAGE_NAME}"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install it first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Authenticate with Google Cloud
echo "🔐 Authenticating with Google Cloud..."
gcloud auth login
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    iam.googleapis.com

# Configure Docker to use gcloud as a credential helper
echo "🐳 Configuring Docker authentication..."
gcloud auth configure-docker

# Build the Docker image
echo "🏗️  Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Push the image to Google Container Registry
echo "📤 Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 10 \
    --max-instances 10 \
    --min-instances 0 \
    --port 8080 \
    --set-env-vars ENVIRONMENT=production

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format 'value(status.url)')

echo ""
echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: ${SERVICE_URL}"
echo ""
echo "🧪 Testing the deployment..."
echo "Health check: ${SERVICE_URL}/health"
echo "Mortality tables: ${SERVICE_URL}/api/v1/mortality-tables"
echo ""

# Test the health endpoint
echo "Testing health endpoint..."
if curl -f -s "${SERVICE_URL}/health" > /dev/null; then
    echo "✅ Health endpoint is working"
else
    echo "❌ Health endpoint test failed"
fi

echo ""
echo "🎉 Valuact Actuarial Engine is now deployed to Cloud Run!"
echo ""
echo "Next steps:"
echo "1. Update your Node.js backend to use: ${SERVICE_URL}"
echo "2. Test the IFRS 17 and Solvency II endpoints"
echo "3. Monitor the service in Google Cloud Console"
echo ""
echo "Service Console: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}"
