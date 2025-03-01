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
mkdir -p /var/www/netcode/admin/html
```

```
chown -R $USER:$USER /var/www/netcode/admin/html
```

```
chmod -R 755 /var/www/netcode
```

### Tạo thư mục back và cấp quyền

```
mkdir -p /var/www/netcode/back/html
```

```
chown -R $USER:$USER /var/www/netcode/back/html
```

```
chmod -R 755 /var/www/netcode/back
```

### Tạo thư mục client và cấp quyền

```
mkdir -p /var/www/netcode/client/html
```

```
chown -R $USER:$USER /var/www/netcode/client/html
```

```
chmod -R 755 /var/www/netcode/client
```

### Cấu hình nginx app

```
vi /etc/nginx/sites-enabled/netcode-app
```

```
server {
        listen 80;
        listen [::]:80;
        server_name Netcode.vn;

        location / {
                root /var/www/netcode/client/html;
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
                root /var/www/netcode/back/html;
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
vi /etc/nginx/sites-enabled/netcode-admin
```

```
server {
        listen 80;
        listen [::]:80;
        server_name manage.Netcode.vn;

        root /var/www/netcode/admin/html;
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
use netcode
```

<sub>Tải lên các file dữ liệu có sẵn</sub>

```
mongoimport --db netcode --collection apikeys --file /var/www/netcode/back/html/apikeys.json --jsonArray
```

```
mongoimport --db netcode --collection apis --file /var/www/netcode/back/html/apis.json --jsonArray
```

```
mongoimport --db netcode --collection apps --file /var/www/netcode/back/html/apps.json --jsonArray
```

```
mongoimport --db netcode --collection bonuspoints --file /var/www/netcode/back/html/bonuspoints.json --jsonArray
```

```
mongoimport --db netcode --collection carts --file /var/www/netcode/back/html/carts.json --jsonArray
```

```
mongoimport --db netcode --collection cloudserverimages --file /var/www/netcode/back/html/cloudserverimages.json --jsonArray
```

```
mongoimport --db netcode --collection cloudserverpartners --file /var/www/netcode/back/html/cloudserverpartners.json --jsonArray
```

```
mongoimport --db netcode --collection cloudserverplans --file /var/www/netcode/back/html/cloudserverplans.json --jsonArray
```

```
mongoimport --db netcode --collection cloudserverproducts --file /var/www/netcode/back/html/cloudserverproducts.json --jsonArray
```

```
mongoimport --db netcode --collection cloudserverregions --file /var/www/netcode/back/html/cloudserverregions.json --jsonArray
```

```
mongoimport --db netcode --collection cycles --file /var/www/netcode/back/html/cycles.json --jsonArray
```

```
mongoimport --db netcode --collection invoices --file /var/www/netcode/back/html/invoices.json --jsonArray
```

```
mongoimport --db netcode --collection localbanks --file /var/www/netcode/back/html/localbanks.json --jsonArray
```

```
mongoimport --db netcode --collection loginhistories --file /var/www/netcode/back/html/loginhistories.json --jsonArray
```

```
mongoimport --db netcode --collection memberships --file /var/www/netcode/back/html/memberships.json --jsonArray
```

```
mongoimport --db netcode --collection newsfeeds --file /var/www/netcode/back/html/newsfeeds.json --jsonArray
```

```
mongoimport --db netcode --collection notifications --file /var/www/netcode/back/html/notifications.json --jsonArray
```

```
mongoimport --db netcode --collection ordercloudservers --file /var/www/netcode/back/html/ordercloudservers.json --jsonArray
```

```
mongoimport --db netcode --collection orders --file /var/www/netcode/back/html/orders.json --jsonArray
```

```
mongoimport --db netcode --collection ordertemplates --file /var/www/netcode/back/html/ordertemplates.json --jsonArray
```

```
mongoimport --db netcode --collection partners --file /var/www/netcode/back/html/partners.json --jsonArray
```

```
mongoimport --db netcode --collection partnerservices --file /var/www/netcode/back/html/partnerservices.json --jsonArray
```

```
mongoimport --db netcode --collection paygates --file /var/www/netcode/back/html/paygates.json --jsonArray
```

```
mongoimport --db netcode --collection players --file /var/www/netcode/back/html/players.json --jsonArray
```

```
mongoimport --db netcode --collection pricings --file /var/www/netcode/back/html/pricings.json --jsonArray
```

```
mongoimport --db netcode --collection requests --file /var/www/netcode/back/html/requests.json --jsonArray
```

```
mongoimport --db netcode --collection sources --file /var/www/netcode/back/html/sources.json --jsonArray
```

```
mongoimport --db netcode --collection templates --file /var/www/netcode/back/html/templates.json --jsonArray
```

```
mongoimport --db netcode --collection tokens --file /var/www/netcode/back/html/tokens.json --jsonArray
```

```
mongoimport --db netcode --collection userbanks --file /var/www/netcode/back/html/userbanks.json --jsonArray
```

```
mongoimport --db netcode --collection users --file /var/www/netcode/back/html/users.json --jsonArray
```

```
mongoimport --db netcode --collection wallethistories --file /var/www/netcode/back/html/wallethistories.json --jsonArray
```

```
mongoimport --db netcode --collection wallets --file /var/www/netcode/back/html/wallets.json --jsonArray
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
