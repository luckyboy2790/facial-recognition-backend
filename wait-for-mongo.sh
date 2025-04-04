#!/bin/bash
# Wait for MongoDB to be ready

until nc -z -v -w30 mongodb 27017
do
  echo "Waiting for MongoDB..."
  sleep 2
done

echo "MongoDB is up and running!"
