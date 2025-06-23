# Render無料プランでのセットアップガイド

## 問題
- Render無料プランではShellが使えない
- データベースの初期化ができない
- ログインエラーが発生する

## 解決方法

### 方法1: セットアップページを使用（推奨）

1. デプロイが完了するまで待つ（データベーススキーマが自動適用される）

2. ブラウザで以下のURLにアクセス：
   ```
   https://あなたのアプリURL/setup
   ```

3. セットアップキーを入力：
   - デフォルト: `setup-construction-chat-2024`
   - または、Renderの環境変数 `SETUP_KEY` に設定された値

4. 「セットアップ実行」をクリック

5. 成功したら、表示されたテストアカウントでログイン：
   - メール: `admin@construction.com`
   - パスワード: `admin123`

### 方法2: APIを直接呼び出す

ブラウザまたはcurlで以下のURLにアクセス：
```
https://あなたのアプリURL/api/setup?key=setup-construction-chat-2024
```

成功すると以下のようなJSONが返されます：
```json
{
  "success": true,
  "message": "セットアップ完了",
  "createdUsers": 3,
  "testAccount": {
    "email": "admin@construction.com",
    "password": "admin123"
  }
}
```

## トラブルシューティング

### エラー: "Database tables not found"
データベーステーブルがまだ作成されていません。数分待ってから再試行してください。

### エラー: "Invalid setup key"
正しいセットアップキーを入力してください。Renderの環境変数を確認するか、デフォルトキーを使用してください。

### エラー: "Setup failed"
データベース接続に問題がある可能性があります。Renderのログを確認してください。

## セキュリティ注意事項

- セットアップ完了後は、セキュリティのため `/setup` ページへのアクセスを制限することを推奨します
- 本番環境では、環境変数 `SETUP_KEY` に強力なランダム文字列を設定してください

## 確認方法

1. ヘルスチェック：
   ```
   https://あなたのアプリURL/api/health
   ```

2. ログインページ：
   ```
   https://あなたのアプリURL/login
   ```