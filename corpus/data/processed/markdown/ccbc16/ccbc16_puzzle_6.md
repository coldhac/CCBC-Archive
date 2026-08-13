---
record_id: "ccbc16:puzzle:6"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "序章"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/6.json"
---

# 举🚩不定

## 题面

_官方存档未提供可提取的文字题面；请查看下方附件或交互源码。_

## 交互源码

### html

```html
<style>
.flags {
    border-collapse: collapse;
    margin: 0 30px 0 0;
}
.flags td {
    text-align: center;
    width: 30px;
    height: 30px;
    border: 1px solid #ccc;
}
</style>
<table class="flags">
    <tr><td>1</td><td>1</td><td></td><td>0</td><td></td><td>1</td><td>2</td><td></td><td>1</td></tr>
    <tr><td></td><td></td><td></td><td>1</td><td style="background-color: orange"></td><td>2</td><td></td><td></td><td>1</td></tr>
    <tr><td>1</td><td></td><td>1</td><td></td><td></td><td style="background-color: blue"></td><td></td><td></td><td>1</td></tr>
    <tr><td></td><td></td><td></td><td></td><td>1</td><td></td><td>2</td><td style="background-color: lime"></td><td>2</td></tr>
    <tr><td></td><td></td><td style="background-color: yellow"></td><td>4</td><td></td><td>3</td><td></td><td>3</td><td></td></tr>
    <tr><td>3</td><td>6</td><td></td><td></td><td style="background-color: red"></td><td></td><td></td><td style="background-color: cyan"></td><td>3</td></tr>
    <tr><td></td><td></td><td></td><td></td><td>4</td><td></td><td>3</td><td></td><td></td></tr>
    <tr><td>1</td><td></td><td>4</td><td></td><td></td><td></td><td></td><td>2</td><td></td></tr>
    <tr><td></td><td></td><td>1</td><td></td><td>1</td><td>0</td><td></td><td></td><td>0</td></tr>
</table>
```


## 答案

`SAVIOR`

## 解析

根据标题的🚩以及数字，可以想到这是一道扫雷题。解的时候会发现有两组解：
<style>
.flags td.flags_x {
border: 2px solid red;
}
</style>
<div style="display: flex">
<table class="flags">
    <tr><td>1</td><td>1</td><td></td><td>0</td><td></td><td>1</td><td>2</td><td>🚩</td><td>1</td></tr>
    <tr><td>🚩</td><td></td><td></td><td>1</td><td style="background-color: orange"></td><td>2</td><td>🚩</td><td></td><td>1</td></tr>
    <tr><td>1</td><td></td><td>1</td><td class="flags_x"></td><td class="flags_x">🚩</td><td style="background-color: blue"></td><td class="flags_x"></td><td></td><td>1</td></tr>
    <tr><td></td><td></td><td class="flags_x">🚩</td><td></td><td>1</td><td></td><td>2</td><td style="background-color: lime">🚩</td><td>2</td></tr>
    <tr><td>🚩</td><td>🚩</td><td style="background-color: yellow">🚩</td><td>4</td><td></td><td>3</td><td class="flags_x">🚩</td><td>3</td><td>🚩</td></tr>
    <tr><td>3</td><td>6</td><td>🚩</td><td class="flags_x"></td><td style="background-color: firebrick">🚩</td><td>🚩</td><td class="flags_x"></td><td style="background-color: cyan"></td><td>3</td></tr>
    <tr><td></td><td>🚩</td><td>🚩</td><td>🚩</td><td>4</td><td class="flags_x">🚩</td><td>3</td><td>🚩</td><td>🚩</td></tr>
    <tr><td>1</td><td></td><td>4</td><td></td><td></td><td></td><td></td><td>2</td><td></td></tr>
    <tr><td></td><td></td><td>1</td><td>🚩</td><td>1</td><td>0</td><td></td><td></td><td>0</td></tr>
</table>

<table class="flags">
    <tr><td>1</td><td>1</td><td></td><td>0</td><td></td><td>1</td><td>2</td><td>🚩</td><td>1</td></tr>
    <tr><td>🚩</td><td></td><td></td><td>1</td><td style="background-color: orange"></td><td>2</td><td>🚩</td><td></td><td>1</td></tr>
    <tr><td>1</td><td></td><td>1</td><td class="flags_x">🚩</td><td class="flags_x"></td><td style="background-color: blue"></td><td class="flags_x">🚩</td><td></td><td>1</td></tr>
    <tr><td></td><td></td><td class="flags_x"></td><td></td><td>1</td><td></td><td>2</td><td style="background-color: lime">🚩</td><td>2</td></tr>
    <tr><td>🚩</td><td>🚩</td><td style="background-color: yellow">🚩</td><td>4</td><td></td><td>3</td><td class="flags_x"></td><td>3</td><td>🚩</td></tr>
    <tr><td>3</td><td>6</td><td>🚩</td><td class="flags_x">🚩</td><td style="background-color: firebrick">🚩</td><td>🚩</td><td class="flags_x">🚩</td><td style="background-color: cyan"></td><td>3</td></tr>
    <tr><td></td><td>🚩</td><td>🚩</td><td>🚩</td><td>4</td><td class="flags_x"></td><td>3</td><td>🚩</td><td>🚩</td></tr>
    <tr><td>1</td><td></td><td>4</td><td></td><td></td><td></td><td></td><td>2</td><td></td></tr>
    <tr><td></td><td></td><td>1</td><td>🚩</td><td>1</td><td>0</td><td></td><td></td><td>0</td></tr>
</table>
</div>

每个颜色格子周围都有两个雷可能在的位置需要二选一，以颜色格为中心这两个组成一个旗语字母：例如红色格子要么在左侧有一个雷，要么在右下方有一个雷，这两个方向合起来是旗语字母 S。六个格子按照彩虹色顺序提取得到答案 `SAVIOR`。

## 提示

### 1. 我毫无头绪

数字是扫雷。

### 2. 该如何提取

扫雷有两个解，注意每个颜色周围无法确定的雷的位置，以旗语提取。


## 本地附件

- [66b4c98014fa4c14ac3f680a3a2773be.webp](../../../assets/static.cipherpuzzles.com/static/images/66b4c98014fa4c14ac3f680a3a2773be.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/6.json](https://ccbc16.cipherpuzzles.com/data/puzzles/6.json)
