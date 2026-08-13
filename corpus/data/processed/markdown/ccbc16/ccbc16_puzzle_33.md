---
record_id: "ccbc16:puzzle:33"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "印刷"
kind: "meta"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/33.json"
---

# 印刷

## 题面

_官方存档未提供可提取的文字题面；请查看下方附件或交互源码。_

## 交互源码

### html

```html
<style>
#pm_container {
    display: flex;
    align-items: flex-start;
}
.pmcol {
    margin: 10px;
    border: 2px solid black;
    padding: 20px;
    background-color: white;
    width: 150px;
}
.pmcol div {
    height: 40px;
    margin: 2px;
    background-color: black;
    color: grey;
}
.pmcol div.pm_red {
    background-color: red;
    color: black;
}
</style>
<div id="pm_container">
    <div class="pmcol">
        <div></div>
        <div class="pm_red"></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
    <div class="pmcol">
        <div class="pm_red"></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
    <div class="pmcol">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div class="pm_red"></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
    <div class="pmcol">
        <div></div>
        <div class="pm_red"></div>
        <div></div>
        <div></div>
    </div>
</div>
```


## 答案

`THE MISSING INK`

## 解析

小题答案来自若干集合，分别是宙斯的七位妻子（`LETO`、`METIS`），六个三角函数（`COT`、`TAN`），十二音（`CSHARP`）、文房四宝（`BRUSH`、`PAPER`）。

每个集合都有默认顺序，提取标红的元素可得 THEMIS、SIN、G、INK，连起来即答案 `THE MISSING INK`。
<style>
#pm_sol_container {
    display: flex;
    align-items: flex-start;
}

.pm_sol_col div {
    width: 150px;
}
.pm_sol_col div.pm_sol_red{
color: red
}
</style>
<div id="pm_sol_container">
    <div class="pm_sol_col">
        <div>METIS</div>
        <div class="pm_sol_red">THEMIS</div>
        <div>EURYNOME</div>
        <div>DEMETER</div>
        <div>MNEMOSYNE</div>
        <div>LETO</div>
        <div>HERA</div>
    </div>
    <div class="pm_sol_col">
        <div class="pm_sol_red">SIN</div>
        <div>COS</div>
        <div>TAN</div>
        <div>COT</div>
        <div>SEC</div>
        <div>CSC</div>
    </div>
    <div class="pm_sol_col">
        <div>C</div>
        <div>C#</div>
        <div>D</div>
        <div>D#</div>
        <div>E</div>
        <div>F</div>
        <div>F#</div>
        <div class="pm_sol_red">G</div>
        <div>G#</div>
        <div>A</div>
        <div>A#</div>
        <div>B</div>
    </div>
    <div class="pm_sol_col">
        <div>BRUSH</div>
        <div class="pm_sol_red">INK</div>
        <div>PAPER</div>
        <div>INKSTONE</div>
    </div>
</div>

## 提示

### 1. 我毫无头绪

注意到黑格与红格加起来，正好是全部小题的数量（包括没有题面的题目，以及点不开的题目）。每个小题答案都是某个有序集合中的元素。

### 2. 该如何提取

将四块红色部分连起来。例如第四列是中国常见于书房的四样东西，取第二个。


## 本地附件

- [5f980ebd803e4e5698d755196b983c60.webp](../../../assets/static.cipherpuzzles.com/static/images/5f980ebd803e4e5698d755196b983c60.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/33.json](https://ccbc16.cipherpuzzles.com/data/puzzles/33.json)
