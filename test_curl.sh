#!/bin/bash
curl http://localhost:8080/login -c tmp/cookie.txt -b tmp/cookie.txt -H 'Content-Type: application/json' -d '{"username": "test", "password": "password"}' -L
curl http://localhost:8080/authtest -c tmp/cookie.txt -b tmp/cookie.txt -v -L

