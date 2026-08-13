---
record_id: "ccbc16:puzzle:45"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "造纸"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/45.json"
---

# 叶子戏

## 题面

_官方存档未提供可提取的文字题面；请查看下方附件或交互源码。_

## 交互源码

- javascript: [../../../assets/static.cipherpuzzles.com/static/images/9c64e6c1d2d14dc4adead7be46d77099.vue](../../../assets/static.cipherpuzzles.com/static/images/9c64e6c1d2d14dc4adead7be46d77099.vue)

### backend_c16-poker

```text
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
const IMG_POKER_BACK = "../../../assets/static.cipherpuzzles.com/static/images/716533601ecb4d9da648096cdab15456.webp"; //牌背
const IMG_POKER_CARD = [
    [
        "../../../assets/static.cipherpuzzles.com/static/images/d6198ba4f4cb4e71a15111513d525bea.webp", // Spade A
        "../../../assets/static.cipherpuzzles.com/static/images/52d8358bc1a94fd78186bb9d75251355.webp", // Spade 2
        "../../../assets/static.cipherpuzzles.com/static/images/4dcaa17624fa459e99964f34a4900cb3.webp", // Spade 3
        "../../../assets/static.cipherpuzzles.com/static/images/92c0ec4700114a5592a05fc07e64838d.webp", // Spade 4
        "../../../assets/static.cipherpuzzles.com/static/images/1b64fca82ba2405484f6c9b0fa7151c8.webp", // Spade 5
        "../../../assets/static.cipherpuzzles.com/static/images/866fe561e2fb4c8baa9a4193460eb073.webp", // Spade 6
        "../../../assets/static.cipherpuzzles.com/static/images/e81fbb3495924dcd8d81b2c1adc53514.webp", // Spade 7
        "../../../assets/static.cipherpuzzles.com/static/images/a1b3f23a9fb540b1ba1ac8e0ef35a231.webp", // Spade 8
        "../../../assets/static.cipherpuzzles.com/static/images/aeeaeb7ed311461cb1c3d65319245006.webp", // Spade 9
        "../../../assets/static.cipherpuzzles.com/static/images/28d5551dac214f10974ccb8d11a07f33.webp", // Spade 10
        "../../../assets/static.cipherpuzzles.com/static/images/1d00ea40dcdb40c3a65e7bf98f22e933.webp", // Spade J
        "../../../assets/static.cipherpuzzles.com/static/images/85c81570e01943cbbf8e93dfa863e3fe.webp", // Spade Q
        "../../../assets/static.cipherpuzzles.com/static/images/79c65aa6e128442f83670437b7e85210.webp", // Spade K
    ],
    [
        "../../../assets/static.cipherpuzzles.com/static/images/699310fd54704647b7b3f0bf9b6261ff.webp", // Heart A
        "../../../assets/static.cipherpuzzles.com/static/images/cb73cda3a0264e65b52a7e4642ed8462.webp", // Heart 2
        "../../../assets/static.cipherpuzzles.com/static/images/d9c6a94ece6f43038db7c0840c29e59d.webp", // Heart 3
        "../../../assets/static.cipherpuzzles.com/static/images/2a4e90d38ca84abba6aaf947984ab224.webp", // Heart 4
        "../../../assets/static.cipherpuzzles.com/static/images/14ee23b8523240c2957187d240c6195b.webp", // Heart 5
        "../../../assets/static.cipherpuzzles.com/static/images/98b029d157084facbe9b25ea467bc347.webp", // Heart 6
        "../../../assets/static.cipherpuzzles.com/static/images/2efe50b2d499469b9781fb96830d376d.webp", // Heart 7
        "../../../assets/static.cipherpuzzles.com/static/images/cf183b145a7342c6813cfeccffe2777a.webp", // Heart 8
        "../../../assets/static.cipherpuzzles.com/static/images/705685d66dfe44a093aaa95577c7b404.webp", // Heart 9
        "../../../assets/static.cipherpuzzles.com/static/images/46c354c2e00a40b99a5bf71bb8771009.webp", // Heart 10
        "../../../assets/static.cipherpuzzles.com/static/images/0c25952392954734a92835e99d775076.webp", // Heart J
        "../../../assets/static.cipherpuzzles.com/static/images/37b5750bc8f343fbbd76b27ea23a380d.webp", // Heart Q
        "../../../assets/static.cipherpuzzles.com/static/images/7db849712ac245419a17fea88389dc72.webp", // Heart K
    ],
    [
        "../../../assets/static.cipherpuzzles.com/static/images/1e98a5f285544b53a6b1318f7b8794f3.webp", // Club A
        "../../../assets/static.cipherpuzzles.com/static/images/1a9b803c4f5c436eb4050a7e0959f1f6.webp", // Club 2
        "../../../assets/static.cipherpuzzles.com/static/images/1bfae5a690dd4cbaab7f6aa29ef4152f.webp", // Club 3
        "../../../assets/static.cipherpuzzles.com/static/images/1a4c102852de4cff98a2d7fc06c729b8.webp", // Club 4
        "../../../assets/static.cipherpuzzles.com/static/images/f17ef9651f75412db2d0694a9a45a571.webp", // Club 5
        "../../../assets/static.cipherpuzzles.com/static/images/fd08782609a3426882728db0419956f8.webp", // Club 6
        "../../../assets/static.cipherpuzzles.com/static/images/cce3546edfa94dfaa9ac4a8290d67d39.webp", // Club 7
        "../../../assets/static.cipherpuzzles.com/static/images/7b017a3e2ca7431697231f947d5f94d7.webp", // Club 8
        "../../../assets/static.cipherpuzzles.com/static/images/bc60ad137758473fbf854db515f92daa.webp", // Club 9
        "../../../assets/static.cipherpuzzles.com/static/images/e2951f1a34804500923ed0af54087eaa.webp", // Club 10
        "../../../assets/static.cipherpuzzles.com/static/images/40e1a5d3a8b0420496ef79ba78ddfec6.webp", // Club J
        "../../../assets/static.cipherpuzzles.com/static/images/777d9f0681b84e62bdd9b55271426c41.webp", // Club Q
        "../../../assets/static.cipherpuzzles.com/static/images/36c68ef3a9674bee8f7125510facc109.webp", // Club K
    ],
    [
        "../../../assets/static.cipherpuzzles.com/static/images/e1049456a1f3423aafc60fc7a68dadfe.webp", // Diamond A
        "../../../assets/static.cipherpuzzles.com/static/images/39c447772d964e5d9f8a07e38f911f8c.webp", // Diamond 2
        "../../../assets/static.cipherpuzzles.com/static/images/159d0264bfba457b90ecbf2e6aa29c66.webp", // Diamond 3
        "../../../assets/static.cipherpuzzles.com/static/images/27faefda8c064d19b4446ae1a107bebd.webp", // Diamond 4
        "../../../assets/static.cipherpuzzles.com/static/images/4a3fb70a3a8949d8879b251587dae992.webp", // Diamond 5
        "../../../assets/static.cipherpuzzles.com/static/images/55ee6ddaff424de39c19c49b455da6b9.webp", // Diamond 6
        "../../../assets/static.cipherpuzzles.com/static/images/4c3c05ad2f29453cbd89af4e44889cca.webp", // Diamond 7
        "../../../assets/static.cipherpuzzles.com/static/images/a6c281e122e849958b7ab602f971d3c9.webp", // Diamond 8
        "../../../assets/static.cipherpuzzles.com/static/images/520e33fe2a3b415e87270a7ea83a9d77.webp", // Diamond 9
        "../../../assets/static.cipherpuzzles.com/static/images/860ad8e76ebc4292a40edae66674bacb.webp", // Diamond 10
        "../../../assets/static.cipherpuzzles.com/static/images/149f45373a3f4676bfa5f65abd3fc22b.webp", // Diamond J
        "../../../assets/static.cipherpuzzles.com/static/images/66020674720542ad9ac74c0516c9a2d7.webp", // Diamond Q
        "../../../assets/static.cipherpuzzles.com/static/images/bf7e60423c1e4761b7a7c6d35c6f37bb.webp", // Diamond K
    ],
    [
        "../../../assets/static.cipherpuzzles.com/static/images/1ea0dc867e3643578a852a6b4833cd95.webp", // Black JOKER
        "../../../assets/static.cipherpuzzles.com/static/images/37973dd342c0431db75fb934bae3019f.webp", // Red JOKER
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
```


## 答案

`*（无）*`

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
</style>
<table id = "answerkey">
<tr><th>牌</th><th>答案</th><th>做法</th></tr>
<tr><td>♠️A</td><td>李白</td><td>上方填入黑桃，黑对白，桃对李。</td></tr>
<tr><td>♠️2</td><td>二桃杀三士</td><td>两个桃，划掉三个士，联想即可。</td></tr>
<tr><td>♠️3</td><td>兰</td><td>除了明显被框出的三，“黑”中也含有被框出的“丷”。</td></tr>
<tr><td>♠️4</td><td>4S店</td><td>按虚线分割开在框中拼好后，空白区域是4个S。</td></tr>
<tr><td>♠️5</td><td>突围</td><td>声母不变，将韵母和声调分别移位。</td></tr>
<tr><td>♠️6</td><td>六个核桃</td><td>黑桃变为了核桃。</td></tr>
<tr><td>♠️7</td><td>黑漆漆</td><td>每三分之一对应“黑桃七”一个字，故牌面为“黑七七”。</td></tr>
<tr><td>♠️8</td><td>天</td><td>将四对黑桃连线象形。</td></tr>
<tr><td>♠️9</td><td>杂交</td><td>中间是墨-土=黑，对左上和右下进行同样操作。</td></tr>
<tr><td>♠️10</td><td>风花雪月</td><td>成语接龙：桃花流水、水中捞月、月黑风高。</td></tr>
<tr><td>♠️J</td><td>逃之夭夭</td><td>桃之幺幺谐音。</td></tr>
<tr><td>♠️Q</td><td>安全</td><td>Q代表女王，填入后象形。</td></tr>
<tr><td>♠️K</td><td>熏陶</td><td>K代表千，千+黑=熏，桃同音为陶。</td></tr>
<tr><td>♥️A</td><td>夏威夷</td><td>“红”字三部分象形为WIH，加上A组成HAWAII。</td></tr>
<tr><td>♥️2</td><td>忐忑</td><td>心+上=忐，心+下=忑。</td></tr>
<tr><td>♥️3</td><td>忠</td><td>心+中=忠。</td></tr>
<tr><td>♥️4</td><td>缀</td><td>将红桃替换为4，与底部”红桃“的“纟”组合出“缀”。</td></tr>
<tr><td>♥️5</td><td>三心二意</td><td>心+音=意，三个心两个意。</td></tr>
<tr><td>♥️6</td><td>红眼病</td><td>三行词语分别是红桃、眼花、病源。</td></tr>
<tr><td>♥️7</td><td>必</td><td>“七”与“心”重叠得到“必”。</td></tr>
<tr><td>♥️8</td><td>八心八箭</td><td>八个心八支箭，联想即可。</td></tr>
<tr><td>♥️9</td><td>红葡萄酒</td><td>红桃九中加入pu，谐音即可。</td></tr>
<tr><td>♥️10</td><td>志</td><td>十+一+心=志。</td></tr>
<tr><td>♥️J</td><td>斗</td><td>J也可被称为勾，勾心斗角。</td></tr>
<tr><td>♥️Q</td><td>术</td><td>从右至左：阿Q正传，刚正不阿，心术不正。</td></tr>
<tr><td>♥️K</td><td>红木</td><td>K代表千，K²是兆，红桃-兆=红木。</td></tr>
<tr><td>♣️A</td><td>竹</td><td>下方为松竹梅，箭头表示公母反义。</td></tr>
<tr><td>♣️2</td><td>梅开二度</td><td>ON为开，°C为度，连读即可。</td></tr>
<tr><td>♣️3</td><td>梅花三弄</td><td>梅花三+弄。</td></tr>
<tr><td>♣️4</td><td>菊</td><td>牌表示对应答案。四项分别对应梅兰竹菊。</td></tr>
<tr><td>♣️5</td><td>大门</td><td>分别是：五花大绑；五花肉；五花八门。</td></tr>
<tr><td>♣️6</td><td>梅花鹿</td><td>梅花六变为梅花陆，谐音即可。</td></tr>
<tr><td>♣️7</td><td>杀伤力</td><td>按照图示替换“梅花七”后，翻转得到答案。</td></tr>
<tr><td>♣️8</td><td>美眉</td><td>分别是：美化、梅花、话梅、画眉。</td></tr>
<tr><td>♣️9</td><td>移花接木</td><td>将MEI HUA JIU Y重排得到YI HUA JIE MU。</td></tr>
<tr><td>♣️10</td><td>华</td><td>拼接后为“草花十”，缺少部分为“华”。</td></tr>
<tr><td>♣️J</td><td>百草枯</td><td>分别是：百，草花，杰克。</td></tr>
<tr><td>♣️Q</td><td>花甲</td><td>牌面倒置了，左右两列分别填入梅花和甲乙丙丁。</td></tr>
<tr><td>♣️K</td><td>早</td><td>中间填入三叶草；下方箭头表示多加一竖。</td></tr>
<tr><td>♦️A</td><td>合</td><td>用口代替方块，左上象形得到合。</td></tr>
<tr><td>♦️2</td><td>丹</td><td>笔画重排。</td></tr>
<tr><td>♦️3</td><td>三菱</td><td>可按比例拼出三菱LOGO。</td></tr>
<tr><td>♦️4</td><td>四四方方</td><td>连读即可。</td></tr>
<tr><td>♦️5</td><td>毋</td><td>箭头表示封闭区域，需要有4个封闭区域且非矩形。</td></tr>
<tr><td>♦️6</td><td>体面</td><td>分别表示正六面体和正方体。</td></tr>
<tr><td>♦️7</td><td>俄罗斯</td><td>俄罗斯方块有七种形状。</td></tr>
<tr><td>♦️8</td><td>囧</td><td>与方块A相同，用口代替方得到囧。</td></tr>
<tr><td>♦️9</td><td>药</td><td>分别为：药方、药片、药丸。</td></tr>
<tr><td>♦️10</td><td>叶</td><td>口（方块）+十=叶。</td></tr>
<tr><td>♦️J</td><td>打比方</td><td>按比例填入虚线框即可。</td></tr>
<tr><td>♦️Q</td><td>大后方</td><td>第一字表示大小。</td></tr>
<tr><td>♦️K</td><td>噩</td><td>王+4*口=噩。</td></tr>
<tr><td>小王</td><td>三花聚顶</td><td>按每个字出现在几张牌中排序，“三”和“花”在最顶上。</td></tr>
<tr><td>大王</td><td>方针</td><td>上方是竹+合=答；下方是将黑桃A的上方与红桃A的下方拼接，得到一张新题。新题上方填入方块，下方填入指南针，由箭头提取得到方针。</td></tr>
</table>

## 提示

### 1. 调整提交次数价格



### 2. ♠️A该怎么做！

上方填入黑白，黑对白，桃对李。

### 3. ♠️2该怎么做！

两个桃，划掉三个士，联想即可。

### 4. ♠️3该怎么做！

除了明显被框出的三，“黑”中也含有被框出的“丷”。

### 5. ♠️4该怎么做！

按虚线分割开在框中拼好后，空白区域是4个S。

### 6. ♠️5该怎么做！

声母不变，将韵母和声调分别移位。

### 7. ♠️6该怎么做！

黑桃变为了核桃。

### 8. ♠️7该怎么做！

每三分之一对应“黑桃七”一个字，故牌面为“黑七七”。

### 9. ♠️8该怎么做！

将四对黑桃连线象形。

### 10. ♠️9该怎么做！

中间是墨-土=黑，对左上和右下进行同样操作。

### 11. ♠️10该怎么做！

成语接龙：桃花流水、水中捞月、月黑风高。

### 12. ♠️J该怎么做！

桃之幺幺谐音。

### 13. ♠️Q该怎么做！

Q代表女王，填入后象形。

### 14. ♠️K该怎么做！

K代表千，千+黑=熏，桃同音为陶。

### 15. ♥️A该怎么做！

“红”字三部分象形为WIH，加上A组成HAWAII。

### 16. ♥️2该怎么做！

心+上=忐，心+下=忑。

### 17. ♥️3该怎么做！

心+中=忠。

### 18. ♥️4该怎么做！

将红桃替换为4，与底部”红桃“的“纟”组合出“缀”。

### 19. ♥️5该怎么做！

心+音=意，三个心两个意。

### 20. ♥️6该怎么做！

三行词语分别是红桃、眼花、病源。

### 21. ♥️7该怎么做！

“七”与“心”重叠得到“必”。

### 22. ♥️8该怎么做！

八个心八支箭，联想即可。

### 23. ♥️9该怎么做！

红桃九中加入pu，谐音即可。

### 24. ♥️10该怎么做！

十+一+心=志。

### 25. ♥️J该怎么做！

J也可被称为勾，勾心斗角。

### 26. ♥️Q该怎么做！

从右至左：阿Q正传，刚正不阿，心术不正。

### 27. ♥️K该怎么做！

K代表千，K²是兆，红桃-兆=红木。

### 28. ♣️A该怎么做！

下方为松竹梅，箭头表示公母反义。

### 29. ♣️2该怎么做！

ON为开，°C为度，连读即可。

### 30. ♣️3该怎么做！

梅花三+弄。

### 31. ♣️4该怎么做！

牌表示对应答案。四项分别对应梅兰竹菊。

### 32. ♣️5该怎么做！

分别是：五花大绑；五花肉；五花八门。

### 33. ♣️6该怎么做！

梅花六变为梅花陆，谐音即可。

### 34. ♣️7该怎么做！

按照图示替换“梅花七”后，翻转得到答案。

### 35. ♣️8该怎么做！

分别是：美化、梅花、话梅、画眉。

### 36. ♣️9该怎么做！

将MEI HUA JIU Y重排得到YI HUA JIE MU。

### 37. ♣️10该怎么做！

拼接后为“草花十”，缺少部分为“华”。

### 38. ♣️J该怎么做！

分别是：百，草花，杰克。

### 39. ♣️Q该怎么做！

牌面倒置了，左右两列分别填入梅花和甲乙丙丁。

### 40. ♣️K该怎么做！

中间填入三叶草；下方箭头表示多加一竖。

### 41. ♦️A该怎么做！

用口代替方块，左上象形得到合。

### 42. ♦️2该怎么做！

笔画重排。

### 43. ♦️3该怎么做！

可按比例拼出三菱LOGO。

### 44. ♦️4该怎么做！

连读即可。

### 45. ♦️5该怎么做！

箭头表示封闭区域，需要有4个封闭区域且非矩形。

### 46. ♦️6该怎么做！

分别表示正六面体和正方体。

### 47. ♦️7该怎么做！

俄罗斯方块有七种形状。

### 48. ♦️8该怎么做！

与方块A相同，用口代替方得到囧。

### 49. ♦️9该怎么做！

分别为：药方、药片、药丸。

### 50. ♦️10该怎么做！

口（方块）+十=叶。

### 51. ♦️J该怎么做！

按比例填入虚线框即可。

### 52. ♦️Q该怎么做！

第一字表示大小。

### 53. ♦️K该怎么做！

王+4*口=噩。

### 54. 小王牌不会！教教！

与答案中含有这些字的牌数有关。

### 55. 大王牌不会！教教！

上方两张并排的牌就是将对应答案拼在一起；下方两张各取一半的牌是将题面各取一半拼接后作答。

拼出的牌中，上方应填的字与黑桃A、红桃A、梅花A同理；下方填中间物品的名字：其形状为圆形，内部为一双色菱形。若仍然无法看出中间物品，可以认为中间的菱形应该更窄，且将红黑看作红蓝。最后提取箭头指向的两个字。


## 中间答案

| 提交 | 回复 | 附加信息 |
| --- | --- | --- |
| 重置 | 你已经重置了本题状态 | clear |

## 本地附件

- [0c25952392954734a92835e99d775076.webp](../../../assets/static.cipherpuzzles.com/static/images/0c25952392954734a92835e99d775076.webp)
- [149f45373a3f4676bfa5f65abd3fc22b.webp](../../../assets/static.cipherpuzzles.com/static/images/149f45373a3f4676bfa5f65abd3fc22b.webp)
- [14ee23b8523240c2957187d240c6195b.webp](../../../assets/static.cipherpuzzles.com/static/images/14ee23b8523240c2957187d240c6195b.webp)
- [159d0264bfba457b90ecbf2e6aa29c66.webp](../../../assets/static.cipherpuzzles.com/static/images/159d0264bfba457b90ecbf2e6aa29c66.webp)
- [1a4c102852de4cff98a2d7fc06c729b8.webp](../../../assets/static.cipherpuzzles.com/static/images/1a4c102852de4cff98a2d7fc06c729b8.webp)
- [1a9b803c4f5c436eb4050a7e0959f1f6.webp](../../../assets/static.cipherpuzzles.com/static/images/1a9b803c4f5c436eb4050a7e0959f1f6.webp)
- [1b64fca82ba2405484f6c9b0fa7151c8.webp](../../../assets/static.cipherpuzzles.com/static/images/1b64fca82ba2405484f6c9b0fa7151c8.webp)
- [1bfae5a690dd4cbaab7f6aa29ef4152f.webp](../../../assets/static.cipherpuzzles.com/static/images/1bfae5a690dd4cbaab7f6aa29ef4152f.webp)
- [1d00ea40dcdb40c3a65e7bf98f22e933.webp](../../../assets/static.cipherpuzzles.com/static/images/1d00ea40dcdb40c3a65e7bf98f22e933.webp)
- [1e98a5f285544b53a6b1318f7b8794f3.webp](../../../assets/static.cipherpuzzles.com/static/images/1e98a5f285544b53a6b1318f7b8794f3.webp)
- [1ea0dc867e3643578a852a6b4833cd95.webp](../../../assets/static.cipherpuzzles.com/static/images/1ea0dc867e3643578a852a6b4833cd95.webp)
- [27faefda8c064d19b4446ae1a107bebd.webp](../../../assets/static.cipherpuzzles.com/static/images/27faefda8c064d19b4446ae1a107bebd.webp)
- [28d5551dac214f10974ccb8d11a07f33.webp](../../../assets/static.cipherpuzzles.com/static/images/28d5551dac214f10974ccb8d11a07f33.webp)
- [2a4e90d38ca84abba6aaf947984ab224.webp](../../../assets/static.cipherpuzzles.com/static/images/2a4e90d38ca84abba6aaf947984ab224.webp)
- [2efe50b2d499469b9781fb96830d376d.webp](../../../assets/static.cipherpuzzles.com/static/images/2efe50b2d499469b9781fb96830d376d.webp)
- [36c68ef3a9674bee8f7125510facc109.webp](../../../assets/static.cipherpuzzles.com/static/images/36c68ef3a9674bee8f7125510facc109.webp)
- [37973dd342c0431db75fb934bae3019f.webp](../../../assets/static.cipherpuzzles.com/static/images/37973dd342c0431db75fb934bae3019f.webp)
- [37b5750bc8f343fbbd76b27ea23a380d.webp](../../../assets/static.cipherpuzzles.com/static/images/37b5750bc8f343fbbd76b27ea23a380d.webp)
- [39c447772d964e5d9f8a07e38f911f8c.webp](../../../assets/static.cipherpuzzles.com/static/images/39c447772d964e5d9f8a07e38f911f8c.webp)
- [40e1a5d3a8b0420496ef79ba78ddfec6.webp](../../../assets/static.cipherpuzzles.com/static/images/40e1a5d3a8b0420496ef79ba78ddfec6.webp)
- [460d684a12ef47228e003d6fa930c6c7.webp](../../../assets/static.cipherpuzzles.com/static/images/460d684a12ef47228e003d6fa930c6c7.webp)
- [46c354c2e00a40b99a5bf71bb8771009.webp](../../../assets/static.cipherpuzzles.com/static/images/46c354c2e00a40b99a5bf71bb8771009.webp)
- [4a3fb70a3a8949d8879b251587dae992.webp](../../../assets/static.cipherpuzzles.com/static/images/4a3fb70a3a8949d8879b251587dae992.webp)
- [4c3c05ad2f29453cbd89af4e44889cca.webp](../../../assets/static.cipherpuzzles.com/static/images/4c3c05ad2f29453cbd89af4e44889cca.webp)
- [4dcaa17624fa459e99964f34a4900cb3.webp](../../../assets/static.cipherpuzzles.com/static/images/4dcaa17624fa459e99964f34a4900cb3.webp)
- [520e33fe2a3b415e87270a7ea83a9d77.webp](../../../assets/static.cipherpuzzles.com/static/images/520e33fe2a3b415e87270a7ea83a9d77.webp)
- [52d8358bc1a94fd78186bb9d75251355.webp](../../../assets/static.cipherpuzzles.com/static/images/52d8358bc1a94fd78186bb9d75251355.webp)
- [55ee6ddaff424de39c19c49b455da6b9.webp](../../../assets/static.cipherpuzzles.com/static/images/55ee6ddaff424de39c19c49b455da6b9.webp)
- [66020674720542ad9ac74c0516c9a2d7.webp](../../../assets/static.cipherpuzzles.com/static/images/66020674720542ad9ac74c0516c9a2d7.webp)
- [699310fd54704647b7b3f0bf9b6261ff.webp](../../../assets/static.cipherpuzzles.com/static/images/699310fd54704647b7b3f0bf9b6261ff.webp)
- [705685d66dfe44a093aaa95577c7b404.webp](../../../assets/static.cipherpuzzles.com/static/images/705685d66dfe44a093aaa95577c7b404.webp)
- [716533601ecb4d9da648096cdab15456.webp](../../../assets/static.cipherpuzzles.com/static/images/716533601ecb4d9da648096cdab15456.webp)
- [777d9f0681b84e62bdd9b55271426c41.webp](../../../assets/static.cipherpuzzles.com/static/images/777d9f0681b84e62bdd9b55271426c41.webp)
- [79c65aa6e128442f83670437b7e85210.webp](../../../assets/static.cipherpuzzles.com/static/images/79c65aa6e128442f83670437b7e85210.webp)
- [7b017a3e2ca7431697231f947d5f94d7.webp](../../../assets/static.cipherpuzzles.com/static/images/7b017a3e2ca7431697231f947d5f94d7.webp)
- [7db849712ac245419a17fea88389dc72.webp](../../../assets/static.cipherpuzzles.com/static/images/7db849712ac245419a17fea88389dc72.webp)
- [85c81570e01943cbbf8e93dfa863e3fe.webp](../../../assets/static.cipherpuzzles.com/static/images/85c81570e01943cbbf8e93dfa863e3fe.webp)
- [860ad8e76ebc4292a40edae66674bacb.webp](../../../assets/static.cipherpuzzles.com/static/images/860ad8e76ebc4292a40edae66674bacb.webp)
- [866fe561e2fb4c8baa9a4193460eb073.webp](../../../assets/static.cipherpuzzles.com/static/images/866fe561e2fb4c8baa9a4193460eb073.webp)
- [92c0ec4700114a5592a05fc07e64838d.webp](../../../assets/static.cipherpuzzles.com/static/images/92c0ec4700114a5592a05fc07e64838d.webp)
- [98b029d157084facbe9b25ea467bc347.webp](../../../assets/static.cipherpuzzles.com/static/images/98b029d157084facbe9b25ea467bc347.webp)
- [9c64e6c1d2d14dc4adead7be46d77099.vue](../../../assets/static.cipherpuzzles.com/static/images/9c64e6c1d2d14dc4adead7be46d77099.vue)
- [a1b3f23a9fb540b1ba1ac8e0ef35a231.webp](../../../assets/static.cipherpuzzles.com/static/images/a1b3f23a9fb540b1ba1ac8e0ef35a231.webp)
- [a6c281e122e849958b7ab602f971d3c9.webp](../../../assets/static.cipherpuzzles.com/static/images/a6c281e122e849958b7ab602f971d3c9.webp)
- [aeeaeb7ed311461cb1c3d65319245006.webp](../../../assets/static.cipherpuzzles.com/static/images/aeeaeb7ed311461cb1c3d65319245006.webp)
- [bc60ad137758473fbf854db515f92daa.webp](../../../assets/static.cipherpuzzles.com/static/images/bc60ad137758473fbf854db515f92daa.webp)
- [bf7e60423c1e4761b7a7c6d35c6f37bb.webp](../../../assets/static.cipherpuzzles.com/static/images/bf7e60423c1e4761b7a7c6d35c6f37bb.webp)
- [cb73cda3a0264e65b52a7e4642ed8462.webp](../../../assets/static.cipherpuzzles.com/static/images/cb73cda3a0264e65b52a7e4642ed8462.webp)
- [cce3546edfa94dfaa9ac4a8290d67d39.webp](../../../assets/static.cipherpuzzles.com/static/images/cce3546edfa94dfaa9ac4a8290d67d39.webp)
- [cf183b145a7342c6813cfeccffe2777a.webp](../../../assets/static.cipherpuzzles.com/static/images/cf183b145a7342c6813cfeccffe2777a.webp)
- [d6198ba4f4cb4e71a15111513d525bea.webp](../../../assets/static.cipherpuzzles.com/static/images/d6198ba4f4cb4e71a15111513d525bea.webp)
- [d9c6a94ece6f43038db7c0840c29e59d.webp](../../../assets/static.cipherpuzzles.com/static/images/d9c6a94ece6f43038db7c0840c29e59d.webp)
- [e1049456a1f3423aafc60fc7a68dadfe.webp](../../../assets/static.cipherpuzzles.com/static/images/e1049456a1f3423aafc60fc7a68dadfe.webp)
- [e2951f1a34804500923ed0af54087eaa.webp](../../../assets/static.cipherpuzzles.com/static/images/e2951f1a34804500923ed0af54087eaa.webp)
- [e81fbb3495924dcd8d81b2c1adc53514.webp](../../../assets/static.cipherpuzzles.com/static/images/e81fbb3495924dcd8d81b2c1adc53514.webp)
- [f17ef9651f75412db2d0694a9a45a571.webp](../../../assets/static.cipherpuzzles.com/static/images/f17ef9651f75412db2d0694a9a45a571.webp)
- [fd08782609a3426882728db0419956f8.webp](../../../assets/static.cipherpuzzles.com/static/images/fd08782609a3426882728db0419956f8.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/45.json](https://ccbc16.cipherpuzzles.com/data/puzzles/45.json)
