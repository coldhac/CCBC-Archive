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

const META_IMG = "https://static.cipherpuzzles.com/static/images/52b29f026bf74300b7f0c0463ccce486.webp"
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