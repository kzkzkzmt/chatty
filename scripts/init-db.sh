#!/bin/bash

echo "🚀 データベース初期化を開始します..."

# Apply database migrations
echo "📊 データベースマイグレーションを適用中..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ マイグレーション完了"
else
    echo "❌ マイグレーション失敗"
    exit 1
fi

# Run setup script to create test users
echo "👤 テストユーザーを作成中..."
node setup.js

if [ $? -eq 0 ]; then
    echo "✅ セットアップ完了！"
    echo "📧 テストアカウント: admin@construction.com / admin123"
else
    echo "❌ セットアップ失敗"
    exit 1
fi