---
record_id: "ccbc16:puzzle:32"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "印刷"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/32.json"
---

# 只剩提取

## 题面

<div class="info-block custom-block show-on-mobile">
    <span class="custom-block-title">📱提示</span>
    <span>本题无移动端适配，推荐在桌面浏览器中查看。</span>
</div>
<style>
.show-on-mobile {
    display: none;
}
@media (max-width: 600px) {
    .show-on-mobile {
        display: block;
    }
}
</style>

## 交互源码

- javascript: [../../../assets/static.cipherpuzzles.com/static/images/3f5d78afb08944a1ac773cee990798ca.vue](../../../assets/static.cipherpuzzles.com/static/images/3f5d78afb08944a1ac773cee990798ca.vue)

### backend_c16-onlyextract

```text
// 只剩提取

// @ts-check

//在后端脚本中，可以使用全局变量 ctx
//全局变量 ctx 的内容如下：
// request: string; // 从前端调用时，前端传来的请求对象，内容为JSON字符串。请调用JSON.parse转换后使用。
// uid: number; // 当前调用此后端脚本的用户 uid
// username: string; //当前调用此后端脚本的用户名
// gid: number; // 当前调用此后端脚本的组队 gid
// getStatus(key: string) : string // 读取：当前用户的状态存储（注意状态信息是加密存储在每个浏览器上的，不同用户的不同进程都有不同的状态）
// setStatus(key: string, value: string) // 写入：当前用户的状态存储
// getProgress(pid: number, key: string) : string // 读取：当前组队的题目进度（组队题目进度是存在后端数据库中的，组队内部共享，每个题目有不同的状态）
// setProgress(pid: number, key: string, value: string) // 写入：当前组队的题目进度
// getStorage(key: string) : string // 读取：全局状态存储。存储在服务器后端。
// setStorage(key: string, value: string) // 写入：全局状态存储。存储在服务器后端。
// getPuzzleData(pid: number) : string // 获取题目的data片段（题目详情中<data></data>中的内容）
// costCredit(gid: number, cost: number) : boolean // 扣减组队的能量点数。返回是否扣减成功。
// response(body: string) // 返回给前端的数据对象。内容为JSON字符串。必须调用JSON.stringify后传入。**必须**在此脚本中至少调用这个函数一次，即使你没什么需要返回的，也请调用一次 ctx.response("{}");
// ===================
// 下面的是一些特殊功能用的函数。尽量少用
// getGroupName(gid: number) : string // 返回给定的GID的队伍名
// getRankAndWinner(gid: number) : { rank: number; champion: string } // 返回给定的GID的队伍的完赛排名以及冠军队伍名称 
// httpPostForm(url: string, form: object, headers: object) : string // 由后端发出HTTP POST请求，调用指定的URL。form为请求参数。

const PID = 32;
//const LEVEL_ANSWER = [0, 100, 200, 300];


//在这个函数中实现你的功能，ctx定义如顶部注释，request为已解析好的传入对象。
/**
 * @param {Ctx} ctx 全局上下文对象
 * @param {object} request 用户请求
 * @returns {object} response 返回给用户的数据
 */

const META_IMG = "../../../assets/static.cipherpuzzles.com/static/images/52b29f026bf74300b7f0c0463ccce486.webp"
const ANSWERS = ["ABECEDARIAN", "INDEX NUM", "FIRST LETTER", "CAB", "ROW", "TOT"]

function main(ctx, request) {
    // ctx.setProgress(PID, "justextract_solved", JSON.stringify([false, false, false, false, false, false]))
    

    let solved = ctx.getProgress(PID, "justextract_solved");
    let correct = false
    if (solved != null) {
        solved = JSON.parse(solved);
    } else {
        solved = [false, false, false, false, false, false]
    }

    if (request.type === 0) {
    } else if (request.type === 1) {
        let guess = request.guess.replace(/[^a-zA-Z]/g, "").toUpperCase()
        let answerKey = ANSWERS[request.puzid].replace(/[^a-zA-Z]/g, "").toUpperCase()
        // checking answer
        if (guess == answerKey) {
            solved[request.puzid] = true;
            ctx.setProgress(PID, "justextract_solved", JSON.stringify(solved))
            correct = true
        }
    }

    let ans = []
    for (let i = 0; i < 6; i++) {
        if (solved[i]) {
            ans.push(ANSWERS[i])
        } else {
            ans.push("")
        }
    }

    //将你需要返回给前端的对象return出去
    return {
        solved: solved,
        meta: [solved[0] ? META_IMG : "",
            solved[1] ? META_IMG : "",
            solved[2] ? META_IMG : "",
            solved[3] && solved[4] && solved[5] ? META_IMG : "",
        ],
        correct: correct,
        answers: ans,
    }
}

//=======以下是JSON解析与调用脚本，一般不需要修改========
/**
 * @param {Ctx} ctx 全局上下文对象
 */
function _jsonProcessHelper(ctx) {
    let request = JSON.parse(ctx.request);
    let resBody = main(ctx, request);
    let resString = JSON.stringify(resBody);
    ctx.response(resString);
}

_jsonProcessHelper(ctx);
```


## 答案

`COT`

## 解析

<style>
#answerkey {
    border-collapse: collapse;
    border-spacing: 0
}
#answerkey th {
    text-align: center;
    font-weight: bold;
    vertical-align: middle;
    padding: 3px 10px;
}
#answerkey td {
    border-style: solid none;
    border-width: thin;
    text-align: center;
    vertical-align: middle;
    padding: 3px 9px;
}
</style>

三列分别为三组题。

<h1>第一组</h1>

图片被墨水覆盖了几乎九成，上方应有的题面无法看见，只能通过下方得到答案。每个圆圈数字对应不同字母，且圆圈数字的变换会作用在对应的字母上。答案分别为自上而下分别为`CLASSICAL`，`SUBSTITUTE`，`EERIE`，`COCOON`，`ELF`，`RIDE`，`LAVA`，`KEEPER`，`YUMMY`，`NAVVY`，`OZONE`。<br>
本组META按顺序从每组提取编号对应的字母，即可得到`ABECEDARIAN`。<br>
<br>

<h1>第二组</h1>

与第一组相似，但本组提取出的均为密文，需解密得到答案。可以根据每题开头的A猜出此题使用加密。
<table id="answerkey">
<tr><th>加密</th><th>答案</th></tr>
<tr><td>电码</td><td>MAIN</td></tr>
<tr><td>二进制</td><td>PENTA</td></tr>
<tr><td>A1Z26</td><td>BADLUCK</td></tr>
<tr><td>九键</td><td>SINCE</td></tr>
<tr><td>跳舞小人</td><td>DOXXING</td></tr>
<tr><td>旗语</td><td>PUFFIN</td></tr>
<tr><td>猪圈</td><td>AUGUST</td></tr>
<tr><td>盲文</td><td>WARM UP</td></tr>
</table>

META做法同第一组，可以得到`INDEX NUM`。
<br>

<h1>第三组</h1>

本组没有墨水，看似是提取的红色圆圈数字其实就是题面，由此得到每题答案。
<table id="answerkey">
<tr><th>解法</th><th>答案</th></tr>
<tr><td>取两个数字英文的共有字母</td><td>FIRST</td></tr>
<tr><td>取颜色英文的第N个字母</td><td>LED</td></tr>
<tr><td>数字象形</td><td>HUE</td></tr>
<tr><td>数字英文均为三个字母，对角线提取</td><td>TIE</td></tr>
<tr><td>取形状英文的第N个字母</td><td>ART</td></tr>
<tr><td>数字为自然底数E的小数形式</td><td>E</td></tr>
<tr><td>数字外的圈象形</td><td>COLOUR</td></tr>
</table>

META做法同前两组，可以得到`FIRST LETTER`。

<h1>③①②</h1>

提交上述三个答案后会得到三个均写有③①②的题目。根据三个答案的提示，使用三种不同的做法，可以得到新的三个答案。最后一道③①②为META，也和前三组的META做法相同，可以得到最终答案是`COT`。
<table id="answerkey">
<tr><th>每组答案</th><th>解法</th><th>答案</th></tr>
<tr><td>ABECEDARIAN</td><td>按A1Z26转换</td><td>CAB</td></tr>
<tr><td>INDEX NUM</td><td>取THREE第三位，ONE第一位，TWO第二位</td><td>ROW</td></tr>
<tr><td>FIRST LETTER</td><td>取THREE，ONE，TWO的第一位字母</td><td>TOT</td></tr>
</table>

## 提示

### 1. 新出现的三个题不会做！

每一列的规则都是独立的。前面得到的答案提示了对应题目的具体做法。

### 2. 第一列怎么做？

每个圆圈数字对应不同字母，且圆圈数字的变换会作用在对应的字母上。举例来说，第一个答案是CLASSICAL

### 3. 第二列怎么做？

本组提取出的均为密文，需要用某种密码来解密。举例来说，第二列第一题是电码。

### 4. 第二列到底都是什么密码？

自上而下分别是电码、二进制、A1Z26、九键、跳舞小人、旗语、猪圈、盲文

### 5. 第三列第一题怎么做？

取两个数字英文的共有字母

### 6. 第三列第二题怎么做？

取颜色英文的第N个字母

### 7. 第三列第三题怎么做？

数字象形

### 8. 第三列第四题怎么做

数字英文均为三个字母，对角线提取

### 9. 第三列第五题怎么做？

取形状英文的第N个字母

### 10. 第三列第六题怎么做

数字为自然底数e的小数形式

### 11. 第三列第七题怎么做？

数字外的圈象形

### 12. 新出现的三个题的第一个怎么说也不会做！

对③①②按A1Z26转换

### 13. 新出现的三个题的第二个怎么说也不会做！

取THREE第三位，ONE第一位，TWO第二位

### 14. 新出现的三个题的第三个怎么说也不会做！

取THREE，ONE，TWO的第一位字母

### 15. 又出了新一题，不会做！

按照与先前三道小META相同的做法，从第一个答案提取③，从第二个答案提取①，从第三个答案提取②。


## 本地附件

- [07d4b8cc238e44f49179a482fa5fb4ca.webp](../../../assets/static.cipherpuzzles.com/static/images/07d4b8cc238e44f49179a482fa5fb4ca.webp)
- [0f52220a4d97464882cdc115a34f68cd.webp](../../../assets/static.cipherpuzzles.com/static/images/0f52220a4d97464882cdc115a34f68cd.webp)
- [1ba0093c881448a6b30df94bd0c0ae23.webp](../../../assets/static.cipherpuzzles.com/static/images/1ba0093c881448a6b30df94bd0c0ae23.webp)
- [261fd282c878424b9e48dfaa6f2f184a.webp](../../../assets/static.cipherpuzzles.com/static/images/261fd282c878424b9e48dfaa6f2f184a.webp)
- [2fb1ed41bfac479ba83ec1606b50367c.webp](../../../assets/static.cipherpuzzles.com/static/images/2fb1ed41bfac479ba83ec1606b50367c.webp)
- [30138e93263f49638c1d5a67c3e6f502.webp](../../../assets/static.cipherpuzzles.com/static/images/30138e93263f49638c1d5a67c3e6f502.webp)
- [3222d4d53ae64fdc9833cceb6a7639df.webp](../../../assets/static.cipherpuzzles.com/static/images/3222d4d53ae64fdc9833cceb6a7639df.webp)
- [3948cb4ee92d423badbba608e2bbf88a.webp](../../../assets/static.cipherpuzzles.com/static/images/3948cb4ee92d423badbba608e2bbf88a.webp)
- [3c16562848be4d1dbd90ca842dbaeb2d.webp](../../../assets/static.cipherpuzzles.com/static/images/3c16562848be4d1dbd90ca842dbaeb2d.webp)
- [3f5d78afb08944a1ac773cee990798ca.vue](../../../assets/static.cipherpuzzles.com/static/images/3f5d78afb08944a1ac773cee990798ca.vue)
- [485a701b8d2b43d2a5fb74148468db04.webp](../../../assets/static.cipherpuzzles.com/static/images/485a701b8d2b43d2a5fb74148468db04.webp)
- [52b29f026bf74300b7f0c0463ccce486.webp](../../../assets/static.cipherpuzzles.com/static/images/52b29f026bf74300b7f0c0463ccce486.webp)
- [5a39deed0ff547a5a6eee7441254f3b8.webp](../../../assets/static.cipherpuzzles.com/static/images/5a39deed0ff547a5a6eee7441254f3b8.webp)
- [5a60a8bddc3c46cc9c2ce27e09f9d0a7.webp](../../../assets/static.cipherpuzzles.com/static/images/5a60a8bddc3c46cc9c2ce27e09f9d0a7.webp)
- [6d2596389958478e869e4ec1d108686d.webp](../../../assets/static.cipherpuzzles.com/static/images/6d2596389958478e869e4ec1d108686d.webp)
- [73ffbb76c3d344a29b13585e94203aba.webp](../../../assets/static.cipherpuzzles.com/static/images/73ffbb76c3d344a29b13585e94203aba.webp)
- [77dc5b9c402847848d521c0a654b2943.webp](../../../assets/static.cipherpuzzles.com/static/images/77dc5b9c402847848d521c0a654b2943.webp)
- [7bee44a08c864ec7a16876cdab4b6b59.webp](../../../assets/static.cipherpuzzles.com/static/images/7bee44a08c864ec7a16876cdab4b6b59.webp)
- [7f85e42b1ec641d3ba8d482583fca4cb.webp](../../../assets/static.cipherpuzzles.com/static/images/7f85e42b1ec641d3ba8d482583fca4cb.webp)
- [859224497061470eaec8b8f133f85e78.webp](../../../assets/static.cipherpuzzles.com/static/images/859224497061470eaec8b8f133f85e78.webp)
- [8a5955703de64dc9852949bbb10e9667.webp](../../../assets/static.cipherpuzzles.com/static/images/8a5955703de64dc9852949bbb10e9667.webp)
- [9fc8f69835db42f69c2e7bf521d4ffcc.webp](../../../assets/static.cipherpuzzles.com/static/images/9fc8f69835db42f69c2e7bf521d4ffcc.webp)
- [b61d69c8eda5486b940a36d9f7671db5.webp](../../../assets/static.cipherpuzzles.com/static/images/b61d69c8eda5486b940a36d9f7671db5.webp)
- [bc0b7c32b66a4cb98e43e7230bfae9a7.webp](../../../assets/static.cipherpuzzles.com/static/images/bc0b7c32b66a4cb98e43e7230bfae9a7.webp)
- [ca78b364bd02440c8d4d3fd8d1b1c826.webp](../../../assets/static.cipherpuzzles.com/static/images/ca78b364bd02440c8d4d3fd8d1b1c826.webp)
- [d3ae5f80fc704a4bab612c4330d12cb1.webp](../../../assets/static.cipherpuzzles.com/static/images/d3ae5f80fc704a4bab612c4330d12cb1.webp)
- [d809855e49ff49508def9abf9c201f10.webp](../../../assets/static.cipherpuzzles.com/static/images/d809855e49ff49508def9abf9c201f10.webp)
- [d9d59339be864edd8c9bac74279ce207.webp](../../../assets/static.cipherpuzzles.com/static/images/d9d59339be864edd8c9bac74279ce207.webp)
- [dbc79a3696c34191b0579bd00fd8aa79.webp](../../../assets/static.cipherpuzzles.com/static/images/dbc79a3696c34191b0579bd00fd8aa79.webp)
- [e0b3a399d64540818b4b41409453808b.webp](../../../assets/static.cipherpuzzles.com/static/images/e0b3a399d64540818b4b41409453808b.webp)
- [e269412003a8476e810c9924d232b34b.webp](../../../assets/static.cipherpuzzles.com/static/images/e269412003a8476e810c9924d232b34b.webp)
- [e2b8786f57754846a6f40f7348e8e605.webp](../../../assets/static.cipherpuzzles.com/static/images/e2b8786f57754846a6f40f7348e8e605.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/32.json](https://ccbc16.cipherpuzzles.com/data/puzzles/32.json)
