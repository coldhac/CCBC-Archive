// 三字谜后端脚本

// @ts-check

const PID = 46;
const TRIDDLES = [
    {
        levels: [
            { id: 0, gram: "输入解", ans: "解|日" },
        ],
        next: "all"
    },
    {
        levels: [
            { id: 1, gram: "同心结", ans: "心结" },
            { id: 2, gram: "反光灯", ans: "灯光" },
            { id: 3, gram: "非非法", ans: "合法" },
            { id: 4, gram: "非非师", ans: "死|熟" },
            { id: 5, gram: "谐麋鹿", ans: "迷路" },
            { id: 6, gram: "倒宜家", ans: "埃及" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 7, gram: "星星星", ans: "三星" },
            { id: 8, gram: "心用用", ans: "一心二用" },
            { id: 9, gram: "狡𠓗窟", ans: "狡兔三窟" },
            { id: 10, gram: "面面刕", ans: "两面三刀" },
            { id: 11, gram: "事事工", ans: "事倍功半" },
            { id: 12, gram: "数数数", ans: "数一数二" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 13, gram: "梅兰竹", ans: "菊" },
            { id: 14, gram: "北大太", ans: "印" },
            { id: 15, gram: "西红水", ans: "三" },
            { id: 16, gram: "东黄南", ans: "渤" },
            { id: 17, gram: "强引弱", ans: "电磁" },
            { id: 18, gram: "固液气", ans: "等离子" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 19, gram: "地不熟", ans: "人生" },
            { id: 20, gram: "海知己", ans: "内存" },
            { id: 21, gram: "1三秋", ans: "落叶|一" },
            { id: 22, gram: "门闻吠", ans: "柴犬" },
            { id: 23, gram: "空白狼", ans: "手套" },
            { id: 24, gram: "成不恨", ans: "钢铁" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 25, gram: "一顺风", ans: "一路顺风", extra: "答成语" },
            { id: 26, gram: "一风顺", ans: "一帆风顺", extra: "答成语" },
            { id: 27, gram: "为非作", ans: "为非作歹", extra: "答成语" },
            { id: 28, gram: "作非为", ans: "胡作非为", extra: "答成语" },
            { id: 29, gram: "说不二", ans: "说一不二", extra: "答成语" },
            { id: 30, gram: "二不说", ans: "二话不说", extra: "答成语" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 31, gram: "椿榎楸", ans: "柊" },
            { id: 32, gram: "离未罔", ans: "两" },
            { id: 33, gram: "氭煵㘳", ans: "洒" },
            { id: 34, gram: "脌昐时", ans: "秒" },
            { id: 35, gram: "艮同失", ans: "易" },
            { id: 36, gram: "三三四", ans: "五" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 37, gram: "目田四", ans: "园" },
            { id: 38, gram: "仱仮仪", ans: "估|借" },
            { id: 39, gram: "椎冋乂", ans: "幻" },
            { id: 40, gram: "都本日", ans: "京东" },
            { id: 41, gram: "阳白反", ans: "下巴" },
            { id: 42, gram: "略略略", ans: "略+" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 43, gram: "氧化氢", ans: "水" },
            { id: 44, gram: "千瓦时", ans: "度" },
            { id: 45, gram: "混凝土", ans: "砼" },
            { id: 46, gram: "图书馆", ans: "圕" },
            { id: 47, gram: "狮虎兽", ans: "彪" },
            { id: 48, gram: "人世佳", ans: "飘" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 49, gram: "㋁行星", ans: "火星" },
            { id: 50, gram: "㏢科幻", ans: "三体" },
            { id: 51, gram: "㏩神话", ans: "后羿射日" },
            { id: 52, gram: "㋉㏩字", ans: "朝" },
            { id: 53, gram: "㍼㍜字", ans: "照" },
            { id: 54, gram: "三㍾皮", ans: "面包" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 55, gram: "答哈鿣", ans: "哈耶克" },
            { id: 56, gram: "㘴填㆟", ans: "坐" },
            { id: 57, gram: "乮前六", ans: "配" },
            { id: 58, gram: "䇂㱐冨", ans: "弋" },
            { id: 59, gram: "㖯㌄㐃", ans: "同仁" },
            { id: 60, gram: "一㔖㌍", ans: "归" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 61, gram: "交换部", ans: "陪" },
            { id: 62, gram: "重组贺", ans: "勋" },
            { id: 63, gram: "组字㫄", ans: "回" },
            { id: 64, gram: "根包邓", ans: "权限" },
            { id: 65, gram: "镜像匕", ans: "刀" },
            { id: 66, gram: "镜像吡", ans: "OFF" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 67, gram: "谈讲谓", ans: "说" },
            { id: 68, gram: "吃屋安", ans: "穿" },
            { id: 69, gram: "术米沐", ans: "杰|沭" },
            { id: 70, gram: "卅井丰", ans: "亖" },
            { id: 71, gram: "鵞䳘䳗", ans: "鵝|鹅" },
            { id: 72, gram: "都堵肚", ans: "阴" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 73, gram: "亳增一", ans: "毫", extra: "一级字" },
            { id: 74, gram: "计增一", ans: "讯", extra: "一级字" },
            { id: 75, gram: "卑减二", ans: "早", extra: "一级字" },
            { id: 76, gram: "苗变一", ans: "昔", extra: "一级字" },
            { id: 77, gram: "烦增二", ans: "颊", extra: "一级字" },
            { id: 78, gram: "牢增二", ans: "牵", extra: "一级字" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 79, gram: "五立方", ans: "125", extra: "阿数字" },
            { id: 80, gram: "八选二", ans: "28", extra: "阿数字" },
            { id: 81, gram: "今年根", ans: "45", extra: "阿数字" },
            { id: 82, gram: "光年米", ans: "9460730472580800", extra: "阿数字" },
            { id: 83, gram: "棋盘麦", ans: "18446744073709551615", extra: "阿数字" },
            { id: 84, gram: "忙狸五", ans: "47176870", extra: "阿数字" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 85, gram: "约三亿", ans: "光速", extra: "答中文"},
            { id: 86, gram: "九点八", ans: "重力加速度", extra: "答中文"},
            { id: 87, gram: "七点九", ans: "第一宇宙速度", extra: "答中文"},
            { id: 88, gram: "六千垓", ans: "阿伏伽德罗常[数量]", extra: "答中文"},
            { id: 89, gram: "己𠃍旧", ans: "自然对数的底|自然常数|自然底数|欧拉数", extra: "答中文"},
            { id: 90, gram: "已通过", ans: "已通过", extra: "答中文"},
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 91, gram: "木又寸", ans: "树"},
            { id: 92, gram: "日一里", ans: "量"},
            { id: 93, gram: "石旦寸", ans: "碍"},
            { id: 94, gram: "丶业又", ans: "变"},
            { id: 95, gram: "亻卜丬", ans: "位"},
            { id: 96, gram: "二丬日", ans: "临"},
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 97, gram: "曌女唐", ans: "武则天" },
            { id: 98, gram: "诗酒剑", ans: "李白" },
            { id: 99, gram: "猹文绍", ans: "鲁迅" },
            { id: 100, gram: "蛋航陆", ans: "哥伦布" },
            { id: 101, gram: "镜苹矮", ans: "白雪公主" },
            { id: 102, gram: "三创秋", ans: "落[葉叶]子" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 103, gram: "狈甥娑", ans: "狼外婆" },
            { id: 104, gram: "厩脊迪", ans: "马里奥" },
            { id: 105, gram: "贼孤国", ans: "乌托邦" },
            { id: 106, gram: "兜扣俗", ans: "麦克风" },
            { id: 107, gram: "镇动驾", ans: "冰激凌" },
            { id: 108, gram: "超股恤", ans: "BAT|bat|Bat" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 109, gram: "柯南药", ans: "APTX4869"},
            { id: 110, gram: "宇宙答", ans: "42"},
            { id: 111, gram: "俊杰歌", ans: "编号89757"},
            { id: 112, gram: "冉阿让", ans: "24601"},
            { id: 113, gram: "未找到", ans: "404"},
            { id: 114, gram: "官方群", ans: "488377800"},
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 115, gram: "半1围", ans: "包", extra: "答一字" },
            { id: 116, gram: "1横字", ans: "〇|一|二|三|亖", extra: "答一字" },
            { id: 117, gram: "1乘2", ans: "[二三四五六七八九]十", extra: "答两字" },
            { id: 118, gram: "餐21", ans: "纸巾", extra: "答两字" },
            { id: 119, gram: "浙12", ans: "江西", extra: "答两字" },
            { id: 120, gram: "1太2", ans: "李白", extra: "答两字" },
        ],
        next: "normal"
    },
    {
        levels: [
            { id: 121, gram: "五字谜", ans: "" },
            { id: 122, gram: "亖字谜", ans: "" },
            { id: 123, gram: "三字谜", ans: "" },
            { id: 124, gram: "两字谜", ans: "" },
            { id: 125, gram: "一字谜", ans: "" },
        ],
        next: "all"
    },
    {
        levels: [
            { id: 126, gram: "解为日", ans: "日" },
        ],
        next: "all"
    },
    {
        levels: [
            { id: 127, gram: "1字谜", ans: "", final: 1 },
        ],
        next: "final"
    }
];

function simpleMin(a, b) {
    return a < b ? a : b;
}

function num2three(num) {
    const chars = "零一二三四五六七八九";
    let numStr = num.toString();
    if (numStr.length === 1) numStr = "00" + numStr;
    if (numStr.length === 2) numStr = "0" + numStr;
    return numStr.split("").map(function (digit) { return chars[parseInt(digit)] }).join("");
}

function countDigits(str) {
  const digits = str.match(/\d/g); // \d matches digits 0-9
  return digits ? digits.length : 0;
}

function getTriddleGram(level, answers) {
    // 不含"1"的是普通题目
    if (!level.gram.includes("1")) return level.gram;

    let ans = answers[level.id];
    if (level.id === 21) { // 1三秋
        ans = answers[0];
    }

    let gram = level.gram;
    let num_digits = countDigits(gram);
    if (ans && ans.length === num_digits) {
        for (let i = 0; i < num_digits; i++) {
            // 将题面中数字1替换成答案的第一个字，依次类推
            gram = gram.replace(i + 1, ans[i]);
        }
        return gram;
    } else {
        // 将所有数字替换为 〇
        return gram.replace(/[1-9]/g, '〇');
    }
}

function checkAnswer(level, answers, answerState) {
    let userAns = answers[level.id].toUpperCase();
    if (level.gram.endsWith("字谜")) {
        let head = getTriddleGram(level, answers)[0]; // x字谜是需要填写在之前的题目中答案为x的题面
        if (answerState[userAns]) {
            return answerState[userAns] === head;
        }
        return false;
    }

    if (level.id === 21) { // 1三秋
        if (answers[0] === "解") return userAns === "落叶";
        else if (answers[0] === "日") return userAns === "一";
        else return false;
    }

    return new RegExp("^(" + level.ans + ")$", "i").test(userAns);
}


function getLevels(answers) {
    let answerState = {};
    let group = [];
    let lastGroupId = 0;
    let completedCount = 0;
    let finishFinal = false;
    for (let groupId in TRIDDLES) {
        lastGroupId = parseInt(groupId);
        let triddleGroup = TRIDDLES[groupId];
        let levels = [];
        let levelCompleted = 0;
        for (let i in triddleGroup.levels) {
            let level = triddleGroup.levels[i];
            let gram = getTriddleGram(level, answers); //计算题面
            let completed = 0;
            if (answers[level.id]) {
                if (checkAnswer(level, answers, answerState)) {
                    levelCompleted++;
                    completedCount++;
                    completed = 1;
                    answerState[gram] = answers[level.id].toUpperCase();
                }
            }
            levels.push({
                i: level.id,
                g: gram,
                c: completed,
                e: level.extra,
                f: level.final
            });
        }
        group.push({
            l: levels,
        });
        //检查是否可以开启下一组
        if (triddleGroup.next === "all") {
            if (levelCompleted < triddleGroup.levels.length) {
                break;
            }
        } else if (triddleGroup.next === "normal") {
            if (levelCompleted < 4) {
                break;
            }
        } else if (triddleGroup.next === "final") {
            if (levelCompleted >= 1) {
                finishFinal = true;
            }
        }
    }
    let next = [];
    //将后续三组题目数量返回，来显示未解锁预览
    for (let i = lastGroupId + 1; i < simpleMin(TRIDDLES.length, lastGroupId + 4); i++) {
        next.push(TRIDDLES[i].levels.length);
    }

    //最后将id == 90 的题面设置成当前通过数量
    let completedCountStr = num2three(completedCount);
    for (let i = 0; i < group.length; i++) {
        for (let j = 0; j < group[i].l.length; j++) {
            if (group[i].l[j].i === 90) { // id == 90 的题面
                group[i].l[j].g = completedCountStr;
            }
        }
    }

    return {
        g: group,
        c: completedCountStr,
        f: finishFinal ? 1 : 0,
        n: next,
    }
}



//在这个函数中实现你的功能，ctx定义如顶部注释，request为已解析好的传入对象。
/**
 * @param {Ctx} ctx 全局上下文对象
 * @param {object} request 用户请求
 * @returns {object} response 返回给用户的数据
 */
function main(ctx, request) {
    let r = getLevels(request.answers);

    if (r.f === 1) {
        if (!ctx.hasPuzzleFinished(PID)) {
            ctx.makePuzzleFinished(ctx.gid, PID, "恭喜你 已通过 三字谜");
        }
    }
    //将你需要返回给前端的对象return出去
    return r;
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