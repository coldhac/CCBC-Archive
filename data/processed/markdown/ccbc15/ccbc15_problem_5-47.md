---
record_id: "ccbc15:problem:5-47"
event_id: "ccbc15"
editions: ["CCBC 15"]
year: 2024
area: "爆吧大战"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc15/problems/5/47.yaml"
---

# 打字游戏

## 题面

只打字不玩耍，聪明杰克也变傻。

## 交互源码

### vue_template

```html
<template>
    <div class="gameplay-wrapper">
        <div class="gameplay-content">
            <div v-if="page == 0" class="game-start-page">
                <div class="game-title">Typing Game</div>
                <div class="game-start"> > PRESS ENTER &lt; </div>
            </div>
            <div v-if="page == 1" class="game-playing-page">
                <div class="game-timing">{{ formatTime(timing) }}</div>
                <div class="game-main">
                    <div class="game-left">
                        <div>Previous line:</div>
                        <div>Type this line:</div>
                    </div>
                    <div class="game-right">
                        <div>{{prevLine}}</div>
                        <div>{{currLine}}</div>
                        <div>
                            <span v-for="(char, index) in inputLine" :style="{color: getInputCharColor(index)}">{{char}}</span>
                            <span class="currcursor">&nbsp;</span>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="page == 2" class="game-gameover-page">
                <div class="game-title">Game Over</div>
                <div class="game-start"> > PRESS ENTER &lt; </div>
            </div>
            <div v-if="page == 3" class="game-win-page">
                <div class="game-title">You Win!</div>
                <div class="game-info">The last line you typed was: {{prevLine}}</div>
                <div class="game-start"> > PRESS ENTER &lt; </div>
            </div>
        </div>
        <div style="height: 170px"></div>
    </div>
</template>

<style>
.gameplay-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    user-select: none;
}
.gameplay-content {
    background-color: aliceblue;
    height: 62vh;
    width: 65vw;
    font-family: Consolas, monospace, monospace;
    font-size: 22px;
    color: black;
}
.game-start-page,.game-gameover-page,.game-win-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    height: 100%;
}
.game-title {
    font-size: 60px;
}

.game-playing-page {
    display: flex;
    flex-direction: column;
    align-items: center;
}
.game-timing {
    margin-top: 60px;
}
.game-main {
    margin-top: 60px;
    display: flex;
    width: 100%;
    unicode-bidi: isolate;
    white-space: pre;
}
.game-left {
    flex: 1;
    text-align: right;
    padding-right: 20px;
}
.game-right {
    flex: 3;
}

.game-info {
    unicode-bidi: isolate;
    white-space: pre;
}

.game-left > div,.game-right > div {
    height: 33px;
}

@keyframes cursorani {
    0%, 100% {
        opacity: 1
    }
    50% {
        opacity: 0
    }
}
.currcursor {
    border-bottom: 2px solid #8a8a8a;
    animation: cursorani 1s infinite steps(1, start);
}

</style>
```

### vue_script

```text
const { ref, inject, onMounted, onBeforeUnmount, nextTick } = Vue;

export default {
    setup() {
        const page = ref(0); //0-Main 1-Gameplay 2-Gameover 3-Win
        const timing = ref(0);
        let startTime;
        let timer;
        const backend = inject("backend");

        const prevLine = ref("");
        const currLine = ref("");
        const inputLine = ref("");

        const getInputCharColor = (i) => {
            if (inputLine.value[i] == currLine.value[i]) {
                return "black";
            } else {
                return "red";
            } 
        }

        const formatTime = (second) => {
            let minutes = Math.floor(second / 60);
            let seconds = second % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        const updateTiming = () => {
            timing.value = 300 - Math.floor((Date.now() - startTime) / 1000);
            if (timing.value <= 0) {
                gameover();
            }
        }

        const onKeydown = async (e) => {
            if (page.value == 0) {
                if (e.key == "Enter") {
                    start();
                }
            } else if (page.value == 1) {
                //playing
                if ("qwertyuiop[]asdfghjkl;'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>?!@#$%^&*()_+1234567890-=`~".includes(e.key)) {
                    console.log(e.key);
                    let upperLetter = e.key.toUpperCase();
                    inputLine.value += upperLetter;
                } else if (e.key == "Backspace") {
                    inputLine.value = inputLine.value.slice(0, -1);
                } else if (e.key == " ") {
                    inputLine.value += " ";
                } else if (e.key == "Enter") {
                    if (inputLine.value == currLine.value) {
                        prevLine.value = currLine.value;
                        let data = await backend("c15-typing-game", {
                            type: 1,
                            input: inputLine.value
                        });

                        if (data.page == 3) {
                            page.value = 3;
                        } else if (data.page != 1) {
                            gameover();
                        } else {
                            currLine.value = data.text;
                            inputLine.value = "";
                        }
                    }
                } else {
                    console.log("Invalid key");
                }
            } else {
                if (e.key == "Enter") {
                    page.value = 0;
                }
            }
        }

        onMounted(() => {
            window.addEventListener('keydown', onKeydown);
        });

        onBeforeUnmount(() => {
            window.removeEventListener('keydown', onKeydown);
            clearInterval(timer);
        });

        const start = async () => {
            startTime = Date.now();
            timing.value = 300;

            let data = await backend("c15-typing-game", {
                type: 0
            });

            timer = setInterval(() => {
                updateTiming();
            }, 1000);

            page.value = data.page;
            prevLine.value = "";
            currLine.value = data.text;
            inputLine.value = "";
        }

        const gameover = () => {
            clearInterval(timer);
            page.value = 2;
        }

        return {
            page,
            timing,
            formatTime,
            prevLine,
            currLine,
            inputLine,
            getInputCharColor
        }
    }
}
```

### backend_c15-typing-game

```text
const LINES = ["ALL WORK AND NO PLAY MAKES JACK A DULL BOY",
    "ALL WORK AND NO PLAY MAKES JACK A DULL BOUV",
    "ALL WORK AND NO PLAY MAKES JACK A DULL NBUV",
    "ALL WORK AND NO PLAY MAKES JACK A DU NVNB UV",
    "ALL WORK AND NO PLAY MAKES JACK A NTNV NBUV",
    "ALL WORK AND NO PLAY MAKES JAC GHNT NVNB UV",
    "ALL WORK AND NO PLAY MAKES J TMGH NT NV NBUV",
    "ALL WORK AND NO PLAY MAKE RMTM GHNT NV NBUV",
    "ALL WORK AND NO PLAY MAB NRM TM GH NT NV NB UV",
    "ALL WORK AND NO PLAY HYBN RM TM GHNT NV NB UV",
    "ALL WORK AND NOP LTG HYBN RM TM GHNT NVNB UV",
    "ALL WORK AND NO/T GHY BNRM TMGH NTNV NB UV",
    "ALL WORK AND TM / TG HYBN RMTM GH NT NVNB UV",
    "ALL WORK AYN TM / TG HY BNRM TM GHNT NV NB UV",
    "ALL WORB MY NTM / TG HYBN RMTM GH NTNV NB UV",
    "ALL WHY BMYN TM / TG HYBN RM TM GH NTNV NB UV",
    "AL HYHY BM YN TM / TG HY BN RM TM GH NT NV NB UV",
    "HV HY HY BM YN TM / TG HY BN RM TM GH NT NV NB UV"
];


function main(ctx, request) {
    if (request.type == 0) {
        //启动
        let status = {
            line: 0,
            start: Date.now()
        };
        ctx.setStatus("c", JSON.stringify(status));

        return {
            page: 1,
            text: LINES[status.line]
        };
    } else if (request.type == 1) {
        let status = JSON.parse(ctx.getStatus("c"));
        let remain = 300 - Math.floor((Date.now() - status.start) / 1000);
        if (remain <= 0) { //时间到
            status.line = 0;
            ctx.setStatus("c", JSON.stringify(status));
            return {
                page: 2,
                text: ""
            }
        } else {
            if (request.input == LINES[status.line]) {
                status.line += 1;
                if (status.line >= LINES.length) {
                    //win
                    return {
                        page: 3,
                        text: ""
                    }
                } else {
                    ctx.setStatus("c", JSON.stringify(status));
                    return {
                        page: 1,
                        text: LINES[status.line]
                    }
                }
            } else { //这不应该发生
                return {
                    page: 2,
                    text: ""
                }
            }
        }
        
    }
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

`BOOGIE WONDERLAND`

## 解析

[解析链接](https://docs.qq.com/sheet/DR3pvenN3dGR0cEF4?tab=h8mwjz)

## 提示

### 1. 打字有什么要注意的吗？

要按正确的指法打字哦！

### 2. 该如何提取

到最后，每个字母对都对应你的食指向两种方向的移动，这提示了要用哪种古典密码提取。


来源：[https://archive.cipherpuzzles.com/ccbc15/problems/5/47.yaml](https://archive.cipherpuzzles.com/ccbc15/problems/5/47.yaml)
