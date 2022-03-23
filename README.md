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
./scripts/build_datalayer.sh
./scripts/build_frontend.sh
```

## Deployment

Deployment is handled via the `detc` tool; execute the plan corresponding to your environment (see deploy folder).



