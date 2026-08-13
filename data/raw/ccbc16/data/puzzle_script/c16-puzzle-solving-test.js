// 2025解谜能力测试后端

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

const PID = 47;
const EX_IMG = "https://static.cipherpuzzles.com/static/images/3f33e27aea514e618b12c535874c8e66.webp";

const PUZZLES = [
    {id: 1, type: "normal", answer: "RYE", score: 2},
    {id: 2, type: "normal", answer: "MOUSE", score: 2},
    {id: 3, type: "normal", answer: "权衡", score: 1},
    {id: 4, type: "normal", answer: "大食", score: 2},
    {id: 5, type: "normal", answer: "IRAN", score: 2},
    {id: 6, type: "normal", answer: "贝多芬", score: 1},
    {id: 7, type: "selection", choices: "无从将反", answer: "反", score: 1},
    {id: 8, type: "normal", answer: "阿曼", score: 3},
    {id: 9, type: "normal", answer: "道德", score: 2},
    {id: 10, type: "normal", answer: "OZONE", score: 1},
    {id: 11, type: "normal", answer: "EIGHT", score: 1},
    {id: 12, type: "normal", answer: "肮脏", score: 1},
    {id: 13, type: "normal", answer: "EGOIST", score: 2},
    {id: 14, type: "normal", answer: "SCAR", score: 1},
    {id: 15, type: "selection", choices: "力式网总", answer: "式", score: 2},
    {id: 16, type: "normal", answer: "SELF", score: 1},
    {id: 17, type: "normal", answer: "ACID", score: 2},
    {id: 18, type: "normal", answer: "SKETCH", score: 1},
    {id: 19, type: "normal", answer: "BYE", score: 2},
    {id: 20, type: "normal", answer: "SON", score: 2},
    {id: 21, type: "normal", answer: "户口本", score: 2},
    {id: 22, type: "normal", answer: "ARM", score: 2},
    {id: 23, type: "normal", answer: "SCALE", score: 1},
    {id: 24, type: "normal", answer: "张家口", score: 3},
    {id: 25, type: "normal", answer: "MOUTH", score: 1},
    {id: 26, type: "selection", choices: "分合异同", answer: "异", score: 1},
    {id: 27, type: "normal", answer: "阿昌族", score: 2},
    {id: 28, type: "normal", answer: "测度", score: 1},
    {id: 29, type: "normal", answer: "ASSERT", score: 2},
    {id: 30, type: "normal", answer: "HALF", score: 2},
    {id: 31, type: "normal", answer: "ONE", score: 2},
    {id: 32, type: "normal", answer: "IDEA", score: 1},
    {id: 33, type: "normal", answer: "EGG", score: 1},
    {id: 34, type: "normal", answer: "MESH", score: 4},
    {id: 35, type: "normal", answer: "ETHIC", score: 2},
    {id: 36, type: "normal", answer: "恶语中伤", score: 2},
    {id: 37, type: "selection", choices: "平面结构", answer: "构", score: 1},
    {id: 38, type: "normal", answer: "TUNED", score: 3},
    {id: 39, type: "normal", answer: "FRIGHTEN", score: 3},
    {id: 40, type: "normal", answer: "OFTEN", score: 2},
    {id: 41, type: "selection", choices: "切胡体方", answer: "体", score: 2},
    {id: 42, type: "normal", answer: "SNOW", score: 2},
    {id: 43, type: "normal", answer: "马六甲", score: 2},
    {id: 44, type: "normal", answer: "CLOSE", score: 4},
    {id: 45, type: "normal", answer: "行", score: 2},
    {id: 46, type: "normal", answer: "AND", score: 2},
    {id: 47, type: "normal", answer: "ASSET", score: 2},
    {id: 48, type: "normal", answer: "鄂温克族", score: 4},
    {id: 49, type: "normal", answer: "CENT", score: 5},
    {id: 50, type: "normal", answer: "TRANS ISOMER", score: 5}
];

/**
 * @param {string} answer
 */
function answerize(answer) {
    return answer
        .trim()
        .toUpperCase()                  // Convert to uppercase
        .replace(/[-\s\u200C\u200B\uFEFF]/g, '');         // Remove all whitespaces and hyphens
}

/**
 * @param {string[]} answer
 */
function getScore(answer) {
    let score = 0;
    let selections = "";
    for (let i = 0; i < PUZZLES.length; i++) {
        let user_answer = answer[i] || "";
        if (PUZZLES[i].type === "selection") {
            if (["1", "2", "3", "4"].includes(user_answer)) {
                user_answer = PUZZLES[i].choices[parseInt(user_answer) - 1];
                selections += user_answer;
            }
        }

        if (answerize(PUZZLES[i].answer) === answerize(user_answer)) {
            score += PUZZLES[i].score;
        }
    }

    if (selections === "将总分平方") {
        score *= score;
    }

    return score;
}



//在这个函数中实现你的功能，ctx定义如顶部注释，request为已解析好的传入对象。
/**
 * @param {Ctx} ctx 全局上下文对象
 * @param {object} request 用户请求
 * @returns {object} response 返回给用户的数据
 */
function main(ctx, request) {
    let ex = ctx.getProgress(PID, "openEx");

    if (request.type == 1) {
        return {
            ex: ex == "1" ? EX_IMG : undefined
        };
    }

    let stKey = `c16-puzzle-solving-test:lastSubmit:gid_${ctx.gid}`;

    let lastSubmitStr = ctx.getStorage(stKey);
    let lastSubmit = parseInt(lastSubmitStr);
    let now = Date.now();
    if (now - lastSubmit <= 60000) {
        return {
            score: "-1",
            message: "请不要过于频繁的交卷"
        }
    }
    ctx.setStorage(stKey, now.toString());

    // 判题流程
    let openEx = false;
    let score = getScore(request.answer);
    if (score >= 7000) {
        ctx.makePuzzleFinished(ctx.gid, PID, "恭喜你达到目标分数，通过本题！");
    } else {
        if (answerize(request.answer[49] || "") == answerize("TRANS ISOMER")) {
            openEx = true;
            ctx.setProgress(PID, "openEx", "1");
        }
    }

    ctx.addAnswerLog(ctx.uid, ctx.gid, PID, "", 8, `本次成绩: ${score}${(openEx ? " EX开放" : "")}`);

    return {
        score: score,
        ex: openEx ? EX_IMG : undefined
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