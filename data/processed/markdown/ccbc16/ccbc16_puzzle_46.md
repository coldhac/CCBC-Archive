---
record_id: "ccbc16:puzzle:46"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "造纸"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/46.json"
---

# 三字谜

## 题面

<div  class="error-block custom-block">
<span class="custom-block-title">修改于 2025/08/11 20:02</span>
<span>倒数第四行增加了答案长度限制</span>
</div>

## 交互源码

- javascript: [../../../assets/static.cipherpuzzles.com/static/images/122f330c42fb47ea9d68877c9fce03d2.vue](../../../assets/static.cipherpuzzles.com/static/images/122f330c42fb47ea9d68877c9fce03d2.vue)

### backend_c16-triddles

```text
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
    min-width: 3ex;
}
#answerkey td {
    border-style: solid none;
    border-width: thin;
    text-align: center;
    vertical-align: middle;
    padding: 3px 9px;
    min-width: 50px;
}
</style>
<table id = "answerkey">
<tr><th>谜题一</th><th>谜答一</th><th>谜题二</th><th>谜答二</th><th>谜题三</th><th>谜答三</th><th>谜题四</th><th>谜答四</th><th>谜题五</th><th>谜答五</th><th>谜题六</th><th>谜答六</th><th>谜讲解</th></tr>
<tr><td>输入解</td><td>解</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>如字面</td></tr>
<tr><td>同心结</td><td>心结</td><td>反光灯</td><td>灯光</td><td>非非法</td><td>合法</td><td>非非师</td><td>死|熟</td><td>谐麋鹿</td><td>迷路</td><td>倒宜家</td><td>埃及</td><td>同向读；反向读；单反义；双反义；谐音词；倒放词</td></tr>
<tr><td>星星星</td><td>三星</td><td>心用用</td><td>一心二用</td><td>狡𠓗窟</td><td>狡兔三窟</td><td>面面刕</td><td>两面三刀</td><td>事事工</td><td>事倍功半</td><td>数数数</td><td>数一数二</td><td>略略略</td></tr>
<tr><td>梅兰竹</td><td>菊</td><td>北大太</td><td>印</td><td>西红水</td><td>三</td><td>东黄南</td><td>渤</td><td>强引弱</td><td>电磁</td><td>固液气</td><td>等离子</td><td>花四君；四大洋；四名著；四海域；基本力；四物态</td></tr>
<tr><td>地不熟</td><td>人生</td><td>海知己</td><td>内存</td><td>解三秋</td><td>落叶</td><td>门闻吠</td><td>柴犬</td><td>空白狼</td><td>手套</td><td>成不恨</td><td>钢铁</td><td>前五略；句子反</td></tr>
<tr><td>一顺风</td><td>一路顺风</td><td>一风顺</td><td>一帆风顺</td><td>为非作</td><td>为非作歹</td><td>作非为</td><td>胡作非为</td><td>说不二</td><td>说一不二</td><td>二不说</td><td>二话不说</td><td>略略略</td></tr>
<tr><td>椿榎楸</td><td>柊</td><td>离未罔</td><td>两</td><td>氭煵㘳</td><td>洒</td><td>脌昐时</td><td>秒</td><td>艮同失</td><td>易</td><td>三三四</td><td>五</td><td>木四季；四小鬼；四元素；六时间；五金属；一到五</td></tr>
<tr><td>目田四</td><td>园</td><td>仱仮仪</td><td>估|借</td><td>椎冋乂</td><td>幻</td><td>都本日</td><td>京东</td><td>阳白反</td><td>下巴</td><td>略略略</td><td>略+</td><td>二加儿；今反义；稚同义；日本都；春雪义；略略略</td></tr>
<tr><td>氧化氢</td><td>水</td><td>千瓦时</td><td>度</td><td>混凝土</td><td>砼</td><td>图书馆</td><td>圕</td><td>狮虎兽</td><td>彪</td><td>人世佳</td><td>飘</td><td>前五略；加上乱</td></tr>
<tr><td>㋁行星</td><td>火星</td><td>㏢科幻</td><td>三体</td><td>㏩神话</td><td>后羿射日</td><td>㋉㏩字</td><td>朝</td><td>㍼㍜字</td><td>照</td><td>三㍾皮</td><td>面包</td><td>略略略</td></tr>
<tr><td>答哈鿣</td><td>哈耶克</td><td>㘴填㆟</td><td>坐</td><td>乮前六</td><td>配</td><td>䇂㱐冨</td><td>弋</td><td>㖯㌄㐃</td><td>同仁</td><td>一㔖㌍</td><td>归</td><td>前二略；干支组；缺笔画；取上半；重组字</td></tr>
<tr><td>交换部</td><td>陪</td><td>重组贺</td><td>勋</td><td>组字㫄</td><td>回</td><td>根包邓</td><td>权限</td><td>镜像匕</td><td>刀</td><td>镜像吡</td><td>OFF</td><td>略略略</td></tr>
<tr><td>谈讲谓</td><td>说</td><td>吃屋安</td><td>穿</td><td>术米沐</td><td>杰|沭</td><td>卅井丰</td><td>亖</td><td>鵞䳘䳗</td><td>鵝|鹅</td><td>都堵肚</td><td>阴</td><td>说同义、四声调；读拼音、衣食住；略三题；两两交</td></tr>
<tr><td>亳增一</td><td>毫</td><td>计增一</td><td>讯</td><td>卑减二</td><td>早</td><td>苗变一</td><td>昔</td><td>烦增二</td><td>颊</td><td>牢增二</td><td>牵</td><td>略略略</td></tr>
<tr><td>五立方</td><td>125</td><td>八选二</td><td>28</td><td>今年根</td><td>45</td><td>光年米</td><td>9460730472580800</td><td>棋盘麦</td><td>18446744073709551615</td><td>忙狸五</td><td>47176870</td><td>略略略</td></tr>
<tr><td>约三亿</td><td>光速</td><td>九点八</td><td>重力加速度</td><td>七点九</td><td>第一宇宙速度</td><td>六千垓</td><td>阿伏伽德罗常[数量]</td><td>己𠃍旧</td><td>自然对数的底|自然常数|自然底数|欧拉数</td><td>已通过</td><td>已通过</td><td>略略略</td></tr>
<tr><td>木又寸</td><td>树</td><td>日一里</td><td>量</td><td>石旦寸</td><td>碍</td><td>丶业又</td><td>变</td><td>亻卜丬</td><td>位</td><td>二丬日</td><td>临</td><td>笔画序，组成字</td></tr>
<tr><td>曌女唐</td><td>武则天</td><td>诗酒剑</td><td>李白</td><td>猹文绍</td><td>鲁迅</td><td>蛋航陆</td><td>哥伦布</td><td>镜苹矮</td><td>白雪公主</td><td>三创秋</td><td>落[葉叶]子</td><td>略略略</td></tr>
<tr><td>狈甥娑</td><td>狼外婆</td><td>厩脊迪</td><td>马里奥</td><td>贼孤国</td><td>乌托邦</td><td>兜扣俗</td><td>麦克风</td><td>镇动驾</td><td>冰激凌</td><td>超股恤</td><td>BAT|bat|Bat</td><td>略略略</td></tr>
<tr><td>柯南药</td><td>APTX4869</td><td>宇宙答</td><td>42</td><td>俊杰歌</td><td>编号89757</td><td>冉阿让</td><td>24601</td><td>未找到</td><td>404</td><td>官方群</td><td>488377800</td><td>略略略</td></tr>
<tr><td>半〇围</td><td>包</td><td>〇横字</td><td>〇|一|二|三|亖</td><td>〇乘〇</td><td>[二三四五六七八九]十</td><td>餐〇〇</td><td>纸巾</td><td>浙〇〇</td><td>江西</td><td>〇太〇</td><td>李白</td><td>略略略</td></tr>
<tr><td>五字谜</td><td>三三四</td><td>亖字谜</td><td>卅井丰</td><td>三字谜</td><td>西红水</td><td>两字谜</td><td>离未罔</td><td>一字谜</td><td>一横字</td><td>-</td><td>-</td><td>〇横字：回答一</td></tr>
<tr><td>解为日</td><td>日</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>回开头，改答案，回答日</td></tr>
<tr><td>〇字谜</td><td>〇横字</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>日三秋：回答一；〇横字：回答〇</td></tr>
</table>

## 提示

### 1. 调整增加次数价格



### 2. 五题的　某一行　懂机制　但还是　填不上！

这行的上一行，有一题的答案可以变。

### 3. 一题的　某一行　我完全　没头绪！

这行的上一行是个提示，表示前面有一题的答案可以变。

### 4. 五题的　某一行　不会做！

X字谜 = 答案是X的字谜

### 5. 一题的　某一行　咋想都　填不上！

这一题需要回答答案为“〇”的题面。
某一题的答案可以为“〇”。

### 6. 二十行　浙某某　答案何

江西

### 7. 二十行　某太某　答案何

李白

### 8. 第八行　人某某　答案何

飘

### 9. 第十行　某某㐃　答案何

同仁

### 10. 十一行　某某匕　答案何

刀

### 11. 十一行　某某吡　答案何

OFF

### 12. 十三行　牢某某　答案何

牵

### 13. 十五行　己某某　答案何

自然常数

### 14. 十六行　二某某　答案何

临

### 15. 十七行　蛋某某　答案何

哥伦布

### 16. 十八行　超某某　答案何

BAT

### 17. 第七行　某某反　答案何

下巴


## 本地附件

- [122f330c42fb47ea9d68877c9fce03d2.vue](../../../assets/static.cipherpuzzles.com/static/images/122f330c42fb47ea9d68877c9fce03d2.vue)
- [729da2f2abb1406d828564d19d600b58.webp](../../../assets/static.cipherpuzzles.com/static/images/729da2f2abb1406d828564d19d600b58.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/46.json](https://ccbc16.cipherpuzzles.com/data/puzzles/46.json)
