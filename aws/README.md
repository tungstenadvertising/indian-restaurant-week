# AWS Infrastructure for IRW News CMS

## Overview

This directory contains AWS Lambda functions and configuration for the News CMS backend.

## Services Used

- **DynamoDB**: Article storage
- **S3**: Image uploads
- **Lambda**: API endpoints
- **API Gateway**: REST API routing
- **Cognito**: Admin authentication

## Setup Instructions

### 1. Create DynamoDB Table

```bash
aws dynamodb create-table \
  --table-name irw-articles \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=slug,AttributeType=S \
    AttributeName=status,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "slug-index",
        "KeySchema": [{"AttributeName": "slug", "KeyType": "HASH"}],
        "Projection": {"ProjectionType": "ALL"}
      },
      {
        "IndexName": "status-index",
        "KeySchema": [{"AttributeName": "status", "KeyType": "HASH"}],
        "Projection": {"ProjectionType": "ALL"}
      }
    ]' \
  --billing-mode PAY_PER_REQUEST
```

### 2. Create S3 Bucket

```bash
aws s3 mb s3://irw-media-uploads --region us-west-2

# Enable CORS
aws s3api put-bucket-cors --bucket irw-media-uploads --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["https://indianrestaurantweeksf.com", "http://localhost:3000"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}'
```

### 3. Create Cognito User Pool

```bash
aws cognito-idp create-user-pool \
  --pool-name irw-admin-pool \
  --auto-verified-attributes email \
  --username-attributes email \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }'
```

### 4. Deploy Lambda Functions

See `template.yaml` for SAM deployment configuration.

```bash
cd aws
sam build
sam deploy --guided
```

## Environment Variables

Create a `.env` file in the project root (or set in Netlify dashboard):

```bash
# API Gateway URL (from SAM/CloudFormation output)
PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/prod

# AWS Cognito (for admin authentication)
PUBLIC_COGNITO_USER_POOL_ID=us-west-2_xxxxxxxxx
PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# AWS Region
PUBLIC_AWS_REGION=us-west-2

# S3 Configuration (for image uploads)
PUBLIC_S3_BUCKET=irw-media-uploads
PUBLIC_S3_REGION=us-west-2
```

**Note:** Without these variables, the admin panel works in development mode with mock data.

## Development Mode

When `PUBLIC_API_URL` is not set, the admin panel operates in development mode:
- Uses mock data from `src/api/newsApi.js`
- Login credentials: `admin@indianrestaurantweek.com` / `Admin123!`
- Changes are simulated (not persisted)

This allows you to test the admin UI before deploying the AWS backend.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /articles | Public | List published articles |
| GET | /articles/{slug} | Public | Get single article |
| GET | /admin/articles | Admin | List all articles |
| POST | /admin/articles | Admin | Create article |
| PUT | /admin/articles/{id} | Admin | Update article |
| DELETE | /admin/articles/{id} | Admin | Delete article |
| POST | /admin/upload | Admin | Get S3 presigned URL |
