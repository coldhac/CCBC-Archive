# Puzzle Hunt Dataset 规范（v2.0.0）

本规范定义一套可同时容纳多个 puzzle hunt 的规范化内容语料格式。它是当前
CCBC `records.jsonl` v1 的下一代目标契约；现有抓取结果和 handbook 继续使用 v1，
直到完成双写和消费者迁移。

规范文件位于 `schema/hunt-dataset-v2/`，可运行示例位于
`examples/hunt-dataset-v2/`。

## 1. 范围

v2 的核心 profile 是 `content-archive`，覆盖：

- hunt、分区/轮次/阶段等分组；
- 题目、Meta、子题和其他可解内容；
- 题面、答案、提交反馈、提示、官方解析和解后内容；
- 题目间的归属、组成、Meta 输入、解锁、题解引用等关系；
- 附件、交互源码、原始来源快照、完整性和权利信息。

以下内容不属于 v2 核心：队伍、用户、实时提交、排行榜、动态解锁状态、工单和
现场运营记录。它们可由独立 profile 或命名空间扩展提供。公告、规则、榜单等非题目
页面可以作为 `sources` 保留，但不能伪装成 puzzle。

本规范描述的是可审计的归档快照，不是可直接运行的比赛后端。尤其不得默认执行数据
包中的 HTML、JavaScript、Vue、可执行文件或服务端代码。

## 2. 规范用语

文中的“必须”“不得”“应该”“可以”分别对应 MUST、MUST NOT、SHOULD、MAY。

## 3. 标准目录

一个数据包必须是自包含目录：

```text
dataset/
  manifest.json
  hunts.jsonl
  groups.jsonl
  puzzles.jsonl
  relations.jsonl
  assets.jsonl
  sources.jsonl
  files/
    <hunt-id>/...
```

六个 JSONL 文件都必须存在；没有记录时使用零字节文件。`files/` 只保存本地附件、
交互源码和其他归档文件。原始响应也可以放在其中，但必须由 `sources.snapshot.path`
引用。

`puzzle_solution_pairs.jsonl`、搜索索引、Markdown、网页 bundle 和质量报告都是可重建
的派生产物，不属于规范真源。

安装 `corpus/requirements.txt` 后，可以直接校验规范示例或任意 v2 数据包：

```bash
python scripts/validate_hunt_dataset.py examples/hunt-dataset-v2
```

validator 只从本仓库加载 JSON Schema，不访问网络，也不运行归档源码。

## 4. 编码与序列化

- JSON 和 JSONL 必须使用 UTF-8（无 BOM）与 LF 换行。
- JSONL 每个非空行必须恰好是一个 JSON object；不得使用注释、尾逗号或 `NaN`。
- 生产者应该按实体 ID 稳定排序，object key 顺序不承载语义。
- 时间必须使用 RFC 3339，并带 `Z` 或明确的 UTC offset。仅知道年份时使用 `year`；
  不知道 offset 时省略相应 date-time 字段，不得伪造日期或时区。
- 为保证各语言消费者行为一致，本 profile 不接受 `:60` leap-second 表示；需要保留该
  事实时将规范时间归一化，并在 source raw 或 notes 中保留原始值。
- 语言使用 BCP 47 tag，例如 `zh-Hans`、`en`；未知语言使用 `und`。
- 本地路径必须是 POSIX 相对路径，不得包含空段、`.`、`..`、反斜杠或绝对路径；
  解析符号链接后仍必须位于数据包根目录内。
- 网络 URL 只允许 `https` 或 `http`。消费者不得把 URL、路径或源码当作可信输入执行。

## 5. 版本

`schema_version` 表示数据结构版本，当前固定为 `2.0.0`。`manifest.json` 和每一条
JSONL 记录都必须带该字段，因此单行记录脱离 manifest 后仍可判定版本。

`dataset_version` 表示内容快照版本，可使用 SemVer、日期或发布方稳定版本号。它与
schema 版本无关。`generated_at` 只表示数据包生成时间；网络抓取时间必须写入
`sources.snapshot.retrieved_at`，缓存命中不得改写原抓取时间。

- schema major：破坏兼容的字段或语义变更；
- schema minor：新增可选能力；
- schema patch：不改变数据语义的说明或约束修正；
- 尚未稳定的赛事特有字段必须先放进 `extensions`，不得污染核心字段。

消费者遇到不支持的 major 必须拒绝读取，不能静默猜测。

## 6. ID

ID 只允许小写 ASCII 字母、数字、点、下划线、连字符和冒号。推荐形式：

```text
hunt_id      example-hunt.2026
group_id     example-hunt.2026:group:round-1
puzzle_id    example-hunt.2026:puzzle:welcome
relation_id  example-hunt.2026:relation:welcome-in-round-1
asset_id     example-hunt.2026:asset:welcome-grid
source_id    example-hunt.2026:source:welcome-page
```

- ID 必须在对应实体表内唯一；group 与 puzzle ID 还必须彼此唯一，因为关系图会同时
  引用它们。
- group、puzzle、relation ID 必须以所属 `hunt_id` 加冒号开头。只服务于一个 hunt 的
  asset/source 也应该使用该前缀；真正跨 hunt 共享的资源可以使用
  `asset:sha256:<digest>` 或 `source:<namespace>:<opaque-id>` 这样的数据集级 ID。
- ID 一经发布不得因改标题、移动分区、URL 重定向或重新抓取而改变，也不得复用。
- puzzle 内的 `content_id/answer_id/response_id/hint_id` 必须以该 `puzzle_id` 加冒号开头，
  并在该 puzzle 内彼此唯一。
- 应优先使用发布方稳定 opaque ID；没有稳定 ID 时可以用 UUIDv5 或稳定哈希。不得直接
  对非 ASCII 标题删字符后充当 ID。
- 发布方原始 ID 放入 `external_ids`，不要塞入 `extensions`。

## 7. Manifest

`manifest.json` 是数据包入口，必须声明：

- `schema_version`、`dataset_id`、`dataset_version`、`profile`；
- 数据集标题、生成时间、默认语言；
- 六张实体表的相对路径、记录数以及可选的字节数和 SHA-256；
- 按 hunt 和 facet 记录的 `coverage`；
- 固定的四级防剧透策略；
- 参与生成的 adapter/聚合器名称、版本和可选 commit；
- 数据集级权利说明、扩展 schema 注册表和可选扩展。

`coverage` 不使用一个含糊的 `complete` 布尔值。每项必须明确：

| 字段 | 说明 |
| --- | --- |
| `hunt_id` | 所属 hunt |
| `facet` | `puzzles/statements/answers/solutions/hints/assets/sources` |
| `status` | `complete/partial/unknown/not_applicable` |
| `expected` / `observed` / `missing` | 已知时填写的数量 |
| `notes` | 已删除内容、公开范围或已知排除项 |

每个 hunt 必须对七个 facet 各有且只有一条 coverage。`complete/partial` 必须给出三个
数量；`complete` 要求 `missing=0`，`partial` 要求 `missing>0`，`not_applicable` 的数量
只能省略或为 0。三个数量同时存在时必须满足 `expected = observed + missing`。

`observed` 使用固定口径：puzzles 计 puzzle 行；statements/solutions 计
`available/partial` content block；answers 计 `counts_as_solve=true` 的 answer；hints 计内容
可用或部分可用的 hint；assets 计本 hunt 的 available asset；sources 计本 hunt 的 source
行。被 hunt 引用的数据集级 asset/source 在该 hunt 计一次，因此一个共享资源可以分别
计入多个 hunt。validator 必须把 declared observed 与实体表按此口径重算的结果比较。

“抓取流程无错误”和“原始内容仍完整”是两个不同命题，必须通过具体 facet 分开表达。

## 8. 实体

### 8.1 hunts

`hunts.jsonl` 每行描述一场可独立识别的活动。系列名和届次放在 `series` 中；类似
CCBC 13/14 的连续活动可以在同一 hunt 下保留多个 `edition_labels`。

核心字段：

| 字段 | 约束 |
| --- | --- |
| `hunt_id` | 稳定 ID |
| `title` | 主显示名称 |
| `localized_titles` | 可选的其他语言标题 |
| `series` | 可选；系列名与一到多个届次标签 |
| `year` / `start_at` / `end_at` | 至少有 `year` 或 `start_at` |
| `timezone` | 可选 IANA timezone |
| `languages` | 至少一种 BCP 47 语言 |
| `credits` | 主办方、编辑等署名；允许 person/team/organization |
| `urls` | homepage、archive、results 等有类型 URL |
| `rights` | 本 hunt 的默认权利策略 |
| `source_ids` | 支撑这些元数据的来源 |

### 8.2 groups

`groups.jsonl` 表示 round、act、stage、track、location、phase、category 等分组。统一叫
group 是为了避免把所有 hunt 的结构强行解释成 round。

每条 group 包含 `group_id`、`hunt_id`、`kind`、`title`、`sort_key`、来源和可选扩展。
嵌套与多重归属由 `member_of` 关系表达，不另设容易冲突的 `parent_id`。

`sort_key` 是稳定字符串，推荐零填充（如 `010.020`）。展示排序按 `sort_key`，再按 ID
打破平局；不得依赖 JSONL 行号或对 ID 做自然语言猜测。

### 8.3 puzzles

`puzzles.jsonl` 是核心内容表。`kind` 支持 `puzzle`、`meta`、`final_meta`、
`subpuzzle`、`runaround`、`bonus` 和 `other`。

一条 puzzle 必须包含：

- 身份：`puzzle_id`、`hunt_id`、`kind`、`sort_key`；
- 展示：`title`、可选本地化标题、`credits`；
- 题面：一个或多个 `statements` content block；
- 答案：`answer_status` 与 `answers`；
- 提交反馈：零个或多个 `answer_responses`；
- 提示：零个或多个带稳定 `hint_id` 和顺序的 `hints`；
- 题解：一个或多个 `solutions` content block；
- 解后内容：零个或多个 `postsolve` content block；
- 溯源：`source_ids`；
- 可选 `interactive`、权利覆盖、外部 ID 和命名空间扩展。

`answer_status=available` 时必须至少有一个 `kind=final` 且
`counts_as_solve=true` 的 answer。`partial` 表示只恢复到一个或多个非最终答案，这些
answer 必须 `counts_as_solve=false`；`missing/not_applicable/unknown` 不得夹带答案。
answer 可以声明
`final/alternate/intermediate/milestone/command` 类型、显示值、语言、是否计作完成、
回复和 checker。checker 只描述 `exact/normalized/regex/source/external` 机制；代码型
checker 只能通过 asset/source ref 作为不可信源码归档，不能成为要求消费者执行的核心
字段。无答案题使用 `answer_status=not_applicable`，不得用空串或“无”冒充答案。

`answer_responses` 只表达“不被定义为答案”的 checker 分支，例如 near-miss、特殊错误或
提示性输入。中间答案、里程碑和控制命令应进入 `answers`，并使用
`counts_as_solve=false`。两者都不是参赛队提交日志。

hint 除稳定 ID、顺序、标题和 content block 外，可以记录 `cost`、`currency`、
`unlock_delay_seconds`、`published_at` 和 condition。未知值必须省略，不能从现行站点状态
倒推出比赛时规则。

`interactive` 可以描述 physical/client/server/external/source-only 模式、
`bundle_asset_id`、`entrypoint_asset_id`、runtime、backend snapshot/protocol、是否可运行、完整性
及网络需求。它仍是
归档描述；validator 不运行其中任何内容。

可运行的 client 必须把 bundle 和入口都建模为 available asset，并在 `asset_refs` 中以
`runtime` 角色引用；入口可以与 bundle 是同一 asset。`source_only` 只能表示源码留档，
必须 `runnable=false`。

### 8.4 content block

题面、提示、题解、反馈和解后内容共享同一结构：

| 字段 | 说明 |
| --- | --- |
| `content_id` | puzzle 内稳定且唯一的内容块 ID |
| `role` / `order` | primary、translation、variant 等角色及展示顺序 |
| `availability` | `available/partial/missing/not_applicable` |
| `language` | BCP 47；未知为 `und` |
| `format` | `markdown/plain_text/html/media/interactive/mixed/none` |
| `body` | 规范内容；纯媒体或缺失内容可为空 |
| `plain_text` | 可选派生纯文本，不得替代保真 body |
| `derived_from_content_id` | 翻译或变体确由其他 block 派生时的引用 |
| `asset_refs` | 带角色、顺序、alt/label、剧透级别的附件引用 |
| `source_ids` | 此字段级内容的一个或多个来源 |
| `missing_reasons` | 缺失或不完整时的受控原因数组 |
| `rights` | 可选的字段级权利覆盖 |
| `notes` | 不适合进入正文的归档说明 |

availability 与 format 正交：`partial + markdown`、`available + media` 都是合法组合；
不得再创建 `text_missing_media` 这种混合枚举。`missing_reasons` 支持
`source_missing/source_removed/media_missing/input_missing/external_only/not_archived/unknown/other`。

format 仍必须与载荷一致：markdown/plain_text/html 要有非空 body，media/interactive
要有 asset ref，mixed 必须同时有非空 body 和 asset ref，none 只能用于 missing 或
not_applicable。

同一内容的多语言版本使用多个 block；不要把翻译拼进一个字符串。每个 block 可以引用
一个或多个 source，以表达题面和修订来自不同快照。`partial` block 必须列出
`missing_reasons`。

### 8.5 relations

`relations.jsonl` 是有向 typed graph。每条边包含 `relation_id`、`hunt_id`、
`type`、`from_id`、`to_id`、`spoiler_level`、assertion、可选顺序/标签/条件和
provenance `source_ids`。端点使用 `from/to`，避免和 provenance source 混淆。

| type | 方向 |
| --- | --- |
| `member_of` | puzzle/group -> group |
| `component_of` | subpuzzle/组件 -> puzzle |
| `feeds` | 普通题/中间题 -> Meta |
| `requires` | 被依赖项 -> 依赖它的项 |
| `unlocks` | puzzle/group -> puzzle/group |
| `solution_reference` | 本题 -> 实际承载题解的题 |
| `precedes` | 前项 -> 后项 |
| `references` | 引用方 -> 被引用方 |
| `variant_of` | 变体 -> 原题 |
| `instance_of` | 队伍实例/随机实例 -> 逻辑模板题 |
| `replaces` | 新版本 -> 被替换版本 |
| `other` | 必须配合 label 或命名空间扩展说明 |

`member_of`、`component_of` 和 `solution_reference` 不得成环。多父级、多分区和共享子题
是合法的。assertion 必须说明关系是 `official/extracted/manual/inferred`，推断关系应带
0–1 confidence。

`condition` 是递归 AST，可以组合 `all/any/not` 与 solved、group-count、time、resource、
manual、other 叶节点。它只用于保真归档和展示，消费者不得假定足以重建原比赛后端。
同 hunt 的结构/解锁关系不得跨 hunt；`references/variant_of/instance_of/replaces` 可以在
明确来源支持时跨 hunt。跨 hunt 关系的 `source_ids` 可以属于任一端 hunt 或数据集级
source；不得引用与两端都无关的第三个 hunt 来源。

### 8.6 assets

`assets.jsonl` 每行只描述一个逻辑附件，puzzle 不得内嵌整份附件 descriptor。内容块和
interactive 通过 `asset_refs` 关联它。

本地可用附件必须有 `path`、`media_type`、`bytes` 和完整 SHA-256；`missing` 或
`external_only` 资源不得伪造本地路径。`original_urls` 可以有多个，附件 ID 不应只依赖
易变 URL。相同 hash 可以被多个 asset ID 引用，但聚合器应该报告可去重项。

每个 asset ref 必须显式声明：

- `role`：`primary/inline/attachment/download/runtime/source/other`；
- `order` 和是否为解题必需的 `required`；
- `spoiler_level`：0–3；
- 可选 `label`、`alt`、`caption`。

这样消费者无需从文件名、Markdown 文本或源码字符串猜测附件可见性。

### 8.7 sources

`sources.jsonl` 将“逻辑来源”和当前数据包使用的抓取快照放在同一行。核心字段包括：

- `source_id`、可选 `hunt_id`、标题；
- `kind`（webpage、api、file、post、repository、manual、other）；
- `officiality`（official、organizer、author、third_party、unknown）；
- canonical/final URL 和当前状态；
- 可选 `snapshot`：真实 `retrieved_at`、HTTP status、media type、bytes、SHA-256、raw path；
- 产生规范化记录的 adapter 名称和版本；
- source 自身的 rights、说明和扩展。

source snapshot 是不可变证据，除抓取时间外还可以保留来源的 `published_at`、
`modified_at`、ETag 和 content hash。普通题面修订或勘误应保持 hunt/puzzle/source ID
不变，在新的 dataset release 中引用新 snapshot；不能覆写旧 raw 后声称 hash 未变。
只有主办方明确用一个新的逻辑题目替换旧题时，才为新题分配 ID 并建立 `replaces` 关系。

一条 puzzle、content block、answer、relation 或 asset 可以引用多个 source。第三方题解
不得仅因被收录而标成 official。重定向后的 URL 不能覆盖 canonical URL。

## 9. 防剧透

v2 固定四级累积模型：

| level | 可包含内容 |
| --- | --- |
| 0 `public` | hunt/group 元数据、标题、题面、题面附件 |
| 1 `hint` | level 0 + 官方提示 |
| 2 `answer` | level 1 + 答案、提交反馈 |
| 3 `solution` | level 2 + 完整题解、解后内容、可能泄题的交互源码/metadata |

实体所处字段决定默认级别；asset ref 必须显式声明级别，且不能低于上下文级别。来源
快照、extensions 和 interactive 源码默认按 level 3 处理，除非专门构建经过 allow-list
清洗的公开视图。

防剧透是展示边界，不是访问控制。静态站已经部署的 level 3 数据不能视为保密数据。

## 10. 权利、来源与隐私

`rights.status` 必须是 `copyrighted/licensed/public_domain/unknown` 之一。只有在来源明确
授权时才能填写 `license_spdx`；“抓得到”不等于“可以再发布”。hunt 级 rights 是默认
值，puzzle/source/asset/content block 可以覆盖，并可记录 rights holders 与证据 source。

从 v1 迁移时，缺少明确证据的 rights 必须先标为 `unknown`，不得因为来源是官方公开页面
就推断为 `licensed`。

数据集自己的代码许可证不得自动套用于题面、附件或题解。对外发布前必须保留 attribution
和 source，检查再分发范围，并清理来源中不必要的个人信息、token、cookie 和私有后端
配置。

## 11. Extensions

所有赛事或 adapter 特有数据放在 `extensions` object 下。一级 key 必须是稳定命名空间，
推荐反向域名或项目 slug，例如：

```json
{
  "extensions": {
    "org.cipherpuzzles.ccbc": {
      "backend_group": "A",
      "original_pid": 42
    }
  }
}
```

扩展不得改变核心字段语义，不得覆盖 ID/路径/剧透/权利约束。一个字段被两个以上独立
hunt 复用后，应通过下一版 schema 评审晋升为核心字段。

生产者应该在 manifest 的 `extension_schemas` 中登记 namespace、版本和 schema URI；
未登记或无法取得 schema 的扩展仍可保真保存，但消费者必须把它当不透明数据。

## 12. 跨文件语义校验

JSON Schema 只负责单记录形状；发布前还必须通过语义 validator：

1. manifest 文件路径、记录数、字节数和 hash 一致；
2. 所有实体 ID 唯一，且前缀与 `hunt_id` 一致；
3. 所有 hunt、source、asset、relation 外键可解析且不跨错 hunt；
4. relation endpoint 类型符合 type 约束，受限关系图无环；
5. `answer_status` 与 final、`counts_as_solve` answer 一致；
6. content availability、format、body、missing reason 一致；
7. asset/snapshot 路径不越界，实际 size/hash 一致；
8. asset ref 剧透级别不低于上下文；
9. URL scheme、时间、语言、SHA-256 和扩展命名空间合法；
10. coverage 引用有效 hunt，且完整计数满足 `expected = observed + missing`。

校验失败的数据包不得发布；warning 可以用于版权待确认、未知完整性、未归组 puzzle 和
可去重附件等人工复核项。

## 13. v1 -> v2 映射

| 当前 v1 | v2 | 自动化 |
| --- | --- | --- |
| `event_id/editions/year` | 一条 hunt + puzzle 的 `hunt_id` | 可自动，名称需复核 |
| `area` | group + `member_of` | 可自动创建，层级/类型/顺序需复核 |
| `record_id/source_id` | `puzzle_id/external_ids` | 可无损保留 legacy alias |
| `kind/title/authors` | puzzle 核心字段/credits | kind 可映射，署名拆分需复核 |
| `parent_id` | `component_of` relation | 可自动 |
| `solution_reference_record_id` | `solution_reference` relation | 可自动 |
| Meta 输入、解锁、共享组件 | typed relation | v1 大多缺失，需补录 |
| `question_*` + `content_*` | statements content block | 可自动拆 availability/format/reason |
| `answer` | final answer | 可自动；normalization/checker 需补录 |
| `additional_answers` | non-final answers 或 `answer_responses` | 基础字段可迁移，语义需分类 |
| `hints` | 稳定 ID 的 hints | 可自动生成 ID，顺序需核对 |
| `solution_*` | solutions content block | 可自动；外链/父题位置转关系 |
| `extended_content_*` | postsolve content block | 可自动 |
| `interactive` | interactive + source/runtime asset refs | 可保真搬入扩展，运行语义需人工分类 |
| record 内嵌 `assets` | assets + content `asset_refs` | 可按 URL/hash 合并，context 需复核 |
| `source_url/raw_path/fetched_at` | source + snapshot | 可迁移；真实抓取时间可能无法恢复 |
| `source_metadata` | 通用字段晋升，其余 namespaced extension | 需按 adapter 映射 |
| `quality` | validator/质量报告派生 | 不迁移为真源 |
| pairs/index/Markdown/manifest counts | derived views/new manifest | 重新生成 |

必须人工补录或确认的高风险信息包括：hunt 准确日期/时区、组织者和作者角色、rights、
source officiality、分组层次与展示顺序、Meta 输入/解锁图、答案规范化、交互运行依赖、
已删内容的缺失原因，以及外部链接能否镜像。

## 14. 接入新 hunt

每个新 hunt 应实现独立 adapter，按以下阶段工作：

1. `discover`：列出官方入口、预期实体和范围，不写规范化输出；
2. `fetch`：不可变保存响应、真实抓取时间、最终 URL、状态、size/hash；
3. `normalize`：只产出本规范实体，不直接生成 handbook；
4. `validate`：执行 JSON Schema、语义校验和覆盖率报告；
5. `aggregate`：在 staging 中合并所有 adapter，检查 ID/hash/关系冲突后原子发布；
6. `derive`：从同一规范包生成 pairs、Markdown、搜索索引和 handbook bundle。

adapter 不得清理其他 hunt 的 raw、asset 或 processed 分区。聚合器是唯一可以替换完整
规范包的组件，并且必须使用 staging + atomic replace。

首次接入至少准备以下 fixture：一条纯文本题、一条媒体或交互题、一条缺失题面/题解
记录、一条 Meta 关系，以及共享附件或多来源场景。测试不应写死全库总数，而应验证
source manifest 与输出一致、外键/枚举/路径/hash/剧透边界和确定性。

## 15. 迁移顺序

1. 冻结现有 v1 输出和黄金 fixture；
2. 用 v1 -> v2 转换器双写，不改变当前 1471 records / 1748 assets；
3. 将 CCBC 特化抓取拆成 adapter registry；
4. 选择一个文本型、一个媒体/交互型外部 hunt 做验收；
5. 让 handbook 从 v2 构建，保留 v1/v2 结果对比；
6. 所有消费者完成版本协商后再停止 v1。

在迁移完成前，v2 是新增 hunt 的目标规范，v1 是现有 CCBC handbook 的兼容输入；两者
不能使用相同 `schema_version`，也不能在同一个 JSONL 文件中混写。
