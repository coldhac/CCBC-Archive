---
record_id: "ccbc13-14:ccbc-13-8"
event_id: "ccbc13-14"
editions: ["CCBC 13"]
year: 2023
area: "CCBC-13"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc13/problems/CCBC-13/8.yaml"
---

# 小纸条

## 题面

<style>
    #stripsofpaper img {
        vertical-align: top;
    }
</style>
<p>一些似曾相识的细长纸条。看着它们，你不禁想起了久远的过去……</p>

<a href="../../../assets/static.cipherpuzzles.com/static/images/2e126f7c18ac467ca5048d2303efe9e8.zip">纸条打包下载</a>

<div id="stripsofpaper">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/456c44a176044bffa4a6035c51dc5fa0.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/e4122220f35e4cdd8a6b9e473e4f2600.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/6b614aaabdb94726a23eb0767292389c.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/db7a65b3d5eb4482b4a6df8180f5feac.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/c02458671f4447c2994fb44972bcf5ae.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/ede8eb9a757643d7bd4603ebb43ef3bf.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/92d1a7f137ab4638aab07bd926c4a0a3.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/602506cbf5cc44349adbe9bd28f70db0.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/a7c4d06d7fe441faa6771e934f260d22.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/d8ea9fdf74824700aa309c9a3179ff0c.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/3bf4e1d40860493f8f1d0d538fa0acc7.webp">
<img src="../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/3d79e9b64ac14fcdb8662d5ea7cb8519.webp">

</div>

## 答案

`CIRCUMCENTER`

## 解析

首先发现这些小纸条缠绕在适当直径的圆柱体后可以拼出字母，12张纸条上的单词分别为`CALCULATE CIRCUMFERENCE OVER STRIP WIDTH ROUND TO NEAREST INTEGER SORT BY LENGTH`，即“计算圆柱体周长除以纸条宽度的商，四舍五入取整后按长度排序”。

圆柱体周长等于纸条上“卷绕后在圆柱体上相接的两点”在纸条上的斜线距离，可以通过勾股定理进行计算。注意这里最终要求的是两个长度的商，所以单位无关紧要。

计算结果为（以像素为单位）：
<style>
#answerkey tr:nth-child(even) td {
background-color: #444;
}
#answerkey td {
vertical-align: top;
padding: 3px 10px;
}
</style>
<table id="answerkey">
<tr><td>纸条编号</td><td>长度</td><td>宽度</td><td>圆柱周长</td><td>商对应的字母</td></tr>
<tr><td>11</td><td>720</td><td>60</td><td>190</td><td>C</td></tr>
<tr><td>7</td><td>2160</td><td>30</td><td>272</td><td>I</td></tr>
<tr><td>3</td><td>3240</td><td>30</td><td>541</td><td>R</td></tr>
<tr><td>10</td><td>3510</td><td>90</td><td>285</td><td>C</td></tr>
<tr><td>6</td><td>3780</td><td>30</td><td>631</td><td>U</td></tr>
<tr><td>4</td><td>4550</td><td>25</td><td>326</td><td>M</td></tr>
<tr><td>5</td><td>5400</td><td>120</td><td>379</td><td>C</td></tr>
<tr><td>12</td><td>5800</td><td>40</td><td>204</td><td>E</td></tr>
<tr><td>9</td><td>6370</td><td>35</td><td>491</td><td>N</td></tr>
<tr><td>8</td><td>6600</td><td>30</td><td>601</td><td>T</td></tr>
<tr><td>1</td><td>8050</td><td>70</td><td>357</td><td>E</td></tr>
<tr><td>2</td><td>8800</td><td>35</td><td>631</td><td>R</td></tr>
</table>

得到最终答案`CIRCUMCENTER`。

## 提示

### 1. 我毫无头绪

你不禁想起了古代斯巴达人使用的密码棒……

### 2. 我读出了所有的纸条，但是纸条2那个词指的是什么？

“周长”。这里指的不是纸条的周长，而是你解读纸条过程中用到的那个工具的周长。

### 3. 所有纸条的单词是什么，怎么理解？

CALCULATE CIRCUMFERENCE OVER STRIP WIDTH ROUND TO NEAREST INTEGER SORT BY LENGTH

这里的OVER是“除以”的意思，也就是说算的是一个比值，不需要考虑单位。


## 本地附件

- [3bf4e1d40860493f8f1d0d538fa0acc7.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/3bf4e1d40860493f8f1d0d538fa0acc7.webp)
- [3d79e9b64ac14fcdb8662d5ea7cb8519.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/3d79e9b64ac14fcdb8662d5ea7cb8519.webp)
- [456c44a176044bffa4a6035c51dc5fa0.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/456c44a176044bffa4a6035c51dc5fa0.webp)
- [602506cbf5cc44349adbe9bd28f70db0.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/602506cbf5cc44349adbe9bd28f70db0.webp)
- [6b614aaabdb94726a23eb0767292389c.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/6b614aaabdb94726a23eb0767292389c.webp)
- [92d1a7f137ab4638aab07bd926c4a0a3.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/92d1a7f137ab4638aab07bd926c4a0a3.webp)
- [a7c4d06d7fe441faa6771e934f260d22.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/a7c4d06d7fe441faa6771e934f260d22.webp)
- [c02458671f4447c2994fb44972bcf5ae.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/c02458671f4447c2994fb44972bcf5ae.webp)
- [d8ea9fdf74824700aa309c9a3179ff0c.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/d8ea9fdf74824700aa309c9a3179ff0c.webp)
- [db7a65b3d5eb4482b4a6df8180f5feac.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/db7a65b3d5eb4482b4a6df8180f5feac.webp)
- [e4122220f35e4cdd8a6b9e473e4f2600.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/e4122220f35e4cdd8a6b9e473e4f2600.webp)
- [ede8eb9a757643d7bd4603ebb43ef3bf.webp](../../../assets/archive.cipherpuzzles.com/ccbc13/images/CCBC-13/ede8eb9a757643d7bd4603ebb43ef3bf.webp)
- [2e126f7c18ac467ca5048d2303efe9e8.zip](../../../assets/static.cipherpuzzles.com/static/images/2e126f7c18ac467ca5048d2303efe9e8.zip)

来源：[https://archive.cipherpuzzles.com/ccbc13/problems/CCBC-13/8.yaml](https://archive.cipherpuzzles.com/ccbc13/problems/CCBC-13/8.yaml)
