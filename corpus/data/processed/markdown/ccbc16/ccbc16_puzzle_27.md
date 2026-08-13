---
record_id: "ccbc16:puzzle:27"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "印刷"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/27.json"
---

# 烫烫烫

## 题面

所以你不光搞错了这个“初学者练习”的编码，还把打印机搞漏墨了？

…………没办法，靠工具和脑补也不是不能做…………

## 交互源码

### html

```html
<style>
div.cccc {
    font-style: monospaced;
}

.cccc em {
    color: transparent;
    background-color: dimgray;
}
</style>

<div class="cccc">
<h3> 場ѧÕß┴╖ﾏｰ </h3>

<p><pre>
1. (二/9)

<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>2x2<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>
オ<em>&nbsp;&nbsp;</em>よ<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>Θ<em>&nbsp;&nbsp;</em>︹
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>遏额<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>︹
オ<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>Θ<em>&nbsp;&nbsp;</em>︹
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>よ<em>&nbsp;&nbsp;</em>额<em>&nbsp;&nbsp;</em>︹
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>logo琌?
</pre></p>

<p><pre>
2. (四)

鍥涘瓧鐚滀竴
閫犻挓姹囩粐
搴忛噷娴佷华
姣嶆枃璁虹梾
璁烘祦璋庤緸
</pre></p>

<p><pre>
3. (8 2)

瞧S漠-16
杨<em>&nbsp;&nbsp;</em>泳<em>&nbsp;&nbsp;</em> 茚
</pre></p>

<p><pre>
4. (1)

赏淹淹送淹淹话
喊<em>&nbsp;&nbsp;</em>嘲喊嘲嘲喊
悄拍拍啄拍拍栋
<em>&nbsp;&nbsp;</em>嘲嘲酣<em>&nbsp;&nbsp;</em>嘲喊
掏赝赝瓮赝赝拱
喊嘲<em>&nbsp;&nbsp;</em>喊嘲嘲喊
悄拍拍啄拍拍栋
喊嘲嘲<em>&nbsp;&nbsp;</em>嘲嘲喊
掏赝赝瓮赝赝拱
喊<em>&nbsp;&nbsp;</em>嘲喊嘲<em>&nbsp;&nbsp;</em>喊
悄拍拍啄拍拍栋
喊嘲嘲喊<em>&nbsp;&nbsp;</em>嘲喊
韧贤贤释贤贤及
</pre></p>

<p><pre>
5. (8)

<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>偺傾億僩乕僔僗
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>偺儂儊僆僗僞僔僗
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>偺僱僋儘乕僔僗
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>偺儊儖僩
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>偺傾億僩乕僔僗
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>偺僾儘儘乕僌
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>偺僱僋儘乕僔僗
<em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em><em>&nbsp;&nbsp;</em>偺儔儞僨償乕
</pre></p>
</div>
```


## 答案

`C SHARP`

## 解析

像标题“烫烫烫”一样，五道小题的乱码都是其它字符编码被错误解读成GBK的结果。（而标题的乱码“場ѧÕß┴╖ﾏｰ”则是正常GBK编码的“初学者练习”五个字分别被错误解读成五道小题所实际使用的编码得到的结果。）


本题的部分信息被墨水所掩盖，导致信息不全，需要用各种方式进行补全。
（以下统一用[]表示被墨水盖住的字）

小题1：原编码是繁体中文常用的BIG5编码，解码后内容是
```
[][][]2x2[][][]
左[]方[][]成[]色 
[][][]塊塗[][]色 
左[]方[][]成[]色 
[][][][]塗[][]色 
[][][][]logo是?
```
可以看出有个2x2方格的logo，接下来要将四个小方格分别染色，这显然是**微软**的logo.

小题2：原编码是UTF-8，解码后内容是
```
四字猜一
造钟汇织
序里流仪
母文论病
论流谎辞
```
和后四行每个字都可以组词的字分别是 **编 程 语 言**。

小题3：原编码是ISO-8859-1，解码后内容是
```
ÇÆSÄ® -16
Ñî[]Ó¾[] Üá
```
可以看出第一行长得很像CAESAR -16，于是将第二行已知的字符ASCII值减去16后得到
```
ÁÞ[]Ã®[] ÌÑ
```
即AP??AR?? IN, 使用QAT或Nutrimatic等工具可以推断出完整答案是**APPEARED IN**.

小题4：原编码是IBM Extended ASCII (Code Page 437)，解码后内容是
```
╔═╤═╤═╦═╤═╤═╗░\n
║░[]│░║░│░│░║░\n
╟─┼─┼─╫─┼─┼─╢░\n
[]│░│░║@[]│░║░\n
╠═╪═╪═╬═╪═╪═╣░\n
║░│░[]║░│░│░║░\n
╟─┼─┼─╫─┼─┼─╢░\n
║░│░│░[]│░│░║░\n
╠═╪═╪═╬═╪═╪═╣░\n
║░[]│░║░│░[]║░\n
╟─┼─┼─╫─┼─┼─╢░\n
║░│░│░║░[]│░║░\n
╚═╧═╧═╩═╧═╧═╝░\n
```
可以看出这是一个6x6数独，但所有线索都被墨水盖住了，于是只能知道本题答案是一个1-6的数字。

小题5：原编码是日文常用的Shift-JIS，解码后内容是
```
[][][][]のアポトーシス
[][][][]のホメオスタシス
[][][][]のネクローシス
[][][][]のメルト
[][][][]のアポトーシス
[][][][]のプロローグ
[][][][]のネクローシス
[][][][]のランデヴー
```
搜索可知这些是《命运石之门》动漫的各集标题，但由于墨水导致标题只剩下后半部分于是可以对应多个集数。将每一行可能的集数按A1Z26转字母后得到`[st][hij][mnop][uv][st][ax][mnop][de]`, 使用QAT或Nutrimatic搜索可得唯一可能的答案单词是**THOUSAND**.

最终：五道小题答案连起来可以读出**微软 编程语言 APPEARED IN [1-6] THOUSAND**, 可以合理推测出数字是2，于是最终答案是微软在2000年推出的C# (**C SHARP**)语言。

## 提示

### 1. 我毫无头绪。

五道小题都是把其它字符编码理解为GBK导致的乱码。

### 2. 所以这些小题的【数据删除】到底是什么？

分别是：BIG5, UTF-8, ISO-8859-1, IBM Extended ASCII(CP437), Shift-JIS.

### 3. 第2小题怎么做？

除第一行外每行找一个字和该行的四个字都能组词。

### 4. 第3小题怎么做？

解码后第一行象形成一句指示，这句指示对第二行的ASCII编码使用（举个例子：第二行解码出的第一个字符Ñ会变成Á），最后再将作用后的结果象形为字母。

### 5. 第4小题怎么做？

解码后可以认出是一种纸笔谜题的网格，但由于线索被墨水盖住所以只能得知答案的范围。你并不需要真的解出这道题的答案，当然你也可以在答案验证中通过少量试错确定本题答案

### 6. 第5小题怎么做？

这些日文有一个共同的出处。如果看不出来可以**一块**放进搜索引擎搜索。最后需要提取的是动漫的集数。


## 中间答案

| 提交 | 回复 | 附加信息 |
| --- | --- | --- |
| 微软 | 这是小题答案之一。 |  |
| microsoft | 这是小题答案之一。 |  |
| 编程语言 | 这是小题答案之一。 |  |
| appeared in | 这是小题答案之一。 |  |
| thousand | 这是小题答案之一。 |  |
| C# | 请提交 C SHARP。 |  |
| 2 | 这是小题答案之一。 |  |
| two | 这是小题答案之一。 |  |
| C＃ | 请提交 C SHARP。 |  |

## 本地附件

- [6517488ec3bb4909a8cf4bef7b924efd.webp](../../../assets/static.cipherpuzzles.com/static/images/6517488ec3bb4909a8cf4bef7b924efd.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/27.json](https://ccbc16.cipherpuzzles.com/data/puzzles/27.json)
