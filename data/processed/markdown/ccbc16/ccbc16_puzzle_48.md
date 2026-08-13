---
record_id: "ccbc16:puzzle:48"
event_id: "ccbc16"
editions: ["CCBC 16"]
year: 2025
area: "造纸"
kind: "puzzle"
source_url: "https://ccbc16.cipherpuzzles.com/data/puzzles/48.json"
---

# 你说话带括号

## 题面

_官方存档未提供可提取的文字题面；请查看下方附件或交互源码。_

## 交互源码

- javascript: [../../../assets/static.cipherpuzzles.com/static/images/3cfc7d96722049f9abe08dcbc890d4a4.vue](../../../assets/static.cipherpuzzles.com/static/images/3cfc7d96722049f9abe08dcbc890d4a4.vue)

### backend_c16-brackets

```text
// 你说话带括号后端脚本

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

const PID = 48;
const PUZZLES = [
    [
        { clue: "复制", ans: "复制", id: 0, g: 0 },
        { clue: "粘贴", ans: "粘贴", id: 1, g: 0 },
        { clue: "恒等", ans: "恒等", id: 2, g: 0 },
        { clue: "变换", ans: "变换", id: 3, g: 0 }
    ],
    [
        { clue: "〈涂改液〉", ans: "涂改", id: 100, g: 1 },
        { clue: "《添加》", ans: "添加剂", id: 101, g: 1 },
        { clue: "〈异亮氨酸〉", ans: "亮氨酸", id: 102, g: 1 },
        { clue: "〈哈萨克斯坦〉", ans: "萨克斯", id: 103, g: 1 },
        { clue: "《生意气》", ans: "书生意气", id: 104, g: 1 },
        { clue: "《分解反应》", ans: "复分解反应", id: 105, g: 1 },
        { clue: "《三角函数》", ans: "反三角函数", id: 106, g: 1 }
    ],
    [
        { clue: "＜牛奶＞", ans: "奶牛", id: 200, g: 2 },
        { clue: "＜蜂蜜＞", ans: "蜜蜂", id: 201, g: 2 },
        { clue: "＜调音＞", ans: "音调", id: 202, g: 2 },
        { clue: "＜藏宝＞", ans: "宝藏", id: 203, g: 2 },
        { clue: "＜酱牛肉＞", ans: "牛肉酱", id: 204, g: 2 },
        { clue: "＜电压高＞", ans: "高压电", id: 205, g: 2 },
        { clue: "＜打飞鸡蛋＞", ans: "鸡飞蛋打", id: 206, g: 2 },
        { clue: "＜转运来时＞", ans: "时来运转", id: 207, g: 2 },
        { clue: "＜水电发力＞", ans: "水力发电", id: 208, g: 2 },
        { clue: "＜一不口心＞", ans: "心口不一", id: 209, g: 2 },
        { clue: "＜主不自由＞", ans: "不由自主", id: 210, g: 2 }
    ],
    [
        { clue: "<br>［太阳系］<br>〈太阳系〉", ans: "太阳", id: 300, g: 3 },
        { clue: "<br>〚刹车〛<br>〈刹车〉", ans: "车", id: 301, g: 3 },
        { clue: "<br>「金属」<br>〈金属〉", ans: "金", id: 302, g: 3 },
        { clue: "<br>『充电器』<br>〈充电器〉", ans: "电器", id: 303, g: 3 },
        { clue: "<br>［分子］<br>〚夸克〛", ans: "原子", id: 304, g: 3 },
        { clue: "<br>〚分子〛<br>「数」", ans: "分数", id: 305, g: 3 },
        { clue: "「『中提琴』」", ans: "低音提琴", id: 306, g: 3 },
        { clue: "『「长方形」』", ans: "菱形", id: 307, g: 3 }
    ],
    [
        { clue: "<br>（二五一十）<br>《〈二五一十〉》", ans: "一五一十", id: 400, g: 4 },
        { clue: "<br>（麦旋风）<br>［手机］", ans: "麦克风", id: 401, g: 4 },
        { clue: "<br>（多媒体）<br>『三棱柱』", ans: "多面体", id: 402, g: 4 },
        { clue: "（南腔北调）", ans: "南水北调", id: 403, g: 4 },
        { clue: "（一丝不挂）", ans: "一丝不苟", id: 404, g: 4 }
    ],
    [
        { clue: "<br>（（原神启动））<br>「成语」", ans: "原封不动", id: 500, g: 5 },
        { clue: "<br>（（我不直道））<br>「成语」", ans: "微不足道", id: 501, g: 5 },
        { clue: "<br>（（真有意思））<br>「成语」", ans: "若有所思", id: 502, g: 5 },
        { clue: "<br>（（鹿目圆香））<br>「成语」", ans: "怒目圆睁", id: 503, g: 5 },
        { clue: "<br>（（五八四十））<br>「成语」", ans: "五湖四海", id: 504, g: 5 },
        { clue: "<br>（（冰糖雪梨））<br>「成语」", ans: "冰天雪地", id: 505, g: 5 },
        // { clue: "<br>（（精神病院））<br>「成语」", ans: "精神抖擞", id: 506, g: 5 },
        { clue: "<br>（（你完蛋了））<br>「成语」", ans: "没完没了", id: 507, g: 5 },
        // { clue: "<br>（（高中生活））<br>「成语」", ans: "无中生有", id: 508, g: 5 },
        { clue: "<br>（（一拜天地））<br>「成语」", ans: "一败涂地", id: 509, g: 5 },
        { clue: "<br>（（下大巴车））<br>「成语」", ans: "下里巴人", id: 510, g: 5 },
        { clue: "<br>（（粉蒸排骨））<br>「成语」", ans: "粉身碎骨", id: 511, g: 5 }
    ],
    [
        { clue: "<br>｟加斯加｠<br>〈《加斯加》〉", ans: "马达", id: 600, g: 6 },
        { clue: "<br>｟一五｠<br>｟二五｠", ans: "一十", id: 601, g: 6 },
        { clue: "<br>｟天时｠<br>｟奥｠", ans: "地利", id: 602, g: 6 },
        { clue: "<br>｟落花｠<br>｟行云｠", ans: "流水", id: 603, g: 6 },
        { clue: "｟｟舍生｠｠", ans: "断章", id: 604, g: 6 },
        { clue: "｟｟为人｠｠", ans: "出", id: 605, g: 6 },
        { clue: "｟｟显山｠｠", ans: "花", id: 606, g: 6 },
        { clue: "｟｟夜行｠｠", ans: "卫", id: 607, g: 6 },
        { clue: "｟｟危地｠｠", ans: "松", id: 608, g: 6 },
        { clue: "｟｟三百六｠｠", ans: "一目", id: 609, g: 6 },
        { clue: "｟＜｟＜｟懵懂｠＞｠＞｠", ans: "由衷", id: 610, g: 6 }
    ],
    [
        { clue: "<br>﹙记本脑﹚<br>〈《记本脑》〉", ans: "笔电", id: 700, g: 7 },
        { clue: "﹙大利﹚", ans: "意面", id: 701, g: 7 },
        { clue: "﹙共识分子﹚", ans: "公知", id: 702, g: 7 },
        { clue: "﹙会性亡﹚", ans: "社死", id: 703, g: 7 },
        { clue: "﹙工产﹚", ans: "人流", id: 704, g: 7 },
        { clue: "﹙分必﹚", ans: "充要条件", id: 705, g: 7 }
    ],
    [
        { clue: "〔子进程〕", ans: "紫禁城", id: 800, g: 8 },
        { clue: "〔雇工〕", ans: "故宫", id: 801, g: 8 },
        { clue: "〔焦灼〕", ans: "胶着", id: 802, g: 8 },
        { clue: "〔十堰市〕", ans: "实验室", id: 803, g: 8 }
    ],
    [
        { clue: "〔〈单缝衍射〉〕", ans: "丹凤眼", id: 900, g: 9 },
        { clue: "〔〈绝世武功〉〕", ans: "爵士舞", id: 901, g: 9 },
        { clue: "〔〈建筑设计〉〕", ans: "注射剂", id: 902, g: 9 },
        { clue: "〔〈却之不恭〉〕", ans: "织布工", id: 903, g: 9 },
        { clue: "〔〈干燥指数〉〕", ans: "造纸术", id: 904, g: 9 },
        { clue: "〔〈互争雄长〉〕", ans: "蒸熊掌", id: 905, g: 9 }
    ],
    [
        { clue: "〘通信员〙", ans: "同心圆", id: 1000, g: 10 },
        { clue: "〘筑基丹〙", ans: "煮鸡蛋", id: 1001, g: 10 },
        { clue: "〘〈爱屋及乌〉〙", ans: "无机物", id: 1002, g: 10 },
        { clue: "〘〈俯拾即是〉〙", ans: "腐蚀剂", id: 1003, g: 10 },
        { clue: "〘〈莫衷一是〉〙", ans: "中医师", id: 1004, g: 10 },
        { clue: "〘〈始终如一〉〙", ans: "石钟乳", id: 1005, g: 10 },
        { clue: "〘〈小肚鸡肠〉〙", ans: "消毒剂", id: 1006, g: 10 },
        { clue: "〘〈一无是处〉〙", ans: "医务室", id: 1007, g: 10 }
    ],
    [
        { clue: "〖背道而驰〗", ans: "南辕北辙", id: 1100, g: 11 },
        { clue: "〖坐享其成〗", ans: "不劳而获", id: 1101, g: 11 },
        { clue: "〖鱼目混珠〗", ans: "滥竽充数", id: 1102, g: 11 },
        { clue: "【阳春白雪】", ans: "下里巴人", id: 1103, g: 11 },
        { clue: "【有机可乘】", ans: "无懈可击", id: 1104, g: 11 },
        { clue: "【不孚众望】", ans: "不负众望", id: 1105, g: 11 }
    ],
    [
        { clue: "<br>﹝寄宿制﹞<br>﹝艺术日﹞", ans: "闭幕式", id: 1200, g: 12 },
        { clue: "<br>﹝注意力﹞<br>［导航地图］", ans: "目的地", id: 1201, g: 12 },
        { clue: "<br>﹝虎虎生风﹞<br>「锦囊牌」", ans: "五谷丰登", id: 1202, g: 12 },
        { clue: "<br>﹝振荡电路﹞<br>「神经递质」", ans: "肾上腺素", id: 1203, g: 12 },
        { clue: "<br>﹝功利主义﹞<br>《空》", ans: "空气阻力", id: 1204, g: 12 },
        { clue: "<br>﹝公共服务﹞<br>【充实】", ans: "空洞无物", id: 1205, g: 12 },
        { clue: "<br>﹝呜呜呜﹞<br>［楼］", ans: "出租屋", id: 1206, g: 12 },
        { clue: "<br>﹝咦咦咦﹞<br>「作业」", ans: "习题集", id: 1207, g: 12 },
        { clue: "﹝呓呓呓﹞", ans: "记忆力", id: 1208, g: 12 }
    ],
    [
        { clue: "<br>〘＜基础＞〙<br>〖基础〗", ans: "初级", id: 1300, g: 13 },
        { clue: "〘＜经纬线＞〙", ans: "显微镜", id: 1301, g: 13 },
        { clue: "〘＜奠基石＞〙", ans: "电视机", id: 1302, g: 13 },
        { clue: "〘＜无意识＞〙", ans: "医务室", id: 1303, g: 13 },
        { clue: "〘＜形式主义＞〙", ans: "衣食住行", id: 1304, g: 13 },
        { clue: "〘＜闭一只眼＞〙", ans: "一言蔽之", id: 1305, g: 13 },
        { clue: "〘＜不够意思＞〙", ans: "一丝不苟", id: 1306, g: 13 },
        { clue: "〘＜取之不尽＞〙", ans: "不知进取", id: 1307, g: 13 },
        { clue: "〘＜显微技术＞〙", ans: "县委书记", id: 1308, g: 13 },
        { clue: "〘＜一蓑烟雨＞〙", ans: "伊索寓言", id: 1309, g: 13 },
        { clue: "〘＜小玩意儿＞〙", ans: "莞尔一笑", id: 1310, g: 13 },
        { clue: "〘＜军事地理＞〙", ans: "势均力敌", id: 1311, g: 13 }
    ],
    [
        { clue: "【早点｝", ans: "晚点", id: 1400, g: 14 },
        { clue: "【去世｝", ans: "来世", id: 1401, g: 14 },
        { clue: "【轻生｝", ans: "重生", id: 1402, g: 14 },
        { clue: "【借口｝", ans: "还口", id: 1403, g: 14 },
        { clue: "【奇遇｝", ans: "偶遇", id: 1404, g: 14 },
        { clue: "【先生｝", ans: "后生", id: 1405, g: 14 },
        { clue: "【公交｝", ans: "私交", id: 1406, g: 14 },
        { clue: "【开心｝", ans: "关心", id: 1407, g: 14 },
        { clue: "【开怀｝", ans: "关怀", id: 1408, g: 14 },
        { clue: "【正切｝", ans: "反切", id: 1409, g: 14 },
        { clue: "｛推文】", ans: "推理", id: 1410, g: 14 },
        { clue: "｛变量】", ans: "变质", id: 1411, g: 14 },
        { clue: "｛出师】", ans: "出生", id: 1412, g: 14 },
        { clue: "｛咖啡果】", ans: "咖啡因", id: 1413, g: 14 },
        { clue: "〖目光｝", ans: "眼光", id: 1414, g: 14 },
        { clue: "｛鼓手〗", ans: "鼓掌", id: 1415, g: 14 }
    ],
    [
        { clue: "【｛天文｝】", ans: "地理", id: 1500, g: 15 },
        { clue: "【｛本月｝】", ans: "末日", id: 1501, g: 15 },
        { clue: "【｛幼时｝】", ans: "长空", id: 1502, g: 15 },
        { clue: "【｛幼师｝】", ans: "长生", id: 1503, g: 15 },
        { clue: "【｛反感｝】", ans: "同理", id: 1504, g: 15 },
        { clue: "【｛返回｝】", ans: "往来", id: 1505, g: 15 },
        { clue: "【｛合理｝】", ans: "分文", id: 1506, g: 15 },
        { clue: "【｛空手｝】", ans: "满足", id: 1507, g: 15 },
        { clue: "【｛实地｝】", ans: "虚空", id: 1508, g: 15 },
        { clue: "【｛歪理｝】", ans: "正文", id: 1509, g: 15 },
        { clue: "【｛外教｝】", ans: "中学", id: 1510, g: 15 },
        { clue: "【｛伪满｝】", ans: "真空", id: 1511, g: 15 },
        { clue: "【｛无理｝】", ans: "有感", id: 1512, g: 15 },
        { clue: "【｛邪恶｝】", ans: "正好", id: 1513, g: 15 },
        { clue: "【｛水手｝】", ans: "火腿", id: 1514, g: 15 },
        { clue: "【｛昨夕｝】", ans: "明朝", id: 1515, g: 15 },
        { clue: "〖｛老舍｝〗", ans: "故居", id: 1516, g: 15 },
        { clue: "〖｛再测｝〗", ans: "重量", id: 1517, g: 15 }
    ],
    [
        { clue: "〈﹛｛怙恃｝﹜〉", ans: "古寺", id: 1600, g: 16 },
        { clue: "〈﹛｛怔忡｝﹜〉", ans: "正中", id: 1601, g: 16 },
        { clue: "〈﹛｛猞猁｝﹜〉", ans: "舍利", id: 1602, g: 16 },
        { clue: "〈﹛｛咄嗟｝﹜〉", ans: "出差", id: 1603, g: 16 },
        { clue: "《﹛｛上下｝﹜》", ans: "忐忑", id: 1604, g: 16 },
        { clue: "《﹛｛原音｝﹜》", ans: "愿意", id: 1605, g: 16 },
        { clue: "《﹛｛木马｝﹜》", ans: "检验", id: 1606, g: 16 },
        { clue: "《﹛｛也门｝﹜》", ans: "他们", id: 1607, g: 16 },
        { clue: "《﹛｛加沙｝﹜》", ans: "袈裟", id: 1608, g: 16 },
        { clue: "《﹛｛白丁｝﹜》", ans: "拍打", id: 1609, g: 16 },
        { clue: "《﹛｛朝夕｝﹜》", ans: "潮汐", id: 1610, g: 16 },
        { clue: "《﹛｛元首｝﹜》", ans: "远道", id: 1611, g: 16 },
        { clue: "《﹛｛用户｝﹜》", ans: "拥护", id: 1612, g: 16 },
        { clue: "《﹛｛周长｝﹜》", ans: "惆怅", id: 1613, g: 16 },
        { clue: "《﹛｛秋田｝﹜》", ans: "愁思", id: 1614, g: 16 },
        { clue: "《﹛｛昆虫｝﹜》", ans: "混浊", id: 1615, g: 16 },
        { clue: "《﹛｛波罗｝﹜》", ans: "菠萝", id: 1616, g: 16 }
    ],
    [
        { clue: "＜《﹛｛由于｝﹜》＞", ans: "宇宙", id: 1700, g: 17 },
        { clue: "＜《﹛｛白虎｝﹜》＞", ans: "琥珀", id: 1701, g: 17 },
        { clue: "＜《﹛｛日月｝﹜》＞", ans: "阴阳", id: 1702, g: 17 },
        { clue: "＜《﹛｛员工｝﹜》＞", ans: "功勋", id: 1703, g: 17 },
        { clue: "＜《﹛｛白云｝﹜》＞", ans: "魂魄", id: 1704, g: 17 },
        { clue: "《〈﹛｛琵琶｝﹜〉》", ans: "枇杷", id: 1705, g: 17 },
        { clue: "《〈﹛｛浮游｝﹜〉》", ans: "蜉蝣", id: 1706, g: 17 }
    ],
    [
        { clue: "<br>〔｛长大｝〕<br>｟一反｠", ans: "常态", id: 1800, g: 18 },
        { clue: "<br>〔｛趁机｝〕<br>｟啧啧｠", ans: "称奇", id: 1801, g: 18 },
        { clue: "<br>〔｛禁航区｝〕<br>「音乐」", ans: "进行曲", id: 1802, g: 18 },
        { clue: "<br>〔｛炮兵｝〕<br>「甜点」", ans: "刨冰", id: 1803, g: 18 },
        { clue: "<br>〔｛闭校｝〕<br>「宗教」", ans: "佛教", id: 1804, g: 18 },
        { clue: "<br>〔｛成语｝〕<br>【恶名】", ans: "盛誉", id: 1805, g: 18 }
    ],
    [
        { clue: "<br>＜〔意见〕＞<br>〖意见〗", ans: "建议", id: 1900, g: 19 },
        { clue: "<br>〘震惊〙<br>【震惊】", ans: "镇静", id: 1901, g: 19 },
        { clue: "<br>〘刻意〙<br>〖刻意〗", ans: "可疑", id: 1902, g: 19 },
        { clue: "<br>〔切记〕<br>【切记】", ans: "切忌", id: 1903, g: 19 },
        { clue: "<br>［手表］<br>［｛手表｝］", ans: "指针", id: 1904, g: 19 },
        { clue: "【正应力｝", ans: "反应力", id: 1905, g: 19 },
        { clue: "<br>〖交付〗〖原因〗<br>［车］", ans: "发动机", id: 1906, g: 19 },
        { clue: "<br>〖泄露〗<br>「作品」", ans: "外传", id: 1907, g: 19 },
        { clue: "<br>《「省份」》<br>「成语」", ans: "东躲西藏", id: 1908, g: 19 },
        { clue: "〔（恍然大悟）〕", ans: "庞然大物", id: 1909, g: 19 },
        { clue: "｟〔｟不笑娼｠〕｠", ans: "东施", id: 1910, g: 19 },
        { clue: "﹙【｛﹙庭师﹚｝】﹚", ans: "中科院", id: 1911, g: 19 },
        { clue: "<br>﹙查理﹚<br>〖维护〗", ans: "检修", id: 1912, g: 19 },
        { clue: "〚十分】", ans: "百合", id: 1913, g: 19 },
        { clue: "＜（（笑贫不笑娼））＞", ans: "皮笑肉不笑", id: 1914, g: 19 },
        { clue: "<br>〖｛一个｝〗<br>『亿』", ans: "单位", id: 1915, g: 19 },
        { clue: "「『眼光｝｝", ans: "耳光", id: 1916, g: 19 },
        { clue: "｛［｛体面｝］］", ans: "面点", id: 1917, g: 19 }
    ],
    [
        { clue: "恭喜通关", ans: "恭喜通关", id: 2000, g: 20 }
    ]
];

function simpleMin(a, b) {
    return a < b ? a : b;
}

function getPuzzleList() {
    let openedGroup = parseInt(ctx.getProgress(PID, "openedGroup") || 0);
    let groupIndex = 0;
    let data = [];
    for (let i = 0; i <= simpleMin(openedGroup, PUZZLES.length - 1); i++) {
        groupIndex = i;
        let puzzles = [];
        for (let j = 0; j < PUZZLES[i].length; j++) {
            let p = PUZZLES[i][j];
            let finish = ctx.getProgress(PID, `f-${p.id}`) == "1" ? 1 : 0;
            if (p.id === 2000) {
                finish = ctx.hasPuzzleFinished(PID) ? 1 : 0
            }
            puzzles.push({
                id: p.id,
                clue: p.clue,
                f: finish,
                al: p.ans.length
            });
        }
        data.push({
            g: i,
            p: puzzles
        });
    }
    //判断之后还有没有剩余的组，如果有，则增加一组作为未解锁预览
    if (groupIndex + 1 < PUZZLES.length) {
        let lockedGroup = PUZZLES[groupIndex + 1];
        let puzzles = [];
        for (let j = 0; j < lockedGroup.length; j++) {
            puzzles.push({
                id: lockedGroup[j].id,
                clue: lockedGroup[j].clue.replace(/[^<br>]/g, "█"),
                f: 0,
                al: lockedGroup[j].ans.length,
                l: 1
            });
        }
        data.push({
            g: groupIndex + 1,
            p: puzzles,
            l: 1
        })
    }

    return data;
}

function checkAnswer(id, answer) {
    let g = parseInt(id / 100);
    if (!PUZZLES[g]) {
        return {
            r: 0
        }
    }

    //判断是否完成
    if (id == 2000) {
        let openedGroup = parseInt(ctx.getProgress(PID, "openedGroup") || 0);
        if (openedGroup >= 20 && answer == "恭喜通关") {
            if (!ctx.hasPuzzleFinished(PID)) {
                ctx.makePuzzleFinished(ctx.gid, PID, "恭喜通关！");
            }

            return {
                r: 1
            }
        }

        return {
            r: 0
        }
    }

    let group = PUZZLES[g];
    //遍历组中所有题目，如果是本题ID，则进行判定，否则记录是否回答正确。
    let correctCount = 0;
    let result = 0;
    for (let i = 0; i < group.length; i++) {
        let p = group[i];
        if (p.id == id) {
            //判定
            if (p.ans == answer) {
                ctx.setProgress(PID, `f-${p.id}`, "1"); //标记本题正确
                correctCount++;
                result = 1;
            }
        } else {
            if (ctx.getProgress(PID, `f-${p.id}`) == "1") {
                correctCount++;
            }
        }
    }

    //判断当前组是否达到了开启下一组的条件
    if (correctCount + parseInt(group.length / 10) + 2 >= group.length) {
        let openedGroup = parseInt(ctx.getProgress(PID, "openedGroup") || 0);
        let nextGroup = g + 1;
        if (openedGroup < nextGroup) {
            ctx.setProgress(PID, "openedGroup", nextGroup.toString());
        }
    }

    return {
        r: result
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
        let data = getPuzzleList();
        return {
            data
        }
    }

    if (request.type === 2) {
        return checkAnswer(request.id, request.answer);
    }
    
    return {
        error: 1
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

<h1>括号作用</h1>
<table id = "answerkey">
<tr><th>括号</th><th>作用</th></tr>
<tr><td>〈〉</td><td>减字</td></tr>
<tr><td>《》</td><td>增字</td></tr>
<tr><td>＜＞</td><td>重排</td></tr>
<tr><td>［］</td><td>部分</td></tr>
<tr><td>〚〛</td><td>整体</td></tr>
<tr><td>「」</td><td>下位概念</td></tr>
<tr><td>『』</td><td>上位概念</td></tr>
<tr><td>（）</td><td>替换一字</td></tr>
<tr><td>｟｠</td><td>组词另一半</td></tr>
<tr><td>﹙﹚</td><td>补全缩写</td></tr>
<tr><td>〔〕</td><td>同音</td></tr>
<tr><td>〘〙</td><td>谐音</td></tr>
<tr><td>﹝﹞</td><td>押韵</td></tr>
<tr><td>〖〗</td><td>同义</td></tr>
<tr><td>【】</td><td>反义</td></tr>
<tr><td>｛｝</td><td>逐字</td></tr>
<tr><td>﹛﹜</td><td>拆字</td></tr>
</table>
有多行题目时，每行得到的答案相同。<br>
两侧括号不同时，将词从某处分为两半后分别处理，此时的｛｝括号不产生作用。（单纯逐字并不会产生影响）<br>
<br>

<h1>答案</h1>
<table id = "answerkey">
<tr><th>题面</th><th>答案</th></tr>
<tr><td>复制</td><td>复制</td></tr>
<tr><td>粘贴</td><td>粘贴</td></tr>
<tr><td>恒等</td><td>恒等</td></tr>
<tr><td>变换</td><td>变换</td></tr>
<tr><td>〈涂改液〉</td><td>涂改</td></tr>
<tr><td>《添加》</td><td>添加剂</td></tr>
<tr><td>〈异亮氨酸〉</td><td>亮氨酸</td></tr>
<tr><td>〈哈萨克斯坦〉</td><td>萨克斯</td></tr>
<tr><td>《生意气》</td><td>书生意气</td></tr>
<tr><td>《分解反应》</td><td>复分解反应</td></tr>
<tr><td>《三角函数》</td><td>反三角函数</td></tr>
<tr><td>＜牛奶＞</td><td>奶牛</td></tr>
<tr><td>＜蜂蜜＞</td><td>蜜蜂</td></tr>
<tr><td>＜调音＞</td><td>音调</td></tr>
<tr><td>＜藏宝＞</td><td>宝藏</td></tr>
<tr><td>＜酱牛肉＞</td><td>牛肉酱</td></tr>
<tr><td>＜电压高＞</td><td>高压电</td></tr>
<tr><td>＜打飞鸡蛋＞</td><td>鸡飞蛋打</td></tr>
<tr><td>＜转运来时＞</td><td>时来运转</td></tr>
<tr><td>＜水电发力＞</td><td>水力发电</td></tr>
<tr><td>＜一不口心＞</td><td>心口不一</td></tr>
<tr><td>＜主不自由＞</td><td>不由自主</td></tr>
<tr><td>［太阳系］｜〈太阳系〉</td><td>太阳</td></tr>
<tr><td>〚刹车〛｜〈刹车〉</td><td>车</td></tr>
<tr><td>「金属」｜〈金属〉</td><td>金</td></tr>
<tr><td>『充电器』｜〈充电器〉</td><td>电器</td></tr>
<tr><td>［分子］｜〚夸克〛</td><td>原子</td></tr>
<tr><td>〚分子〛｜「数」</td><td>分数</td></tr>
<tr><td>「『中提琴』」</td><td>低音提琴</td></tr>
<tr><td>『「长方形」』</td><td>菱形</td></tr>
<tr><td>（二五一十）｜《〈二五一十〉》</td><td>一五一十</td></tr>
<tr><td>（麦旋风）｜［手机］</td><td>麦克风</td></tr>
<tr><td>（多媒体）｜『三棱柱』</td><td>多面体</td></tr>
<tr><td>（南腔北调）</td><td>南水北调</td></tr>
<tr><td>（一丝不挂）</td><td>一丝不苟</td></tr>
<tr><td>（（原神启动））｜「成语」</td><td>原封不动</td></tr>
<tr><td>（（我不直道））｜「成语」</td><td>微不足道</td></tr>
<tr><td>（（真有意思））｜「成语」</td><td>若有所思</td></tr>
<tr><td>（（鹿目圆香））｜「成语」</td><td>怒目圆睁</td></tr>
<tr><td>（（五八四十））｜「成语」</td><td>五湖四海</td></tr>
<tr><td>（（冰糖雪梨））｜「成语」</td><td>冰天雪地</td></tr>
<tr><td>（（你完蛋了））｜「成语」</td><td>没完没了</td></tr>
<tr><td>（（一拜天地））｜「成语」</td><td>一败涂地</td></tr>
<tr><td>（（下大巴车））｜「成语」</td><td>下里巴人</td></tr>
<tr><td>（（粉蒸排骨））｜「成语」</td><td>粉身碎骨</td></tr>
<tr><td>｟加斯加｠｜〈《加斯加》〉</td><td>马达</td></tr>
<tr><td>｟一五｠｜｟二五｠</td><td>一十</td></tr>
<tr><td>｟天时｠｜｟奥｠</td><td>地利</td></tr>
<tr><td>｟落花｠｜｟行云｠</td><td>流水</td></tr>
<tr><td>｟｟舍生｠｠</td><td>断章</td></tr>
<tr><td>｟｟为人｠｠</td><td>出</td></tr>
<tr><td>｟｟显山｠｠</td><td>花</td></tr>
<tr><td>｟｟夜行｠｠</td><td>卫</td></tr>
<tr><td>｟｟危地｠｠</td><td>松</td></tr>
<tr><td>｟｟三百六｠｠</td><td>一目</td></tr>
<tr><td>｟＜｟＜｟懵懂｠＞｠＞｠</td><td>由衷</td></tr>
<tr><td>﹙记本脑﹚｜〈《记本脑》〉</td><td>笔电</td></tr>
<tr><td>﹙大利﹚</td><td>意面</td></tr>
<tr><td>﹙共识分子﹚</td><td>公知</td></tr>
<tr><td>﹙会性亡﹚</td><td>社死</td></tr>
<tr><td>﹙工产﹚</td><td>人流</td></tr>
<tr><td>﹙分必﹚</td><td>充要条件</td></tr>
<tr><td>〔子进程〕</td><td>紫禁城</td></tr>
<tr><td>〔雇工〕</td><td>故宫</td></tr>
<tr><td>〔焦灼〕</td><td>胶着</td></tr>
<tr><td>〔十堰市〕</td><td>实验室</td></tr>
<tr><td>〔〈单缝衍射〉〕</td><td>丹凤眼</td></tr>
<tr><td>〔〈绝世武功〉〕</td><td>爵士舞</td></tr>
<tr><td>〔〈建筑设计〉〕</td><td>注射剂</td></tr>
<tr><td>〔〈却之不恭〉〕</td><td>织布工</td></tr>
<tr><td>〔〈干燥指数〉〕</td><td>造纸术</td></tr>
<tr><td>〔〈互争雄长〉〕</td><td>蒸熊掌</td></tr>
<tr><td>〘通信员〙</td><td>同心圆</td></tr>
<tr><td>〘筑基丹〙</td><td>煮鸡蛋</td></tr>
<tr><td>〘〈爱屋及乌〉〙</td><td>无机物</td></tr>
<tr><td>〘〈俯拾即是〉〙</td><td>腐蚀剂</td></tr>
<tr><td>〘〈莫衷一是〉〙</td><td>中医师</td></tr>
<tr><td>〘〈始终如一〉〙</td><td>石钟乳</td></tr>
<tr><td>〘〈小肚鸡肠〉〙</td><td>消毒剂</td></tr>
<tr><td>〘〈一无是处〉〙</td><td>医务室</td></tr>
<tr><td>〖背道而驰〗</td><td>南辕北辙</td></tr>
<tr><td>〖坐享其成〗</td><td>不劳而获</td></tr>
<tr><td>〖鱼目混珠〗</td><td>滥竽充数</td></tr>
<tr><td>【阳春白雪】</td><td>下里巴人</td></tr>
<tr><td>【有机可乘】</td><td>无懈可击</td></tr>
<tr><td>【不孚众望】</td><td>不负众望</td></tr>
<tr><td>﹝寄宿制﹞｜﹝艺术日﹞</td><td>闭幕式</td></tr>
<tr><td>﹝注意力﹞｜［导航地图］</td><td>目的地</td></tr>
<tr><td>﹝虎虎生风﹞｜「锦囊牌」</td><td>五谷丰登</td></tr>
<tr><td>﹝振荡电路﹞｜「神经递质」</td><td>肾上腺素</td></tr>
<tr><td>﹝功利主义﹞｜《空》</td><td>空气阻力</td></tr>
<tr><td>﹝公共服务﹞｜【充实】</td><td>空洞无物</td></tr>
<tr><td>﹝呜呜呜﹞｜［楼］</td><td>出租屋</td></tr>
<tr><td>﹝咦咦咦﹞｜「作业」</td><td>习题集</td></tr>
<tr><td>﹝呓呓呓﹞</td><td>记忆力</td></tr>
<tr><td>〘＜基础＞〙｜〖基础〗</td><td>初级</td></tr>
<tr><td>〘＜经纬线＞〙</td><td>显微镜</td></tr>
<tr><td>〘＜奠基石＞〙</td><td>电视机</td></tr>
<tr><td>〘＜无意识＞〙</td><td>医务室</td></tr>
<tr><td>〘＜形式主义＞〙</td><td>衣食住行</td></tr>
<tr><td>〘＜闭一只眼＞〙</td><td>一言蔽之</td></tr>
<tr><td>〘＜不够意思＞〙</td><td>一丝不苟</td></tr>
<tr><td>〘＜取之不尽＞〙</td><td>不知进取</td></tr>
<tr><td>〘＜显微技术＞〙</td><td>县委书记</td></tr>
<tr><td>〘＜一蓑烟雨＞〙</td><td>伊索寓言</td></tr>
<tr><td>〘＜小玩意儿＞〙</td><td>莞尔一笑</td></tr>
<tr><td>〘＜军事地理＞〙</td><td>势均力敌</td></tr>
<tr><td>【早点｝</td><td>晚点</td></tr>
<tr><td>【去世｝</td><td>来世</td></tr>
<tr><td>【轻生｝</td><td>重生</td></tr>
<tr><td>【借口｝</td><td>还口</td></tr>
<tr><td>【奇遇｝</td><td>偶遇</td></tr>
<tr><td>【先生｝</td><td>后生</td></tr>
<tr><td>【公交｝</td><td>私交</td></tr>
<tr><td>【开心｝</td><td>关心</td></tr>
<tr><td>【开怀｝</td><td>关怀</td></tr>
<tr><td>【正切｝</td><td>反切</td></tr>
<tr><td>｛推文】</td><td>推理</td></tr>
<tr><td>｛变量】</td><td>变质</td></tr>
<tr><td>｛出师】</td><td>出生</td></tr>
<tr><td>｛咖啡果】</td><td>咖啡因</td></tr>
<tr><td>〖目光｝</td><td>眼光</td></tr>
<tr><td>｛鼓手〗</td><td>鼓掌</td></tr>
<tr><td>【｛天文｝】</td><td>地理</td></tr>
<tr><td>【｛本月｝】</td><td>末日</td></tr>
<tr><td>【｛幼时｝】</td><td>长空</td></tr>
<tr><td>【｛幼师｝】</td><td>长生</td></tr>
<tr><td>【｛反感｝】</td><td>同理</td></tr>
<tr><td>【｛返回｝】</td><td>往来</td></tr>
<tr><td>【｛合理｝】</td><td>分文</td></tr>
<tr><td>【｛空手｝】</td><td>满足</td></tr>
<tr><td>【｛实地｝】</td><td>虚空</td></tr>
<tr><td>【｛歪理｝】</td><td>正文</td></tr>
<tr><td>【｛外教｝】</td><td>中学</td></tr>
<tr><td>【｛伪满｝】</td><td>真空</td></tr>
<tr><td>【｛无理｝】</td><td>有感</td></tr>
<tr><td>【｛邪恶｝】</td><td>正好</td></tr>
<tr><td>【｛水手｝】</td><td>火腿</td></tr>
<tr><td>【｛昨夕｝】</td><td>明朝</td></tr>
<tr><td>〖｛老舍｝〗</td><td>故居</td></tr>
<tr><td>〖｛再测｝〗</td><td>重量</td></tr>
<tr><td>〈﹛｛怙恃｝﹜〉</td><td>古寺</td></tr>
<tr><td>〈﹛｛怔忡｝﹜〉</td><td>正中</td></tr>
<tr><td>〈﹛｛猞猁｝﹜〉</td><td>舍利</td></tr>
<tr><td>〈﹛｛咄嗟｝﹜〉</td><td>出差</td></tr>
<tr><td>《﹛｛上下｝﹜》</td><td>忐忑</td></tr>
<tr><td>《﹛｛原音｝﹜》</td><td>愿意</td></tr>
<tr><td>《﹛｛木马｝﹜》</td><td>检验</td></tr>
<tr><td>《﹛｛也门｝﹜》</td><td>他们</td></tr>
<tr><td>《﹛｛加沙｝﹜》</td><td>袈裟</td></tr>
<tr><td>《﹛｛白丁｝﹜》</td><td>拍打</td></tr>
<tr><td>《﹛｛朝夕｝﹜》</td><td>潮汐</td></tr>
<tr><td>《﹛｛元首｝﹜》</td><td>远道</td></tr>
<tr><td>《﹛｛用户｝﹜》</td><td>拥护</td></tr>
<tr><td>《﹛｛周长｝﹜》</td><td>惆怅</td></tr>
<tr><td>《﹛｛秋田｝﹜》</td><td>愁思</td></tr>
<tr><td>《﹛｛昆虫｝﹜》</td><td>混浊</td></tr>
<tr><td>《﹛｛波罗｝﹜》</td><td>菠萝</td></tr>
<tr><td>＜《﹛｛由于｝﹜》＞</td><td>宇宙</td></tr>
<tr><td>＜《﹛｛白虎｝﹜》＞</td><td>琥珀</td></tr>
<tr><td>＜《﹛｛日月｝﹜》＞</td><td>阴阳</td></tr>
<tr><td>＜《﹛｛员工｝﹜》＞</td><td>功勋</td></tr>
<tr><td>＜《﹛｛白云｝﹜》＞</td><td>魂魄</td></tr>
<tr><td>《〈﹛｛琵琶｝﹜〉》</td><td>枇杷</td></tr>
<tr><td>《〈﹛｛浮游｝﹜〉》</td><td>蜉蝣</td></tr>
<tr><td>〔｛长大｝〕｜｟一反｠</td><td>常态</td></tr>
<tr><td>〔｛趁机｝〕｜｟啧啧｠</td><td>称奇</td></tr>
<tr><td>〔｛禁航区｝〕｜「音乐」</td><td>进行曲</td></tr>
<tr><td>〔｛炮兵｝〕｜「甜点」</td><td>刨冰</td></tr>
<tr><td>〔｛闭校｝〕｜「宗教」</td><td>佛教</td></tr>
<tr><td>〔｛成语｝〕｜【恶名】</td><td>盛誉</td></tr>
<tr><td>＜〔意见〕＞｜〖意见〗</td><td>建议</td></tr>
<tr><td>〘震惊〙｜【震惊】</td><td>镇静</td></tr>
<tr><td>〘刻意〙｜〖刻意〗</td><td>可疑</td></tr>
<tr><td>〔切记〕｜【切记】</td><td>切忌</td></tr>
<tr><td>［手表］｜［｛手表｝］</td><td>指针</td></tr>
<tr><td>【正应力｝</td><td>反应力</td></tr>
<tr><td>〖交付〗〖原因〗｜［车］</td><td>发动机</td></tr>
<tr><td>〖泄露〗｜「作品」</td><td>外传</td></tr>
<tr><td>《「省份」》｜「成语」</td><td>东躲西藏</td></tr>
<tr><td>〔（恍然大悟）〕</td><td>庞然大物</td></tr>
<tr><td>｟〔｟不笑娼｠〕｠</td><td>东施</td></tr>
<tr><td>﹙【｛﹙庭师﹚｝】﹚</td><td>中科院</td></tr>
<tr><td>﹙查理﹚｜〖维护〗</td><td>检修</td></tr>
<tr><td>〚十分】</td><td>百合</td></tr>
<tr><td>＜（（笑贫不笑娼））＞</td><td>皮笑肉不笑</td></tr>
<tr><td>〖｛一个｝〗｜『亿』</td><td>单位</td></tr>
<tr><td>「『眼光｝｝</td><td>耳光</td></tr>
<tr><td>｛［｛体面｝］］</td><td>面点</td></tr>
<tr><td>恭喜通关</td><td>恭喜通关</td></tr>
</table>

## 提示

### 1. 调整增加次数价格



### 2. 〈〉是什么意思！

删去若干字。

### 3. 《》是什么意思！

给括号里的词语增加若干字；与｛｝配合时则是对每字增加相同部件。

### 4. ＜＞是什么意思！

将字重新排列。

### 5. ［］是什么意思！

答案是括号内事物的一部分。

### 6. 〚〛是什么意思！

括号内事物是答案的一部分。

### 7. 「」是什么意思！

下位概念，即答案是括号内事物的一个分类或个例。

### 8. 『』是什么意思！

上位概念，即括号内事物是答案的一个分类或个例。

### 9. （）是什么意思！

替换一个字。

### 10. ｟｠是什么意思！

答案可以跟括号内连起来成为新的词。

### 11. ﹙﹚是什么意思！

括号内是一个词去掉了缩写后的部分，需要的答案就是缩写。例如“当欧尼！”的答案是“别酱了”。

### 12. 〔〕是什么意思？

同音词。

### 13. 〘〙是什么意思！

谐音，音调可以不一样。

### 14. ﹝﹞是什么意思！

押韵，音调需要一致。

### 15. 〖〗是什么意思！

同义词。

### 16. 【】是什么意思！

反义词。

### 17. ｛｝是什么意思！

逐字进行相同的处理，而非把括号内当作一个整体理解。例如“上海”逐字的反义词可能是“下山”。

### 18. ﹛﹜是什么意思！

在部件层面进行处理。

### 19. 多行题目是什么意思！

每行均能得出同一个答案。

### 20. 两侧括号不同是什么意思！

两侧括号不同时，将词从某处分为两半后分别处理，此时的｛｝括号不产生作用。

### 21. 『「长某某」』答案是什么？

菱形

### 22. ｟｟夜某｠｠的答案是什么

卫

### 23. ﹙分某﹚的答案是什么

充要条件

### 24. ﹝寄某某﹞｜﹝艺某某﹞的答案是什么

闭幕式

### 25. ﹝某某某﹞｜［楼］的答案是什么

出租屋

### 26. ｛咖某某】的答案是什么

咖啡因

### 27. 【｛某师｝】的答案是什么

长生

### 28. 【｛合某｝】的答案是什么

分文

### 29. 〖｛某测｝〗的答案是什么

重量

### 30. 《﹛｛木某｝﹜》的答案是什么

检验

### 31. 〔｛成某｝〕｜【某某】的答案是什么

盛誉

### 32. 〖泄某〗｜「某某」的答案是什么

外传

### 33. 〖交某〗〖某某〗｜［某］的答案是什么

发动机

### 34. ﹙【｛﹙庭师﹚｝】﹚的答案是什么

中科院


## 中间答案

| 提交 | 回复 | 附加信息 |
| --- | --- | --- |
| 重置 | 成功重置了状态 | clear |

## 本地附件

- [320398c9d0084679ae55e48627b0d209.webp](../../../assets/static.cipherpuzzles.com/static/images/320398c9d0084679ae55e48627b0d209.webp)
- [3cfc7d96722049f9abe08dcbc890d4a4.vue](../../../assets/static.cipherpuzzles.com/static/images/3cfc7d96722049f9abe08dcbc890d4a4.vue)

来源：[https://ccbc16.cipherpuzzles.com/data/puzzles/48.json](https://ccbc16.cipherpuzzles.com/data/puzzles/48.json)
