# 監視員サイト

## 開発
ある`html`ファイルは[11ty.js](https://www.11ty.dev/)と言うStatic site generatorを利用し、`ejs`のテンプレートから作成ものだ。Static site generatorに関するものを編集する場合は[Node.js](https://nodejs.org/ja/)が必要。

Node.jsあれば、cloneした後command lineで`npm install`一回してから`npm start`すると、ローカルーサーバーが始まって、編集したファイルはライブリロードされる。