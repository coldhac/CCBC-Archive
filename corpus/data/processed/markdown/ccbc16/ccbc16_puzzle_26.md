---
record_id: "ccbc16:puzzle:26"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "印刷"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/26.json"
---

# 图寻

## 题面

<div  class="error-block custom-block">
<span class="custom-block-title">修改于 2025/08/11 12:16</span>
<span>题面增加了文字内容</span>
</div>

## 交互源码

### html

```html
<style>
    #tuxun {
        overflow-x: scroll;
        width: inherit;
        scrollbar-width: thin;
    }
</style>
<p>(3 2 3) -> 3</p>
<div id="tuxun"><img id="tuxun_img" src="../../../assets/static.cipherpuzzles.com/static/images/eb4b6dc866fd421b8275e62e955213d8.png" style="border: 1px solid black"></div>

<script>
if (document.getElementById("tuxun_img").complete) {
    document.getElementById("tuxun").scrollLeft = 22000;
} else {
    document.getElementById("tuxun_img").onload = () => {
        document.getElementById("tuxun").scrollLeft = 22000;
    };
} 
</script>
```


## 答案

`TAN`

## 解析

根据这幅图的超宽比例（约 21:1）可以猜到是名画《清明上河图》，跟《清明上河图》叠加会发现数字都落在某个汉字上，按照数字提取汉字拼音，按照古画浏览顺序从右到左可得 ANS IS TAN，所以本题答案是 `TAN`。

数字与汉字的重叠的部分如下：

![img-Screenshot 2025-08-02 163749.png](../../../assets/static.cipherpuzzles.com/static/images/e063d499c52d4488a433787442c04f23.png)

- 第一个字母：天3 = A
- 第二个字母：店4 = N

![img-Screenshot 2025-08-02 163859.png](../../../assets/static.cipherpuzzles.com/static/images/6522c808944648a7b4e72799249855d7.png)

- 第三个字母：神1 = S
- 第四个字母：命2 = I

![img-Screenshot 2025-08-02 164006.png](../../../assets/static.cipherpuzzles.com/static/images/e2942acdc60f49b4a8e4ee8d619958cc.png)

- 第五个字母：孙1 = S
- 第六个字母：檀1 = T

![img-Screenshot 2025-08-02 164054.png](../../../assets/static.cipherpuzzles.com/static/images/852e0edd19a346e2a5f2292ea3e0fba1.png)

- 第七个字母：太2 = A
- 第八个字母：丸3 = N

## 提示

### 1. 我毫无头绪

空白的图片原为一幅名画。长宽比是入手点

### 2. 该如何提取

令数字与汉字重叠，以数字提取拼音的第n个字母，从右往左读。

### 3. 我知道要找什么但是找不到

这是《清明上河图》，可以访问以下两个地址看到全图：

https://upload.wikimedia.org/wikipedia/commons/8/86/Alongtheriver_QingMing.jpg

https://www.dpm.org.cn/collection/paint/228226.html

### 4. 请给我所有需要的字

从右往左分别为：天 店 神 命 孙 檀 太 丸


## 本地附件

- [6522c808944648a7b4e72799249855d7.png](../../../assets/static.cipherpuzzles.com/static/images/6522c808944648a7b4e72799249855d7.png)
- [852e0edd19a346e2a5f2292ea3e0fba1.png](../../../assets/static.cipherpuzzles.com/static/images/852e0edd19a346e2a5f2292ea3e0fba1.png)
- [95566727de4840f8a2ea1bc045d22286.webp](../../../assets/static.cipherpuzzles.com/static/images/95566727de4840f8a2ea1bc045d22286.webp)
- [e063d499c52d4488a433787442c04f23.png](../../../assets/static.cipherpuzzles.com/static/images/e063d499c52d4488a433787442c04f23.png)
- [e2942acdc60f49b4a8e4ee8d619958cc.png](../../../assets/static.cipherpuzzles.com/static/images/e2942acdc60f49b4a8e4ee8d619958cc.png)
- [eb4b6dc866fd421b8275e62e955213d8.png](../../../assets/static.cipherpuzzles.com/static/images/eb4b6dc866fd421b8275e62e955213d8.png)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/26.json](https://ccbc16.cipherpuzzles.com/data/puzzles/26.json)
