---
record_id: "ccbc16:puzzle:55"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "终章"
kind: "final_meta"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/55.json"
---

# 最后的谜题

## 题面

<div  class="error-block custom-block">
<span class="custom-block-title">提示</span>
<span>如果题目面板卡在“处理中……”难以恢复。可以尝试按下 Ctrl + M 并在弹出的控制条中单击“判定”按钮，即可自行恢复。若仍没有恢复请及时通过站内信联系出题组。</span>
</div>

四棵树苗的能量汇聚在一起，居然又出现了第五棵树苗！它屹立在晶化土壤的中心，晶莹的枝叶流光溢彩，像是星云的精华凝聚而成。它给@{##u##}一种熟悉的感觉，仿佛早在最初的最初，它就在这里了。原来这四个纪念品是四大科学家留给@{##u##}的锦囊！借助量子云的力量保存了记忆的切片，@{##ta##}可以看到下一代能源设备建造时的场景，并和当时的四大科学家精神交流。@{##u##}知道，@{##ta##}必须先搞懂这四个锦囊的意义，才能帮助@{##ta##}解决最后的谜题。

## 交互源码

- javascript: [../../../assets/static.cipherpuzzles.com/static/images/95b6c54b0cab44a8aadc3737b85dd2f2.vue](../../../assets/static.cipherpuzzles.com/static/images/95b6c54b0cab44a8aadc3737b85dd2f2.vue)

### backend_c16-finalmeta

```text
// Final Meta

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

const PID = 55;
const PUZZLE_PIDS = [51, 52, 53, 54];
const MESSAGE = "你解出了谜题，那句决定一切的谜底早已到了眼前。它就是：";
const WORDS = ["中心思想", "子虚乌有", "黄金比例", "自树一帜"];
const CHAR_MAP = {
  "中": {stroke: 4, pinyin: "zhong", tone: 1},
  "心": {stroke: 4, pinyin: "xin", tone: 1},
  "思": {stroke: 9, pinyin: "si", tone: 1},
  "想": {stroke: 13, pinyin: "xiang", tone: 3},
  "子": {stroke: 3, pinyin: "zi", tone: 3},
  "虚": {stroke: 11, pinyin: "xu", tone: 1},
  "乌": {stroke: 4, pinyin: "wu", tone: 1},
  "有": {stroke: 6, pinyin: "you", tone: 3},
  "自": {stroke: 6, pinyin: "zi", tone: 4},
  "树": {stroke: 9, pinyin: "shu", tone: 4},
  "一": {stroke: 1, pinyin: "yi", tone: 1},
  "帜": {stroke: 8, pinyin: "zhi", tone: 4},
  "黄": {stroke: 11, pinyin: "huang", tone: 2},
  "金": {stroke: 8, pinyin: "jin", tone: 1},
  "比": {stroke: 4, pinyin: "bi", tone: 3},
  "例": {stroke: 8, pinyin: "li", tone: 4}
}

function check1(input) {
    let resultStatus = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; // 0: 错误, 1: 正确, 2: 未判定, 3: 无效
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (input[i][j] === "?") {
                resultStatus[i][j] = 2; // 未判定
            }
            for (let k = 0; k < 4; k++) {
                // 递归检查每个词的第一个字，如果第一个字匹配，就继续检查下一个字，
                // 直到整个词语都匹配之后，将整个路径一起标为1
                if (check1Helper(input, resultStatus, i, j, k, 0)) {
                    resultStatus[i][j] = 1;
                    break;
                }
            }
        }
    }

    // 所有位置都被正确标记为1，才认为结果为真
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (resultStatus[i][j] !== 1) {
                return {
                    result: false,
                    status: resultStatus
                }
            }
        }
    }

    return {
        result: true,
        status: resultStatus
    }
}

function check1Helper(input, resultStatus, i, j, wordIndex, charIndex) {
    if (charIndex >= 4) {
        return true;
    }

    if (input[i][j] !== WORDS[wordIndex][charIndex]) {
        return false;
    }

    // 上
    if (j - 1 >= 0) {
        if (check1Helper(input, resultStatus, i, j - 1, wordIndex, charIndex + 1)) {
            resultStatus[i][j] = 1;
            return true;
        }
    }
    // 下
    if (j + 1 < 4) {
        if (check1Helper(input, resultStatus, i, j + 1, wordIndex, charIndex + 1)) {
            resultStatus[i][j] = 1;
            return true;
        }
    }
    // 左
    if (i - 1 >= 0) {
        if (check1Helper(input, resultStatus, i - 1, j, wordIndex, charIndex + 1)) {
            resultStatus[i][j] = 1;
            return true;
        }
    }
    // 右
    if (i + 1 < 4) {
        if (check1Helper(input, resultStatus, i + 1, j, wordIndex, charIndex + 1)) {
            resultStatus[i][j] = 1;
            return true;
        }
    }

    return false;
}

function check2(input) {
    let result = true;
    let resultStatus = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; // 0: 错误, 1: 正确, 2: 未判定, 3: 无效
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i === j || i + j === 3) {
                // 只有主对角线或副对角线上的才进行判定
                if (CHAR_MAP[input[i][j]]) {
                    let good = (CHAR_MAP[input[i][j]].stroke % 2 === 1) === (i === j); // 奇数笔画在主对角线，偶数笔画在副对角线
                    if (good) {
                        resultStatus[i][j] = 1; // 正确
                    } else {
                        resultStatus[i][j] = 0; // 错误
                        result = false;
                    }
                } else {
                    resultStatus[i][j] = 2; // 没有对应的字符
                    result = false;
                }
            } else {
                resultStatus[i][j] = 3; // 无效
            }
        }
    }

    return {
        result,
        status: resultStatus
    }
}

function check3(input) {
    let result = true;
    let resultStatus = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; // 0: 错误, 1: 正确, 2: 未判定, 3: 无效

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i + j === 3) {
                resultStatus[i][j] = 3; // 无效
            } else {
                if (CHAR_MAP[input[i][j]] && CHAR_MAP[input[3 - j][3 - i]]) {
                    if (CHAR_MAP[input[i][j]].pinyin.length === CHAR_MAP[input[3 - j][3 - i]].pinyin.length) {
                        resultStatus[i][j] = 1; // 正确
                    } else {
                        resultStatus[i][j] = 0; // 错误
                        result = false;
                    }
                } else if (input[i][j] === "?") {
                    resultStatus[i][j] = 2; // 未判定
                    result = false;
                } else {
                    resultStatus[i][j] = 0; // 无效
                    result = false;
                }
            }
        }
    }

    return {
        result,
        status: resultStatus
    }
}

function check4(input) {
    let result = true;
    let resultStatus = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; // 0: 错误, 1: 正确, 2: 未判定, 3: 无效

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i !== 2) {
                resultStatus[i][j] = 3; // 无效
            } else {
                if (CHAR_MAP[input[i][j]]) {
                    if (CHAR_MAP[input[i][j]].tone === 1) {
                        resultStatus[i][j] = 1; // 正确
                    } else {
                        resultStatus[i][j] = 0; // 错误
                        result = false;
                    }
                } else if (input[i][j] === "?") {
                    resultStatus[i][j] = 2; // 未判定
                    result = false;
                } else {
                    resultStatus[i][j] = 0; // 无效
                    result = false;
                }
            }
        }
    }

    return {
        result,
        status: resultStatus
    }
}



//在这个函数中实现你的功能，ctx定义如顶部注释，request为已解析好的传入对象。
/**
 * @param {Ctx} ctx 全局上下文对象
 * @param {object} request 用户请求
 * @returns {object} response 返回给用户的数据
 */
function main(ctx, request) {
    if (request.type === 1) {
        let defaultString = "";
        for (let i = 0; i < 4; i++) {
            let pid = PUZZLE_PIDS[i];
            if (ctx.hasPuzzleFinished(pid)) {
                defaultString += WORDS[i];
            } else {
                defaultString += "????";
            }
        }

        return {
            data: defaultString
        }
    } else if (request.type === 2) {
        let inputString = request.answer;

        let input = [];
        for (let i = 0; i < 4; i++) {
            input[i] = [];
            for (let j = 0; j < 4; j++) {
                let char = inputString[i * 4 + j];
                if ((!CHAR_MAP[char]) && (char !== "?")) {
                    return {
                        error: "出现未知错误"
                    }
                }
                input[i][j] = char;
            }
        }

        let r1 = check1(input);
        let r2 = check2(input);
        let r3 = check3(input);
        let r4 = check4(input);

        let rs = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                rs[i * 4 + j] += r1.status[i][j];
                rs[i * 4 + j] += r2.status[i][j];
                rs[i * 4 + j] += r3.status[i][j];
                rs[i * 4 + j] += r4.status[i][j];
            }
        }

        let result = r1.result && r2.result && r3.result && r4.result;
        return {
            result: result,
            status: rs,
            message: result ? MESSAGE : undefined
        };
    }
    
    return {
        error: "type error"
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


## 解题后内容

<a type="button" class="el-button el-button--primary el-button--large finalbutton" href="/article/finalend">前往结局 →</a>
<style>
.finalbutton {
    text-decoration: none;
}
</style>

## 答案

`树中自有黄金乌`

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
    vertical-align: middle;
    padding: 3px 9px;
}
.fm-table {
    border-collapse: collapse;
    margin: 0 30px 0 0;
}
.fm-table td {
    text-align: center;
    width: 30px;
    height: 30px;
    border: 1px solid;
    /* color: black */
}
</style>

本题使用四道树题答案如下。
<table id="answerkey">
<tr><th>树</th><th>答案</th></tr>
<tr><td>指南树</td><td>中心思想</td></tr>
<tr><td>印刷树</td><td>子虚乌有</td></tr>
<tr><td>火药树</td><td>黄金比例</td></tr>
<tr><td>造纸树</td><td>自树一帜</td></tr>
</table>

本题是一个小游戏，要求排列这16个字，使得所有灯都被点亮。根据例子并经过尝试，可以推出每个灯的规则：
<table id="answerkey">
<tr><th>灯位置</th><th>规则</th></tr>
<tr><td>1</td><td>每个答案的四个字需要能够在网格中连续读出（四连通，可以转弯）。</td></tr>
<tr><td>2</td><td>对角线上的字笔画数都是奇数，反对角线上的字笔画数都是偶数。</td></tr>
<tr><td>3</td><td>拼音长度沿反对角线对称。</td></tr>
<tr><td>4</td><td>第三行所有字都是一声。</td></tr>
</table>

根据这些规则，可以尝试或逻辑推导得到唯一的正确排布方式：

<table class="fm-table">
    <tr>
        <td>想</td>
        <td>树</td>
        <td>自</td>
        <td>例</td>
    </tr>
    <tr>
        <td>思</td>
        <td>一</td>
        <td>帜</td>
        <td>比</td>
    </tr>
    <tr>
        <td>心</td>
        <td>乌</td>
        <td>虚</td>
        <td>金</td>
    </tr>
    <tr>
        <td>中</td>
        <td>有</td>
        <td>子</td>
        <td>黄</td>
    </tr>
</table>

最后，注意到 CCBC16 Logo 中有一个 4x4 的网格，按照 16 标出的笔画顺序读相应位置的字，得到最终答案「树中自有黄金乌」。

## 提示

### 1. 第一盏灯的规则

每个答案的四个字需要能够在网格中连续读出（四连通，可以转弯）。

### 2. 第二盏灯的规则

对角线上的字笔画数都是奇数，反对角线上的字笔画数都是偶数。

### 3. 第三盏灯的规则

拼音长度沿反对角线对称。

### 4. 第四盏灯的规则

第三行所有字都是一声。

### 5. 该如何提取

注意 CCBC16 的 logo。


## 本地附件

- [95b6c54b0cab44a8aadc3737b85dd2f2.vue](../../../assets/static.cipherpuzzles.com/static/images/95b6c54b0cab44a8aadc3737b85dd2f2.vue)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/55.json](https://ccbc16.cipherpuzzles.com/data/puzzles/55.json)
