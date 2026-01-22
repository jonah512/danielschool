cd webapp
sudo npm run build
cd ..
sudo docker stop daniel-service
sudo docker rm daniel-service
sudo docker stop daniel-mysql
sudo docker rm daniel-mysql

sudo docker-compose -p daniel up --build -d