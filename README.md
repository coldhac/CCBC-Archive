# CCBC Archive Workspace

本仓库包含两个边界清晰、可独立运行的项目：一套负责恢复和整理 CCBC 历届官方资料，另一套负责把整理结果发布成适合比赛现场查阅的静态手册。

```text
CCBC-Archive/
  corpus/      CCBC 官方资料抓取、规范化与质量报告
  handbook/    CCBC 卡题手册的静态站、数据构建器与测试
```

## 快速开始

直接查看已经生成好的手册，不需要安装语料项目依赖：

```bash
cd handbook
python3 -m http.server 8765 --directory public
```

浏览器访问 <http://127.0.0.1:8765/>。详细用法见 [`handbook/README.md`](handbook/README.md)。

重新抓取或整理语料：

```bash
cd corpus
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/scrape_ccbc.py
```

数据结构、覆盖范围和完整性说明见 [`corpus/README.md`](corpus/README.md)。

若要接入 CCBC 以外的 puzzle hunt，不要继续扩展当前 v1 的赛事特有字段；目标数据契约、
实体关系、来源/权利和迁移规则见 [`corpus/DATASET_SPEC.md`](corpus/DATASET_SPEC.md)。

## 两个项目如何协作

`corpus` 的主要交付物是 `corpus/data/processed/records.jsonl` 和 `assets.jsonl`。`handbook` 可以读取这两个文件，重新生成 `handbook/public/data/`：

```bash
cd handbook
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python scripts/build.py --corpus-root ../corpus
```

这一步是显式的数据导入，不是运行时依赖。生成完成后，`handbook/public/` 可以单独复制、托管和离线使用；删除或移走 `corpus/` 不影响已经生成的手册。

## 资料范围与权利

当前可恢复范围包括 CCBC 2–4，以及 CCBC 11、12、13/14、15、16。早期资料中官方已经删除的题面、媒体或解析会保留缺失标记，不会用第三方内容或生成内容补写。

题面、提示、题解、附件及署名的权利仍归原作者和 CCBC 主办方。本仓库不为原始内容声明新的许可证；对外发布数据、站点或衍生产物前，请确认授权范围并保留来源信息。
