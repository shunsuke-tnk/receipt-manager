#!/bin/bash

# レシート管理アプリ起動スクリプト

echo "📄 レシート管理アプリを起動します..."
echo ""

# カレントディレクトリを確認
if [ ! -f "app.py" ]; then
    echo "❌ エラー: app.pyが見つかりません"
    echo "プロジェクトルートで実行してください"
    exit 1
fi

# Python仮想環境をチェック
if [ ! -d "venv" ]; then
    echo "⚠️  仮想環境が見つかりません。作成します..."
    python3 -m venv venv
fi

# 仮想環境を有効化
source venv/bin/activate

# 依存関係をインストール
echo "📦 Python依存関係を確認中..."
pip install -q -r requirements.txt

# バックエンドを起動
echo ""
echo "🚀 バックエンドAPIを起動します (http://localhost:5001)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "ℹ️  ポート5000はmacOSのAirPlayレシーバーが使用しているため、5001を使用します"
echo ""
echo "✅ フロントエンドを起動するには、別のターミナルで以下を実行:"
echo "   cd \"$(pwd)\""
echo "   npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python app.py
