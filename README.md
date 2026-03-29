[![IaC](https://app.soluble.cloud/api/v1/public/badges/f9cd157a-2c49-4577-98dc-94d1fc16a27a.svg?orgId=782207203755)](https://app.soluble.cloud/repos/details/github.com/lacework-demo/ticketing-app?orgId=782207203755)

# Ticketing app

This app records issues or service requests for our internal use. 

> Note: This application is for demonstration purposes only

## Run locally
Execute the app locally vai `docker-compose`; from the root of the project:

```
docker-compose up
```

## Build artifacts
From the root of the project, run:

```
./scripts/build_all.sh
```

## Deployment

Deployment is handled via the `detc` tool; execute the plan corresponding to your environment (see deploy folder).

** Exposes port 4999
