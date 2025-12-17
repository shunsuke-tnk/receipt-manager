# セキュリティガイド

## 環境変数の管理

### 必須の環境変数

#### バックエンド (Render.com等)
```
FLASK_ENV=production
FLASK_SECRET_KEY=<ランダムな長い文字列>
GOOGLE_CLIENT_ID=<Google Cloud Consoleから取得>
GOOGLE_CLIENT_SECRET=<Google Cloud Consoleから取得>
GOOGLE_REDIRECT_URI=https://your-api-domain.onrender.com/oauth2callback
GOOGLE_DRIVE_FOLDER_ID=<保存先フォルダのID>
PORT=5000
```

#### フロントエンド (Vercel/Netlify等)
```
VITE_API_URL=https://your-api-domain.onrender.com
```

## 重要な注意事項

### ❌ 絶対にコミットしてはいけないファイル
- `.env`
- `.env.local`
- `token.json`
- `credentials.json`

これらは `.gitignore` に含まれていますが、念のため確認してください。

### Google Cloud Console設定

1. **OAuth 2.0 認証情報**
   - アプリケーションの種類: Webアプリケーション
   - 承認済みのリダイレクトURI:
     - 開発: `http://localhost:5000/oauth2callback`
     - 本番: `https://your-api-domain.onrender.com/oauth2callback`

2. **Google Drive API**
   - APIを有効化する
   - スコープ: `https://www.googleapis.com/auth/drive.file`

### CORS設定

本番環境では、`app.py` のCORS設定を特定のドメインのみに制限することを推奨:

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://your-frontend-domain.vercel.app"],
        "supports_credentials": True
    }
})
```

### HTTPS必須

- カメラAPIはHTTPSまたはlocalhostでのみ動作します
- 本番環境では必ずHTTPSを使用してください
- Render.com、Vercel、Netlifyは自動的にHTTPSを提供します

### レート制限

本番環境では、APIにレート制限を追加することを推奨:

```bash
pip install flask-limiter
```

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)
```

### ファイルサイズ制限

大きなファイルのアップロードを防ぐため、`app.py` に追加:

```python
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
```

## トラブルシューティング

### 認証エラー
- `credentials.json` が正しくサーバーに配置されているか確認
- リダイレクトURIが正確に一致しているか確認

### CORS エラー
- フロントエンドのドメインがCORS設定に含まれているか確認
- `supports_credentials=True` が設定されているか確認

### 環境変数が反映されない
- デプロイ後にサービスを再起動
- 環境変数名のスペルミスを確認
