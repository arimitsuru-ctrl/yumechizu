#!/bin/bash
# 🗺️ 夢の地図 - 開発サーバー起動スクリプト

set -e

echo "🗺️  夢の地図 - 開発サーバーを起動しています..."
echo ""

# カレントディレクトリを確認
if [ ! -f "wrangler.toml" ]; then
  echo "❌ エラー: wrangler.toml が見つかりません"
  echo "   このスクリプトはプロジェクトルートで実行してください"
  echo "   cd /home/arisawa/yumechizu/yumechizu-pages"
  exit 1
fi

echo "✅ プロジェクトディレクトリが確認できました"
echo ""

# Node.js のバージョン確認
NODE_VERSION=$(node --version)
echo "📦 Node.js: $NODE_VERSION"

# Wrangler のバージョン確認
WRANGLER_VERSION=$(wrangler --version)
echo "⚙️  Wrangler: $WRANGLER_VERSION"
echo ""

# サーバー起動
echo "🚀 ローカル開発サーバーを起動しています..."
echo "   URL: http://localhost:8788"
echo ""
echo "🛑 終了するには Ctrl+C を押してください"
echo ""

# Wrangler pages dev を実行
wrangler pages dev --local

