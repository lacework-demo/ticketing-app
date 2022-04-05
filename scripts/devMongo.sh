docker run  -p 27017:27017 \
    -e MONGO_INITDB_ROOT_USERNAME=mongoadmin \
    -e MONGO_INITDB_ROOT_PASSWORD=secret \
    -e MONGO_INITDB_USERNAME=tickets \
    -e MONGO_INITDB_PASSWORD=tickets \
    -e MONGO_INITDB_DATABASE=tickets \
    -v $(pwd)/init-mongo.sh:/docker-entrypoint-initdb.d/init-mongo.sh \
    mongo:latest
