# CCBC 卡题手册

这是一个完全静态、可离线部署的 CCBC 现场参考手册。它包含卡点症状入口、机制索引、一页速查、完整历年题库，以及默认折叠的官方提示、答案、题解、扩展内容和交互源码档案。

`public/` 是完整发布物。只要保留这个目录，手册运行时不需要 Python、Node.js、语料项目或外部 API。

## 独立运行

所有命令都从本项目目录执行：

```bash
cd handbook
python3 -m http.server 8765 --directory public
```

然后访问 <http://127.0.0.1:8765/>。不要直接双击 `public/index.html`；浏览器对本地文件的数据加载和媒体访问有限制。

也可以把 `public/` 整体部署到任意静态文件服务器。页面资源使用相对路径，可从站点根路径或子路径运行。

## 防剧透边界

- 默认搜索索引只包含公开题面字段。
- 提示索引和完整题解索引分别存储，只在用户明确切换后加载。
- 官方提示逐条展开；最终答案和完整题解需要再次确认。
- 刷新或新开页面会恢复折叠状态，不在 URL、页面标题和结果摘要中写入答案。
- 静态站只能避免误看，不能把已经部署到客户端的历史资料当作访问控制或保密系统。

## 项目结构

```text
handbook/
  public/                 可直接预览或部署的完整静态站
    data/                 题面、分级剧透索引、附件与关系数据
    content/guide.js      机制分类、卡点症状与一页速查内容
  scripts/build.py        从规范化语料重建 public/data
  tests/test_bundle.py    数据完整性与防剧透分层测试
  tests/smoke.mjs         桌面和手机端浏览回归测试
  requirements.txt        仅重建数据时需要的 Python 依赖
```

## 从语料重新生成数据

首次准备构建环境：

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

仓库中的语料项目位于相邻目录，直接运行：

```bash
python scripts/build.py --corpus-root ../corpus
```

构建器会校验记录、父子关系、题解引用、附件大小与 SHA-256，然后原子替换整个 `public/data/`。默认复制附件，使生成后的手册与语料目录在文件层面互不影响。开发时可显式使用 `--asset-mode hardlink` 节省磁盘，但两个路径会指向同一文件内容。

若语料不在相邻目录，可以指定：

```bash
python scripts/build.py --corpus-root /path/to/corpus
```

高级用法可通过 `--records`、`--assets` 和 `--asset-root` 分别覆盖数据表与附件根目录；`assets.jsonl` 中的 `local_path` 必须位于 `--asset-root` 内。

## 测试

数据与构建回归：

```bash
python -m unittest discover -s tests -p 'test_*.py'
```

浏览回归测试需要 Playwright，并假定手册已经在 `http://127.0.0.1:8765/` 运行。首次准备测试环境：

```bash
npm install
npx playwright install chromium
npm run test:smoke
```

可以用 `HANDBOOK_URL` 指定其他预览地址，用 `CHROME_PATH` 指定本地 Chromium 浏览器。

## 内容边界

- 当前覆盖 CCBC 2–4 与 CCBC 11–16 的可恢复官方公开资料。
- 官方已经删除的题面、媒体或官解会显示缺失状态，不会补写。
- 题面、提示、题解和附件的著作权与署名仍归原作者和 CCBC 主办方；对外发布前需确认授权范围。
