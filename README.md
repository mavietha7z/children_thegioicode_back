### Cập nhật và nâng cấp ubuntu

```
apt update
```

```
apt upgrade
```

### Tải và nâng cấp các package

<sub>Tải nginx và kiểm tra</sub>

```
apt install nginx
```

```
systemctl status nginx
```

<sub>Tải nodejs 18</sub>

```
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&\
sudo apt-get install -y nodejs
```

<sub>Cấu hình và tải mongodb</sub>

```
curl -fsSL https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
```

`Output: OK`

```
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
```

```
apt update
```

```
apt install mongodb-org
```

```
systemctl start mongod.service
```

<sub>Tải pm2</sub>

```
npm i pm2 -g
```

<sub>Chuyển múi giờ về Việt Nam</sub>

```
sudo timedatectl set-timezone Asia/Ho_Chi_Minh
```

<sub>Tải puppeteer</sub>

```
sudo apt update
sudo apt install chromium-browser
sudo apt install -y \
        wget \
        curl \
        gnupg \
        ca-certificates \
        libx11-dev \
        libx264-dev \
        libnss3 \
        fonts-liberation \
        libappindicator3-1 \
        libasound2 \
        libxtst6 \
        libxss1 \
        libdbus-1-3 \
        libgbm1
```

### Tạo thư mục admin và cấp quyền

```
mkdir -p /var/www/thegioicode/admin/html
```

```
chown -R $USER:$USER /var/www/thegioicode/admin/html
```

```
chmod -R 755 /var/www/thegioicode
```

### Tạo thư mục back và cấp quyền

```
mkdir -p /var/www/thegioicode/back/html
```

```
chown -R $USER:$USER /var/www/thegioicode/back/html
```

```
chmod -R 755 /var/www/thegioicode/back
```

### Tạo thư mục client và cấp quyền

```
mkdir -p /var/www/thegioicode/client/html
```

```
chown -R $USER:$USER /var/www/thegioicode/client/html
```

```
chmod -R 755 /var/www/thegioicode/client
```

### Cấu hình nginx app

```
vi /etc/nginx/sites-enabled/thegioicode-app
```

```
server {
        listen 80;
        listen [::]:80;
        server_name thegioicode.com;

        location / {
                root /var/www/thegioicode/client/html;
                index index.html index.htm index.nginx-debian.html;
                try_files $uri /index.html;
        }
        location /css {
                proxy_pass http://localhost:8080;
        }
        location /js {
                proxy_pass http://localhost:8080;
        }
        location /images {
                proxy_pass http://localhost:8080;
        }
        location /api {
                root /var/www/thegioicode/back/html;
                index index.js index.html index.htm index.nginx-debian.html;
                proxy_pass http://localhost:8080;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
        }
}
```

### Cấu hình nginx admin

```
vi /etc/nginx/sites-enabled/thegioicode-admin
```

```
server {
        listen 80;
        listen [::]:80;
        server_name manage.thegioicode.com;

        root /var/www/thegioicode/admin/html;
        index index.html index.htm index.nginx-debian.html;

        location / {
                try_files $uri /index.html;
        }
}
```

```
nginx -t
```

```
service nginx reload
```

### Sửa code trong source admin

<sub>Sửa url api</sub>

```
/src/utils/index.js
```

<sub>Sửa url api</sub>

```
/src/services/callback.js
```

<sub>Sửa url admin & image admin</sub>

```
/public/index.html
```

### Sửa code trong source back

<sub>Sửa đừng dấn thư mục log & view</sub>

```
/src/configs/index.js

```

<sub>Sửa SSL HTTP => HTTPS và sửa đường dẫn lưu ảnh</sub>

```
/src/controllers/image/upload.js
```

### Cấu hình mongodb

<sub>Tạo database</sub>

```
mongo
```

```
use thegioicode
```

<sub>Tải lên các file dữ liệu có sẵn</sub>

```
mongoimport --db thegioicode --collection apikeys --file /var/www/thegioicode/back/html/apikeys.json --jsonArray
```

```
mongoimport --db thegioicode --collection apis --file /var/www/thegioicode/back/html/apis.json --jsonArray
```

```
mongoimport --db thegioicode --collection apps --file /var/www/thegioicode/back/html/apps.json --jsonArray
```

```
mongoimport --db thegioicode --collection bonuspoints --file /var/www/thegioicode/back/html/bonuspoints.json --jsonArray
```

```
mongoimport --db thegioicode --collection carts --file /var/www/thegioicode/back/html/carts.json --jsonArray
```

```
mongoimport --db thegioicode --collection cloudserverimages --file /var/www/thegioicode/back/html/cloudserverimages.json --jsonArray
```

```
mongoimport --db thegioicode --collection cloudserverpartners --file /var/www/thegioicode/back/html/cloudserverpartners.json --jsonArray
```

```
mongoimport --db thegioicode --collection cloudserverplans --file /var/www/thegioicode/back/html/cloudserverplans.json --jsonArray
```

```
mongoimport --db thegioicode --collection cloudserverproducts --file /var/www/thegioicode/back/html/cloudserverproducts.json --jsonArray
```

```
mongoimport --db thegioicode --collection cloudserverregions --file /var/www/thegioicode/back/html/cloudserverregions.json --jsonArray
```

```
mongoimport --db thegioicode --collection cycles --file /var/www/thegioicode/back/html/cycles.json --jsonArray
```

```
mongoimport --db thegioicode --collection invoices --file /var/www/thegioicode/back/html/invoices.json --jsonArray
```

```
mongoimport --db thegioicode --collection localbanks --file /var/www/thegioicode/back/html/localbanks.json --jsonArray
```

```
mongoimport --db thegioicode --collection loginhistories --file /var/www/thegioicode/back/html/loginhistories.json --jsonArray
```

```
mongoimport --db thegioicode --collection memberships --file /var/www/thegioicode/back/html/memberships.json --jsonArray
```

```
mongoimport --db thegioicode --collection newsfeeds --file /var/www/thegioicode/back/html/newsfeeds.json --jsonArray
```

```
mongoimport --db thegioicode --collection notifications --file /var/www/thegioicode/back/html/notifications.json --jsonArray
```

```
mongoimport --db thegioicode --collection ordercloudservers --file /var/www/thegioicode/back/html/ordercloudservers.json --jsonArray
```

```
mongoimport --db thegioicode --collection orders --file /var/www/thegioicode/back/html/orders.json --jsonArray
```

```
mongoimport --db thegioicode --collection ordertemplates --file /var/www/thegioicode/back/html/ordertemplates.json --jsonArray
```

```
mongoimport --db thegioicode --collection partners --file /var/www/thegioicode/back/html/partners.json --jsonArray
```

```
mongoimport --db thegioicode --collection partnerservices --file /var/www/thegioicode/back/html/partnerservices.json --jsonArray
```

```
mongoimport --db thegioicode --collection paygates --file /var/www/thegioicode/back/html/paygates.json --jsonArray
```

```
mongoimport --db thegioicode --collection players --file /var/www/thegioicode/back/html/players.json --jsonArray
```

```
mongoimport --db thegioicode --collection pricings --file /var/www/thegioicode/back/html/pricings.json --jsonArray
```

```
mongoimport --db thegioicode --collection requests --file /var/www/thegioicode/back/html/requests.json --jsonArray
```

```
mongoimport --db thegioicode --collection resourceaccounts --file /var/www/thegioicode/back/html/resourceaccounts.json --jsonArray
```

```
mongoimport --db thegioicode --collection resourcecategories --file /var/www/thegioicode/back/html/resourcecategories.json --jsonArray
```

```
mongoimport --db thegioicode --collection resourceproducts --file /var/www/thegioicode/back/html/resourceproducts.json --jsonArray
```

```
mongoimport --db thegioicode --collection sources --file /var/www/thegioicode/back/html/sources.json --jsonArray
```

```
mongoimport --db thegioicode --collection templates --file /var/www/thegioicode/back/html/templates.json --jsonArray
```

```
mongoimport --db thegioicode --collection tokens --file /var/www/thegioicode/back/html/tokens.json --jsonArray
```

```
mongoimport --db thegioicode --collection userbanks --file /var/www/thegioicode/back/html/userbanks.json --jsonArray
```

```
mongoimport --db thegioicode --collection users --file /var/www/thegioicode/back/html/users.json --jsonArray
```

```
mongoimport --db thegioicode --collection wallethistories --file /var/www/thegioicode/back/html/wallethistories.json --jsonArray
```

```
mongoimport --db thegioicode --collection wallets --file /var/www/thegioicode/back/html/wallets.json --jsonArray
```

<sub>Giới hạn log của PM2</sub>

```
vi /etc/logrotate.d/pm2
```

```
/root/.pm2/logs/*.log {
        daily
        rotate 3
        compress
        delaycompress
        missingok
        notifempty
        create 0644 root root
        size 1M
}
```

<sub>Giới hạn log của MongoDB</sub>

```
vi /etc/logrotate.d/mongodb
```

```
/var/log/mongodb/mongod.log {
        daily
        rotate 3
        compress
        delaycompress
        missingok
        notifempty
        create 640 mongodb mongodb
        size 10M
}
```

##### Kiểm tra Logrotate

```
logrotate -d /etc/logrotate.d/pm2
```

```
logrotate -d /etc/logrotate.d/mongodb
```

## Upload code và chạy dự án
