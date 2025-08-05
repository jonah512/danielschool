cd webapp
npm run build 
cd ..
sudo docker stop daniel-service
sudo docker rm daniel-service
sudo docker-compose -p daniel up --build -d