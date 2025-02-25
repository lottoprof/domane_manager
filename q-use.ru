server {
    listen 443 ssl http2;
    server_name q-use.ru www.q-use.ru;

    root /var/www/domains;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/q-use.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/q-use.ru/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/q-use.ru/chain.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    gzip on;
    gzip_types application/json application/javascript text/plain text/css;
    gzip_min_length 256;
    gzip_comp_level 5;
    gzip_proxied any;
    gzip_vary on;

    location / {
        try_files $uri $uri/ /index.html;
    }

location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # CORS Headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";

    if ($request_method = OPTIONS) {
        return 204;
    }
}


    location /static/ {
        root /var/www/domains;
    }

    location /js/ {
        root /var/www/domains;
    }

    location /css/ {
        root /var/www/domains;
    }

    location /img/ {
        root /var/www/domains;
    }
}

server {
    listen 80;
    server_name q-use.ru www.q-use.ru;
    return 301 https://$server_name$request_uri;
}

