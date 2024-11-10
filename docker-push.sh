#!/bin/bash
region=asia-south1-docker.pkg.dev
project_id=acoustic-cirrus-439618-h8

# Shortner Service
docker build -t $region/$project_id/shortner-service/shortner-service:latest ./shortner-service/
docker push $region/$project_id/shortner-service/shortner-service:latest 

# Analytics Service
docker build -t $region/$project_id/analytics-service/analytics-service:latest ./analytics-service/
docker push $region/$project_id/analytics-service/analytics-service:latest

# Frontend Service
# docker build -t $region/$project_id/frontend-service/frontend-service:latest ./frontend-service/
# docker push $region/$project_id/frontend-service/frontend-service:latest