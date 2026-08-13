---
record_id: "ccbc15:problem:1-6"
event_id: "ccbc15"
editions: ["CCBC 15"]
year: 2024
area: "面试"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc15/problems/1/6.yaml"
---

# 后院探险

## 题面

最后，也是最难的一题，我们要考查你的动手能力。请注意有些东西是不能动的哦。

## 交互源码

### vue_template

```html
<template>
    <div class="gameplay-wrapper">
        <div class="gameplay-scroll">
            <ul class="gameplay-content">
                <li v-for="item in contents" :class="item.type" v-html="item.content"></li>
            </ul>
        </div>
        <div class="instruction-field">
            <form class="instruction-form" @submit.prevent="checkReply">
                <div class="el-input el-input-group el-input-group--append">
                    <div class="el-input__wrapper" tabindex="-1">
                        <input type="text" class="el-input__inner instruction-text" placeholder="输入你的指令" required v-model="userInput">
                    </div>
                    <div class="el-input-group__append">
                        <button class="el-button instruction-submit" type="submit">输入</button>
                    </div>
                </div>
            </form>
        </div>
        <div style="height: 170px"></div>
    </div>
</template>

<style>
.gameplay-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.gameplay-scroll {
    background-color: aliceblue;
    height: 62vh;
    width: 65vw;
    overflow: auto;
}

.gameplay-content li {
    width: 95%;
    list-style-type: none;
    margin: 10px auto;
}

.instruction-field {
    margin-top: 10px;
    width: 65vw;
}

.system-response{
    color:black;
}
.user-response{
    color: gray;
    font-style: italic;
}
</style>
```

### vue_script

```text
const { ref, inject, onMounted, nextTick } = Vue;

export default {
    setup() {
        const userInput = ref("");
        const contents = ref([
            {
                type: "system-response",
                content: "<b>你现在在一个神奇的房间里，输入WASD向对应方向移动。</b>"
            }
        ]);

        const backend = inject("backend");

        const checkReply = async () => {
            let inputValue = userInput.value;
            userInput.value = "";
            contents.value.push({
                type: "user-response",
                content: inputValue
            });
            await processBackend(inputValue);
        }

        const processBackend = async (text) => {
            let data;
            if (text) {
                data = await backend("c15-c15-6", {
                    text
                });
            } else {
                data = await backend("c15-c15-6", {});
            }

            if (data.reply) {
                contents.value.push({
                    type: "system-response",
                    content: data.reply
                });
            }
            contents.value.push({
                type: "system-response",
                content: data.roomResult
            });

            await scrollToBottom();
        }

        const scrollToBottom = async () => {
            await nextTick();
            let container = document.querySelector(".gameplay-scroll");
            container.scrollTop = container.scrollHeight;
        }

        onMounted(() => {
            processBackend();
        });

        return {
            userInput,
            contents,
            checkReply
        }
    }
}
```

### backend_c15-c15-6

```text
const LETTER_ARRAY = [
    ['H', 'O', 'R', 'R', 'O', 'R'],
    ['I', 'N', 'D', 'O', 'O', 'R'],
    ['M', 'E', 'D', 'I', 'U', 'M'],
    ['D', 'E', 'C', 'O', 'Y', 'S'],
    ['I', 'N', 'T', 'E', 'N', 'T'],
    ['P', 'R', 'I', 'E', 'S', 'T']
];
const ITEM_ARRAY = [
    [
        "一枚创可贴",
        "一张圆形标识。上面画了一个斜杠",
        "西藏的湖的明信片",
        "一个十字架",
        "微软的游戏主机，但是盒子不见了",
        "一幅井字棋，不过你找不到圆形的棋子了"
    ],
    [
        "一罐一氧化氮",
        "半个杯子",
        "一些数字",
        "去掉根的韭菜",
        "一个标识着绝对零度的温度计",
        "一个一直在摇头的玩偶"
    ],
    [
        "下面半边被截断的魏文帝画像",
        "半个赛尔号的助手机器人",
        "404三个数字",
        "一个感叹号",
        "一张来自俄克拉何马州的明信片",
        "一本春秋战国时期法家的著作"
    ],
    [
        "一张模拟信号图，其中一个小圆球被特别的标记了",
        "一个收音机，一直在播放“牙套妹，奈何美色……”",
        "一个乘号",
        "江苏卫视的光头主持人",
        "¬",
        "一只手，它的中指，无名指和小拇指都立了起来"
    ],
    [
        "一张王力宏在花田里的照片",
        "两个放在一起的狼牙棒，每个上面都有三根钉子，朝向两旁。",
        "函数中的未知数",
        "奥尼尔和科比的合照",
        "一面国旗，一半是黄，一半是橙，中间有条龙。",
        "挪威的国旗"
    ],
    [
        "一台机器，似乎用来拍胸片的",
        "第94号元素",
        "一幅字：“昨夜风疏雨骤……”",
        "一个写着“un”的单词卡",
        "一幅角膜塑形镜",
        "一张地图，上面标记了一些国家：“卢旺达”，“马里”，‘’埃及”"
    ]
];

function findPossibleDirection(pos) {
    let answer = [];
    if (pos.row > 0) {
        answer.push("上");
    }
    if (pos.row < 5) {
        answer.push("下");
    }
    if (pos.column > 0) {
        answer.push("左");
    }
    if (pos.column < 5) {
        answer.push("右");
    }
    return answer;
}

function findTheCorrectResponse(pos, text) {
    let reply = "";
    if (text.toLowerCase() == 'w' && pos.row > 0) {
        reply = "你往上移动了一个房间。<br>";
        pos.row -= 1;
    } else if (text.toLowerCase() == 'a' && pos.column > 0) {
        reply = "你往左移动了一个房间。<br>";
        pos.column -= 1;
    } else if (text.toLowerCase() == 's' && pos.row < 5) {
        reply = "你往下移动了一个房间。<br>";
        pos.row += 1;
    } else if (text.toLowerCase() == 'd' && pos.column < 5) {
        reply = "你往右移动了一个房间。<br>";
        pos.column += 1;
    } else {
        reply = "你不知道自己在干什么，原地晕乎乎的。";
    }

    return reply;
}

function findRoomResult(pos) {
    let scene = `你在房间的墙上看见了一个大大的"${LETTER_ARRAY[pos.row][pos.column]}"字母。\n
    你还在房间里看到了${ITEM_ARRAY[pos.row][pos.column]}。<br>`;
    let direction  = `你可以往${findPossibleDirection(pos).join("，")}方移动。`;
    return scene + direction;
}

function main(ctx, request) {
    let currentPosString = ctx.getStatus("pos");
    let currentPos = {
        row: 0,
        column: 0
    };
    if (currentPosString) {
        currentPos = JSON.parse(currentPosString);
    }
    
    let reply = "";
    if (request.text) {
        reply = findTheCorrectResponse(currentPos, request.text);
    }
    let roomResult = findRoomResult(currentPos);

    //回写pos
    ctx.setStatus("pos", JSON.stringify(currentPos));

    return {
        roomResult: roomResult,
        reply: reply
    };
}

//=======以下是JSON解析与调用脚本，一般不需要修改========
function _jsonProcessHelper(ctx) {
    let request = JSON.parse(ctx.request);
    let resBody = main(ctx, request);
    let resString = JSON.stringify(resBody);
    ctx.response(resString);
}

_jsonProcessHelper(ctx);
```


## 答案

`HOUSES`

## 解析

地图和房间内容如下：

|                         |                             |                 |             |                       |                                |
|:-----------------------:|:---------------------------:|:---------------:|:-----------:|:---------------------:|:------------------------------:|
| H 创可贴（OK绷）                   | O 圆形标识。上面画了一个斜杠             | R西藏的湖的明信片       | R十字架        | O微软的游戏主机，但是盒子不见了      | R井字棋，不过你找不到圆形的棋子了              |
| I一罐一氧化氮                 | N半个杯子                       | D一些数字           | O去掉根的韭菜     | O标识着绝对零度的温度计          | R一直在摇头的玩偶                      |
| M下面半边被截断的魏文帝画像          | E半个赛尔号的助手机器人                | D404三个数字        | I感叹号        | U俄克拉何马州的明信片           | M春秋战国时期法家的著作                   |
| D一张模拟信号图，其中一个小圆球被特别的标记了 | E一个收音机，一直在播放“牙套妹，奈何美色……”    | C乘号             | O浙江卫视的光头主持人 | Y¬                    | S手，它的中指，无名指和小拇指都立了起来           |
| I王力宏在花田里的照片             | N两个放在一起的狼牙棒，每个上面都有三根钉子，朝向两旁 | T函数中的未知数        | E奥尼尔和科比的合照  | N一面国旗，一半是黄，一半是橙，中间有条龙 | T挪威的国旗                         |
| P一台机器，似乎用来拍胸片的          | R第94号元素                     | I一幅字：“昨夜风疏雨骤……” | E写着“un”的单词卡 | S角膜塑形镜                | T地图，上面标记了一些国家：“卢旺达”，“马里”，‘’埃及” |

每个房间的物品可以对应一个表示对/错的意向

|    |    |   |    |    |    |
|:---:|:---:|:---:|:---:|:---:|:---:|
| OK | 禁  | X | +  | X  | X  |
| NO | 不  | No. | 非  | 0K | X  |
| 不  | no | x | !  | OK | 非  |
| 灯泡符号 | 错  | X | 非  | 非  | OK |
| 错  | 非  | x | OK |  不丹  | +  |
| X  | 钚  | 否 | un | OK | 非  |

提取表示正确意思房间的字母，得到答案**HOUSES**

## 提示

### 1. 我毫无头绪

试着把整个后院都给探索一遍，把大致的形状和包括的内容记下来。

### 2. 该如何提取

注意到有一些物品可以代表“OK”，有些是名称，有些是缩写，有些是字谜。每行（横向移动）仅有一个。


来源：[https://archive.cipherpuzzles.com/ccbc15/problems/1/6.yaml](https://archive.cipherpuzzles.com/ccbc15/problems/1/6.yaml)
