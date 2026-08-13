---
record_id: "ccbc15:problem:3-18"
event_id: "ccbc15"
editions: ["CCBC 15"]
year: 2024
area: "科学的深入浅出"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc15/problems/3/18.yaml"
---

# 错位文字

## 题面

这些文字好像...错位了？

<br>

    脱氧核糖栾酾
    通用为衔总线
    替月价值珿呔
    兪锥绩效挊栊
    號拤万甜网络
    入琀宏佂糺绞

## 答案

`GALLBLADDER`

## 解析

| **题面文字** | **校正Unicode后文字** | **三字母缩写** | **Unicode位移量** | **对应凯撒后字母** |
|:--------:|:----------------:|:---------:|:--------------:|:-----------:|
| 脱氧核糖栾酾   | 脱氧核糖**核酸**           | DN**A**       | +6 | G |
| 通用为衔总线   | 通用**串行**总线           | U**S**B       | +8 | A |
| 替月价值珿呔   | **最有**价值**球员**           | **M**V**P**       | -1 -4 | L L |
| 兪锥绩效挊栊   | **关键**绩效**指标**           | **K**P**I**       | -9 +3 | B L |
| 號拤万甜网络   | **虚拟专用**网络           | **VP**N       | +5 -12 | A D |
| 入琀宏佂糺绞   | **全球定位系统**           | **GPS**       | -3 -11 -1 | D E R |

最终答案为**GALLBLADDER**

## 提示

### 1. 我毫无头绪

题面中有一些不明所以的乱码，究竟是什么东西错位了导致的呢？

### 2. 到底错位了什么

这里每一行字都应当是一个六字词，是因为Unicode码移位而形成了乱码，尝试把所有的文字都复原吧。提供一个可以使用的工具，进入后选择凯撒移位（中文版）：https://puzz.cipherpuzzles.com/tools/mmjq.html

### 3. 该如何提取

每个六字词语都可以翻译成一个生活中经常提到的三字母缩写，这个缩写的每个字母对应该六字词语的一部分。根据之前得到的错位情况，同样用于缩写中的英文字母（凯撒密码）。


来源：[https://archive.cipherpuzzles.com/ccbc15/problems/3/18.yaml](https://archive.cipherpuzzles.com/ccbc15/problems/3/18.yaml)
