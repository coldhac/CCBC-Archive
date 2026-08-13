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