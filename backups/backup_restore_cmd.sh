sudo docker exec -i daniel-mysql mysql \
   -u root -proot_password_2025 \
   -e "CREATE DATABASE IF NOT EXISTS daniel_school; GRANT ALL PRIVILEGES ON daniel_school.* TO 'daniel_user'@'%'; FLUSH PRIVILEGES;"

sudo docker exec -i daniel-mysql mysqldump \
   -u daniel_user -pdaniel_password_2025 \
   --no-data --no-tablespaces \
   daniel_school > daniel_school_structure.sql


sudo docker exec -i daniel-mysql mysqldump \
  -u daniel_user -pdaniel_password_2025 \
  --no-data --no-tablespaces \
  daniel_school > daniel_school_structure.sql

sudo docker exec -i daniel-mysql mysql \
   -u daniel_user -pdaniel_password_2025 \
   daniel_school < /home/ubuntu/workspace/danielschool/all_data_only.sql


sudo docker exec -i daniel-mysql mysql \
   -u daniel_user -pdaniel_password_2025 \
   daniel_school < all_data_only.sql