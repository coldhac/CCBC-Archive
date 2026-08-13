// 叶子戏（扑克谜）后端脚本

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

const PID = 45;
const IMG_POKER_BACK = "https://static.cipherpuzzles.com/static/images/716533601ecb4d9da648096cdab15456.webp"; //牌背
const IMG_POKER_CARD = [
    [
        "https://static.cipherpuzzles.com/static/images/d6198ba4f4cb4e71a15111513d525bea.webp", // Spade A
        "https://static.cipherpuzzles.com/static/images/52d8358bc1a94fd78186bb9d75251355.webp", // Spade 2
        "https://static.cipherpuzzles.com/static/images/4dcaa17624fa459e99964f34a4900cb3.webp", // Spade 3
        "https://static.cipherpuzzles.com/static/images/92c0ec4700114a5592a05fc07e64838d.webp", // Spade 4
        "https://static.cipherpuzzles.com/static/images/1b64fca82ba2405484f6c9b0fa7151c8.webp", // Spade 5
        "https://static.cipherpuzzles.com/static/images/866fe561e2fb4c8baa9a4193460eb073.webp", // Spade 6
        "https://static.cipherpuzzles.com/static/images/e81fbb3495924dcd8d81b2c1adc53514.webp", // Spade 7
        "https://static.cipherpuzzles.com/static/images/a1b3f23a9fb540b1ba1ac8e0ef35a231.webp", // Spade 8
        "https://static.cipherpuzzles.com/static/images/aeeaeb7ed311461cb1c3d65319245006.webp", // Spade 9
        "https://static.cipherpuzzles.com/static/images/28d5551dac214f10974ccb8d11a07f33.webp", // Spade 10
        "https://static.cipherpuzzles.com/static/images/1d00ea40dcdb40c3a65e7bf98f22e933.webp", // Spade J
        "https://static.cipherpuzzles.com/static/images/85c81570e01943cbbf8e93dfa863e3fe.webp", // Spade Q
        "https://static.cipherpuzzles.com/static/images/79c65aa6e128442f83670437b7e85210.webp", // Spade K
    ],
    [
        "https://static.cipherpuzzles.com/static/images/699310fd54704647b7b3f0bf9b6261ff.webp", // Heart A
        "https://static.cipherpuzzles.com/static/images/cb73cda3a0264e65b52a7e4642ed8462.webp", // Heart 2
        "https://static.cipherpuzzles.com/static/images/d9c6a94ece6f43038db7c0840c29e59d.webp", // Heart 3
        "https://static.cipherpuzzles.com/static/images/2a4e90d38ca84abba6aaf947984ab224.webp", // Heart 4
        "https://static.cipherpuzzles.com/static/images/14ee23b8523240c2957187d240c6195b.webp", // Heart 5
        "https://static.cipherpuzzles.com/static/images/98b029d157084facbe9b25ea467bc347.webp", // Heart 6
        "https://static.cipherpuzzles.com/static/images/2efe50b2d499469b9781fb96830d376d.webp", // Heart 7
        "https://static.cipherpuzzles.com/static/images/cf183b145a7342c6813cfeccffe2777a.webp", // Heart 8
        "https://static.cipherpuzzles.com/static/images/705685d66dfe44a093aaa95577c7b404.webp", // Heart 9
        "https://static.cipherpuzzles.com/static/images/46c354c2e00a40b99a5bf71bb8771009.webp", // Heart 10
        "https://static.cipherpuzzles.com/static/images/0c25952392954734a92835e99d775076.webp", // Heart J
        "https://static.cipherpuzzles.com/static/images/37b5750bc8f343fbbd76b27ea23a380d.webp", // Heart Q
        "https://static.cipherpuzzles.com/static/images/7db849712ac245419a17fea88389dc72.webp", // Heart K
    ],
    [
        "https://static.cipherpuzzles.com/static/images/1e98a5f285544b53a6b1318f7b8794f3.webp", // Club A
        "https://static.cipherpuzzles.com/static/images/1a9b803c4f5c436eb4050a7e0959f1f6.webp", // Club 2
        "https://static.cipherpuzzles.com/static/images/1bfae5a690dd4cbaab7f6aa29ef4152f.webp", // Club 3
        "https://static.cipherpuzzles.com/static/images/1a4c102852de4cff98a2d7fc06c729b8.webp", // Club 4
        "https://static.cipherpuzzles.com/static/images/f17ef9651f75412db2d0694a9a45a571.webp", // Club 5
        "https://static.cipherpuzzles.com/static/images/fd08782609a3426882728db0419956f8.webp", // Club 6
        "https://static.cipherpuzzles.com/static/images/cce3546edfa94dfaa9ac4a8290d67d39.webp", // Club 7
        "https://static.cipherpuzzles.com/static/images/7b017a3e2ca7431697231f947d5f94d7.webp", // Club 8
        "https://static.cipherpuzzles.com/static/images/bc60ad137758473fbf854db515f92daa.webp", // Club 9
        "https://static.cipherpuzzles.com/static/images/e2951f1a34804500923ed0af54087eaa.webp", // Club 10
        "https://static.cipherpuzzles.com/static/images/40e1a5d3a8b0420496ef79ba78ddfec6.webp", // Club J
        "https://static.cipherpuzzles.com/static/images/777d9f0681b84e62bdd9b55271426c41.webp", // Club Q
        "https://static.cipherpuzzles.com/static/images/36c68ef3a9674bee8f7125510facc109.webp", // Club K
    ],
    [
        "https://static.cipherpuzzles.com/static/images/e1049456a1f3423aafc60fc7a68dadfe.webp", // Diamond A
        "https://static.cipherpuzzles.com/static/images/39c447772d964e5d9f8a07e38f911f8c.webp", // Diamond 2
        "https://static.cipherpuzzles.com/static/images/159d0264bfba457b90ecbf2e6aa29c66.webp", // Diamond 3
        "https://static.cipherpuzzles.com/static/images/27faefda8c064d19b4446ae1a107bebd.webp", // Diamond 4
        "https://static.cipherpuzzles.com/static/images/4a3fb70a3a8949d8879b251587dae992.webp", // Diamond 5
        "https://static.cipherpuzzles.com/static/images/55ee6ddaff424de39c19c49b455da6b9.webp", // Diamond 6
        "https://static.cipherpuzzles.com/static/images/4c3c05ad2f29453cbd89af4e44889cca.webp", // Diamond 7
        "https://static.cipherpuzzles.com/static/images/a6c281e122e849958b7ab602f971d3c9.webp", // Diamond 8
        "https://static.cipherpuzzles.com/static/images/520e33fe2a3b415e87270a7ea83a9d77.webp", // Diamond 9
        "https://static.cipherpuzzles.com/static/images/860ad8e76ebc4292a40edae66674bacb.webp", // Diamond 10
        "https://static.cipherpuzzles.com/static/images/149f45373a3f4676bfa5f65abd3fc22b.webp", // Diamond J
        "https://static.cipherpuzzles.com/static/images/66020674720542ad9ac74c0516c9a2d7.webp", // Diamond Q
        "https://static.cipherpuzzles.com/static/images/bf7e60423c1e4761b7a7c6d35c6f37bb.webp", // Diamond K
    ],
    [
        "https://static.cipherpuzzles.com/static/images/1ea0dc867e3643578a852a6b4833cd95.webp", // Black JOKER
        "https://static.cipherpuzzles.com/static/images/37973dd342c0431db75fb934bae3019f.webp", // Red JOKER
    ]
]
const POKER_ANSWER = [
    ["李白", "二桃杀三士", "兰", "4S店", "突围", "六个核桃", "黑漆漆", "天", "杂交", "风花雪月", "逃之夭夭", "安全", "熏陶"], // Spade
    ["夏威夷", "忐忑", "忠", "缀", "三心二意", "红眼病", "必", "八心八箭", "红葡萄酒", "志", "斗", "术", "红木"], // Heart
    ["竹", "梅开二度", "梅花三弄", "菊", "大门", "梅花鹿", "杀伤力", "美眉", "移花接木", "华", "百草枯", "花甲", "早"], // Club
    ["合", "丹", "三菱", "四四方方", "毋", "体面", "俄罗斯", "囧", "药", "叶", "打比方", "大后方", "噩"], // Diamond
    ["三花聚顶", "方针"] // JOKERs
]

const CARD_NAME = ["♠️", "♥️", "♣️", "♦️"];
function getCardName(gid, cid) {
    if (gid == 4) {
        if (cid == 0) return "JOKER";
        else return "<span style=\"color: red\">JOKER</span>";
    }

    let cardNumber = (cid + 1).toString();
    if (cid == 0) cardNumber = "A";
    else if (cid == 10) cardNumber = "J";
    else if (cid == 11) cardNumber = "Q";
    else if (cid == 12) cardNumber = "K";

    return CARD_NAME[gid] + cardNumber;
}


function getZeroAnswer() {
    return [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0]
    ];
}

/**
 * @param {number[][]} finishStatus
 * @returns {number[]}
 */
function getFinishedCount(finishStatus) {
    return finishStatus.map(function(s) { 
        return s.reduce(function(m, k) {
            return (k == 1) ? (m + 1) : m;
        }, 0);
    });
}


//在这个函数中实现你的功能，ctx定义如顶部注释，request为已解析好的传入对象。
/**
 * @param {Ctx} ctx 全局上下文对象
 * @param {object} request 用户请求
 * @returns {object} response 返回给用户的数据
 */
function main(ctx, request) {
    // 扑克谜：
    // type: 1-获取题目列表 2-判题 3-增加回答次数
    // 当type=1时，没有其他参数
    // 当type=2时，额外参数  gid: 组号 / pid: 题号 / answer: 答案
    // 当type=3时，额外参数 gid: 组号 / pid: 题号
    let finishStatusString = ctx.getProgress(PID, "finishpuzzles"); 
    let finishStatus;
    if (finishStatusString) {
        finishStatus = JSON.parse(finishStatusString);
    } else {
        finishStatus = getZeroAnswer();
    }

    let waCountString = ctx.getProgress(PID, "wacount"); 
    let waCount;
    if (waCountString) {
        waCount = JSON.parse(waCountString);
    } else {
        waCount = getZeroAnswer();
    }

    let finishedCount = getFinishedCount(finishStatus);

    if (request.type == 1) {
        let puzzles = [];
        for (let group = 0; group < 4; group++) {
            let g = {
                gid: group,
                data: []
            };
            let openCard = finishedCount[group] + 3;
            for (let card = 0; card < 13; card++) {
                let status = card < openCard ? 1 : 0; // 1-显示 0-隐藏
                let p = {
                    gid: group,
                    pid: card,
                    status: status, // 1-显示 0-隐藏
                    card: status == 1 ? IMG_POKER_CARD[group][card] : IMG_POKER_BACK,
                    finished: finishStatus[group][card] == 1 ? 1 : 0,
                    answer: finishStatus[group][card] == 1 ? POKER_ANSWER[group][card] : null,
                    errorCount: waCount[group][card]
                }
                g.data.push(p);
            }
            puzzles.push(g);
        }
        //检查是否每种花色都完成了11张
        if (finishedCount[0] >= 11 && finishedCount[1] >= 11 && finishedCount[2] >= 11 && finishedCount[3] >= 11)
        {
            //展示小王
            let g = {
                gid: 4,
                data: []
            };
            let blackJoker = {
                gid: 4,
                pid: 0,
                status: 1,
                card: IMG_POKER_CARD[4][0],
                finished: finishStatus[4][0] == 1 ? 1 : 0,
                answer: finishStatus[4][0] == 1 ? POKER_ANSWER[4][0] : null,
                errorCount: waCount[4][0]
            };
            g.data.push(blackJoker);

            //判断是否可以展示大王
            if (finishStatus[4][0] == 1) {
                let redJoker = {
                    gid: 4,
                    pid: 1,
                    status: 1,
                    card: IMG_POKER_CARD[4][1],
                    finished: ctx.hasPuzzleFinished(PID) ? 1 : 0,
                    answer: ctx.hasPuzzleFinished(PID) ? POKER_ANSWER[4][1] : null,
                    errorCount: waCount[4][1]
                };
                g.data.push(redJoker);
            }

            puzzles.push(g);
        }

        return {
            puzzles: puzzles,
            isFinished: ctx.hasPuzzleFinished(PID),
        };
    } else if (request.type == 2) {
        //判题
        let group = request.gid;
        let card = request.pid;
        let answer = request.answer.trim().toUpperCase();

        if (waCount[group][card] >= 20)
        {
            ctx.addAnswerLog(ctx.uid, ctx.gid, PID, request.answer, 3, `小题 ${getCardName(group, card)}`);
            return {
                status: 3 //1-正确 2-错误 3-答题次数用尽
            }
        }

        if (answer == POKER_ANSWER[group][card]) {

            //判断是否完成整题
            if (group == 4 && card == 1) {
                ctx.makePuzzleFinished(ctx.gid, PID, "完成最终小题，整题完成！");
            } else {
                //正确
                finishStatus[group][card] = 1;
                //回写
                ctx.setProgress(PID, "finishpuzzles", JSON.stringify(finishStatus));
            }
            //添加日志
            ctx.addAnswerLog(ctx.uid, ctx.gid, PID, request.answer, 1, `小题 ${getCardName(group, card)}`);

            

            return {
                status: 1,
                finish: (group == 4 && card == 1) ? 1 : 0
            }
        } else {
            //错误
            waCount[group][card]++;
            //回写
            ctx.setProgress(PID, "wacount", JSON.stringify(waCount));
            //添加日志
            ctx.addAnswerLog(ctx.uid, ctx.gid, PID, request.answer, 2, `小题 ${getCardName(group, card)}`);

            return {
                status: 2
            }
        }
    } else if (request.type == 3) {
        //增加次数
        let group = request.gid;
        let card = request.pid;

        //尝试扣减20000信用点
        let result = ctx.costCredit(ctx.gid, 20000);
        if (result) {
            waCount[group][card] -= 20;
            ctx.setProgress(PID, "wacount", JSON.stringify(waCount));
        }

        return {
            result: result
        }
    }

    return {
        data: "???"
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