---
record_id: "ccbc12:problem:e-p2021"
event_id: "ccbc12"
editions: ["CCBC 12"]
year: 2022
area: "时间线E"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc12/problems/e/p2021.yaml"
---

# #2021 神秘活动 - CCBC 12

## 题面

你好像置身于中国大陆的某处。你发现郁郁葱葱的树林中有一座造型奇特的建筑，走近一看，原来是一座天文馆。

<br>

<div id="normalTimeContent">
  <div>
    <p>天文馆的活动宣传栏里贴着一张海报。</p>
    <br>
    <div class="poster-wrapper">
      <div class="poster-text">
        <p>我会在每天的当地时间凌晨，时针和分针第二次重合之际，</p>
        <p>在36号机器人的见证下，用你们看不到的方式，给予你们天宫的旨意。</p>
        <p>请准时来到这里，聆听仙人的教诲。</p>
      </div>
      <div class="poster-hand-box">
        <div class="poster-hour-hand" id="hour-hand"></div>
        <div class="poster-min-hand" id="min-hand"></div>
      </div>
      <div class="poster-center-circle"></div>
    </div>
    <br>
    <p>“这也太谜语人了吧。想要搞活动宣传，又不好好写海报内容，时间都不写清楚，我看这活动不会有人来。”</p>
  </div>
</div>

<div id="radioContent">
  <div>
  <p>你看到手表上时针和分针走向重合了，大概海报上说的时间就是这个时候吧。</p>
  <br>
  <p>你四处望望，发现一群人聚集在天文馆前的广场上，举着锅（卫星天线）朝着天空，好像在接收着什么东西。你走过去，听到连着天线的音箱发出刺耳的噪音。</p>
  <br>
  <audio src="../../../assets/archive.cipherpuzzles.com/ccbc12/images/e/7c6633ddb86a4d3fb37d0a25e67fa466.m4a" controls></audio>
  </div>
</div>

## 交互源码

### javascript

```javascript
function showNormal(val) {
  let normalEl = document.getElementById("normalTimeContent");
  let radioEl = document.getElementById("radioContent");
  if (val) {
    normalEl.style.display = 'block';
    radioEl.style.display = 'none';
  } else {
    normalEl.style.display = 'none';
    radioEl.style.display = 'block';
  }
}
(function () {
  const resetHandPosition = () => {
    let d = new Date();
    let utcOffset = d.getTimezoneOffset();
    let nowTs = d.getTime();
    let displayDate = new Date(nowTs + utcOffset * 60 * 1000 + 8 * 60 * 60 * 1000);

    if (displayDate.getHours() == 1 && displayDate.getMinutes() == 5) {
      showNormal(false);
    } else {
      showNormal(true);
    }

    let daySecond = displayDate.getHours() * 3600 + displayDate.getMinutes() * 60 + displayDate.getSeconds();
    let h = daySecond / 3600;
    let m = daySecond / 60 % 60;
    let rotateH = (h % 12 * 30);
    let rotateM = m * 6;

    let hourHandEl = document.getElementById("hour-hand");
    if (hourHandEl) {
      hourHandEl.style.transform = `rotate(${rotateH}deg)`;
      hourHandEl.style.display = 'block';
    }
    let minHandEl = document.getElementById("min-hand");
    if (minHandEl) {
      minHandEl.style.transform = `rotate(${rotateM}deg)`;
      minHandEl.style.display = 'block';
    }
  }
  resetHandPosition();
  let timer = setInterval(() => {
    resetHandPosition();
  }, 1000);
})();
```

### css

```css
.poster-wrapper {
    background-image: url("../../../assets/archive.cipherpuzzles.com/ccbc12/images/e/a9bb8262fcfb4766b3db4b6caf592bd2.webp");
    background-size: 100%;
    width: 750px;
    height: 919px;
    position: relative;
}
.poster-text {
    position: absolute;
    text-align: center;
    top: 757px;
    left: 53px;
    color: #CCCCFF;
    font-size: 21px;
    text-shadow: 2px 2px 2px #8e7453;
}
.poster-text p {
    margin-top: 0;
    margin-left: 0;
    margin-bottom: 18px;
    margin-right: 0;
}
.poster-hour-hand {
    background-image: url("../../../assets/archive.cipherpuzzles.com/ccbc12/images/e/7ec37c7c6afb4356be4e839a19685596.webp");
    background-size: 100%;
    width: 160px;
    height: 160px;
    position: absolute;
    left: 287px;
    top: 99px;
    z-index: 30;
    transform: rotate(0deg);
    display: none;
}
.poster-min-hand {
    background-image: url("../../../assets/archive.cipherpuzzles.com/ccbc12/images/e/7928c539845a4f79b194d0b47dd81660.webp");
    background-size: 100%;
    width: 160px;
    height: 160px;
    position: absolute;
    left: 287px;
    top: 99px;
    z-index: 29;
    transform: rotate(0deg);
    display: none;
}
.poster-hand-box {
    filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 0.35));
}
.poster-center-circle {
    width: 11px;
    height: 11px;
    z-index: 31;
    position: absolute;
    top: 173px;
    left: 362px;
    border-radius: 50%;
    background-color: black;
}
```


## 解题后内容

你得到了一个神秘的数字：77.19

## 答案

`DAR ES SALAAM`

## 解析

根据预告函，得知在需要在北京时间的每天1：05：27打开这个网页。预告里的“天宫”指的是空间站，而搜索空间站+无线电可以得到空间站活动都是向爱好者们发送sstv图像，所以下载一个sstv解码软件，将音频按照sstv的robot36模式（即预告函里的“36号机器人”）解码可以得到答案：**DAR ES SALAAM**。

<img src="../../../assets/archive.cipherpuzzles.com/ccbc12/images/answer/e-2021.png" style="width: 250px" />

## 提示

### 1. 我毫无头绪

根据预告函解出时间再来这里试试？（午夜算作“第一次”。）顺带一提，时间是根据你的系统时间判定的。

### 2. 参加活动后该怎么做

这是慢扫描电视的声音，需要下载个软件解析一下。（预告函里提示了解析的模式。）


## 本地附件

- [e-2021.png](../../../assets/archive.cipherpuzzles.com/ccbc12/images/answer/e-2021.png)
- [7928c539845a4f79b194d0b47dd81660.webp](../../../assets/archive.cipherpuzzles.com/ccbc12/images/e/7928c539845a4f79b194d0b47dd81660.webp)
- [7c6633ddb86a4d3fb37d0a25e67fa466.m4a](../../../assets/archive.cipherpuzzles.com/ccbc12/images/e/7c6633ddb86a4d3fb37d0a25e67fa466.m4a)
- [7ec37c7c6afb4356be4e839a19685596.webp](../../../assets/archive.cipherpuzzles.com/ccbc12/images/e/7ec37c7c6afb4356be4e839a19685596.webp)
- [a9bb8262fcfb4766b3db4b6caf592bd2.webp](../../../assets/archive.cipherpuzzles.com/ccbc12/images/e/a9bb8262fcfb4766b3db4b6caf592bd2.webp)

来源：[https://archive.cipherpuzzles.com/ccbc12/problems/e/p2021.yaml](https://archive.cipherpuzzles.com/ccbc12/problems/e/p2021.yaml)
