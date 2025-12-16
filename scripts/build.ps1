# Build (com API URL customizada)
docker build --build-arg NEXT_PUBLIC_API_URL=http://172.25.10.34:8081 -t localhost:5000/bet-frontend:latest .

# Upload
docker push localhost:5000/bet-frontend:latest