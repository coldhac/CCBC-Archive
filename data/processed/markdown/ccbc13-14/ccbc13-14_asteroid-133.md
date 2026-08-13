---
record_id: "ccbc13-14:asteroid-133"
event_id: "ccbc13-14"
editions: ["CCBC 13", "CCBC 14"]
year: 2023
area: "小行星数据库"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc13/problems/asteroid/133.yaml"
---

# ⭐

## 题面

<div class="ccbcstylewrapper">
  <div style="position: relative;height: 280px; width: 280px;background-color: #efefe5; color: black;">
    <table class="mytable1">
      <tr>
        <td>E</td>
        <td>D</td>
        <td>G</td>
        <td>E</td>
      </tr>
      <tr>
        <td>G</td>
        <td>N</td>
        <td>A</td>
        <td>W</td>
      </tr>
      <tr>
        <td>R</td>
        <td>O</td>
        <td>D</td>
        <td>E</td>
      </tr>
      <tr>
        <td>H</td>
        <td>A</td>
        <td>W</td>
        <td>K</td>
      </tr>
    </table>
    <table class="mytable2">
      <tr>
        <td></td>
        <td class="black"></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td></td>
        <td class="black"></td>
        <td></td>
        <td></td>
      </tr>
      <tr>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </table>
  </div>
</div>

## 交互源码

### css

```css
.mytable1, .mytable2 {
  border-collapse: collapse;
  margin: 10px;
  position: absolute;
}
.mytable2 {
  border: 3px solid #888;
  left: 30px;
  top: 30px;
  transform: rotate(10deg);
}
.mytable1 td {
  border: 1px solid #888;
}
.mytable1 td, .mytable2 td {
  width: 50px;
  height: 50px;
  text-align: center;
  font-size: 32px;
}
.mytable2 td:not(.black) {
    background-color: rgba(0, 0, 0, 0.8);
}
```


## 答案

`DOWNWARD`

## 解析

_官方存档未填写解析。_

## 提示

### 1. 我毫无思路

本题为天窗密码。需要将天窗旋转并提取多次。


来源：[https://archive.cipherpuzzles.com/ccbc13/problems/asteroid/133.yaml](https://archive.cipherpuzzles.com/ccbc13/problems/asteroid/133.yaml)
