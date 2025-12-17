# レシート・領収書管理アプリ

スマホで撮影したレシートや領収書を自動でトリミング・補正し、Googleドライブに保存するWebアプリケーション。

## 機能

### MVP機能
- ✅ カメラ撮影またはファイルアップロード
- ✅ AI自動輪郭検出（レシートの四隅を自動認識）
- ✅ 手動調整UI（輪郭ポイントをドラッグして微調整）
- ✅ 画像補正
  - 明るさ調整
  - コントラスト調整
  - ノイズ除去
- ✅ 台形補正（透視変換でフラット化）
- ✅ Googleドライブへの自動アップロード
- ✅ PWA対応（スマホのホーム画面に追加可能）

### 今後の拡張予定
- レシート情報の自動読み取り（OCR）
- データの表形式への転記
- 支出管理機能

## 技術スタック

### バックエンド
- **Python 3.9+**
- **Flask** - Web APIフレームワーク
- **OpenCV** - 画像処理・輪郭検出
- **Google Drive API** - ファイルアップロード

### フロントエンド
- **React 19** + **TypeScript**
- **Vite** - ビルドツール
- **TailwindCSS** - スタイリング

## セットアップ手順

### 1. 前提条件
- Python 3.9以上
- Node.js 18以上
- Googleアカウント

### 2. リポジトリをクローン

```bash
cd "/Users/tanakashunsuke/レシート処理アプリ"
```

### 3. バックエンドのセットアップ

#### 3.1 Python仮想環境を作成

```bash
python3 -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate
```

#### 3.2 依存パッケージをインストール

```bash
pip install -r requirements.txt
```

#### 3.3 Google Drive API認証設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Google Drive APIを有効化
4. OAuth 2.0 クライアントIDを作成（アプリケーションの種類: Webアプリケーション）
5. 承認済みのリダイレクトURIに追加: `http://localhost:5000/oauth2callback`
6. 認証情報JSONをダウンロードし、`credentials.json`として保存

#### 3.4 環境変数を設定

```bash
cp .env.example .env
```

`.env`ファイルを編集:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/oauth2callback
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here
FLASK_SECRET_KEY=your_random_secret_key
FLASK_ENV=development
```

**Googleドライブフォルダ IDの取得方法:**
1. Googleドライブでアップロード先フォルダを作成
2. フォルダを開いたときのURL `https://drive.google.com/drive/folders/FOLDER_ID` の`FOLDER_ID`部分をコピー

### 4. フロントエンドのセットアップ

```bash
npm install
```

### 5. アプリケーションの起動

#### ターミナル1: バックエンド起動

```bash
source venv/bin/activate
python app.py
```

Flask APIが http://localhost:5000 で起動します。

#### ターミナル2: フロントエンド起動

```bash
npm run dev
```

Vite開発サーバーが http://localhost:5173 で起動します。

### 6. アプリケーションにアクセス

ブラウザで http://localhost:5173 を開きます。

### 7. Google Drive認証

1. 初回アクセス時に「Drive連携」ボタンをクリック
2. Googleアカウントでログイン
3. アクセス権限を許可
4. 自動的にアプリに戻ります

## 使い方

### レシート撮影から保存までの流れ

1. **撮影**
   - 「カメラを起動」または「ファイルから選択」
   - レシート全体が映るように撮影

2. **輪郭調整**
   - 自動検出された緑色の輪郭ポイントを確認
   - 必要に応じてドラッグして調整
   - 「次へ」で進む

3. **画像補正**
   - 明るさ・コントラスト・ノイズ除去を調整
   - プレビューで確認しながら設定
   - 「処理を実行」で実行

4. **確認とアップロード**
   - 処理済み画像を確認
   - ファイル名を編集（デフォルトは日時付き）
   - 「Googleドライブに保存」でアップロード

5. **完了**
   - アップロード完了！
   - 「新しいレシートを撮影」で次の撮影へ

## スマホでの使用方法

### PWAとしてインストール（推奨）

#### iOS (Safari)
1. Safariでアプリを開く
2. 共有ボタン（↑）をタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

#### Android (Chrome)
1. Chromeでアプリを開く
2. メニュー（⋮）をタップ
3. 「ホーム画面に追加」または「アプリをインストール」を選択
4. 「追加」をタップ

ホーム画面からネイティブアプリのように起動できます！

## トラブルシューティング

### カメラが起動しない
- ブラウザのカメラ権限を確認
- HTTPSまたはlocalhostでアクセスしているか確認
- 代わりに「ファイルから選択」を使用

### 輪郭検出がうまくいかない
- レシートを明るい場所で撮影
- レシートをできるだけ平らに置く
- 手動調整で緑のポイントを正しい位置にドラッグ

### アップロードが失敗する
- Google Drive認証が完了しているか確認
- `.env`の`GOOGLE_DRIVE_FOLDER_ID`が正しいか確認
- ネットワーク接続を確認

### TypeScriptエラーが表示される
- まず依存パッケージをインストール: `npm install`
- エラーは開発時のみで、実行には影響しません

## プロジェクト構造

```
レシート処理アプリ/
├── app.py                  # Flaskバックエンド
├── services/
│   ├── image_processor.py  # OpenCV画像処理
│   └── google_drive_service.py  # Google Drive API
├── src/
│   ├── App.tsx            # メインアプリ
│   ├── components/        # Reactコンポーネント
│   │   ├── CameraCapture.tsx
│   │   ├── ImagePreview.tsx
│   │   ├── ImageAdjust.tsx
│   │   └── UploadConfirm.tsx
│   └── services/
│       └── api.ts         # API呼び出し
├── public/
│   ├── manifest.json      # PWA設定
│   └── sw.js              # Service Worker
└── requirements.txt       # Python依存関係
```

## 本番環境へのデプロイ

誰でもどこでも使えるWebアプリとして公開できます！

### 📚 詳細なデプロイ手順

**[DEPLOYMENT.md](DEPLOYMENT.md)** に完全な手順を記載しています。

### クイックスタート

1. **Google Cloud Console設定** - OAuth認証とDrive API設定
2. **GitHubにプッシュ** - リポジトリ作成
3. **Render.comでバックエンドデプロイ** - 無料プランあり
4. **Vercelでフロントエンドデプロイ** - 無料プランあり

### デプロイ後のURL例

- フロントエンド: `https://receipt-manager.vercel.app`
- バックエンド: `https://receipt-manager-api.onrender.com`

### 推奨プラットフォーム

#### バックエンド (Flask)
- ✅ **Render.com** (推奨・無料プランあり)
- Railway
- Heroku

#### フロントエンド (React)
- ✅ **Vercel** (推奨・無料プランあり)
- Netlify
- Cloudflare Pages

### 必要な設定

詳細は [DEPLOYMENT.md](DEPLOYMENT.md) と [SECURITY.md](SECURITY.md) を参照

## ライセンス

MIT

## 作成者

Tanaka Shunsuke
