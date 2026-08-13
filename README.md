# CCBC 历届题目与解析语料

本项目从 CCBC 官方公开存档中采集题面、答案、官方解析、提示、中间答案与一方附件，并同时保留原始响应和统一格式，供后续检索、切分、标注与蒸馏。

范围包括 CCBC 2–4 的官方历史帖恢复层，以及 CCBC 11、12、13/14、15、16 的现代官方存档。CCBC 2–4 的部分旧楼层和媒体已被平台删除，记录会逐题标出缺口；CCBC 1、5–10 当前没有可恢复的完整官方题目与解析，不用第三方题解冒充官方原文。

## 目录

```text
data/
  raw/                              官方 YAML / JSON 原始响应
  assets/                           官方域名内的图片、音频、附件和交互源码
  processed/
    records.jsonl                   全量、保真、统一结构（主数据集）
    puzzle_solution_pairs.jsonl     仅含官方解析的题面-题解对
    solution_references.jsonl       子题到父题官方解析的关联表
    assets.jsonl                    附件 URL、路径、类型、大小与 SHA-256
    raw_files.jsonl                 所有原始响应的大小与 SHA-256
    index.csv                       便于筛选和人工检查的索引
    markdown/<event>/               每题一份可直接阅读的 Markdown
    external_links.csv              外部依赖清单（只编目，不镜像）
    manifest.json                   数量、范围、失败项、抓取统计
    QUALITY_REPORT.md               可读版质量报告
```

## 重跑

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/scrape_ccbc.py
```

默认复用 `data/raw` 和 `data/assets` 中已有文件。需要重新拉取时使用：

```bash
python scripts/scrape_ccbc.py --refresh
```

只想快速重建结构化文本、不下载附件时使用 `--no-assets`。

## `records.jsonl` 主要字段

每行是一条独立记录。`kind` 为 `puzzle`、`meta`、`final_meta` 或 `subpuzzle`；复合题子题通过 `parent_id` 关联主谜题。

| 字段 | 含义 |
| --- | --- |
| `record_id` | 跨次运行稳定的唯一 ID |
| `event_id` / `editions` / `year` / `area` | 赛事与分区元数据 |
| `title` / `authors` / `answer` | 标题、作者、答案 |
| `question_markdown` / `question_text` | 保真题面与纯文本题面 |
| `content_status` / `content_format` | 题面是否存在，以及文本、媒体、交互、标题题等形式 |
| `solution_markdown` / `solution_text` | 保真官方解析与纯文本解析 |
| `solution_status` / `solution_format` | 独立官解、父题官解引用、仅外链、官方缺失，以及纯媒体解析等形式 |
| `extended_content_*` | 解题后才显示的补充内容 |
| `hints` / `additional_answers` | 官方提示与中间答案反馈 |
| `interactive` | 内联 HTML、CSS、JavaScript 或 Vue 源码/入口 |
| `assets` / `failed_assets` | 成功本地化的附件及其题面/解析角色，以及失败引用的 URL 与错误信息 |
| `source_url` / `raw_path` / `fetched_at` | 可追溯来源 |
| `quality` | 题面、答案、解析、提示及 `pair_eligible` 的存在性/可用性标记 |

`puzzle_solution_pairs.jsonl` 是更轻的加工入口，只包含 `content_status=available`、`solution_status=available` 且题面信号可用的记录；不会自动生成或猜测缺失解析，也不会纳入关键媒体已删、只有答案、只有外链解析，或只剩官解而题面已删的记录。

历史恢复记录额外使用 `incomplete_official`、`answer_only` 和 `available_without_question`，分别表示题面尚存但关键媒体/输入已删、只剩官方答案、以及官解尚存但题面楼已删。这些记录留在 `records.jsonl`，并通过 `source_metadata.missing_media`、`missing_inputs` 和 `recovery_notes` 提供机器可读缺口与出处。

CCBC 16 的千字谜、火药碎片和公开交互后端中的子题会作为 `subpuzzle` 单独成行，并用 `parent_id` 关联主谜题。原始交互源码始终完整保留；能可靠拆出的题面、答案和逐题解析则另外落到子题记录中。

## 范围与权利

- CCBC 2–4 来自主办方官方贴吧帖的公开接口；所有仍可见的分页原始响应会保留，删除楼层或旧图不会被伪造补齐。
- CCBC 13 与 14 是同一场连续活动，公共的“小行星数据库”和最终题保留双届标签。
- CCBC 16 的“千字谜”按存档前端公开展示的条件收录子题，并保留父子关系。
- 外部视频站等通常只记录链接；CCBC 15 的公开腾讯官解另保存入口页及可取得的数据快照。CCBC 16 千字谜中一条以外站图片作为完整官解的记录也会镜像该核心图片。官方存档与官方静态资源域名内的文件会镜像到本地。
- `manifest.json` 中 `records_complete`、`assets_complete` 与 `corpus_complete` 分开记录；使用 `--no-assets` 时不会误报为完整语料。
- `corpus_complete` 表示当前仍可公开取得的来源与附件已经抓取完毕；`source_content_complete` 则反映原届内容是否仍完整。早期赛事已有删除项，因此后者为 `false`，细节见 `historical_recovery` 与 `QUALITY_REPORT.md`。
- 内容著作权与署名仍归原作者和 CCBC 主办方；本项目没有为原内容声明新的许可证。使用或发布加工数据前请自行确认授权范围并保留来源信息。
