# Cloud Run Deployment Guide

## Overview

This guide will deploy the Valuact Actuarial Engine (Python FastAPI service) to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Firebase Project** (valuact-platform) - already set up
3. **gcloud CLI** installed
4. **Docker** installed

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
cd actuarial-engine
./deploy.sh
```

This script will:
- Authenticate with Google Cloud
- Enable required APIs
- Build Docker image
- Push to Container Registry
- Deploy to Cloud Run
- Test the deployment

### Option 2: Manual Steps

#### 1. Install gcloud CLI (if not installed)

```bash
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

#### 2. Authenticate and Configure

```bash
gcloud auth login
gcloud config set project valuact-platform
```

#### 3. Enable Required APIs

```bash
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    containerregistry.googleapis.com \
    iam.googleapis.com
```

#### 4. Configure Docker

```bash
gcloud auth configure-docker
```

#### 5. Build and Deploy

```bash
cd actuarial-engine

# Build Docker image
docker build -t gcr.io/valuact-platform/valuact-actuarial-engine .

# Push to registry
docker push gcr.io/valuact-platform/valuact-actuarial-engine

# Deploy to Cloud Run
gcloud run deploy valuact-actuarial-engine \
    --image gcr.io/valuact-platform/valuact-actuarial-engine \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 10 \
    --max-instances 10 \
    --min-instances 0 \
    --port 8080 \
    --set-env-vars ENVIRONMENT=production
```

## Configuration

### Service Settings

- **Memory**: 2GB (for actuarial calculations)
- **CPU**: 2 cores (for performance)
- **Timeout**: 300 seconds (5 minutes)
- **Concurrency**: 10 requests per instance
- **Scaling**: 0-10 instances (auto-scaling)
- **Port**: 8080 (Cloud Run will set PORT env var)

### Environment Variables

The service uses these environment variables:

- `PORT`: Set by Cloud Run (default: 8080)
- `ENVIRONMENT`: Set to "production"

## Testing Deployment

After deployment, test these endpoints:

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe valuact-actuarial-engine \
    --platform managed --region us-central1 \
    --format 'value(status.url)')

# Test health endpoint
curl ${SERVICE_URL}/health

# Test mortality tables
curl ${SERVICE_URL}/api/v1/mortality-tables

# Test IFRS 17 calculation (may timeout due to complexity)
curl -X POST ${SERVICE_URL}/api/v1/calculate/ifrs17 \
  -H "Content-Type: application/json" \
  -d '{
    "policies": [{
      "policy_id": "TEST001",
      "issue_date": "2024-01-01",
      "face_amount": 100000,
      "premium": 5000,
      "policy_type": "term_life",
      "gender": "male",
      "issue_age": 35,
      "policy_term": 20
    }],
    "assumptions": {
      "discount_rate": 0.03,
      "lapse_rate": 0.05,
      "mortality_table": "CSO_2017",
      "expense_inflation": 0.02
    }
  }'
```

## Updating Backend Configuration

Once deployed, update your Node.js backend to use the Cloud Run URL:

**File**: `server/.env`

```bash
# Update this line:
ACTUARIAL_ENGINE_URL=https://valuact-actuarial-engine-xxxxx-uc.a.run.app
```

## Monitoring

### Google Cloud Console

- **Cloud Run**: https://console.cloud.google.com/run
- **Logs**: https://console.cloud.google.com/logs
- **Monitoring**: https://console.cloud.google.com/monitoring

### Key Metrics to Monitor

- **Request latency**: Should be < 5 seconds for health/mortality endpoints
- **Error rate**: Should be < 1%
- **Memory usage**: Should stay under 2GB
- **CPU usage**: Monitor for optimization opportunities

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Check Docker build locally
docker build -t test-image .

# Check for missing dependencies
docker run --rm test-image pip list
```

#### 2. Deployment Failures

```bash
# Check service status
gcloud run services describe valuact-actuarial-engine \
    --platform managed --region us-central1

# Check logs
gcloud logs read --service=valuact-actuarial-engine --limit=50
```

#### 3. Timeout Issues

The IFRS 17 calculation may timeout due to complexity. This is expected and needs optimization:

- Reduce calculation complexity
- Implement caching
- Use background processing
- Optimize algorithms

#### 4. Memory Issues

If calculations fail due to memory:

```bash
# Increase memory allocation
gcloud run services update valuact-actuarial-engine \
    --memory 4Gi \
    --platform managed \
    --region us-central1
```

## Cost Optimization

### Current Configuration Costs

- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests

### Optimization Tips

1. **Set min-instances to 0** (cold starts acceptable)
2. **Use appropriate memory allocation** (2GB is generous)
3. **Monitor usage** and adjust scaling
4. **Implement caching** to reduce computation

## Security

### Current Security Features

- ✅ **Non-root user** in Docker container
- ✅ **HTTPS only** (Cloud Run default)
- ✅ **No persistent storage** (stateless)
- ✅ **Environment variables** for configuration

### Additional Security (Optional)

- **Authentication**: Add API key authentication
- **VPC**: Deploy in private VPC
- **IAM**: Restrict access with service accounts

## Next Steps

After successful deployment:

1. **Update Node.js backend** with Cloud Run URL
2. **Test end-to-end** integration
3. **Monitor performance** and optimize
4. **Set up alerts** for errors and performance
5. **Implement caching** for better performance

## Support

- **Google Cloud Run Docs**: https://cloud.google.com/run/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Docker Docs**: https://docs.docker.com/
