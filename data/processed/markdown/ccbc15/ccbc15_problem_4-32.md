---
record_id: "ccbc15:problem:4-32"
event_id: "ccbc15"
editions: ["CCBC 15"]
year: 2024
area: "全球呼叫出题组"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc15/problems/4/32.yaml"
---

# What9Colors

## 题面

你来到了巴西利亚。

仔细远望这座多彩的高原城市，你看到了——仔细看！你一定看得到的！

<div class="colors">
    <div style="background-color: #A0CDEF;"></div>
    <div style="background-color: #FEEDE0;"></div>
    <div style="background-color: #BE4053;"></div>
    <div style="background-color: #333EE0;"></div>
    <div style="background-color: #A12266;"></div>
    <div style="background-color: #9ADD5B;"></div>
    <div style="background-color: #AACCEE;"></div>
    <div style="background-color: #115A5C;"></div>
    <div style="background-color: #271828;"></div>
</div>

<style>
.colors {
    display: flex;
    flex-wrap: wrap;
    width: 3px;
}
.colors > div {
    height: 1px;
    width: 1px;
}
</style>

## 解题后内容

你要离开之前，获得了一份旅游指南，你注意到其中一句话被圈了出来：“雨季常带来强烈的洪水。”

## 答案

`BRIEFCASE`

## 解析

仔细观察页面会发现有一个3x3的像素格，每个色值对应一个字母或需要在0处按规律填写一个字母，得到答案**BRIEFCASE**

| **颜色代码** | **解释**              | **提取** |
|:--------:|:-------------------:|:------:|
| A0CDEF   | 0是填空例子教学            | B      |
| FEEDE0   | FEEDER              | R      |
| BE4053   | 元素Be=4 ?=53         | I      |
| 333EE0   | 镜像对称0填E             | E      |
| A12266   | A1Z26 6             | F      |
| 9ADD5B   | 9+5b=0x64=100=C(罗马) | C      |
| AACCEE   | ACE                 | A      |
| 115A5C   | ASCII码 115          | S      |
| 271828   | e                   | E      |

## 提示

### 1. 题在哪里

仔细观察，或者F12查看页面，这个页面除了那句话以外还有别的东西。

### 2. 我找到题了，但是我要做什么

获得它们的十六进制颜色编码，然后将它们作为小题解开，每个编码指向一个字母。

### 3. 第1小题怎么做

向0处填入一个字母，使序列拥有简单的规律。

### 4. 第2小题怎么做

向0处填入一个字母，使之成为一个有意义的单词。

### 5. 第3小题怎么做

该小题中的字母是一个元素，0处应当填入其后数字代表的元素符号。

### 6. 第4小题怎么做

该小题的内容某种意义上左右镜像对称。

### 7. 第5小题怎么做

该小题的前五个字符指向一种常见的加密方式，剩余字符是答案对应的编码。

### 8. 第6小题怎么做

该小题的字母部分构成了一个有意义的单词，跟随它的指引计算，计算结果可以用一个字母表示。

### 9. 第7小题怎么做

该小题可以直接读出一个单词，该单词直接对应某个字母。

### 10. 第8小题怎么做

该小题后一半是一种编码方式的象形，前一半则是答案在这种编码方式下的编号。

### 11. 第9小题怎么做

这是一个著名的常数。


来源：[https://archive.cipherpuzzles.com/ccbc15/problems/4/32.yaml](https://archive.cipherpuzzles.com/ccbc15/problems/4/32.yaml)
