---
record_id: "ccbc16:puzzle:12"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "序章"
kind: "meta"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/12.json"
---

# 星之所在

## 题面

解决了多处能源设施的问题后，你再次回到能源中枢。解谜终端上出现了一行行奇怪的符号，在量子波动的作用下如同星星般闪烁着。

## 交互源码

### html

```html
<style>
    #meta_container {
        width: inherit;
        border-radius: 30px;
        padding: 30px;
        background: linear-gradient(rgba(0, 0, 0, 0.28) 3px, rgba(0, 0, 0, 0.3) 5px);
        background-size: 100% 8px;
        overflow: auto;
    }

    #meta_container #clue {
        margin: 0 auto;
        color: white;
        width: max-content;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    #clue span{
        font-size: 48px;
    }
</style>
<div id="meta_container">
    <div id="clue">
        <span>□□✧</span>
        <span>□□□✧□□</span>
        <span>✧□□</span>
        <span>✧□□□□□□</span>
        <span>□□✧□</span>
        <span>□□□□□✧</span>
        <span>□□✧□□</span>
        <span>✧□□□□□□□□□□□</span>
        <span>✧□□□</span>
        <span>□✧</span>
        <span>✧□□□□</span>
    </div>
</div>
```


## 解题后内容

<a type="button" class="el-button el-button--primary el-button--large link-button" href="/article/g1-end">前往间章 →</a>
<style>
.link-button {
    text-decoration: none;
}

## 答案

`STAR FARMING`

## 解析

这是本区元谜题，用到了所有小题答案。通过标题“星之所在”以及观察，可以发现每个小题答案里都藏有一个中文或英文的星名。如果将这个星名替换成“✧”，剩下的字母/汉字替换成□，恰好能对应题目里给出的某一行。例如答案“战国策”含有“策”，策是一颗仙后座的恒星，所以“战国策”对应第一行的□□✧。

每颗星星可以根据巴耶命名法写成希腊字母+星座名字。按希腊字母的次序（α=1、β=2……），在星座名字里提取字母可得答案`STAR FARMING`。

<style>
#metaanswer td, #metaanswer th {
padding: 5px 10px;
border: 0;
}
#metaanswer .star {
color: #c00;
font-weight: bold;
}
#metaanswer tr:nth-child(even) td {
background-color: #eee;
}
</style>
<table id="metaanswer" cellspacing="0" cellpadding="0">
<tr><th>答案模板</th><th>小题答案</th><th>巴耶名称</th><th>第几希腊字母</th><th>提取星座字母</th></tr>
<tr><td>□□✧</td><td>战国<span class="star">策</span></td><td>γ Cassiopeiae</td><td>3</td><td>S</td></tr>
<tr><td>□□□✧□□</td><td>EXP<span class="star">ATRIA</span>TE</td><td>α Trianguli Australis</td><td>1</td><td>T</td></tr>
<tr><td>✧□□</td><td><span class="star">RAN</span>TS</td><td>ε Eridani</td><td>5</td><td>A</td></tr>
<tr><td>✧□□□□□□</td><td><span class="star">MIMOSA</span> PUDICA</td><td>β Crucis</td><td>2</td><td>R</td></tr>
<tr><td>□□✧□</td><td>SO<span class="star">DA LIM</span>E</td><td>α Fornacis</td><td>1</td><td>F</td></tr>
<tr><td>□□□□□✧</td><td>我欲因之梦<span class="star">吴越</span></td><td>ζ Aquilae</td><td>6</td><td>A</td></tr>
<tr><td>□□✧□□</td><td>RE<span class="star">CURSA</span>NT</td><td>β Eridani</td><td>2</td><td>R</td></tr>
<tr><td>✧□□□□□□□□□□□</td><td><span class="star">FURUD</span>ATE HARUICHI</td><td>ζ Canis Majoris</td><td>6</td><td>M</td></tr>
<tr><td>✧□□□</td><td><span class="star">霹雳一</span>声暴动</td><td>β Piscium</td><td>2</td><td>I</td></tr>
<tr><td>□✧</td><td>S<span class="star">AVIOR</span></td><td>ε Carinae</td><td>5</td><td>N</td></tr>
<tr><td>✧□□□□</td><td><span class="star">SAD R</span>OBOT</td><td>γ Cygni</td><td>3</td><td>G</td></tr>
</table>

## 提示

### 1. 我毫无头绪

每一行都能跟一个小题答案对应。每个小题答案里藏了一个恒星的名字（包括中文的和英文的），整个名字（可以是一个或者更多个字符）被✧代替。其它不是星星名字的字符（字母或者汉字）都被换成了□。

### 2. 该如何提取

找到每个星星的巴耶命名法，以希腊字母的次序在星座名里提取。


## 本地附件

- [8d6eaccb0ab44d4d8374e823276756ab.webp](../../../assets/static.cipherpuzzles.com/static/images/8d6eaccb0ab44d4d8374e823276756ab.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/12.json](https://ccbc16.cipherpuzzles.com/data/puzzles/12.json)
