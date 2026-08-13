# CCBC 历届题目与解析语料

本项目从 CCBC 官方公开存档中采集题面、答案、官方解析、提示、中间答案与一方附件，并同时保留原始响应和统一格式，供检索、切分、标注与后续加工使用。

范围包括 CCBC 2–4 的官方历史帖恢复层，以及 CCBC 11、12、13/14、15、16 的现代官方存档。CCBC 2–4 的部分旧楼层和媒体已被平台删除，记录会逐题标出缺口；CCBC 1、5–10 当前没有可恢复的完整官方题目与解析，不用第三方题解冒充官方原文。

## 独立运行

所有命令都从本项目目录执行：

```bash
cd corpus
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/scrape_ccbc.py
```

默认复用 `data/raw/` 和 `data/assets/` 中已有文件。需要重新下载时使用：

```bash
python scripts/scrape_ccbc.py --refresh
```

只重建结构化文本、不下载附件时使用：

```bash
python scripts/scrape_ccbc.py --no-assets
```

运行项目测试：

```bash
python -m unittest discover -s tests
```

抓取器默认把当前项目作为数据根；也可以通过 `--root <path>` 指定另一个输出根。

## 目录

```text
corpus/
  data/
    raw/                            官方 YAML、JSON 与历史接口原始响应
    assets/                         图片、音频、附件和公开交互源码
    processed/
      records.jsonl                 全量、保真、统一结构的主数据集
      puzzle_solution_pairs.jsonl   仅含可用题面与官方解析的加工对
      solution_references.jsonl     子题到父题官方解析的关联表
      assets.jsonl                  附件路径、类型、大小与 SHA-256
      raw_files.jsonl               原始响应大小与 SHA-256
      index.csv                     便于筛选和人工检查的索引
      markdown/<event>/             每题一份可读 Markdown
      external_links.csv            只编目、不镜像的外部依赖
      manifest.json                 范围、数量、失败项与抓取统计
      QUALITY_REPORT.md             可读版质量报告
  scripts/                          抓取器、历史恢复层与 protobuf 绑定
  tests/                            抓取与解析回归测试
```

## `records.jsonl` 主要字段

每行是一条独立记录。`kind` 为 `puzzle`、`meta`、`final_meta` 或 `subpuzzle`；复合题子题通过 `parent_id` 关联主谜题。

| 字段 | 含义 |
| --- | --- |
| `record_id` | 跨次运行稳定的唯一 ID |
| `event_id` / `editions` / `year` / `area` | 赛事与分区元数据 |
| `title` / `authors` / `answer` | 标题、作者、答案 |
| `question_markdown` / `question_text` | 保真题面与纯文本题面 |
| `content_status` / `content_format` | 题面可用性及文本、媒体、交互等形式 |
| `solution_markdown` / `solution_text` | 保真官方解析与纯文本解析 |
| `solution_status` / `solution_format` | 独立官解、父题引用、仅外链或官方缺失等状态 |
| `extended_content_*` | 解题后才显示的补充内容 |
| `hints` / `additional_answers` | 官方提示与中间答案反馈 |
| `interactive` | 内联 HTML、CSS、JavaScript 或 Vue 源码与入口 |
| `assets` / `failed_assets` | 已本地化附件及失败引用 |
| `source_url` / `raw_path` / `fetched_at` | 可追溯来源 |
| `quality` | 题面、答案、解析、提示及配对可用性标记 |

`puzzle_solution_pairs.jsonl` 只收录题面信号与官方解析都可用的记录，不会猜测缺失解析，也不会纳入关键媒体已删、只有答案、只有外链解析或只剩官解而题面已删的记录。

历史恢复记录使用 `incomplete_official`、`answer_only` 和 `available_without_question` 区分不同缺口，并通过 `source_metadata.missing_media`、`missing_inputs` 与 `recovery_notes` 保留机器可读说明。CCBC 16 的千字谜、火药碎片和公开交互后端子题会单独成行，并用 `parent_id` 关联主谜题。

## 给下游项目的数据契约

下游至少需要：

- `data/processed/records.jsonl`
- `data/processed/assets.jsonl`
- `assets.jsonl` 中每条 `local_path` 指向的本地文件

`local_path` 始终相对于本项目根目录，例如 `data/assets/...`。消费者必须把路径限制在语料根内，不能把它当作任意文件路径执行或读取。

## 完整性语义

- `records_complete`、`assets_complete` 与 `corpus_complete` 分开记录；使用 `--no-assets` 不会误报为完整语料。
- `corpus_complete` 表示当前仍可公开取得的来源与附件已抓取完毕。
- `source_content_complete` 反映原届内容是否仍完整。早期赛事已有删除项，因此通常为 `false`；详情见 `manifest.json` 的 `historical_recovery` 和 `QUALITY_REPORT.md`。
- 外部视频站等通常只记录链接；官方存档及官方静态资源域名内文件会尽量镜像。

## 范围与权利

CCBC 2–4 来自主办方官方贴吧帖的公开接口；删除楼层或旧图不会被伪造补齐。CCBC 13 与 14 是同一场连续活动，共用的小行星数据库和最终题保留双届标签。

内容著作权与署名仍归原作者和 CCBC 主办方。本项目没有为原内容声明新的许可证；使用或发布加工数据前请确认授权范围并保留来源信息。
