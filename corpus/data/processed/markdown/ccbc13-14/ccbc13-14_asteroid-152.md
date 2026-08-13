---
record_id: "ccbc13-14:asteroid-152"
event_id: "ccbc13-14"
editions: ["CCBC 13", "CCBC 14"]
year: 2023
area: "小行星数据库"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc13/problems/asteroid/152.yaml"
---

# ⭐

## 题面

<div class="ccbcstylewrapper">
  <div style="position: relative; height: 400px; width: 400px; float: left">
    <div class="grid">
      <div></div><div></div><div></div><div></div><div></div><div></div>
      <div></div><div></div><div></div><div></div><div></div><div></div>
      <div></div><div></div><div></div><div></div><div></div><div></div>
      <div></div><div></div><div></div><div></div><div></div><div></div>
      <div></div><div></div><div></div><div></div><div></div><div></div>
      <div></div><div></div><div></div><div></div><div></div><div></div>
    </div>
    <div class="board">
      <div>⭐</div><div>🌙</div><div>⭐</div><div>🌙</div><div>⭐</div>
      <div>🌙</div><div>🌙</div><div>🌙</div><div>🌙</div><div>🌙</div>
      <div>⭐</div><div>⚪</div><div>⚫</div><div>🌙</div><div>⭐</div>
      <div>🌙</div><div>🌙</div><div>🌙</div><div>🌙</div><div>🌙</div>
      <div>⭐</div><div>🌙</div><div>⭐</div><div>🌙</div><div>⭐</div>
    </div>
  </div>
  <div style="position: relative; height: 400px; width: 400px; left: 400px;">
      <div class="grid">
        <div></div><div></div><div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div><div></div><div></div>
        <div></div><div></div><div></div><div></div><div></div><div></div>
      </div>
      <div class="board">
        <div>⭐</div><div>🌙</div><div>⭐</div><div>🌙</div><div>⭐</div>
        <div>🌙</div><div>🌙</div><div>🌙</div><div>⚪</div><div>🌙</div>
        <div>⭐</div><div>🌙</div><div>⚫</div><div>🌙</div><div>⭐</div>
        <div>🌙</div><div>🌙</div><div>🌙</div><div>🌙</div><div>🌙</div>
        <div>⭐</div><div>🌙</div><div>⭐</div><div>🌙</div><div>⭐</div>
      </div>
  </div>

  <p style="clear:both">
      一弯瑞月照西州，<br>
      寒星幽，<br>
      疏光流。<br>
      雾起岚生、散暑洗新秋。<br>
      夜静长闻雷隐隐，<br>
      斜瀑里，<br>
      银雨稠。
  </p>
</div>

## 交互源码

### css

```css
.board, .grid {
  margin: 20px 20px 20px 0;
  float: left;
  position: absolute;
  display: grid;
}
.board div, .grid div {
  text-align: center;
  width: 50px;
  height: 50px;
  font-size: 32px;
}
.grid {
  grid-template-columns: repeat(6, 50px);
}
.board {
  left: 25px;
  top: 25px;
  grid-template-columns: repeat(5, 50px);
}
.grid div {
  border: 1px solid #aaa;
}
.grid div:nth-child(-n+6) {
  border-top: 0px;
}
.grid div:nth-child(6n+1) {
    border-left: 0px;
}
.grid div:nth-last-child(-n+6) {
  border-bottom: 0px;
}
.grid div:nth-child(6n) {
  border-right: 0px;
}
```


## 答案

`PLAYERS`

## 解析

_官方存档未填写解析。_

## 提示

### 1. 我毫无头绪

棋盘分别展示的是五子棋的开局两步，根据第三步落子的位置不同，每个开局有不同的名字，都跟“星”或“月”有关。根据这个将每行诗对应到棋盘的位置上。

### 2. 如何提取

搜索棋盘密码（注意因为棋盘是25格而英文有26个字母，IJ两个字母往往并为一格）。每一行诗对应一个字母，所以答案一共有7个字母。


来源：[https://archive.cipherpuzzles.com/ccbc13/problems/asteroid/152.yaml](https://archive.cipherpuzzles.com/ccbc13/problems/asteroid/152.yaml)
