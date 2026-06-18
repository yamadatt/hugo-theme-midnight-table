# Midnight Table — Hugo Theme

深夜の対話番組のような読み物アーカイブ向けの、シンプルな日本語 Hugo テーマです。記事一覧、年/月別アーカイブ、カテゴリー、タグ、About、クライアントサイド検索を備えています。

デモサイトと記事サンプルは [`exampleSite/`](exampleSite) にあります。

## インストール

### 方法1: Hugo Modules（推奨）

サイトの `hugo.toml`（または `config/_default/hugo.toml`）に以下を追加します。

```toml
[module]
  [[module.imports]]
    path = "github.com/yamadatt/hugo-theme-midnight-table"
```

サイトのルートで Hugo Modules を有効化し、依存関係を取得します。

```bash
hugo mod init github.com/yourname/yoursite   # 未初期化の場合
hugo mod get github.com/yamadatt/hugo-theme-midnight-table
hugo server
```

### 方法2: git submodule

```bash
git submodule add https://github.com/yamadatt/hugo-theme-midnight-table.git themes/hugo-theme-midnight-table
```

サイトの `hugo.toml` に以下を追加します。

```toml
theme = "hugo-theme-midnight-table"
```

## デモサイトをローカルで確認する

```bash
cd exampleSite
hugo server -D
```

ローカルサーバーは通常 `http://localhost:1313/` で起動します。ポートが使用中の場合は `--port 1314` などを指定してください。

`exampleSite/go.mod` はテーマ本体を `replace` でリポジトリルートに向けているため、リモートに公開する前でもローカルで動作確認できます。

## ページ構成

| URL | レイアウト | 内容 |
|-----|-----------|------|
| `/` | `layouts/index.html` | トップの記事一覧 |
| `/posts/<slug>/` | `_default/single.html` | 個別記事 |
| `/posts/` | `_default/archives.html` | 記事アーカイブ |
| `/archives/` | `_default/archives.html` | 年・月別の記事アーカイブ |
| `/categories/` | `_default/terms.html` | カテゴリー一覧 |
| `/categories/<category>/` | `_default/taxonomy.html` | カテゴリー別の記事一覧 |
| `/tags/` | `_default/terms.html` | タグ一覧 |
| `/tags/<tag>/` | `_default/taxonomy.html` | タグ別の記事一覧 |
| `/about/` | `_default/about.html` | サイト説明 |
| `/index.json` | `layouts/index.json` | 検索インデックス |

## 機能

- 上部ナビ: `Archive`、`Category`、`Tag`、`About`、検索アイコン
- スマホ表示: ハンバーガーメニューでナビを開閉
- 検索: 検索アイコンまたは `Command + K` / `Ctrl + K` で起動
- 検索候補: `↑` / `↓` で移動、`Enter` で記事へ移動
- アーカイブ: 年/月別に記事を表示
- 個別記事: カテゴリー、タグ、本文下部の前後記事リンクを表示
- Markdown本文: 見出し、引用、コード、表、画像に対応
- 表示調整: 表は横スクロール、画像は記事幅に収まるように表示

## 記事の追加

```bash
hugo new posts/your-slug.md
```

ページバンドルで画像を一緒に管理する場合:

```bash
hugo new posts/2026/your-post/index.md
```

フロントマターの主な項目:

- `title` … 記事タイトル
- `date` … 公開日
- `draft` … 下書きにする場合は `true`
- `summary` … トップや検索結果で使う概要
- `categories` … カテゴリー。個別記事とカテゴリー一覧に反映
- `tags` … タグ。個別記事とタグ一覧に反映
- `featured: true` … トップの記事一覧で「最新」バッジを表示
- `images` / `cover` … 記事に関連する画像メタデータ

## Markdown

本文は通常の Markdown で書けます。基本記法の例は [Markdown Syntax Guide](exampleSite/content/posts/markdown-syntax-guide.md) を参照してください。

よく使う記法:

- `##` / `###` … 見出し
- `>` … 引用
- `` `code` `` … インラインコード
- ```` ``` ```` … コードブロック
- `| ... |` … 表
- `![説明](image.png)` … 画像

## カスタマイズ（テーマ利用サイト側の `hugo.toml`）

- サイト名は `title` で変更できます。
- ページあたりの記事数は `pagination.pagerSize` で変更できます。
- カテゴリー表示は `params.showCategories` で切り替えできます。`false` にするとヘッダーの `Category` と個別記事のカテゴリー行を表示しません。
- ヘッダーの見出し下に表示する一言は `params.eyebrow` で変更できます。
- サイトの説明（`<meta name="description">`）は `params.description` で変更できます。
- 配色、余白、ナビ、検索、記事本文の見た目はテーマの `static/css/style.css` で調整できます（サイト側で同名ファイルを `static/css/style.css` に置くと上書きできます）。
- 検索の挙動はテーマの `static/js/search.js` で調整できます。
- 検索対象の項目はテーマの `layouts/index.json` で変更できます。

設定例は [`exampleSite/hugo.toml`](exampleSite/hugo.toml) を参照してください。

## メモ

- `hasCJKLanguage = true` で日本語の抜粋・文字数カウントが正しく動作します。
- `outputs.home = ["HTML", "RSS", "JSON"]` により `/index.json` を生成しています。
- `hugo server -D` では `draft: true` の記事も一覧、アーカイブ、検索に含まれます。

## ライセンス

[MIT License](LICENSE)

## 公式テーマ一覧 (themes.gohugo.io) への申請に向けて（TODO）

- [ ] `images/screenshot.png`（900x600推奨）、`images/tn.png`（900x600、ショーケース一覧用）の追加
- [ ] GitHub へのリポジトリ公開・タグ付けリリース
- [ ] `hugo mod get` での取得確認（公開後）
