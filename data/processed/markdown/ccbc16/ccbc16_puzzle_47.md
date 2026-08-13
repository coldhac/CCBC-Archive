---
record_id: "ccbc16:puzzle:47"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "造纸"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/47.json"
---

# 2025年度解谜能力测试

## 题面

_官方存档未提供可提取的文字题面；请查看下方附件或交互源码。_

## 交互源码

- javascript: [../../../assets/static.cipherpuzzles.com/static/images/f6114bac401f4d5ca4bfb400a263cfd6.vue](../../../assets/static.cipherpuzzles.com/static/images/f6114bac401f4d5ca4bfb400a263cfd6.vue)

### backend_c16-puzzle-solving-test

```text
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
const EX_IMG = "../../../assets/static.cipherpuzzles.com/static/images/3f33e27aea514e618b12c535874c8e66.webp";

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
<tr><th>编号</th><th>答案</th><th>解析</th></tr>
<tr><td>01</td><td>RYE</td><td>右箭头表示字典序+1。向下或向左的箭头需要旋转题面之后再字典序+1。</td></tr>
<tr><td>02</td><td>MOUSE</td><td>填入A到Z使得A到Z形成一条路径。读对角线上的字母。</td></tr>
<tr><td>03</td><td>权衡</td><td>填入北斗七星的名称。</td></tr>
<tr><td>04</td><td>大食</td><td>填入五指的名称。</td></tr>
<tr><td>05</td><td>IRAN</td><td>填入一二三的拼音。</td></tr>
<tr><td>06</td><td>贝多芬</td><td> 1=C 提示简谱。33455432是《欢乐颂》的开头。</td></tr>
<tr><td>07</td><td>反</td><td>每行的两个问号填入相同字母，形成单词 ANTI。</td></tr>
<tr><td>08</td><td>阿曼</td><td>箭头表示终点国家的英文名是起点国家的英文名的子串。</td></tr>
<tr><td>09</td><td>道德</td><td>箭头表示交换（英文单词的）第三位和第五位。</td></tr>
<tr><td>10</td><td>OZONE</td><td>填入 ZERO、EIGHT、INFINITY。</td></tr>
<tr><td>11</td><td>EIGHT</td><td>取对应笔画之后转旗语。</td></tr>
<tr><td>12</td><td>肮脏</td><td>甲乙丙表示三个汉字，上面的带圈数字表示汉字对应的拼音。</td></tr>
<tr><td>13</td><td>EGOIST</td><td>在02中的网格上使用Playfair密码。</td></tr>
<tr><td>14</td><td>SCAR</td><td>背景图是NATO的标志。箭头表示取字母对应的NATO单词，然后去掉首字母。</td></tr>
<tr><td>15</td><td>式</td><td>本题使用注意事项。注意事项中含有两个寸（汉字部件）。取两个寸之间的汉字。</td></tr>
<tr><td>16</td><td>SELF</td><td>按照单词含义提取首字母或尾字母。</td></tr>
<tr><td>17</td><td>ACID</td><td>所有单词长度为4。左边的4x4字母矩阵是右边的4x4字母矩阵的转置。左侧依次为 WALK、ICON、NINE、EDGE，右侧依次为 WINE、ACID、LONG、KNEE。</td></tr>
<tr><td>18</td><td>SKETCH</td><td>读所有"/"的位置象形。</td></tr>
<tr><td>19</td><td>BYE</td><td>蓝色背景为06中的33455432，绿色箭头是09中的交换第三位和第五位。应用变换得到33554432，等于2的25次方。最后A1Z26提取。</td></tr>
<tr><td>20</td><td>SON</td><td>网格为元素周期表的右上角。</td></tr>
<tr><td>21</td><td>户口本</td><td>剪影均为中国省级行政区，箭头表示提取简称对应方向的部件。注意最终答案对提取出的圆圈数字有修改。</td></tr>
<tr><td>22</td><td>ARM</td><td>所有国家答案为 04 大食，05 IRAN，08 阿曼。</td></tr>
<tr><td>23</td><td>SCALE</td><td>七段数码管取负形，象形字母。</td></tr>
<tr><td>24</td><td>张家口</td><td>箭头表示取物品的量词，例如猪变为头，墙变为面。最下行的三张图分别为桌子、饭店、井。</td></tr>
<tr><td>25</td><td>MOUTH</td><td>虚线表示将左侧镜像。之后按猪圈密码提取。</td></tr>
<tr><td>26</td><td>异</td><td>左侧的字含有十二地支，右侧则没有。</td></tr>
<tr><td>27</td><td>阿昌族</td><td>箭头将数字转为对应的民族名称（五十六民族有官方的数字顺序）。</td></tr>
<tr><td>28</td><td>测度</td><td>读标题中对应位置的字。</td></tr>
<tr><td>29</td><td>ASSERT</td><td>读键盘上两字母之间中点位置的字母。</td></tr>
<tr><td>30</td><td>HALF</td><td>提取盲文。</td></tr>
<tr><td>31</td><td>ONE</td><td>提取摩斯，横为"-"，撇为"/"（分隔符），点为"."。</td></tr>
<tr><td>32</td><td>IDEA</td><td>将罗马数字转为英文单词，提取之中的罗马数字，再A1Z26转换。</td></tr>
<tr><td>33</td><td>EGG</td><td>标题提示本题机制与23相同。</td></tr>
<tr><td>34</td><td>MESH</td><td>四行分别对应SQRT、RUST、SPQR、PORQ。按照康托展开提取。</td></tr>
<tr><td>35</td><td>ETHIC</td><td>第一行为WHITE，第二行为BLACK。</td></tr>
<tr><td>36</td><td>恶语中伤</td><td>本题的答案是成语。第一行和第二行分别是一语成谶和一语中的。</td></tr>
<tr><td>37</td><td>构</td><td>转为拼音后文章为回文。</td></tr>
<tr><td>38</td><td>TUNED</td><td>按照横的位置提取五位二进制。</td></tr>
<tr><td>39</td><td>FRIGHTEN</td><td>a/b表示提取b的序数词的第a位。</td></tr>
<tr><td>40</td><td>OFTEN</td><td>箭头表示起点单词的后三字母和终点单词的前三字母相同。</td></tr>
<tr><td>41</td><td>体</td><td>四格分别是 BOOK、BOOL、COOK、COOL。选项要和编号数字一起读。</td></tr>
<tr><td>42</td><td>SNOW</td><td>左侧转 Unicode，右侧转 ASCII。</td></tr>
<tr><td>43</td><td>马六甲</td><td>每个起点单词在一个有序集合内，箭头表示按数字移动后的集合元素。</td></tr>
<tr><td>44</td><td>CLOSE</td><td>本题为 cryptarithm，使用23、32、13的答案。</td></tr>
<tr><td>45</td><td>行</td><td>这行写了两个成语，一石二鸟和一目十行。</td></tr>
<tr><td>46</td><td>AND</td><td>19题中的◀变为1，▶变为4。按照19题下半部分重新提取。</td></tr>
<tr><td>47</td><td>ASSET</td><td>每个图片对应一个单词，单词的形式为xTOy或xISy。按顺序应用在起点单词SMART上。</td></tr>
<tr><td>48</td><td>鄂温克族</td><td>填入汉字的笔画。二到十中只有八和九没有使用。之后按照27中的箭头机制得到最终答案。</td></tr>
<tr><td>49</td><td>CENT</td><td>四行分别对应30、25、11、31。将答案转为汉字后，象形对应的古典密码提取。例如，半对应C。</td></tr>
<tr><td>50</td><td>TRANS ISOMER</td><td>按22的要求，提取所有答案的第二个字母，得到 YOU ARE AMAZING CHECK YOUR CHOICES AND GET YOUR FINAL ANSWER。五道选择题的选项组成“反式异构体”，翻译成英文得到答案。</td></tr>
<tr><td>EX</td><td></td><td>按EX题面要求重新选择选项，发现选项汉字可以组成“将总分平方”。如此提交的答案总分将会被平方。超过7000分即可通过本题。</td></tr>
</table>

## 提示

### 1. 调整增加回答次数价格



### 2. 01怎么做

右箭头表示字典序+1。向下或向左的箭头需要旋转题面之后再字典序+1。

### 3. 02怎么做

填入A到Z使得A到Z形成一条路径。按箭头指示读字母。

### 4. 03怎么做

填入北斗七星的名称。

### 5. 04怎么做

填入五指的名称。

### 6. 05怎么做

填入一二三的拼音。

### 7. 06怎么做

1=C 提示简谱。33455432是《欢乐颂》的开头。

### 8. 07怎么做

每行的两个问号填入相同字母。

### 9. 08怎么做

箭头表示终点国家的英文名是起点国家的英文名的子串。

### 10. 09怎么做

箭头表示交换（英文单词的）第三位和第五位。

### 11. 10怎么做

填入 ZERO、EIGHT、INFINITY。

### 12. 11怎么做

取对应笔画之后转旗语。

### 13. 12怎么做

甲乙丙表示三个汉字，上面的带圈数字表示汉字对应的拼音。

### 14. 13怎么做

在02中的网格上使用 Playfair 密码。

### 15. 14怎么做

背景图是NATO的标志。箭头表示取字母对应的NATO单词，然后去掉首字母。

### 16. 15怎么做

本题使用注意事项。注意事项中含有两个寸（汉字部件）。取两个寸之间的汉字。

### 17. 16怎么做

按照单词含义提取首字母或尾字母。

### 18. 17怎么做

所有单词长度为4。左边的4x4字母矩阵是右边的4x4字母矩阵的转置。左侧第二和四个单词不相同。

### 19. 18怎么做

读所有"/"的位置象形。

### 20. 19怎么做

蓝色背景在06中出现。绿色箭头在09中出现。

### 21. 20怎么做

网格为元素周期表的右上角。

### 22. 21怎么做

剪影均为中国省级行政区，箭头表示提取简称对应方向的部件。

### 23. 22怎么做

按照指示做即可。所有国家答案都在此题之前出现。

### 24. 23怎么做

七段数码管取负形，象形字母。

### 25. 24怎么做

箭头表示取物品的量词。

### 26. 25怎么做

虚线表示将左侧镜像。之后按猪圈密码提取。

### 27. 26怎么做

左侧的字含有十二地支，右侧则没有。

### 28. 27怎么做

箭头将数字转为对应的民族名称（五十六民族有官方的数字顺序）。

### 29. 28怎么做

前四个格子填2025。

### 30. 29怎么做

读键盘上两字母之间中点位置的字母。

### 31. 30怎么做

提取盲文。

### 32. 31怎么做

提取摩斯。

### 33. 32怎么做

将罗马数字转为英文单词，提取之中的罗马数字。

### 34. 33怎么做

标题提示本题机制与23相同。

### 35. 34怎么做

四行分别对应一个四字母字符串。按照康托展开提取。

### 36. 35怎么做

每行填颜色的英文名。

### 37. 36怎么做

本题的答案是成语。

### 38. 37怎么做

转为拼音后文章为回文。

### 39. 38怎么做

按照横的位置提取五位二进制。

### 40. 39怎么做

a/b表示提取b的序数词的第a位。

### 41. 40怎么做

箭头表示起点单词的后三字母和终点单词的前三字母相同。

### 42. 41怎么做

选项要和编号数字一起读。

### 43. 42怎么做

左侧转 Unicode，右侧转 ASCII。

### 44. 43怎么做

每个起点单词在一个有序集合内，箭头表示按数字移动后的集合元素。

### 45. 44怎么做

本题为 cryptarithm，使用23、32、13的答案。

### 46. 45怎么做

这行写了两个成语。

### 47. 46怎么做

19题中的◀变为◀-1，▶变为▶-1。按照19题下半部分重新提取。

### 48. 47怎么做

每个图片对应一个单词，单词的形式为xTOy或xISy。

### 49. 48怎么做

填入汉字的笔画。之后按照27中的箭头机制得到答案。

### 50. 49怎么做

四行分别对应30、25、11、31。将答案转为汉字后，象形对应的古典密码提取。例如，半对应C。

### 51. 50怎么做

按22的要求，提取所有答案的第二个字母。之后按照得到的指示进行，读相应的答案并翻译成英文。

### 52. 如何通过本题

按照新出现的图片上的指示，修改部分题目的答案。


## 本地附件

- [05378011b0854659843a88c4d49eb8de.webp](../../../assets/static.cipherpuzzles.com/static/images/05378011b0854659843a88c4d49eb8de.webp)
- [079bf7f8ce274a72a3ced985ed2009c3.webp](../../../assets/static.cipherpuzzles.com/static/images/079bf7f8ce274a72a3ced985ed2009c3.webp)
- [08ee820fb10d41918677199e6776b709.webp](../../../assets/static.cipherpuzzles.com/static/images/08ee820fb10d41918677199e6776b709.webp)
- [12bb54c2ec074659a68b316cc5999505.webp](../../../assets/static.cipherpuzzles.com/static/images/12bb54c2ec074659a68b316cc5999505.webp)
- [17887b3ea73f486badf8cd78601fd04b.webp](../../../assets/static.cipherpuzzles.com/static/images/17887b3ea73f486badf8cd78601fd04b.webp)
- [1e7a7e57b0bb444bace3bb958e5f6087.webp](../../../assets/static.cipherpuzzles.com/static/images/1e7a7e57b0bb444bace3bb958e5f6087.webp)
- [2450c40aa40b4ac0bb586469793dcb0b.webp](../../../assets/static.cipherpuzzles.com/static/images/2450c40aa40b4ac0bb586469793dcb0b.webp)
- [262411f42add413e9bb815f1732439c7.webp](../../../assets/static.cipherpuzzles.com/static/images/262411f42add413e9bb815f1732439c7.webp)
- [2b2ab547958240ba8dd36bdb924f5529.webp](../../../assets/static.cipherpuzzles.com/static/images/2b2ab547958240ba8dd36bdb924f5529.webp)
- [2baf21d353d44e0089afcdb0bf49de7a.webp](../../../assets/static.cipherpuzzles.com/static/images/2baf21d353d44e0089afcdb0bf49de7a.webp)
- [2e89e6c91bb348cfb4e59717cd40482e.webp](../../../assets/static.cipherpuzzles.com/static/images/2e89e6c91bb348cfb4e59717cd40482e.webp)
- [2fd11336796d4f28b23ed9461b50fb21.webp](../../../assets/static.cipherpuzzles.com/static/images/2fd11336796d4f28b23ed9461b50fb21.webp)
- [30335c82ab9f4dc8ab7cdbeb4bd50f1d.webp](../../../assets/static.cipherpuzzles.com/static/images/30335c82ab9f4dc8ab7cdbeb4bd50f1d.webp)
- [362cd57d266846e984856bf97329cc43.webp](../../../assets/static.cipherpuzzles.com/static/images/362cd57d266846e984856bf97329cc43.webp)
- [38679b877e2f48868cef47865234a8a2.webp](../../../assets/static.cipherpuzzles.com/static/images/38679b877e2f48868cef47865234a8a2.webp)
- [38d18189999e4662b6f402cf16a303a1.webp](../../../assets/static.cipherpuzzles.com/static/images/38d18189999e4662b6f402cf16a303a1.webp)
- [3a2380f6e7ee46769bb2de390856f09d.webp](../../../assets/static.cipherpuzzles.com/static/images/3a2380f6e7ee46769bb2de390856f09d.webp)
- [3e9ccd531ff04929919ba1b0eaa877b2.webp](../../../assets/static.cipherpuzzles.com/static/images/3e9ccd531ff04929919ba1b0eaa877b2.webp)
- [3f33e27aea514e618b12c535874c8e66.webp](../../../assets/static.cipherpuzzles.com/static/images/3f33e27aea514e618b12c535874c8e66.webp)
- [4649e9385d29490387dcfeacddd2d30f.webp](../../../assets/static.cipherpuzzles.com/static/images/4649e9385d29490387dcfeacddd2d30f.webp)
- [4b4ed5e04f8d4efcbca117978601f69b.webp](../../../assets/static.cipherpuzzles.com/static/images/4b4ed5e04f8d4efcbca117978601f69b.webp)
- [4c7fea4fa94b4c40b76089b1343602ac.webp](../../../assets/static.cipherpuzzles.com/static/images/4c7fea4fa94b4c40b76089b1343602ac.webp)
- [4cf33d038cec479ca7c3f0a96f881d43.webp](../../../assets/static.cipherpuzzles.com/static/images/4cf33d038cec479ca7c3f0a96f881d43.webp)
- [50615ba8c7ed40bca1594f1f6a1e49c8.webp](../../../assets/static.cipherpuzzles.com/static/images/50615ba8c7ed40bca1594f1f6a1e49c8.webp)
- [530e5e323234472b8cc02886ba5570ca.webp](../../../assets/static.cipherpuzzles.com/static/images/530e5e323234472b8cc02886ba5570ca.webp)
- [558ae48f5a4443ef9940d36fb2ce9e64.webp](../../../assets/static.cipherpuzzles.com/static/images/558ae48f5a4443ef9940d36fb2ce9e64.webp)
- [5625c8659bbd4eafbf07a46529ffc189.webp](../../../assets/static.cipherpuzzles.com/static/images/5625c8659bbd4eafbf07a46529ffc189.webp)
- [5c36bb4765264ddb902780fd0198ee15.webp](../../../assets/static.cipherpuzzles.com/static/images/5c36bb4765264ddb902780fd0198ee15.webp)
- [69e5a164e83442c69b59b3489f2a9e57.webp](../../../assets/static.cipherpuzzles.com/static/images/69e5a164e83442c69b59b3489f2a9e57.webp)
- [6a402b7724e8434a87a92bb62c4ca30b.webp](../../../assets/static.cipherpuzzles.com/static/images/6a402b7724e8434a87a92bb62c4ca30b.webp)
- [7559909d65574be69fcbcc3c0f3a719a.webp](../../../assets/static.cipherpuzzles.com/static/images/7559909d65574be69fcbcc3c0f3a719a.webp)
- [7bf183eb396b4d9192871b9983ad198d.webp](../../../assets/static.cipherpuzzles.com/static/images/7bf183eb396b4d9192871b9983ad198d.webp)
- [7de45c727ce24fe48e4666bb78728777.webp](../../../assets/static.cipherpuzzles.com/static/images/7de45c727ce24fe48e4666bb78728777.webp)
- [82ef7799e0a2429a82ade83554a66991.webp](../../../assets/static.cipherpuzzles.com/static/images/82ef7799e0a2429a82ade83554a66991.webp)
- [83dc75894d304b33aaf39cb8e4e4f68c.webp](../../../assets/static.cipherpuzzles.com/static/images/83dc75894d304b33aaf39cb8e4e4f68c.webp)
- [84a293ffad0143be9a2e0d5eddc4b5b4.webp](../../../assets/static.cipherpuzzles.com/static/images/84a293ffad0143be9a2e0d5eddc4b5b4.webp)
- [8e91fb4dcae3481786686634cf2ecf4e.webp](../../../assets/static.cipherpuzzles.com/static/images/8e91fb4dcae3481786686634cf2ecf4e.webp)
- [9e6c4aed427e472bab5bdef87fba0dd1.webp](../../../assets/static.cipherpuzzles.com/static/images/9e6c4aed427e472bab5bdef87fba0dd1.webp)
- [a5f1c72b2fc74f90b93b110f2db06312.webp](../../../assets/static.cipherpuzzles.com/static/images/a5f1c72b2fc74f90b93b110f2db06312.webp)
- [b06253b53a8f4567b74a83b676f9c092.webp](../../../assets/static.cipherpuzzles.com/static/images/b06253b53a8f4567b74a83b676f9c092.webp)
- [b40fe7a0893645b89b16365385a3cf92.webp](../../../assets/static.cipherpuzzles.com/static/images/b40fe7a0893645b89b16365385a3cf92.webp)
- [b7a187c1491d434894befb6928a3465d.webp](../../../assets/static.cipherpuzzles.com/static/images/b7a187c1491d434894befb6928a3465d.webp)
- [b85c8dcd5e70428f8bdd061d24379982.webp](../../../assets/static.cipherpuzzles.com/static/images/b85c8dcd5e70428f8bdd061d24379982.webp)
- [bc2fbfe97d634bf8a2e7169b6cf36e2b.webp](../../../assets/static.cipherpuzzles.com/static/images/bc2fbfe97d634bf8a2e7169b6cf36e2b.webp)
- [be28b2d4d8bd413f87377dcbbb6871ad.webp](../../../assets/static.cipherpuzzles.com/static/images/be28b2d4d8bd413f87377dcbbb6871ad.webp)
- [c6eb4748ca5c45e8b01affcc37d18384.webp](../../../assets/static.cipherpuzzles.com/static/images/c6eb4748ca5c45e8b01affcc37d18384.webp)
- [c7c68b894ad9461d8e093b54acfb2752.webp](../../../assets/static.cipherpuzzles.com/static/images/c7c68b894ad9461d8e093b54acfb2752.webp)
- [cd15a729e2de4806a6c764859c2e9d3b.webp](../../../assets/static.cipherpuzzles.com/static/images/cd15a729e2de4806a6c764859c2e9d3b.webp)
- [ce05deee0dba4017a9efc02e64a7ae21.webp](../../../assets/static.cipherpuzzles.com/static/images/ce05deee0dba4017a9efc02e64a7ae21.webp)
- [d2d831d2bbd5482aa8adbac30a619833.webp](../../../assets/static.cipherpuzzles.com/static/images/d2d831d2bbd5482aa8adbac30a619833.webp)
- [e046e0a5a216486592814c0fafbfebc0.webp](../../../assets/static.cipherpuzzles.com/static/images/e046e0a5a216486592814c0fafbfebc0.webp)
- [f5fffae6887048e9baae95c43134d419.webp](../../../assets/static.cipherpuzzles.com/static/images/f5fffae6887048e9baae95c43134d419.webp)
- [f6114bac401f4d5ca4bfb400a263cfd6.vue](../../../assets/static.cipherpuzzles.com/static/images/f6114bac401f4d5ca4bfb400a263cfd6.vue)
- [fad335e7a31d4481a5b76a4755dc0a6d.webp](../../../assets/static.cipherpuzzles.com/static/images/fad335e7a31d4481a5b76a4755dc0a6d.webp)
- [fea3df97f6cf47139ebdb18dd30ba158.webp](../../../assets/static.cipherpuzzles.com/static/images/fea3df97f6cf47139ebdb18dd30ba158.webp)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/47.json](https://ccbc16.cipherpuzzles.com/data/puzzles/47.json)
