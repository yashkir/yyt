#!/bin/bash
echo -e "\n-- TEST: Logging in..."
curl http://localhost:8080/login -c tmp/cookie.txt -b tmp/cookie.txt -H 'Content-Type: application/json' -d '{"username": "test", "password": "password"}' -L
echo -e "\n-- TEST: Trying authtest/ ..."
curl http://localhost:8080/authtest -c tmp/cookie.txt -b tmp/cookie.txt -L
echo -e "\n-- TESTS DONE"

