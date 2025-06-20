# 建設チャットアプリ デプロイメントガイド

## 🚀 本番環境へのデプロイ手順

### 前提条件
- Node.js 18.0.0以上
- PostgreSQL 13以上
- Git

### 1. サーバー環境の準備

#### Ubuntu/Debian系の場合
```bash
# Node.js のインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL のインストール
sudo apt-get install postgresql postgresql-contrib

# PM2 のインストール（プロセス管理用）
sudo npm install -g pm2
```

### 2. データベースの設定

```bash
# PostgreSQL に接続
sudo -u postgres psql

# データベースとユーザーの作成
CREATE DATABASE construction_chat;
CREATE USER chat_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE construction_chat TO chat_user;
\q
```

### 3. アプリケーションのデプロイ

```bash
# リポジトリのクローン
git clone <your-repository-url> construction-chat-app
cd construction-chat-app

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
nano .env
```

### 4. 環境変数の設定

`.env` ファイルを編集：

```env
# 本番用データベース設定
DATABASE_URL="postgresql://chat_user:your_secure_password@localhost:5432/construction_chat?schema=public"

# 強力なJWT秘密鍵を生成して設定
JWT_SECRET="your-super-secure-jwt-secret-at-least-32-characters-long"

# Next.js設定
NEXTAUTH_SECRET="your-super-secure-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# 本番環境設定
NODE_ENV="production"
PORT=3000
```

### 5. データベースマイグレーション

```bash
# Prisma セットアップ
npx prisma generate
npx prisma migrate deploy

# 初期データの作成（オプション）
npm run setup
```

### 6. アプリケーションのビルドと起動

```bash
# プロダクションビルド
npm run build

# PM2でアプリケーションを起動
pm2 start ecosystem.config.js

# PM2の自動起動設定
pm2 startup
pm2 save
```

### 7. Nginx リバースプロキシの設定

`/etc/nginx/sites-available/construction-chat` ファイルを作成：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket サポート
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # ファイルアップロードサイズ制限
    client_max_body_size 10M;
}
```

設定を有効化：
```bash
sudo ln -s /etc/nginx/sites-available/construction-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL証明書の設定（Let's Encrypt）

```bash
# Certbot のインストール
sudo apt-get install certbot python3-certbot-nginx

# SSL証明書の取得
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自動更新の設定
sudo crontab -e
# 以下の行を追加：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 PM2 設定ファイル

`ecosystem.config.js` を作成：

```javascript
module.exports = {
  apps: [{
    name: 'construction-chat',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

## 📊 監視とログ

### ログの確認
```bash
# PM2 ログの表示
pm2 logs construction-chat

# リアルタイムログ監視
pm2 logs construction-chat --lines 200
```

### システム監視
```bash
# PM2 ダッシュボード
pm2 monit

# システム状況確認
pm2 status
```

## 🔄 アップデート手順

```bash
# アプリケーションの停止
pm2 stop construction-chat

# 最新コードの取得
git pull origin main

# 依存関係の更新
npm install

# データベースマイグレーション（必要な場合）
npx prisma migrate deploy

# ビルド
npm run build

# アプリケーションの再起動
pm2 reload construction-chat
```

## 🔒 セキュリティ強化

### ファイアウォール設定
```bash
# ufw の有効化
sudo ufw enable

# 必要なポートのみ開放
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### 定期バックアップ設定
```bash
# データベースバックアップスクリプト
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U chat_user construction_chat > /backups/db_backup_$DATE.sql

# crontab に追加（毎日3時にバックアップ）
0 3 * * * /path/to/backup_script.sh
```

## 🚨 トラブルシューティング

### よくある問題

1. **WebSocket接続エラー**
   - Nginxの設定でWebSocketサポートが有効か確認
   - ファイアウォールでWebSocket用ポートが開放されているか確認

2. **ファイルアップロードエラー**
   - uploadsディレクトリの権限確認
   - Nginxの`client_max_body_size`設定確認

3. **データベース接続エラー**
   - PostgreSQLサービスの状態確認
   - DATABASE_URLの設定確認

### ログの確認コマンド
```bash
# アプリケーションログ
pm2 logs construction-chat

# Nginxログ
sudo tail -f /var/log/nginx/error.log

# PostgreSQLログ
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

## 📈 パフォーマンス最適化

### データベース最適化
```sql
-- インデックスの追加
CREATE INDEX idx_messages_room_created ON messages(room_id, created_at);
CREATE INDEX idx_file_versions_file_created ON file_versions(file_id, created_at);
```

### キャッシュ設定
- Redis を使用したセッション管理の導入
- ファイルアップロード用の CDN 設定

このガイドに従って、本番環境での安定稼働を実現できます。