---
record_id: "ccbc16:puzzle:18"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "指南"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/18.json"
---

# 就是为了这点醋

## 题面

_官方存档未提供可提取的文字题面；请查看下方附件或交互源码。_

## 交互源码

### html

```html
<style>
    #summary {
        border-collapse: collapse;
        margin-bottom: 20px;
    }
    #summary td {
        border: 1px solid #ccc;
        padding: 5px 10px;
    }
    #ingredients {
        display:grid;
        grid-template-columns: auto auto auto auto
    }
    @media (max-width: 945px) {
        #ingredients {
            display: grid;
            grid-template-columns: auto auto auto;
        }
    }

    @media (max-width: 600px) {
        #ingredients {
            display: grid;
            grid-template-columns: auto auto;
        }
    }
</style>
<table id="summary">
    <tr><td rowspan="8">二进制饺子</td><td>脱口而出</td><td>八样材料</td></tr>
    <tr><td>双消音</td><td>四样材料</td></tr>
    <tr><td>同声相应</td><td>四样材料</td></tr>
    <tr><td>数数数字</td><td>四样材料</td></tr>
    <tr><td>对“古詩”</td><td>四样材料</td></tr>
    <tr><td>实名制</td><td>四样材料</td></tr>
    <tr><td>拼好字</td><td>两样材料</td></tr>
    <tr><td>成双成对</td><td>五样材料</td></tr>
</table>
<ul id="ingredients">
<li>黯淡</li>	<li>八仙过海各显神通</li>	<li>不计其数</li>	<li>渡口尚余景</li>	<li>夺泥燕口</li>
<li>飞去飞来烟雨秋</li>	<li>惯子如杀子</li>	<li>罕达罕河</li>	<li>红芪</li>	<li>虎头燕额</li>
<li>回旋现象</li>	<li>积极参加</li>	<li>空话连篇</li>	<li>空口无凭</li>	<li>离居经三春</li>
<li>您</li>	<li>青口白舌</li>	<li>青梅竹马</li>	<li>让再让三</li>	<li>入寺钟未歇</li>
<li>三缄其口</li>	<li>三歧真巨口鱼</li>	<li>十载常独坐</li>	<li>铁砂</li>	<li>王诩</li>
<li>王右军</li>	<li>羞答答</li>	<li>玄发看成一把丝</li>	<li>言路倚忠直</li>	<li>蝇营蚁聚</li>
<li>玉米钻心虫</li>	<li>纸盒子</li>	<li>中华树蟋</li>	<li>洲际弹道导弹</li>	<li>捉襟见肘</li>
</ul>
```


## 解题后内容

成功解开谜题后，量子星云影响的设备恢复正常，同时从中浮现出一张碎纸片。

<img src="../../../assets/static.cipherpuzzles.com/static/images/688e99e045ea4a628884c72229e0528e.webp" alt="fragment" style="max-width: 100%" />

## 答案

`CHAMPION`

## 解析

<style>
#answerkey {
    border-collapse: collapse;
    border-spacing: 0
}
#answerkey th {
    text-align: center;
    font-weight: bold;
    vertical-align: middle;
    padding: 3px 10px;
}
#answerkey td {
    border-style: solid none;
    border-width: thin;
    text-align: center;
    vertical-align: middle;
    padding: 3px 9px;
}
</style>

本题为META MATCHING题，需要自行将每个词对应至某题，由此得到每题答案。

<h1>脱口而出</h1>

可以找到四对成语，每对均在某一位有相同字。先根据`口`的位置提取另一成语中的字得到`话梅`和`数额`；再重复一次，使用`话`和`额`中的`口`提取另一字，得到`母女`。
<table id="answerkey">
<tr><th>成语1</th><th>成语2</th><th>提取1</th><th>提取2</th></tr>
<tr><td>空话连篇</td><td>空口无凭</td><td>话</td><td rowspan=2>母</td></tr>
<tr><td>青梅竹马</td><td>青口白舌</td><td>梅</td></tr>
<tr><td>不计其数</td><td>三缄其口</td><td>数</td><td rowspan=2>女</td></tr>
<tr><td>虎头燕额</td><td>夺泥燕口</td><td>额</td></tr>
</table>
<br>

<h1>双消音</h1>

可以找到长度递增的四个词，它们的拼音除了某一字母外均出现两次。提取只出现一次的字母得到`IDEA`。
<table id="answerkey">
<tr><th>词</th><th>拼音</th><th>提取</th></tr>
<tr><td>您</td><td>NIN</td><td>I</td></tr>
<tr><td>黯淡</td><td>AN DAN</td><td>D</td></tr>
<tr><td>纸盒子</td><td>ZHI HE ZI</td><td>E</td></tr>
<tr><td>捉襟见肘</td><td>ZHUO JIN JIAN ZHOU</td><td>A</td></tr>
</table>
<br>

<h1>同声相应</h1>

可以找到四个词，它们的声母只有一字不同。提取此字，按照出现位置排序，谐音得到回答`餐具`。
<table id="answerkey">
<tr><th>词</th><th>提取</th><th>谐音</th></tr>
<tr><td>回旋现象</td><td>回</td><td>回</td></tr>
<tr><td>罕达罕河</td><td>达</td><td>答</td></tr>
<tr><td>积极参加</td><td>参</td><td>餐</td></tr>
<tr><td>蝇营蚁聚</td><td>聚</td><td>具</td></tr>
</table>
<br>

<h1>数数数字</h1>

可以找到长度递减的四个词，它们均含有一个数字。根据数字提取对应位置，得到`通玄真经`。
<table id="answerkey">
<tr><th>词</th><th>数字</th><th>提取</th></tr>
<tr><td>八仙过海各显神通</td><td>八</td><td>通</td></tr>
<tr><td>玄发看成一把丝</td><td>一</td><td>玄</td></tr>
<tr><td>三歧真巨口鱼</td><td>三</td><td>真</td></tr>
<tr><td>离居经三春</td><td>三</td><td>经</td></tr>
</table>
<br>

<h1>对“古詩”</h1>

可以找到四句诗，其中分别含有`十口言寺`四个字。找到其上下句，取对应位置的字按同样方式组装得到`朵玛`。
<table id="answerkey">
<tr><th>诗</th><th>上下句</th><th>提取</th></tr>
<tr><td>十载常独坐</td><td>十载常独坐，几人知此心。</td><td>几</td></tr>
<tr><td>渡口尚余景</td><td>渡口尚余景，乔木故乡陌。</td><td>木</td></tr>
<tr><td>言路倚忠直</td><td>王所切经纶，言路倚忠直。</td><td>王</td></tr>
<tr><td>入寺钟未歇</td><td>上马鸡始鸣，入寺钟未歇。</td><td>马</td></tr>
</table>
<br>

<h1>实名制</h1>

可以找到长度递减的四个词，它们均有另一个名字。按顺序提取最后一字得到`螟蛉之子`。
<table id="answerkey">
<tr><th>词</th><th>别名</th><th>提取</th></tr>
<tr><td>玉米钻心虫</td><td>玉米螟</td><td>螟</td></tr>
<tr><td>中华树蟋</td><td>竹蛉</td><td>蛉</td></tr>
<tr><td>王右军</td><td>王羲之</td><td>之</td></tr>
<tr><td>王诩</td><td>鬼谷子</td><td>子</td></tr>
</table>
<br>

<h1>拼好字</h1>

可以找到两个词`红芪`和`铁砂`，它们两字各取一半可以组成新字，由此得到`纸钞`。
<br>
<br>

<h1>成双成对</h1>

可以找到长度递减的五个词，它们均有一个字重复。按顺序提取得到答`让子弹飞`。
<table id="answerkey">
<tr><th>词</th><th>提取</th></tr>
<tr><td>羞答答</td><td>答</td></tr>
<tr><td>让再让三</td><td>让</td></tr>
<tr><td>惯子如杀子</td><td>子</td></tr>
<tr><td>洲际弹道导弹</td><td>弹</td></tr>
<tr><td>飞去飞来烟雨秋</td><td>飞</td></tr>
</table>
<br>

<h1>二进制饺子</h1>

可以发现每个答案均对应某个以`子`结尾的词。将`饺`分割成五部分，根据第一个字是否包含某部分对应为五位二进制，可以得到`CHAMPION`。
<table id="answerkey">
<tr><th>题目</th><th>答案</th><th>〇子</th><th>饣</th><th>丶</th><th>一</th><th>八</th><th>乂</th><th>五位二进制</th><th>对应字母</th></tr>
<tr><td>脱口而出</td><td>母女</td><td>父子</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>00011</td><td>C</td></tr>
<tr><td>双消音</td><td>IDEA</td><td>丶子（点子）</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>01000</td><td>H</td></tr>
<tr><td>同声相应</td><td>餐具</td><td>乂子（叉子）</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>00001</td><td>A</td></tr>
<tr><td>数数数字</td><td>通玄真经</td><td>文子</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td><td>01101</td><td>M</td></tr>
<tr><td>对“古詩”</td><td>朵玛</td><td>饣子（食子）</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>10000</td><td>P</td></tr>
<tr><td>实名制</td><td>螟蛉之子</td><td>义子</td><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>01001</td><td>I</td></tr>
<tr><td>拼好字</td><td>纸钞</td><td>交子</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>01111</td><td>O</td></tr>
<tr><td>成双成对</td><td>让子弹飞</td><td>六子</td><td>0</td><td>1</td><td>1</td><td>1</td><td>0</td><td>01110</td><td>N</td></tr>
</table>

## 提示

### 1. 「脱口而出」该怎么做！

四对词中每对有一个含有「口」，根据「口」的位置提取另一个词。得到两个词后以相似的规则再次重复。

### 2. 「双消音」该怎么做！

转换成拼音后，将重复字母消去。排序是按字数递增。

### 3. 「同声相应」该怎么做！

提取唯一一个声母不同的字后谐音。排序是这个字的出现位置。

### 4. 「数数数字」该怎么做！

根据词中数字提取第N位的字。排序是按字数递减。

### 5. 「对“古詩”」该怎么做！

找到古诗所在的上下句，取「十口言寺」的对应位置，重新组成两个字。

### 6. 「实名制」该怎么做！

找到其别名，取最后一字。排序是按字数递减。

### 7. 「拼好字」该怎么做！

两个字各取一半拼成新字。

### 8. 「成双成对」该怎么做！

取词中出现两次的字。排序是按字数递增。

### 9. 「二进制饺子」看不明白！

每个答案都与一个以“子”结尾的词有关。

### 10. 「二进制饺子」不会提取！

将“饺”这个字分割成五部分：饣（食）丶一八乂，根据是否包含每个部分对应为五位二进制。


## 中间答案

| 提交 | 回复 | 附加信息 |
| --- | --- | --- |
| 母女 | 这是小题答案之一。 |  |
| IDEA | 这是小题答案之一。 |  |
| 餐具 | 这是小题答案之一。 |  |
| 通玄真经 | 这是小题答案之一。 |  |
| 朵玛 | 这是小题答案之一。 |  |
| 螟蛉之子 | 这是小题答案之一。 |  |
| 纸钞 | 这是小题答案之一。 |  |
| 让子弹飞 | 这是小题答案之一。 |  |

## 本地附件

- [2c9dc9d8db22471785d7fb068f3f81e0.svg](../../../assets/static.cipherpuzzles.com/static/images/2c9dc9d8db22471785d7fb068f3f81e0.svg)
- [688e99e045ea4a628884c72229e0528e.webp](../../../assets/static.cipherpuzzles.com/static/images/688e99e045ea4a628884c72229e0528e.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/18.json](https://ccbc16.cipherpuzzles.com/data/puzzles/18.json)
