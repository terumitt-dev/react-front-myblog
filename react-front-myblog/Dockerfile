# ベースイメージ（Node.js 20系）
FROM node:20

# 作業ディレクトリ作成
WORKDIR /app

# package.json と package-lock.json のみ先にコピー（キャッシュが効くように）
COPY package*.json ./

# 依存関係インストール
RUN npm install

# 残りのソースコードをコピー
COPY . .

# 開発サーバがリッスンするポート
EXPOSE 3000

# ファイル変更検知の問題を回避（特に Docker Desktop / Mac）
ENV CHOKIDAR_USEPOLLING=true

# アプリ起動（開発サーバ）
CMD ["npm", "start"]
