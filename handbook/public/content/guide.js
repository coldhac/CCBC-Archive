(function () {
  "use strict";

  const guide = {
    version: "1.0.0",
    schemaVersion: "1.0.0",
    title: "CCBC 现场解谜机制与卡点手册",
    subtitle: "用卡住症状定位下一步，用多轴标签检索相似机制",
    principles: [
      "机制标签是多选的。一道题通常同时具有载体、核心操作、提取方式和知识域标签。",
      "先描述自己卡在哪个阶段，再判断题型；现场检索时，阶段通常比题名相似更有用。",
      "先验证小样例，再批量处理；任何重复劳动都应建立在至少一个可核验样例上。",
      "把观察、假设、已验证规则和中间产物分开记录，避免团队把猜测当成结论。",
      "默认只请求能推动一步的提示。完整中间结果和官解应处于更高泄露等级。"
    ],
    tagUsage: {
      formula: "卡点症状 + 载体 A + 核心操作 B + 提取/结构 C + 知识域 D",
      example: "不会提取 + 图像颜色 + 分组配对 + 序号提取 + 地理旗帜",
      confidenceLevels: [
        { id: "explicit", label: "明确", definition: "官解或官方提示直接说明该机制。" },
        { id: "inferred", label: "推断", definition: "题面与解法足以可靠确认，但原文未直接命名。" },
        { id: "weak", label: "弱命中", definition: "仅有关键词或表面相似，现场检索默认降权。" }
      ]
    },
    axes: [
      {
        id: "carrier",
        code: "A",
        label: "载体与表征",
        question: "信息主要藏在哪里？",
        description: "描述玩家首先接触到的媒介和信息形态，不等同于真正解法。",
        categories: [
          {
            id: "A1_text_word",
            label: "文字与词汇",
            definition: "题面以单词、定义、句子、词长、横线或段落结构承载主要信息。",
            aliases: ["文字题", "词语题", "英文词", "定义题", "补词", "word puzzle"],
            signals: ["大量横线或词长", "释义和例句", "词语列表", "重复句式", "大小写或标点异常"],
            quickTest: "遮住图片后，只看文字、词长和排列，题目是否仍保留大部分可操作信息？",
            steps: ["抄出精确文本并保留大小写、空格和标点", "标注词长、共同前后缀与重复结构", "尝试补全、分词、重排、增删替换和读音关系"],
            pitfalls: ["过早把文案当纯剧情", "清洗文本时丢失空格、标点或字体差异", "只按中文语义思考而忽略英文形式"],
            representativeIds: ["ccbc12:problem:c-p1764", "ccbc13-14:ccbc-13-12", "ccbc16:puzzle:18"]
          },
          {
            id: "A2_hanzi_phonology",
            label: "汉字与语音文字学",
            definition: "汉字字形、部件、笔画、拼音、声调、谐音、五笔或四角号码是显著载体。",
            aliases: ["拆字", "字谜", "拼音", "谐音", "部首", "笔画", "Chinese wordplay"],
            signals: ["生僻字或错别字密集", "字形被切分、旋转或重叠", "声母韵母和声调提示", "部件、笔顺、编码编号"],
            quickTest: "把汉字换成同义词后题目是否失效？若失效，机制多半依赖字形或读音。",
            steps: ["分别建立字形层、读音层、语义层记录", "检查偏旁部件、笔画数、封闭区与笔顺", "检查拼音、声调、同音近音、押韵和方言可能性"],
            pitfalls: ["混淆简繁体或不同字形标准", "把谐音误当严格同音", "笔画数未统一字典标准"],
            representativeIds: ["ccbc13-14:ccbc-13-4", "ccbc13-14:ccbc-13-7", "ccbc16:puzzle:48"]
          },
          {
            id: "A3_visual_symbol",
            label: "图像、图标与颜色",
            definition: "图片、剪影、图标、emoji、颜色、字体或视觉负形承担主要信息。",
            aliases: ["看图说话", "认图", "图标题", "颜色题", "剪影", "emoji"],
            signals: ["正文很少而图片很多", "重复使用少数颜色或形状", "图标属于同一套视觉系统", "轮廓、留白或方向异常"],
            quickTest: "图片能否稳定命名为对象、颜色、方向、作品或符号？这些名称的长度是否匹配题面？",
            steps: ["先做客观视觉描述，不急于命名", "记录颜色、方向、数量、位置和尺寸", "识别候选后检查整套图片是否来自同一体系"],
            pitfalls: ["凭第一印象锁死识别结果", "忽略图片裁切、镜像、透明层或负空间", "颜色名称与显示设备存在偏差"],
            representativeIds: ["ccbc12:problem:b-p2058", "ccbc13-14:ccbc-13-6", "ccbc16:puzzle:14"]
          },
          {
            id: "A4_audio_video",
            label: "音频、视频与动画",
            definition: "音高、节奏、歌词、音色、画面帧、动作或动画周期是有效信息。",
            aliases: ["音乐题", "听歌", "视频题", "MV", "音高", "动画", "audio puzzle"],
            signals: ["附件为音频或视频", "每小节结构重复", "画面与声音不同步或被修改", "题面要求播放、拖动或逐帧查看"],
            quickTest: "改变播放速度、查看频谱/乐谱或逐帧后，是否出现稳定的离散单位？",
            steps: ["记录时长、分段、重复周期和声道", "尝试变速不变调、变调不变速、频谱与逐帧", "把音高、次数、动作或差异转成离散符号"],
            pitfalls: ["只凭听感猜曲名", "转码丢失声道或时间信息", "忽略静音、元数据和画面文字"],
            representativeIds: ["ccbc12:problem:b-p1982", "ccbc12:problem:f-p2018", "ccbc13-14:ccbc-13-2"]
          },
          {
            id: "A5_grid_data_numeric",
            label: "网格、表格与数字",
            definition: "行列、格点、矩阵、公式、坐标、数字序列或数据表构成题面骨架。",
            aliases: ["表格题", "矩阵", "方阵", "数字题", "网格题", "data puzzle"],
            signals: ["每行每列条件", "行列标题或坐标", "大量数字和公式", "规则在局部邻域或整行整列上成立"],
            quickTest: "交换两行、两列或转置后，哪些性质保持不变？行列汇总是否能解释给定数字？",
            steps: ["保真抄录行列与坐标", "计算行列和、积、频次、差值与对称性", "检查转置、邻接、周期和矩阵运算"],
            pitfalls: ["抄错一格导致全局矛盾", "忽略零基/一基索引", "视觉排版中的空格被误当空值"],
            representativeIds: ["ccbc11:problem:13", "ccbc11:problem:30", "ccbc15:problem:3-21"]
          },
          {
            id: "A6_spatial_physical",
            label: "空间与实物操作",
            definition: "折叠、裁切、旋转、翻转、叠放、拼图、立体模型、迷宫或物理模拟不可忽略。",
            aliases: ["折纸", "立体题", "拼图", "迷宫", "旋转", "空间想象", "physical puzzle"],
            signals: ["折线或裁切线", "展开图与三视图", "可移动碎片", "路径、机关、光线、水流或重力叙述"],
            quickTest: "纸上画箭头或做一个低成本模型后，方向、相邻关系或遮挡是否变得明确？",
            steps: ["给每个面、边、碎片编号并标方向", "用纸模或截图图层验证变换", "记录每一步状态，避免靠脑内旋转连续推演"],
            pitfalls: ["镜像与旋转混淆", "忘记观察者视角变化", "连续操作后无法复盘中间状态"],
            representativeIds: ["ccbc11:problem:9", "ccbc12:problem:b-p1989", "ccbc16:puzzle:43"]
          },
          {
            id: "A7_web_code_interactive",
            label: "网页、代码与交互",
            definition: "页面状态、按钮反馈、源码、控制台、程序片段或可交互游戏承载题目。",
            aliases: ["交互题", "网页题", "代码题", "F12", "控制台", "CTF", "interactive"],
            signals: ["页面有自定义控件", "正文异常短或空白", "脚本生成内容", "输入会改变状态", "出现代码或编程语言"],
            quickTest: "查看页面源、控制台、网络资源和交互前后状态，是否出现题面未显示的信息？",
            steps: ["先保存初始状态和资源", "检查可见交互、DOM、控制台与脚本常量", "区分解题机制、答案校验和纯展示代码"],
            pitfalls: ["把技术故障误当谜题", "盲目阅读全部压缩代码", "直接改状态跳关而错过机制"],
            representativeIds: ["ccbc12:problem:a-p1853", "ccbc13-14:ccbc-14-20", "ccbc16:puzzle:22"]
          }
        ]
      },
      {
        id: "operation",
        code: "B",
        label: "核心操作与机制",
        question: "玩家真正需要反复做什么？",
        description: "描述从输入到中间结果的主要变换，可以同时标多个机制。",
        categories: [
          {
            id: "B1_identify_research",
            label: "识别与外部检索",
            definition: "先把素材识别成作品、人物、地点、序列、标准集合或专业对象，再继续解题。",
            aliases: ["认图", "查出处", "百科", "OEIS", "搜原曲", "知识题", "identification"],
            signals: ["题面给出多件同类素材", "需要标准英文名或固定顺序", "提示明确鼓励搜索", "识别结果本身长度可提取"],
            quickTest: "候选答案能否全部落入一个边界清楚、顺序稳定的集合？",
            steps: ["先列客观特征和多个候选", "用两个以上特征交叉验证", "记录标准名、别名、语言版本和权威顺序"],
            pitfalls: ["只找到一个相似对象就停止验证", "搜索结果受当前年份或地区版本影响", "中英文名称长度不同"],
            representativeIds: ["ccbc11:problem:8", "ccbc12:problem:f-p2018", "ccbc12:problem:b-p2058"]
          },
          {
            id: "B2_classical_cipher",
            label: "古典密码与编码",
            definition: "使用摩尔斯、盲文、旗语、猪圈、凯撒、Atbash、A1Z26、九键、棋盘或进制等标准编码。",
            aliases: ["古典密码", "码表", "摩斯", "盲文", "旗语", "凯撒", "cipher"],
            signals: ["规则化点线或方向", "数字集中在固定范围", "成组符号尺寸一致", "标题暗示通信、键盘、镜像或位移"],
            quickTest: "符号的取值数、分组长度和方向是否匹配某种标准码表的容量？",
            steps: ["统计符号字母表和分组边界", "确定阅读方向、位序、分隔符和版本", "用一个高置信样例验证后再批量解码"],
            pitfalls: ["有码表就硬套", "方向、端序或黑白极性反了", "忽略扩展字符和非英文版本"],
            representativeIds: ["ccbc12:problem:ccbc12-pages-loopstage_main", "ccbc12:problem:c-p1909", "ccbc15:problem:1-1"]
          },
          {
            id: "B3_lexical_transform",
            label: "词汇变换",
            definition: "对词或短语做重排、增删替换、拼合、分割、词梯、缩写、同反义或谐音操作。",
            aliases: ["变词", "重排", "加字母", "删字母", "换字", "拼词", "wordplay"],
            signals: ["词长接近", "多个词共享字母集合", "定义似乎差一个字", "结果可再次形成常见词"],
            quickTest: "比较候选词的多重集：是否总能用同一种小变换互相转换？",
            steps: ["规范大小写但保留重复字母", "计算增删差集与位置变化", "检查语义关系、读音关系和变换后的自然顺序"],
            pitfalls: ["把字母集合当字符串，漏掉重复次数", "只接受完全重排而忽略增删一字母", "中文分词边界不稳定"],
            representativeIds: ["ccbc12:problem:c-p1764", "ccbc13-14:ccbc-13-13", "ccbc16:puzzle:18"]
          },
          {
            id: "B4_glyph_transform",
            label: "字形与部件操作",
            definition: "在字形层面对汉字、字母或符号做拆分、组合、加减、旋转、重叠、取笔画或数封闭区。",
            aliases: ["拆字", "合字", "部件加减", "笔画重排", "象形", "glyph"],
            signals: ["字被切块或框选", "箭头连接字形", "题面强调第几画、偏旁或封闭区域", "结果可拼成新字"],
            quickTest: "不读字义，只看轮廓和部件，题面关系是否仍成立？",
            steps: ["统一字体与简繁体", "标出可分离部件和变换方向", "逐步画出加减前后，检查结果是否为稳定字形"],
            pitfalls: ["不同字体部件形态不一致", "把视觉相似误当规范部件", "忽略操作针对每个字还是整个词"],
            representativeIds: ["ccbc13-14:ccbc-13-4", "ccbc13-14:ccbc-13-7", "ccbc16:puzzle:48"]
          },
          {
            id: "B5_constraint_logic",
            label: "约束推理与纸笔谜题",
            definition: "依据局部和全局条件逐步排除，完成数独、Masyu、Nonogram、Star Battle、Battleship、填字或自定义逻辑盘面。",
            aliases: ["逻辑题", "纸笔谜题", "数独", "填字", "唯一解", "logic puzzle"],
            signals: ["每行每列恰好若干", "相邻或不相邻限制", "格内候选逐步缩小", "规则要求唯一解"],
            quickTest: "能否为每条规则写出可机械检查的约束，并找到当前候选最少的位置？",
            steps: ["先完整重述规则并标单位", "建立候选和已满足约束", "从最紧约束、极值和矛盾假设推进", "阶段性验证所有规则"],
            pitfalls: ["偷偷加入熟悉题型的默认规则", "把题目给定数字和自己填入数字混淆", "过早猜测导致后续伪矛盾"],
            representativeIds: ["ccbc11:problem:13", "ccbc12:problem:e-p2051", "ccbc15:problem:5-42"]
          },
          {
            id: "B6_math_formal_compute",
            label: "数学、形式系统与计算",
            definition: "核心需要数列、进制、概率、排列组合、群、博弈、递推、算法或形式演算。",
            aliases: ["数学题", "进制", "算法", "SG函数", "置换", "lambda", "formal system"],
            signals: ["公式或运算符密集", "结果需要大量精确计算", "提示需要编程", "存在递推、状态空间或抽象代数对象"],
            quickTest: "能否用小输入手算出题目样例，并明确运算顺序、取整方式和数值范围？",
            steps: ["形式化定义输入输出", "用最小样例核对记号", "再决定手算、表格或脚本", "对边界值和取整单独测试"],
            pitfalls: ["把装饰数学当真实机制或反之", "运算结合顺序错误", "浮点、进制和取整约定不一致"],
            representativeIds: ["ccbc15:problem:3-21", "ccbc13-14:ccbc-14-20", "ccbc16:puzzle:35"]
          },
          {
            id: "B7_spatial_transform_path",
            label: "几何变换、路径与模拟",
            definition: "通过折叠、镜像、旋转、叠图、异或、滑动、巡游、流体或机关状态得到信息。",
            aliases: ["路径题", "叠图", "异或", "折叠", "滑块", "模拟", "spatial transform"],
            signals: ["箭头或路线", "多层透明图", "前后状态差异", "物体沿规则移动", "题面描述物理过程"],
            quickTest: "给关键点编号并执行一步后，所有对象的位置和朝向能否无歧义更新？",
            steps: ["固定坐标系与观察方向", "一次只做一个变换并保存快照", "检查路径是否覆盖、相交、闭合或留下未用元素"],
            pitfalls: ["复合变换顺序颠倒", "旋转中心错误", "移动对象与移动观察者混淆"],
            representativeIds: ["ccbc11:problem:10", "ccbc12:problem:b-p1989", "ccbc16:puzzle:43"]
          },
          {
            id: "B8_group_match_order",
            label: "分组、配对、分类与排序",
            definition: "依据共同属性、对应关系、顺序键或一一匹配，把对象组织成有意义结构。",
            aliases: ["分组", "配对", "分类", "排序", "matching", "grouping"],
            signals: ["对象数量可整齐分组", "两侧列表数量相等", "每组共享唯一属性", "题面给日期、颜色、长度或编号"],
            quickTest: "每个对象是否恰好使用一次，并且每组都有同一种可解释关系？",
            steps: ["列出候选属性矩阵", "先锁定唯一匹配和极端长度", "完成后检查一一性与排序键"],
            pitfalls: ["用不同标准凑不同组", "一个对象被重复使用", "先猜顺序再倒推分组导致过拟合"],
            representativeIds: ["ccbc11:problem:15", "ccbc13-14:ccbc-14-13417492", "ccbc16:puzzle:14"]
          },
          {
            id: "B9_compare_set_overlay",
            label: "比较、集合与叠合",
            definition: "通过差异、交集、差集、重合、异或、缺失或多版本比较提取信息。",
            aliases: ["找不同", "交集", "差集", "剩余", "重合", "异或", "compare"],
            signals: ["两份相似素材", "多答案共享字母", "明显有未使用元素", "透明层或版本差异"],
            quickTest: "把对象转换成集合、多重集或同坐标图层后，差异是否稀疏且可读？",
            steps: ["先对齐顺序、大小和坐标", "区分集合与多重集", "分别检查交集、对称差、补集与逐位异或"],
            pitfalls: ["未对齐就比较", "忽略重复字母", "把随机噪声当有意差异"],
            representativeIds: ["ccbc11:problem:4", "ccbc11:problem:22", "ccbc12:problem:c-metac"]
          },
          {
            id: "B10_reconstruct_stego",
            label: "逆向重建与隐写",
            definition: "从错误提交、残缺素材、页面源码、零宽字符、负空间或隐藏层恢复原始信息。",
            aliases: ["隐写", "隐藏信息", "逆向", "恢复原题", "F12", "零宽字符", "steganography"],
            signals: ["表面内容异常少", "给出大量错误结果", "页面说什么都没有", "空白、格式或源码可疑"],
            quickTest: "切换纯文本、十六进制、DOM、图层或差分视图后，是否出现结构化信号？",
            steps: ["保留原始字节与格式", "枚举可见层、源码层、编码层和历史状态", "用恢复出的局部信息反向验证生成过程"],
            pitfalls: ["复制粘贴时清掉隐写字符", "把网站框架代码当题目", "错误提交未按题目分组就直接分析"],
            representativeIds: ["ccbc13-14:ccbc-13-12", "ccbc15:problem:4-32", "ccbc15:problem:6-51"]
          },
          {
            id: "B11_iterate_reuse_recursive",
            label: "重复、复用与递归",
            definition: "同一机制需再次执行，或复用前题、前区、往届机制与此前答案递归构造新题。",
            aliases: ["再来一次", "复用机制", "递归", "回到开头", "用之前答案", "iteration"],
            signals: ["第一次得到的是指示而非答案", "题面引用上一次或过去题目", "结构分层且每层相似", "答案成为下一层输入"],
            quickTest: "把刚完成的操作作用于中间产物，能否继续产生同类型、长度合理的结果？",
            steps: ["写清每轮输入、操作和输出", "确认终止条件", "区分复用机制与复用答案", "每轮保存中间结果"],
            pitfalls: ["只做一轮就强行提交", "递归层级偏一", "无止境重复而未检查终止信号"],
            representativeIds: ["ccbc11:problem:16", "ccbc13-14:ccbc-13-9", "ccbc16:puzzle:42"]
          },
          {
            id: "B12_state_game_exploration",
            label: "状态探索、组合游戏与密室",
            definition: "需要通过操作反馈发现规则、规划状态转移、赢得游戏或推进多房间机关。",
            aliases: ["组合游戏", "密室", "状态机", "试关卡", "解锁", "escape room"],
            signals: ["每次操作改变可用动作", "有胜负或终局条件", "物品可拾取组合", "不同时间或房间状态"],
            quickTest: "能否把当前状态、合法动作和目标写成一张状态转移表？",
            steps: ["记录初始状态与所有可交互物", "一次改变一个变量观察反馈", "寻找不变量、必胜态或依赖图", "保留重置和复现路径"],
            pitfalls: ["随机点击却不记录", "把偶然反馈当规则", "跳过中间状态导致后续物品缺失"],
            representativeIds: ["ccbc13-14:ccbc-14-19", "ccbc13-14:ccbc-14-20", "ccbc16:puzzle:43"]
          }
        ]
      },
      {
        id: "extraction",
        code: "C",
        label: "提取与 Hunt 结构",
        question: "中间结果怎样变成答案？",
        description: "描述最后读取、二次变换及 feeder/Meta 依赖。提取机制应与主体机制分开标注。",
        categories: [
          {
            id: "C1_direct_decode",
            label: "直接解码",
            definition: "主体操作的输出按原顺序直接组成答案，无额外索引或重排。",
            aliases: ["直接读", "逐个解码", "按顺序连接", "direct decode"],
            signals: ["每个单位稳定给出一个字母", "题面顺序天然明确", "中间结果长度等于答案长度"],
            quickTest: "把最可靠的前三个单位直接连接，是否像自然语言开头？",
            steps: ["确认单位边界", "确认自然阅读顺序", "逐项解码并保留未知位占位符"],
            pitfalls: ["看到数字就多做一次 A1Z26", "擅自重排已经有自然顺序的结果", "未知位被删除导致错位"],
            representativeIds: ["ccbc12:problem:a-p1709", "ccbc12:problem:b-p1982"]
          },
          {
            id: "C2_indexed_extract",
            label: "序号与坐标提取",
            definition: "由数字、颜色、年份、位置、坐标或另一组对象决定从字符串中取第 n 位。",
            aliases: ["按数字取字母", "索引", "坐标", "颜色序", "indexing"],
            signals: ["对象旁有小数字", "数字范围不大于词长", "颜色可映射固定顺序", "a/b、行列坐标或年份后两位"],
            quickTest: "索引是否全部合法，并能解释题面每一个数字或颜色？",
            steps: ["明确一基还是零基", "确定被索引的标准名称和语言", "先验证一个题面明示样例", "按独立排序键输出"],
            pitfalls: ["索引和排序用成同一组数字", "空格连字符是否计数不统一", "英文名版本选择错误"],
            representativeIds: ["ccbc12:problem:f-p2018", "ccbc12:problem:b-p2063", "ccbc13-14:ccbc-13-13417491"]
          },
          {
            id: "C3_initial_final_acrostic",
            label: "首尾、藏头与位置字母",
            definition: "读取首字母、尾字母、首尾组合、每行固定位置或藏头藏尾。",
            aliases: ["首字母", "尾字母", "藏头", "藏尾", "acrostic"],
            signals: ["多行或多对象等长排列", "题面强调头尾、起终点", "首字母形成明显片段"],
            quickTest: "分别读首、尾、首尾交替和固定列，哪种能解释题面提示且不需重排？",
            steps: ["保留原行序", "明确多词答案取一个还是多个首字母", "对未知项保留空位"],
            pitfalls: ["多词答案只取了一个首字母", "先排序后藏头却未验证排序依据", "把标题也无理由纳入"],
            representativeIds: ["ccbc12:problem:b-metab", "ccbc12:problem:c-metac", "ccbc12:problem:ccbc12-pages-loopstage_main"]
          },
          {
            id: "C4_residue_intersection",
            label: "剩余、交集与差集",
            definition: "读取未使用元素、唯一公共字母、差异位、补集或消去后残留。",
            aliases: ["剩下什么", "未用字母", "共同字母", "消去", "residue"],
            signals: ["主体步骤使用了大部分元素但仍有少量剩余", "对象成对且有唯一共同项", "题面强调多余、缺少、重合"],
            quickTest: "残留数量是否稳定地每组一项，且所有输入都能被解释？",
            steps: ["标记已用元素而非直接删除", "区分集合与多重集", "按原位置或另给顺序读取残留"],
            pitfalls: ["重复字母只消去一次或消去过多", "漏掉反向单词", "残留仍需排序却直接提交"],
            representativeIds: ["ccbc11:problem:30", "ccbc12:problem:c-metac", "ccbc13-14:ccbc-13-3"]
          },
          {
            id: "C5_read_order_path",
            label: "阅读顺序与路径",
            definition: "箭头、路线、环、坐标、棋步、传统书写方向或空间遍历决定读取次序。",
            aliases: ["读法", "路径读取", "箭头顺序", "环形读取", "reading order"],
            signals: ["题面有起点、箭头、编号或路线", "结果在二维或三维布局中", "常规从左到右读不通"],
            quickTest: "路径能否恰好覆盖目标元素一次，并由题面唯一确定起点与方向？",
            steps: ["标明起点、朝向和转向规则", "给访问序列编号", "先读前几位检查语言信号", "检查漏读和重复"],
            pitfalls: ["方向正确但起点错一格", "从观察者视角与对象视角混读", "把路径构造和路径读取混为一步"],
            representativeIds: ["ccbc11:problem:10", "ccbc13-14:ccbc-13-8", "ccbc12:problem:a-p1947"]
          },
          {
            id: "C6_symbol_binary_render",
            label: "符号化与二/多进制呈现",
            definition: "把有无、黑白、颜色、点线、方向或类别转成位串、数字或字符图。",
            aliases: ["有无转二进制", "黑白编码", "点线", "bit pattern", "binary render"],
            signals: ["每组恰有两类或三类状态", "固定 5/6/8 位一组", "题面暗示开关、阴阳、点划或像素"],
            quickTest: "翻转极性后，哪一套能在多个分组上同时得到合法字符？",
            steps: ["确定符号到数值映射", "确定高低位顺序和分组", "同时试极性与端序", "用可打印范围或码表校验"],
            pitfalls: ["只试一种黑白极性", "五位 A1Z26 与真正二进制混淆", "前导零被丢失"],
            representativeIds: ["ccbc11:problem:30", "ccbc12:problem:c-p1909", "ccbc11:problem:m4"]
          },
          {
            id: "C7_visual_negative_shape",
            label: "负空间、象形与显像",
            definition: "通过空隙、轮廓、光栅、像素图、轨迹或排列后的整体形状直接看出字母。",
            aliases: ["看负形", "象形字母", "空白区域", "显字", "negative space"],
            signals: ["操作后出现规则黑白图", "线条之间有刻意空隙", "题面提示远看、眯眼、叠图或动画"],
            quickTest: "缩小、反色、模糊或只看空白区域后，是否出现标准字形？",
            steps: ["统一缩放与方向", "分别查看正形和负形", "尝试反色、镜像、旋转和降采样", "记录字形置信度"],
            pitfalls: ["过度脑补模糊字形", "图像缩放插值破坏细线", "整体还需分格却连在一起看"],
            representativeIds: ["ccbc12:problem:a-p2085", "ccbc12:problem:c-p1738", "ccbc15:problem:4-32"]
          },
          {
            id: "C8_answer_transform_reapply",
            label: "答案二次变换与机制复用",
            definition: "中间答案不是最终答案，需要按标题、原机制、其他题机制或新指示再次变换。",
            aliases: ["答案还要处理", "再做一次", "复用前题", "二次提取", "reapply"],
            signals: ["中间结果是清晰指令", "提交得到阶段反馈", "题目明确引用其他题", "结果格式与最终答案不符"],
            quickTest: "中间结果能否被读作操作说明、机制名称或另一题的输入？",
            steps: ["判断中间结果是答案、线索还是指令", "定位被引用机制及其输入格式", "执行时保留原顺序", "用答案长度和反馈校验"],
            pitfalls: ["读到英文短语就直接提交", "只复用答案而非机制", "复用机制时忘记本题新增的方向或排序"],
            representativeIds: ["ccbc11:problem:16", "ccbc13-14:ccbc-13-9", "ccbc16:puzzle:50"]
          },
          {
            id: "C9_feeder_meta",
            label: "Feeder 汇总型 Meta",
            definition: "多个小题答案作为输入，经统一统计、填盘、关联或变换得到 Meta 答案。",
            aliases: ["小题答案", "feeder", "小 Meta", "汇总题", "meta puzzle"],
            signals: ["题面引用本区答案", "输入数量与格数匹配", "每个 feeder 提供一个词或特征"],
            quickTest: "列出所有可用 feeder 后，题面结构能否解释它们的数量、长度或属性？",
            steps: ["先锁定输入集合和标准化答案", "建立 feeder 到位置/属性的映射", "检查是否全部恰好使用一次", "再执行统一提取"],
            pitfalls: ["输入集合不全就硬解", "小题答案空格与词形未统一", "默认每个 feeder 都必须使用"],
            representativeIds: ["ccbc11:problem:m4", "ccbc11:problem:mm", "ccbc16:puzzle:55"]
          },
          {
            id: "C10_meta_matching",
            label: "Meta Matching",
            definition: "需要自行把 feeder 答案与线索、操作或位置一一配对，再从匹配关系中提取。",
            aliases: ["Meta matching", "答案配线索", "自行配对", "feeder matching"],
            signals: ["两组数量相等的答案与线索", "每条机制看似对应某个 feeder", "没有预先给定映射"],
            quickTest: "是否存在唯一匹配矩阵，并且每个 feeder 与每条线索都恰好用一次？",
            steps: ["分别列出 feeder 特征和线索要求", "先匹配长度、字母或主题唯一项", "传播排除", "用未匹配项检查整体一致性"],
            pitfalls: ["局部语义很像就锁死", "允许一条 feeder 被多用却无题面依据", "忽略答案需要先变形再匹配"],
            representativeIds: ["ccbc16:puzzle:14", "ccbc16:puzzle:18", "ccbc11:problem:m8"]
          },
          {
            id: "C11_recursive_meta",
            label: "递归 Meta 与 Meta 链",
            definition: "Meta 答案继续作为更高层 Meta 的输入，或题目按元、元元等层级递归依赖。",
            aliases: ["Meta-meta", "递归元谜题", "层级 Meta", "meta chain"],
            signals: ["多个 Meta 互相引用", "答案层层加入输入", "题面强调元的次数或回到最初"],
            quickTest: "能否画出无歧义依赖图，并为每层确定输入只来自更早层？",
            steps: ["画依赖 DAG 或层级表", "从无依赖节点开始", "每层验证答案格式", "最后检查是否回收全部层级信息"],
            pitfalls: ["把高层提示提前用于低层造成循环论证", "层级编号偏一", "遗漏共享答案或跨区输入"],
            representativeIds: ["ccbc16:puzzle:42", "ccbc13-14:ccbc-1314-1314", "ccbc11:problem:fm"]
          },
          {
            id: "C12_interactive_multistage",
            label: "交互式多阶段流程",
            definition: "题目按关卡、房间、层、时间或解锁状态推进，每阶段产物成为下一阶段钥匙。",
            aliases: ["多阶段", "密室流程", "层层解锁", "checkpoint", "multistage"],
            signals: ["页面内容随操作变化", "拿到物品或密码后出现新区域", "提示按房间/关卡编号", "可保存中间状态"],
            quickTest: "当前阶段的目标、产物和下一处使用位置能否各用一句话写清？",
            steps: ["维护阶段清单和物品栏", "每次解锁记录触发条件", "区分一次性操作与可逆操作", "在 checkpoint 保存截图和中间码"],
            pitfalls: ["团队成员状态不同步", "阶段产物被误当最终答案", "刷新页面丢失状态后无法复现"],
            representativeIds: ["ccbc13-14:ccbc-14-19", "ccbc16:puzzle:43", "ccbc13-14:ccbc-14-22"]
          }
        ]
      },
      {
        id: "domain",
        code: "D",
        label: "知识域",
        question: "需要调用哪类外部知识？",
        description: "知识域只帮助搜索和分工，不代表机制；同一机制可以出现在任何知识域。",
        categories: [
          { id: "D1_chinese_linguistics", label: "汉语与文字学", definition: "汉字结构、拼音声调、成语、古诗文、书法与传统编码。", aliases: ["汉字", "古诗", "拼音", "成语", "书法"], signals: ["拆字与部首", "诗词出处", "声调或方言", "笔画与编码"], quickTest: "是否需要确定具体字形、标准读音或传统文本版本？", steps: ["统一简繁和字典标准", "核对原文与作者", "分开处理字形、读音、语义"], pitfalls: ["版本异文", "笔画标准不同", "网络流行读音误导"], representativeIds: ["ccbc13-14:ccbc-13-7", "ccbc16:puzzle:48"] },
          { id: "D2_language_literature", label: "语言、文学与翻译", definition: "跨语言词义、惯用语、文学作品、人物与文本关系。", aliases: ["翻译", "外语", "文学", "双关", "惯用语"], signals: ["多语种并列", "非字面意义", "作品引用", "译名差异"], quickTest: "直译不通时，是否存在惯用语、固定译名或词源关系？", steps: ["保留原文拼写", "查权威译名和习语", "比较字面义与实际义"], pitfalls: ["机器翻译抹掉双关", "不同译本名称不一"], representativeIds: ["ccbc13-14:ccbc-13-14", "ccbc13-14:ccbc-13-16"] },
          { id: "D3_music_stage", label: "音乐与舞台艺术", definition: "歌曲、乐理、音游、歌剧、舞蹈和演出节目。", aliases: ["音乐", "歌曲", "歌剧", "音游", "乐理"], signals: ["音频曲目", "音符和弦", "角色唱段", "节奏和歌词"], quickTest: "需要的是听辨作品、分析乐理，还是比较被改动的音频？", steps: ["先切分音频", "识别曲目与版本", "再提取音高、节奏或歌词差异"], pitfalls: ["翻唱版本不同", "音名体系混用"], representativeIds: ["ccbc12:problem:f-p2018", "ccbc12:problem:c-p1865"] },
          { id: "D4_pop_culture_games", label: "影视、动漫与游戏", definition: "电子游戏、动漫、影视作品、角色、道具和系列版本知识。", aliases: ["动漫", "游戏", "电影", "角色", "宝可梦"], signals: ["角色剪影", "作品 logo", "关卡截图", "版本专属属性"], quickTest: "所有素材是否来自同一作品、厂牌、世代或类型？", steps: ["识别作品和版本", "使用官方或专业 wiki", "记录标准英文名与固定顺序"], pitfalls: ["跨世代数据变化", "中文译名不同"], representativeIds: ["ccbc12:problem:e-p2051", "ccbc13-14:ccbc-13-3"] },
          { id: "D5_geography_flags_transport", label: "地理、旗帜与交通", definition: "国家城市、地图轮廓、河流、旗帜、地铁、区号与交通网络。", aliases: ["地理", "国旗", "地图", "城市", "地铁", "河流"], signals: ["轮廓和坐标", "旗色与国名", "线路图", "区号和缩写"], quickTest: "识别结果能否落到标准地理集合，并给出唯一英文名、代码或顺序？", steps: ["锁定尺度和年代", "核对官方代码与译名", "标经纬、方向和邻接"], pitfalls: ["历史疆界变化", "同名城市", "线路版本过期"], representativeIds: ["ccbc12:problem:b-p2063", "ccbc11:problem:2"] },
          { id: "D6_history_calendar_culture", label: "历史、历法与文化常识", definition: "历史事件人物、年代、日历、节日、传统顺序和社会文化。", aliases: ["历史", "年份", "日历", "节日", "文化常识"], signals: ["特定年份", "历史人物", "月份星期", "时代限定"], quickTest: "题面是否明确限制到某一历史时点，导致今天的答案不同？", steps: ["记录题面基准日期", "使用同时期资料", "区分公历、农历和地区习惯"], pitfalls: ["用当前数据回答历史题", "日期格式混淆"], representativeIds: ["ccbc12:problem:b-p1989", "ccbc12:problem:b-p2016"] },
          { id: "D7_math_logic", label: "数学与逻辑", definition: "数论、代数、几何、组合、概率、数列、逻辑谜题和形式证明。", aliases: ["数学", "逻辑", "数列", "几何", "概率"], signals: ["公式和证明条件", "唯一解", "数值规律", "组合状态"], quickTest: "能否把条件写成方程、约束或算法，并在小例子上验证？", steps: ["形式化变量", "找不变量与边界", "必要时编写验证器"], pitfalls: ["相关性误当规律", "只拟合给定样例"], representativeIds: ["ccbc11:problem:13", "ccbc13-14:ccbc-14-20"] },
          { id: "D8_natural_science", label: "自然科学", definition: "物理、化学、生物、天文、地质和科学史对象。", aliases: ["物理", "化学", "生物", "天文", "元素"], signals: ["公式和单位", "元素周期表", "物种属性", "天体轨道"], quickTest: "题目需要专业概念本身，还是只借科学符号做编码？", steps: ["确认术语与单位", "查标准表格", "核对科学量和符号"], pitfalls: ["单位制混用", "旧分类与新分类不同"], representativeIds: ["ccbc12:problem:b-p2001", "ccbc11:problem:4"] },
          { id: "D9_computing_web", label: "计算机与网络", definition: "编程语言、算法、字符编码、网页、操作系统和网络技术。", aliases: ["编程", "代码", "网页", "ASCII", "Unicode", "算法"], signals: ["代码片段", "控制台", "字符编码", "程序输出"], quickTest: "代码是否需要真正执行，还是只需识别算法、语言或排版？", steps: ["识别语言和年代", "在沙箱运行小例子", "检查编码和端序"], pitfalls: ["直接运行不可信代码", "语言版本差异"], representativeIds: ["ccbc12:problem:a-p1853", "ccbc16:puzzle:22"] },
          { id: "D10_sports_boardgames", label: "体育、棋类与竞技", definition: "体育项目、队徽、赛事、棋类规则和竞技记录。", aliases: ["体育", "足球", "田径", "棋类", "五子棋"], signals: ["队徽与比分", "世界纪录", "棋盘局面", "赛事年份"], quickTest: "需要识别对象、求合法走法，还是按竞技记录排序？", steps: ["确定规则版本", "核对赛事时点", "记录标准名称与坐标"], pitfalls: ["规则年代变化", "队徽改版"], representativeIds: ["ccbc12:problem:b-p2058", "ccbc12:problem:c-p1799"] },
          { id: "D11_art_design_typography", label: "艺术、设计与字体", definition: "画作、视觉设计、logo、字体、色彩系统和印刷表现。", aliases: ["画作", "艺术", "logo", "字体", "设计"], signals: ["名画或风格引用", "特殊字体", "颜色体系", "版式异常"], quickTest: "作品识别、构图关系和字体名称中，哪一项能解释题面操作？", steps: ["识别视觉来源", "核对原作方向和颜色", "检查字体字符映射"], pitfalls: ["网络图被裁切或调色", "字体 fallback 改变字形"], representativeIds: ["ccbc11:problem:28", "ccbc13-14:ccbc-14-13417492"] },
          { id: "D12_everyday_objects_food", label: "日常物品、品牌与食物", definition: "食物配方、器具、票据、键盘、品牌和生活流程。", aliases: ["生活常识", "食物", "品牌", "键盘", "器具"], signals: ["配方和成分", "商品包装", "日常操作顺序", "设备布局"], quickTest: "对象是否有稳定的行业标准、配方或布局可用于排序和提取？", steps: ["先确定通用名与品牌名", "查标准配方或布局", "关注地区和年代版本"], pitfalls: ["品牌差异", "把常识近似当精确比例"], representativeIds: ["ccbc12:problem:a-p1780", "ccbc12:problem:a-p2024"] }
        ]
      }
    ],
    symptoms: [
      {
        id: "S0_access_render",
        name: "题面、资源或交互不可见",
        shortName: "看不到题",
        description: "尚未进入解题阶段：题面空白、资源打不开、交互卡住，或不确定空白是否为题意。",
        aliases: ["题在哪里", "题面在哪里", "图片挂了", "音频打不开", "页面卡住", "一直处理中", "按钮没反应"],
        signals: ["页面空白或只剩标题", "浏览器报资源错误", "队友看到的内容不同", "刷新前后状态不一致"],
        stage: "access",
        nextStep: "先区分技术故障与刻意留白：保存页面状态，核对标题、源码、附件和官方公告。",
        quickQuestions: ["其他队员能看到吗？", "标题、空白、源码或控制台是否本身携带信息？", "是否缺少必须的附件或解锁状态？"],
        quickTest: "用另一浏览器或无缓存打开，并查看资源请求；若所有人都一致空白，再把空白当机制。",
        steps: ["截图并记录时间和已做操作", "检查附件、网络、控制台与页面源码", "核对题目公告和解锁条件", "确认技术正常后再分析刻意空白"],
        pitfalls: ["把网站 bug 当谜题", "刷新导致交互状态丢失", "为找隐写而跳过明显的资源 404"],
        representativeIds: ["ccbc15:problem:4-32", "ccbc15:problem:6-51", "ccbc16:puzzle:55"]
      },
      {
        id: "S1_no_entry",
        name: "完全不知道从何入手",
        shortName: "没思路",
        description: "能看到完整题面，但尚未形成可验证的观察或第一步。",
        aliases: ["我毫无头绪", "我毫无思路", "要做什么", "这是什么", "从哪开始", "完全不会"],
        signals: ["没有抄录或分类", "只在泛泛猜主题", "无法说出题面最异常的三处"],
        stage: "entry",
        nextStep: "先做清点：列出对象、重复、差异、数量、格式和题目刻意给出的限制。",
        quickQuestions: ["哪些信息重复得不自然？", "对象数量能组成什么结构？", "标题和示例强调了哪个动作？"],
        quickTest: "不用解释题意，只写出三条可被队友复核的客观观察。",
        steps: ["按载体分类题面信息", "数数量、词长、颜色和重复", "找题面给的样例或极端项", "提出可在一小部分上验证的假设"],
        pitfalls: ["立刻搜题名导致被主题带偏", "提出无法证伪的宏大猜想", "忽略标题、说明和排版"],
        representativeIds: ["ccbc12:problem:a-p1709", "ccbc13-14:ccbc-14-20", "ccbc16:puzzle:42"]
      },
      {
        id: "S2_recognition",
        name: "素材、出处或码表认不出来",
        shortName: "认不出",
        description: "知道需要命名或识别题面对象，但卡在图片、歌曲、人物、作品、符号或标准题型。",
        aliases: ["这是什么图", "哪首歌", "这些人是谁", "什么密码", "哪个作品", "看不出来"],
        signals: ["已有对象切分但名称为空", "候选很多且无法验证", "后续步骤依赖标准英文名"],
        stage: "recognition",
        nextStep: "先提取可搜索的客观特征，再用整组共性验证，不要单图单猜。",
        quickQuestions: ["这些对象是否来自同一集合？", "题目需要中文名、英文名还是编号？", "是否有一件最容易锁定的锚点？"],
        quickTest: "一个候选必须同时解释至少两个独立特征，并与整组主题一致。",
        steps: ["记录颜色、轮廓、文字和上下文", "从最独特对象建立锚点", "反查同系列列表", "统一名称和版本"],
        pitfalls: ["以图搜图的第一个结果即定案", "混用不同世代或地区译名", "识别对象正确但取了错误属性"],
        representativeIds: ["ccbc12:problem:f-p2018", "ccbc13-14:ccbc-13-6", "ccbc11:problem:8"]
      },
      {
        id: "S3_source_scope",
        name: "知道要查，但版本或范围不明确",
        shortName: "查不到准确信息",
        description: "已经识别知识域或资料类型，却因版本、年代、语言、范围过大或关键词不足无法落到唯一数据。",
        aliases: ["用哪个版本", "范围太大", "帮我锁定", "资料来源", "翻译不出来", "查到很多种"],
        signals: ["不同网站数据互相冲突", "结果长度随译名变化", "题面注明比赛时点或初代版本"],
        stage: "research",
        nextStep: "提取题面中的时间、地区、语言、世代与数量约束，把查询限定到同一标准。",
        quickQuestions: ["题面基准日期是什么？", "有没有明确的世代、平台、语言或国家？", "答案长度能排除哪些版本？"],
        quickTest: "所选版本应让整组对象使用同一数据源且所有索引合法。",
        steps: ["列出版本分歧", "以题面时点和示例选标准", "保存来源链接和标准名", "用第二个对象交叉验证"],
        pitfalls: ["用今天的数据解历史题", "同一题混用多个数据库", "机器翻译改变字母数"],
        representativeIds: ["ccbc11:problem:12", "ccbc12:problem:e-p2051", "ccbc16:puzzle:52"]
      },
      {
        id: "S4_rule_inference",
        name: "不懂符号、箭头或局部规则",
        shortName: "不懂规则",
        description: "已识别题面组件，但不能把颜色、箭头、括号、数字或每行变化写成确定操作。",
        aliases: ["箭头是什么意思", "括号是什么意思", "数字怎么用", "每行什么规律", "颜色干什么", "看不懂机制"],
        signals: ["能命名输入与输出却解释不了关系", "同类符号反复出现", "有示例但尚未形式化"],
        stage: "rule",
        nextStep: "挑最短或已知输入输出的一组，列出变前/变后差异，只推一个符号的作用。",
        quickQuestions: ["哪个样例输入输出都已知？", "符号改变的是字形、读音、位置还是类别？", "同色或同方向是否始终同操作？"],
        quickTest: "把猜出的规则用于第二个独立样例，能否无额外补丁得到正确形态？",
        steps: ["分离每种符号", "从单变量样例推规则", "写成明确输入输出", "跨样例验证"],
        pitfalls: ["一次解释多个符号导致过拟合", "把箭头方向当阅读方向而非变换", "规则只对一个样例成立"],
        representativeIds: ["ccbc11:problem:4", "ccbc16:puzzle:48", "ccbc16:puzzle:50"]
      },
      {
        id: "S5_setup_group_map",
        name: "不知道如何分组、配对或填盘",
        shortName: "不会组织素材",
        description: "对象已识别、局部规则也大致明确，但缺少输入到组、位置、格子或线索的一一映射。",
        aliases: ["怎么分组", "怎么配对", "填什么词", "哪些答案要用", "放到哪里", "怎么对应"],
        signals: ["两侧对象数量相等", "每个对象有多个候选位置", "局部都能解释但整体冲突"],
        stage: "setup",
        nextStep: "建立候选矩阵，先放长度、数量或属性唯一的对象，再传播排除。",
        quickQuestions: ["是否要求每个对象恰好使用一次？", "哪个对象候选最少？", "有无长度、颜色、年代等硬约束？"],
        quickTest: "完整映射必须解释全部对象，且每组使用同一种关系。",
        steps: ["列对象和位置属性", "标硬约束与软联想", "优先处理唯一候选", "完成后检查一一性"],
        pitfalls: ["用不同理由勉强配不同项", "重复使用对象", "把排序问题误作配对问题"],
        representativeIds: ["ccbc11:problem:15", "ccbc13-14:ccbc-13-13417491", "ccbc16:puzzle:14"]
      },
      {
        id: "S6_logic_progress",
        name: "逻辑盘面或约束推理推不动",
        shortName: "推不动",
        description: "已经正确建模并完成部分盘面，但找不到下一条必然推论。",
        aliases: ["死锁了", "给个切入点", "能简化吗", "下一步推哪里", "纸笔谜题卡住", "做不下去"],
        signals: ["有候选标记", "规则没有明显违反", "开始反复扫盘却无新增"],
        stage: "solve",
        nextStep: "找候选最少的行列或格，重算全局计数、边界和交叉约束；必要时做短矛盾假设。",
        quickQuestions: ["哪条约束最接近饱和？", "边角是否比内部受限更多？", "能否假设一个二选一并在两步内推出矛盾？"],
        quickTest: "下一步必须能引用具体规则证明，而不是因为图案看起来应该如此。",
        steps: ["重核规则与抄盘", "扫描极值和饱和约束", "交叉两类约束", "做有界分支并立即回填结论"],
        pitfalls: ["忘记隐藏或附加规则", "猜测后不做标记", "用最终答案形状反推盘面"],
        representativeIds: ["ccbc11:problem:13", "ccbc16:puzzle:31", "ccbc12:problem:e-p2051"]
      },
      {
        id: "S7_contradiction_nonunique",
        name: "出现矛盾、多解或不稳定结果",
        shortName: "矛盾或多解",
        description: "执行现有理解后违反条件、存在多个合法结果，或不同队员得到不一致答案。",
        aliases: ["填的时候有矛盾", "解不唯一", "怎么算都不对", "有多个答案", "结果不稳定"],
        signals: ["索引越界", "约束冲突", "盘面多解", "只有加入额外假设才能完成"],
        stage: "validation",
        nextStep: "先回退到最后一个已验证状态，区分抄录错、规则漏、方向错和题面隐藏约束。",
        quickQuestions: ["最早在哪一步产生矛盾？", "是否偷偷用了熟悉题型的默认规则？", "反向、镜像、零基或另一版本能否消除系统性错误？"],
        quickTest: "用独立方法检查候选解是否满足每一条原文规则。",
        steps: ["定位首个冲突", "重核输入和单位", "逐条开关假设", "比较多个解的共同部分寻找提取目标"],
        pitfalls: ["直接重做却不找首错", "把官方隐藏规则当 bug", "为了唯一解臆造约束"],
        representativeIds: ["ccbc11:problem:14", "ccbc11:problem:m2", "ccbc15:problem:3-21"]
      },
      {
        id: "S8_execution_tool",
        name: "知道方法但不会执行或缺少工具",
        shortName: "不会执行",
        description: "机制已经说得清楚，但手工成本、编程、音频、图像、数学或专业软件阻碍实际完成。",
        aliases: ["具体怎么执行", "我不会编程", "听不出音高", "需要专业技术", "怎么算", "用什么工具"],
        signals: ["算法明确但数据量大", "需要转谱、逐帧或图层", "手算容易出错", "有可机械验证过程"],
        stage: "execution",
        nextStep: "先为一个小样例定义准确输入输出，再选择表格、脚本或专业工具批量处理。",
        quickQuestions: ["最小可验证样例是什么？", "工具是否会改变原始数据？", "结果如何人工抽查？"],
        quickTest: "工具对题面示例或一项已知结果必须输出正确答案。",
        steps: ["写清算法而非直接写代码", "保留原始文件", "对小样例调试", "批量执行后抽查边界项"],
        pitfalls: ["自动化错误被批量放大", "工具默认设置改变速度、采样或编码", "为一次性小任务过度开发"],
        representativeIds: ["ccbc12:problem:c-metac", "ccbc16:puzzle:22", "ccbc16:puzzle:35"]
      },
      {
        id: "S9_ordering",
        name: "对象齐了，但不知道排序或阅读顺序",
        shortName: "不会排序",
        description: "已经得到完整对象、字母或小题答案集合，尚未找到输出顺序。",
        aliases: ["怎么排序", "提取顺序", "日期有什么用", "从哪边读", "按什么顺序"],
        signals: ["字母重排后疑似答案", "题面有日期、颜色、编号或空间位置尚未使用", "集合正确但字符串乱码"],
        stage: "ordering",
        nextStep: "清点未使用的题面信息，优先尝试题号、空间、时间、长度和标准集合顺序。",
        quickQuestions: ["什么信息还没用？", "顺序是输入自带还是解后生成？", "是否有明确起点、方向和并列项规则？"],
        quickTest: "排序键应对所有对象有定义，且不依赖先知道最终答案。",
        steps: ["列出候选排序键", "先用硬顺序", "处理并列和方向", "检查结果语言性但不以其为唯一证据"],
        pitfalls: ["为了拼出词随意重排", "把提取数字误作排序数字", "排序键中有当前时点变化数据"],
        representativeIds: ["ccbc11:problem:3", "ccbc11:problem:30", "ccbc13-14:ccbc-14-13417492"]
      },
      {
        id: "S10_extraction",
        name: "主体完成，但不知道如何提取",
        shortName: "不会提取",
        description: "盘面、识别、分组或变换已完成，却不知道看哪些格、取哪些字母或怎样编码成答案。",
        aliases: ["该如何提取", "最后一步", "看哪里", "怎么取字母", "答案怎么读"],
        signals: ["有完整中间表", "仍有颜色、数字、框线或未用元素", "结果数量接近答案长度"],
        stage: "extraction",
        nextStep: "做未使用信息审计：数字、颜色、框、粗体、路径、差异和题名通常在此阶段发挥作用。",
        quickQuestions: ["题面哪些设计还没解释？", "每组能否稳定产出一个字母？", "取字母后用什么顺序读？"],
        quickTest: "提取规则应覆盖所有组、索引全部合法，并解释题面显眼标记。",
        steps: ["列出未用信号", "先试直接、索引、首尾、交差集", "确定顺序", "检查长度和语言但保留未知位"],
        pitfalls: ["见数字就 A1Z26", "同时猜提取和排序导致过拟合", "忽略答案需要二次变换"],
        representativeIds: ["ccbc11:problem:1", "ccbc12:problem:b-p2063", "ccbc16:puzzle:55"]
      },
      {
        id: "S11_gibberish_validation",
        name: "提取后乱码、长度不符或提交不对",
        shortName: "结果不对",
        description: "已经有字符串或候选答案，但表现为乱码、系统性错位、字母数不合或验证失败。",
        aliases: ["字母数对不上", "提取是乱码", "为什么不对", "提交不正确", "结果扭曲", "差一点"],
        signals: ["大量近似正确字母", "周期性错位", "结果可读但格式不符", "中间答案反馈命中"],
        stage: "validation",
        nextStep: "不要立刻换机制；检查方向、端序、极性、索引基准、排序、名称版本及是否需要再做一次。",
        quickQuestions: ["错误是随机还是系统性的？", "反向、镜像或整体移位后是否改善？", "结果可能是指令而非答案吗？"],
        quickTest: "只改一个全局约定，应同时修正多个位置；否则更可能是局部输入错误。",
        steps: ["保留当前结果", "按全局约定逐项排查", "定位首个异常单位", "检查提交规范和阶段反馈"],
        pitfalls: ["用字谜网站强行拟合乱码", "同时改多个假设", "泄露最终答案来反修过程"],
        representativeIds: ["ccbc11:problem:16", "ccbc13-14:asteroid-125", "ccbc15:problem:5-44"]
      },
      {
        id: "S12_intermediate_next",
        name: "拿到中间答案或指令后不知道下一步",
        shortName: "然后呢",
        description: "已经得到一句通顺文字、一个对象或阶段答案，却不清楚它是答案、操作说明还是下一阶段钥匙。",
        aliases: ["接下来怎么办", "然后呢", "这是什么意思", "怎么使用", "得到一句话了", "中间答案后"],
        signals: ["结果是祈使句或机制名", "提交得到阶段反馈", "题面仍有大片未使用区域", "结果格式明显不像答案"],
        stage: "transition",
        nextStep: "给中间产物分类：最终答案、指令、搜索词、密码、位置、机制名或另一个输入。",
        quickQuestions: ["它是名词还是祈使句？", "题面还有什么组件没用？", "这句话能否精确指向一个动作或另一题机制？"],
        quickTest: "执行解释后的动作，应消耗此前未用信息并产生可验证的新结构。",
        steps: ["原样抄录中间产物", "尝试分词与标点", "映射到未使用组件", "执行最小可逆动作"],
        pitfalls: ["通顺短语直接当最终答案", "搜索短语后随便选结果", "忽略交互页面需要实际执行指令"],
        representativeIds: ["ccbc11:problem:27", "ccbc16:puzzle:22", "ccbc16:puzzle:54"]
      },
      {
        id: "S13_repeat_recursion",
        name: "会第一组，但不会推广或递归",
        shortName: "不会重复机制",
        description: "已解出一个样例或一层，不确定其他组如何变体、是否需重复同一操作或何时终止。",
        aliases: ["只会第一条", "后面怎么做", "是不是再做一次", "要重复几次", "回到哪里"],
        signals: ["多组结构相似", "第一轮输出仍是结构化输入", "题面强调循环、再、元或复用"],
        stage: "iteration",
        nextStep: "写成输入→操作→输出表，比较第一组与第二组只改变了哪个参数。",
        quickQuestions: ["每组共享什么，不同什么？", "上一轮输出是否满足同一输入格式？", "终止信号是什么？"],
        quickTest: "统一规则应能解释至少两组，且无需为每组发明新机制。",
        steps: ["抽象第一组规则", "找变化参数", "在第二组验证", "记录每轮并检查终止"],
        pitfalls: ["把样例中的常量写死", "无限重复忽略终止条件", "复用了答案而不是操作"],
        representativeIds: ["ccbc11:problem:19", "ccbc11:problem:16", "ccbc13-14:ccbc-13-9"]
      },
      {
        id: "S14_meta_inputs",
        name: "Meta 不知道要用哪些答案或碎片",
        shortName: "Meta 输入不明",
        description: "确认是 Meta 或复合题，但 feeder、碎片、前置信息或答案版本尚未锁定。",
        aliases: ["用哪些答案", "需要哪些碎片", "之前哪些信息", "feeder 是什么", "缺哪个小题"],
        signals: ["题面格数与现有答案数不符", "跨分区或剧情解锁", "多个答案版本", "父子题依赖复杂"],
        stage: "meta-input",
        nextStep: "先画依赖表：候选输入、来源题、标准答案、长度、已解状态和题面可容纳位置。",
        quickQuestions: ["题面数量暗示几个输入？", "哪些答案由剧情或解锁规则排除？", "需要答案全文还是某种特征？"],
        quickTest: "输入集合应解释题面容量，且每个选入或排除都有独立依据。",
        steps: ["列所有候选 feeder", "标准化答案", "匹配数量和长度", "标注共享、未用和缺失输入"],
        pitfalls: ["默认本区所有答案都使用", "把中间答案当 feeder", "忽略 Meta 可能使用机制而非答案"],
        representativeIds: ["ccbc11:problem:mm", "ccbc16:puzzle:42", "ccbc16:puzzle:43"]
      },
      {
        id: "S15_meta_matching_dependency",
        name: "Feeder 与 Meta 对不上或存在未使用答案",
        shortName: "Meta 对不上",
        description: "输入集合大致确定，但无法一一对应，或发现某些小题答案未被使用、需要变形或跨区引用。",
        aliases: ["小题答案和 meta 对不上", "哪个没用", "对应不上", "多了一个答案", "少一个答案"],
        signals: ["大部分匹配自然但少数冲突", "题面剧情暗示弃用项", "答案需同义、翻译或字母变换后才匹配"],
        stage: "meta-matching",
        nextStep: "分开验证输入选择和匹配规则；允许题面明确支持的未用项，但不要靠最终答案硬配。",
        quickQuestions: ["冲突来自输入集合还是答案形式？", "是否每区固定有未使用项？", "匹配的是语义、字形、字母还是机制？"],
        quickTest: "最终映射应一一对应，并能解释未使用答案的统一规则。",
        steps: ["建立匹配候选矩阵", "标出硬冲突", "检查答案翻译和变形", "寻找一致的弃用或跨区规则"],
        pitfalls: ["把所有答案强塞入 Meta", "局部语义相似取代统一机制", "偷看最终答案后倒推匹配"],
        representativeIds: ["ccbc15:problem:2-14", "ccbc16:puzzle:18", "ccbc11:problem:m8"]
      },
      {
        id: "S16_answer_format_normalization",
        name: "答案内容对，但提交格式或规范不对",
        shortName: "格式不对",
        description: "核心答案已基本确定，可能因中英文、空格、连字符、词形、缩写、答案长度或系统规范验证失败。",
        aliases: ["大概知道答案为什么不对", "怎么提交", "几字答案", "要英文吗", "空格要不要", "格式错误"],
        signals: ["中间答案反馈接近正确", "题面给答案模式", "候选只有词形差异", "答案框提示长度"],
        stage: "submission",
        nextStep: "先查题面答案格式、长度和 additional answer 反馈，再做最小规范化，不改核心解法。",
        quickQuestions: ["要求哪种语言和词形？", "空格标点是否忽略？", "当前结果是全称、简称、人物还是作品？"],
        quickTest: "格式调整必须由题面或反馈支持，而不是枚举所有拼写碰撞答案。",
        steps: ["核对答案长度模式", "统一大小写和空格", "检查单复数、时态、全称与译名", "保留原推导记录"],
        pitfalls: ["暴力提交变体", "把阶段答案当最终答案", "为迎合格式改坏正确内容"],
        representativeIds: ["ccbc13-14:asteroid-125", "ccbc15:problem:5-44", "ccbc13-14:ccbc-13-12"]
      },
      {
        id: "S17_need_full_checkpoint",
        name: "需要完整中间结果来恢复进度",
        shortName: "需要检查点",
        description: "渐进提示已不足，团队换班、复杂盘面或长流程需要完整对应表、简化盘面或阶段结果继续。",
        aliases: ["给我全部的点", "给简化图", "所有对应关系", "直接给中间结果", "SHOW ME", "队友过程丢了"],
        signals: ["已购买多层提示仍无法复现", "多人状态不同步", "盘面或密室流程很长", "技术/无障碍需求"],
        stage: "checkpoint",
        nextStep: "明确请求哪一阶段的可验证产物，而不是最终答案；记录来源、泄露等级和接续步骤。",
        quickQuestions: ["最早缺失的是哪一阶段？", "需要盘面、映射表、识别清单还是字符串？", "拿到结果后下一步是什么？"],
        quickTest: "检查点应能让玩家从明确阶段继续，但不自动泄露后续机制和最终答案。",
        steps: ["定位断点", "请求最小完整产物", "与题面状态核对", "补写团队日志再继续"],
        pitfalls: ["一次索要整题官解", "检查点版本与当前题面不一致", "拿到结果后仍不记录过程"],
        representativeIds: ["ccbc15:problem:5-42", "ccbc16:puzzle:43", "ccbc11:problem:13"]
      }
    ],
    quick: {
      firstMinute: [
        { label: "保真", action: "保存原图、原音频、原网页和原始文字；不要先 OCR 后丢弃原件。" },
        { label: "清点", action: "数对象、组数、词长、颜色、方向、重复、缺失和异常格式。" },
        { label: "分层", action: "把题面分成载体、主体操作、排序、提取、答案格式五层。" },
        { label: "找锚", action: "先做最短、最特殊或题面给了样例的一项，建立可核验锚点。" },
        { label: "留痕", action: "团队记录中分开写：观察、假设、验证结果、待办和已提交答案。" }
      ],
      stuckLadder: [
        { step: 1, label: "题面完整吗", question: "资源、解锁和交互状态是否正常？", yes: "进入清点", no: "走 S0 资源诊断" },
        { step: 2, label: "对象认出来了吗", question: "图片、声音、人物、作品、符号和标准题型能否命名？", yes: "归一名称和版本", no: "走 S2/S3 识别检索" },
        { step: 3, label: "规则能写成动作吗", question: "能否用一句输入→操作→输出描述每种符号？", yes: "小样例验证", no: "走 S4 规则推断" },
        { step: 4, label: "素材组织好了吗", question: "分组、配对、填盘和 feeder 集合是否明确？", yes: "执行主体步骤", no: "走 S5 或 S14/S15" },
        { step: 5, label: "执行能推进吗", question: "当前卡点是逻辑、工具、矛盾还是重复推广？", yes: "完成主体结果", no: "走 S6/S7/S8/S13" },
        { step: 6, label: "知道怎么读答案吗", question: "提取对象、顺序、编码和答案格式是否都已解释？", yes: "独立复核后提交", no: "走 S9/S10/S12" },
        { step: 7, label: "结果通过了吗", question: "字符串是否可读、长度正确且符合提交规范？", yes: "记录过程并同步团队", no: "走 S11/S16；必要时请求 S17 检查点" }
      ],
      sorting: [
        { name: "题面原序", signals: ["列表天然有先后", "故事流程", "行列原位"], try: "先不排序，保留原输入顺序作为基线。", check: "题面每项恰好对应一个输出。" },
        { name: "编号或题号", signals: ["明确数字标签", "feeder 来自多道小题"], try: "按数值而非字符串排序，确认零基/一基。", check: "编号无遗漏、无重复。" },
        { name: "空间阅读", signals: ["网格、地图、环、路径、箭头"], try: "明确起点、方向、转向和观察视角。", check: "目标元素通常恰好访问一次。" },
        { name: "时间顺序", signals: ["年份、日期、版本、生命周期"], try: "统一历法和基准日期后排序。", check: "并列项有题面给出的次级规则。" },
        { name: "长度或数值", signals: ["词长差异", "价格、概率、大小、频率"], try: "分别试升序和降序，注意整数与小数可能承担不同角色。", check: "排序键对每项都有效。" },
        { name: "标准集合顺序", signals: ["彩虹、行星、生肖、月份、字母表、元素"], try: "使用题面时代与语言对应的公认顺序。", check: "所有对象属于同一套标准集合。" },
        { name: "解后生成顺序", signals: ["每项解出日期、颜色、坐标或编号", "原序明显无意义"], try: "先完成对象识别，再按新属性排。", check: "排序属性本身在主体步骤中自然产生。" },
        { name: "链式顺序", signals: ["前后缀相接", "首尾字母重合", "地图相邻", "因果关系"], try: "建有向边，寻找唯一入度 0 的起点。", check: "形成一条覆盖全部对象的链，而非多个环。" }
      ],
      extraction: [
        { name: "直接读取", question: "每组是否已稳定得到一个字母或词？", try: "按自然顺序直接连接，未知位保留 ?。", check: "不需要解释不了的额外变换。" },
        { name: "数字索引", question: "是否有尚未使用且不大于词长的数字？", try: "按一基索引先试；空格和标点默认不计，除非题面说明。", check: "全部索引合法且样例吻合。" },
        { name: "首尾与固定列", question: "对象是否等长或题面强调头尾？", try: "依次读首字母、尾字母、首尾组合和标记列。", check: "多词答案的取法需统一。" },
        { name: "差集、交集和剩余", question: "主体步骤后是否留下少量元素？", try: "按多重集消去，标出唯一共同或未用项。", check: "每组稳定剩一个，重复次数正确。" },
        { name: "计数与频率", question: "颜色、字符或类别出现次数是否有意？", try: "计数后检查 A1Z26、进制、坐标或排序。", check: "计数范围合理，包含/不包含空格的约定一致。" },
        { name: "位置与路径", question: "是否有箭头、坐标、路线、棋步或传统书写方向？", try: "先给访问顺序编号，再读对应格。", check: "起点和方向由题面唯一支持。" },
        { name: "二值或多值编码", question: "每组是否自然分成两类或三类？", try: "试黑白极性、位序和分组长度。", check: "多个分组同时落入合法字符范围。" },
        { name: "负空间与整体图形", question: "重排或连线后是否形成规则图案？", try: "缩小、反色、镜像或只看空隙。", check: "字形在统一尺度下可重复辨认。" },
        { name: "再做一次", question: "中间结果是指令、机制名或仍符合原输入格式吗？", try: "把原操作应用到中间产物，或定位被引用的题。", check: "二次操作消耗此前未用信息。" },
        { name: "Meta 提取", question: "是否有 feeder、匹配表或多层依赖？", try: "先锁定输入集合，再做一一匹配和统一提取。", check: "所有使用和弃用项都有同一规则。" }
      ],
      signals: [
        { signal: "点、划、长短、滴答", candidates: ["摩尔斯", "二值节奏", "长短音"], try: "先确定分隔和点划极性，再查摩尔斯。" },
        { signal: "六点格、凸点、2×3", candidates: ["盲文", "六位二进制"], try: "确认行列方向和空点是否保留。" },
        { signal: "人物或旗子朝不同方向", candidates: ["旗语", "方向索引"], try: "统一观察者视角，检查左右手和镜像。" },
        { signal: "井字、X 形、带点围栏", candidates: ["猪圈密码", "九宫格位置"], try: "先辨认格形，再处理点和旋转。" },
        { signal: "数字范围 1–26", candidates: ["A1Z26", "索引", "频次"], try: "不要自动 A1Z26；先问数字是否更像取第 n 位。" },
        { signal: "成对数字如 21、32", candidates: ["手机九键", "坐标", "行列索引"], try: "检查第一位是否落在 2–9，第二位是否不超过键上字母数。" },
        { signal: "规则化黑白或有无", candidates: ["二进制", "二维码", "像素字", "Nonogram"], try: "同时试反色、转置和行列分组。" },
        { signal: "颜色重复且数量有限", candidates: ["彩虹序", "颜色英文首字母", "色环数值", "分类"], try: "先判断颜色是排序、索引、字母还是状态，而非直接套彩虹。" },
        { signal: "多行近似文本", candidates: ["找不同", "固定位置提取", "字母频率", "重排"], try: "逐位对齐，计算差异与字符多重集。" },
        { signal: "标题异常、正文空白", candidates: ["标题题", "零宽字符", "源码隐写", "资源故障"], try: "先排除加载问题，再保留标题原始字节和格式检查。" },
        { signal: "一组对象恰好 5、6、8、10、12 个", candidates: ["五行/五常", "方向/骰子", "八卦", "十进制", "生肖/月"], try: "数量只做候选生成，必须再由内容独立验证。" },
        { signal: "得到完整英文祈使句", candidates: ["下一步指令", "搜索词", "交互操作"], try: "先执行它指向的最小可逆动作，不要直接提交。" }
      ],
      codes: [
        { name: "A1Z26", pattern: "1–26 的整数，或可化为该范围的计数", use: "1=A，26=Z；也常用于最终计数转字母。", check: "所有值应落在 1–26；0 的处理必须有题面依据。", pitfalls: ["数字其实是索引", "把 0 当空格未经提示"] },
        { name: "凯撒 / ROT", pattern: "字母整体平移，标题含凯撒、旋转、前后若干位", use: "尝试题面给定位移；ROT13 是自反特例。", check: "同一位移应改善整段而非零星字母。", pitfalls: ["加减方向反了", "每字位移量其实不同"] },
        { name: "Atbash", pattern: "镜像、倒序字母表、A↔Z", use: "英文字母映射 A↔Z、B↔Y。", check: "它是自反变换，做两次回原文。", pitfalls: ["误把字符串倒序当 Atbash"] },
        { name: "摩尔斯", pattern: "点划、短长、滴答、开关时长", use: "按字符间和单词间隔分组后查点划码。", check: "大部分分组长度为 1–4，数字可到 5。", pitfalls: ["点划极性反了", "分隔符未识别"] },
        { name: "盲文", pattern: "2×3 点阵、六位有无；扩展盲文可能 2×4", use: "按固定点位编号把凸点组合转字符。", check: "方向由题面或至少两个词验证。", pitfalls: ["转置、上下翻转", "中英文/扩展版不同"] },
        { name: "旗语", pattern: "两臂、两旗或两条射线的方向组合", use: "将一对方向映射为字母。", check: "确定人物面向与观察视角。", pitfalls: ["镜像", "两臂顺序颠倒"] },
        { name: "猪圈密码", pattern: "井字格、X 格、角框及可选圆点", use: "由格形、开口方向和有无点确定字母。", check: "同套码表应覆盖全题。", pitfalls: ["旋转方向错", "把框内点漏掉"] },
        { name: "手机九键", pattern: "2–9 与按键次数，或成对小数字", use: "第一位选按键，第二位选该键第几个字母。", check: "数字不能超过键上候选数。", pitfalls: ["7/9 键有四个字母", "T9 预测与多击输入混淆"] },
        { name: "Polybius / 5×5 棋盘", pattern: "1–5 成对坐标、5×5 字母方阵", use: "一位行一位列；I/J 合并或关键词棋盘需题面确认。", check: "先用已知样例确定行列顺序。", pitfalls: ["行列互换", "关键词棋盘被当标准棋盘"] },
        { name: "Playfair", pattern: "5×5 棋盘加字母二元组", use: "按同行、同列、矩形规则处理字母对。", check: "明确加密还是解密、I/J 规则及补位字母。", pitfalls: ["方向反了", "重复字母拆分规则遗漏"] },
        { name: "二进制", pattern: "两类状态、0/1、黑白、有无、阴阳", use: "确定高低位、分组和目标编码后转换。", check: "保留前导零；同时试极性和端序。", pitfalls: ["分组长度错", "结果其实应显示成图而非转数值"] },
        { name: "三进制及一般进制", pattern: "恰有 n 类状态，或题面暗示基数", use: "每类映射 0…n-1，再按位权转换。", check: "所有数字小于基数，位序有依据。", pitfalls: ["直接把结果当 A1Z26", "类别顺序任意"] },
        { name: "ASCII", pattern: "7/8 位二进制、十进制 32–126、十六进制字节", use: "按字节转可打印字符。", check: "多数结果落在可打印范围。", pitfalls: ["十进制与十六进制混用", "缺前导零"] },
        { name: "Unicode", pattern: "U+、较大码点、汉字排序或字符偏移", use: "按码点查询、排序或做题面明确的偏移。", check: "区分码点与 UTF-8 字节。", pitfalls: ["按 UTF-8 字节错排", "组合字符归一化差异"] },
        { name: "Base64 / Base32 / 十六进制", pattern: "受限字符集、长度规律、末尾 =", use: "先识别字符集和填充，再解码为字节或文本。", check: "解码结果应有合理编码或文件头。", pitfalls: ["把普通随机串强行解码", "多层编码只做一层"] },
        { name: "NATO 字母表", pattern: "Alpha、Bravo、Charlie 等通信词", use: "词对应首字母；也可能反向由字母取通信词再索引。", check: "确认使用 NATO 版本及拼写。", pitfalls: ["与旧式或其他语言通话表混用"] },
        { name: "罗马数字", pattern: "I V X L C D M 或文本中刻意出现这些字母", use: "可直接转数值，也常从英文单词中提取罗马数字。", check: "确认是否允许非标准减法写法。", pitfalls: ["把所有 I/V/X 当数值而忽略它们在单词中"] },
        { name: "栅栏 / 密码棒", pattern: "条带、绕杆、上下往复、固定列数", use: "按给定宽度重排阅读；Scytale 常由纸条宽度或周长确定。", check: "换行后应能解释全部字符。", pitfalls: ["宽度和行数互换", "填入方向与读取方向相同"] },
        { name: "键盘位置", pattern: "QWERTY、拨号盘、相邻键、错位输入", use: "按键位坐标、相邻移动或两键中点转换。", check: "明确设备、语言和布局版本。", pitfalls: ["电脑键盘与手机键盘混用", "QWERTY/AZERTY 差异"] },
        { name: "颜色顺序", pattern: "彩虹、色环、电阻色环或有限调色板", use: "可作为排序、数字、首字母或分类；必须由主题决定。", check: "颜色作用在全题保持一致。", pitfalls: ["默认所有颜色都按彩虹", "青/蓝、靛/紫命名不一"] }
      ],
      teamHandoff: [
        "当前卡点属于哪个症状 ID",
        "已确认的载体/机制/提取/知识域标签",
        "原始素材与当前工作文件的位置",
        "已验证规则及其验证样例",
        "未验证假设和已排除方向",
        "完整中间结果、未知位和排序",
        "已提交内容及系统反馈",
        "接手者最小可执行的下一步"
      ],
      hintLevels: [
        { level: "L0", label: "观察", content: "指出值得看的区域、数量或异常，不命名机制。" },
        { level: "L1", label: "方向", content: "命名机制类别或第一步，不给具体对应表。" },
        { level: "L2", label: "操作", content: "说明规则、排序或提取方法，保留实际计算。" },
        { level: "L3", label: "检查点", content: "给出完整中间盘面、识别表或字符串，不给后续。" },
        { level: "L4", label: "题解", content: "完整过程与答案，仅在明确请求时展示。" }
      ]
    },
    glossary: [
      { term: "载体", definition: "信息呈现的媒介，如文字、图片、音频、网格或交互；载体不等于机制。" },
      { term: "机制", definition: "玩家对输入反复执行的核心操作，如解码、匹配、拆字或约束推理。" },
      { term: "提取", definition: "把主体解题结果转成最终答案字母或词的步骤。" },
      { term: "Feeder", definition: "为 Meta 提供答案或特征输入的普通小题。" },
      { term: "Meta", definition: "综合多个 feeder 答案或机制的谜题。" },
      { term: "Meta Matching", definition: "需要自行把 feeder 与线索或操作一一配对的 Meta。" },
      { term: "Enumeration", definition: "答案词数与各词字母数，例如 (5 3)；中文题也可能给字数或笔画。" },
      { term: "中间答案", definition: "可提交验证、可触发反馈或用于下一阶段，但不是最终答案的产物。" },
      { term: "检查点", definition: "足以恢复某阶段进度的完整盘面、映射表或中间字符串。" },
      { term: "答案归一化", definition: "大小写、空格、标点、简繁、词形和译名等提交格式处理。" },
      { term: "题族", definition: "共享父题、生成模板或同一批交互机制的题目集合；检索时应去重。" },
      { term: "泄露等级", definition: "提示暴露解法的程度，从观察方向到完整官解逐级增加。" }
    ],
    retrievalPolicy: {
      defaultScope: "优先从非 subpuzzle 主记录召回；子题只作为明确匹配的二级实例。",
      familyDiversity: "同一 parent_id 或模板题族默认最多返回一条，避免 CCBC 16 大型题族淹没结果。",
      eventDiversity: "同一届默认最多两条代表题，优先跨届验证机制稳定性。",
      excludedByDefault: ["ccbc16:qian:*"],
      includeWhen: "用户明确检索千字谜、短谜、图谜、字谜，或主记录不足以支持该机制。",
      rankOrder: ["卡点阶段匹配", "明确机制标签", "已有中间产物匹配", "载体和知识域", "文本相似度"],
      evidenceRule: "默认使用 explicit 与 inferred 标签；weak 关键词命中降权且不单独触发高泄露提示。"
    }
  };

  // Compatibility aliases keep the data convenient for both simple pages and
  // richer tooling without duplicating the taxonomy itself.
  guide.axes.forEach(function (axis) {
    axis.name = axis.label;
    axis.items = axis.categories;
    axis.items.forEach(function (item) {
      item.name = item.label;
      item.description = item.definition;
    });
  });

  // Curated navigation metadata keeps field use focused on one decision at a
  // time while leaving the complete taxonomy available for reference.
  guide.stageGroups = [
    {
      id: "entry",
      label: "还没找到入口",
      question: "还没找到可以动手的入口？",
      description: "题面不可见，或不知道素材是什么、该从哪里开始。",
      example: "看不到题 / 没思路 / 认不出 / 查不到准确信息",
      icon: "compass",
      symptomIds: ["S0_access_render", "S1_no_entry", "S2_recognition", "S3_source_scope"]
    },
    {
      id: "understand",
      label: "理解题目",
      question: "看懂了素材，但不懂怎么组织或操作？",
      description: "组件已经能辨认，局部规则或整体对应关系仍不清楚。",
      example: "不懂规则 / 不会分组、配对或填盘",
      icon: "puzzle",
      symptomIds: ["S4_rule_inference", "S5_setup_group_map"]
    },
    {
      id: "execute",
      label: "执行与验证",
      question: "知道大方向，但做不动或做出了矛盾？",
      description: "需要找到下一条必然推论、排查错误，或选择合适工具。",
      example: "推不动 / 矛盾或多解 / 不会执行",
      icon: "list-checks",
      symptomIds: ["S6_logic_progress", "S7_contradiction_nonunique", "S8_execution_tool"]
    },
    {
      id: "extract",
      label: "排序与提取",
      question: "主体做完了，但答案还没有出现？",
      description: "对象已经齐全，需要决定顺序、读取方法或校验乱码。",
      example: "不会排序 / 不会提取 / 结果不对",
      icon: "scan-line",
      symptomIds: ["S9_ordering", "S10_extraction", "S11_gibberish_validation"]
    },
    {
      id: "multistage",
      label: "多阶段与 Meta",
      question: "拿到中间产物，却不知道怎样接到下一阶段？",
      description: "机制需要复用，或多个 feeder、Meta 和交互阶段存在依赖。",
      example: "然后呢 / 不会复用 / Meta 输入或匹配不明",
      icon: "network",
      symptomIds: ["S12_intermediate_next", "S13_repeat_recursion", "S14_meta_inputs", "S15_meta_matching_dependency"]
    },
    {
      id: "handoff",
      label: "提交与接手",
      question: "解法基本完成，只差提交或恢复进度？",
      description: "检查答案规范，或整理一份别人能无损接手的检查点。",
      example: "提交格式不对 / 需要完整检查点",
      icon: "clipboard-check",
      symptomIds: ["S16_answer_format_normalization", "S17_need_full_checkpoint"]
    }
  ];

  const axisNavigation = {
    carrier: { userQuestion: "我看到的是什么？", icon: "shapes" },
    operation: { userQuestion: "题目让我反复做什么？", icon: "wrench" },
    extraction: { userQuestion: "中间结果怎样变成答案？", icon: "scan-text" },
    domain: { userQuestion: "需要哪类外部知识？", icon: "book-open" }
  };
  const axisGroups = {
    carrier: [
      { id: "language", label: "文字与语言", description: "字词、句子、汉字形音本身承载信息。", itemIds: ["A1_text_word", "A2_hanzi_phonology"] },
      { id: "visual-data", label: "图像与结构", description: "从视觉对象、颜色、网格、表格或数字结构入手。", itemIds: ["A3_visual_symbol", "A5_grid_data_numeric"] },
      { id: "dynamic-interactive", label: "动态、空间与交互", description: "需要播放、模拟、动手操作或检查页面状态。", itemIds: ["A4_audio_video", "A6_spatial_physical", "A7_web_code_interactive"] }
    ],
    operation: [
      { id: "recognize-transform", label: "识别与转换", description: "先识别素材，再按固定规则解码或改变形式。", itemIds: ["B1_identify_research", "B2_classical_cipher", "B3_lexical_transform", "B4_glyph_transform"] },
      { id: "reason-simulate", label: "推理与模拟", description: "依靠约束、计算或逐步更新状态求解。", itemIds: ["B5_constraint_logic", "B6_math_formal_compute", "B7_spatial_transform_path"] },
      { id: "organize-compare", label: "组织与比较", description: "通过分组、配对、排序、集合或叠合发现关系。", itemIds: ["B8_group_match_order", "B9_compare_set_overlay"] },
      { id: "hidden-flow", label: "隐藏与流程", description: "恢复隐藏信息，或在重复和状态流程中持续推进。", itemIds: ["B10_reconstruct_stego", "B11_iterate_reuse_recursive", "B12_state_game_exploration"] }
    ],
    extraction: [
      { id: "direct-position", label: "直接与位置读取", description: "按自然顺序、序号或固定位置获得字母。", itemIds: ["C1_direct_decode", "C2_indexed_extract", "C3_initial_final_acrostic"] },
      { id: "residue-render", label: "残留、路径与显像", description: "读取剩余元素、访问路径、位串或最终图形。", itemIds: ["C4_residue_intersection", "C5_read_order_path", "C6_symbol_binary_render", "C7_visual_negative_shape"] },
      { id: "transform-hunt", label: "二次处理与 Hunt 结构", description: "把中间答案继续变换，或处理 feeder、Meta 和多阶段依赖。", itemIds: ["C8_answer_transform_reapply", "C9_feeder_meta", "C10_meta_matching", "C11_recursive_meta", "C12_interactive_multistage"] }
    ],
    domain: [
      { id: "language", label: "语言与文字", description: "汉字、语言、文学、翻译和词源。", itemIds: ["D1_chinese_linguistics", "D2_language_literature"] },
      { id: "culture-art", label: "文化与艺术", description: "音乐、舞台、影视、动漫、游戏、艺术和字体。", itemIds: ["D3_music_stage", "D4_pop_culture_games", "D11_art_design_typography"] },
      { id: "society-life", label: "社会与生活", description: "地理、历史、交通、竞技、品牌和日常物品。", itemIds: ["D5_geography_flags_transport", "D6_history_calendar_culture", "D10_sports_boardgames", "D12_everyday_objects_food"] },
      { id: "science-tech", label: "科学与技术", description: "数学、逻辑、自然科学、计算机和网络。", itemIds: ["D7_math_logic", "D8_natural_science", "D9_computing_web"] }
    ]
  };

  const mechanismPresentation = {
    A1_text_word: { shortLabel: "文字词汇", icon: "text", cue: "词长、横线或重复句式是主要结构" },
    A2_hanzi_phonology: { shortLabel: "汉字语音", icon: "languages", cue: "换成同义词就失效，字形或读音本身有用" },
    A3_visual_symbol: { shortLabel: "图像颜色", icon: "image", cue: "正文很少，颜色、图标或轮廓反复出现" },
    A4_audio_video: { shortLabel: "音频视频", icon: "audio-lines", cue: "变速、逐帧或看频谱后才出现离散单位" },
    A5_grid_data_numeric: { shortLabel: "网格数字", icon: "table-2", cue: "行列、坐标或数字汇总形成稳定约束" },
    A6_spatial_physical: { shortLabel: "空间实物", icon: "box", cue: "折叠、旋转、裁切或相邻关系需要实际模拟" },
    A7_web_code_interactive: { shortLabel: "网页交互", icon: "code-2", cue: "交互状态、源码或网络资源含可用信息" },
    B1_identify_research: { shortLabel: "识别检索", icon: "search", cue: "整组素材应落入同一个边界清楚的集合" },
    B2_classical_cipher: { shortLabel: "密码编码", icon: "key-round", cue: "符号取值数和固定分组长度像标准码表" },
    B3_lexical_transform: { shortLabel: "词汇变换", icon: "replace", cue: "词之间总能用同一种增删改换互相转换" },
    B4_glyph_transform: { shortLabel: "字形操作", icon: "shapes", cue: "不读字义，只操作轮廓、笔画或部件" },
    B5_constraint_logic: { shortLabel: "约束推理", icon: "grid-3x3", cue: "规则能写成约束，盘面存在候选与必然步" },
    B6_math_formal_compute: { shortLabel: "数学计算", icon: "calculator", cue: "公式或形式规则可以在小样例上复算" },
    B7_spatial_transform_path: { shortLabel: "路径模拟", icon: "route", cue: "位置、方向或路径会随每步操作更新" },
    B8_group_match_order: { shortLabel: "分组排序", icon: "layout-list", cue: "对象需恰好使用一次地分组、配对或排序" },
    B9_compare_set_overlay: { shortLabel: "比较叠合", icon: "blend", cue: "两份相似素材叠合后只剩稀疏差异" },
    B10_reconstruct_stego: { shortLabel: "隐写重建", icon: "scan-search", cue: "空白、源码、字节或隐藏层里另有结构" },
    B11_iterate_reuse_recursive: { shortLabel: "重复递归", icon: "repeat-2", cue: "第一轮产物仍像同类输入或操作指令" },
    B12_state_game_exploration: { shortLabel: "状态探索", icon: "gamepad-2", cue: "每次操作都会改变状态和下一步合法动作" },
    C1_direct_decode: { shortLabel: "直接读取", icon: "arrow-right", cue: "每个单位已稳定得到字母，顺序也天然明确" },
    C2_indexed_extract: { shortLabel: "序号提取", icon: "list-ordered", cue: "对象旁有不大于词长的小数字或坐标" },
    C3_initial_final_acrostic: { shortLabel: "首尾藏头", icon: "pilcrow", cue: "多行结构适合读取首尾或同一固定位置" },
    C4_residue_intersection: { shortLabel: "剩余差集", icon: "circle-minus", cue: "主体操作用掉大部分元素，只剩少量残留" },
    C5_read_order_path: { shortLabel: "路径读取", icon: "route", cue: "起点、方向或路线决定唯一访问顺序" },
    C6_symbol_binary_render: { shortLabel: "位串显字", icon: "binary", cue: "两三类状态能分成固定长度的位串" },
    C7_visual_negative_shape: { shortLabel: "负空间显像", icon: "scan", cue: "缩小、反色或看负空间后出现字形" },
    C8_answer_transform_reapply: { shortLabel: "二次变换", icon: "refresh-cw", cue: "得到的是操作说明或机制名，不像最终答案" },
    C9_feeder_meta: { shortLabel: "Feeder Meta", icon: "network", cue: "小题答案的数量正好匹配 Meta 结构" },
    C10_meta_matching: { shortLabel: "Meta 匹配", icon: "shuffle", cue: "两组等量输入需要建立唯一的一一匹配" },
    C11_recursive_meta: { shortLabel: "Meta 链", icon: "git-branch", cue: "多个 Meta 互相引用，需要先画依赖图" },
    C12_interactive_multistage: { shortLabel: "多阶段交互", icon: "mouse-pointer-click", cue: "页面随操作变化，产物继续进入下一阶段" },
    D1_chinese_linguistics: { shortLabel: "汉语文字", icon: "languages", cue: "部首、笔画、拼音、声调或汉字编码不可替换" },
    D2_language_literature: { shortLabel: "语言文学", icon: "book-open", cue: "固定译名、惯用语、词源或多语关系决定结果" },
    D3_music_stage: { shortLabel: "音乐舞台", icon: "music", cue: "曲目、音高、节奏或舞台作品需要统一识别" },
    D4_pop_culture_games: { shortLabel: "影视动漫游戏", icon: "clapperboard", cue: "角色、台词或素材来自同一作品或世代" },
    D5_geography_flags_transport: { shortLabel: "地理交通", icon: "map", cue: "轮廓、坐标、旗帜、站点指向标准地理集合" },
    D6_history_calendar_culture: { shortLabel: "历史历法", icon: "landmark", cue: "年份、节日或历史时点会改变正确版本" },
    D7_math_logic: { shortLabel: "数学逻辑", icon: "sigma", cue: "条件适合写成方程、证明或逻辑模型" },
    D8_natural_science: { shortLabel: "自然科学", icon: "flask-conical", cue: "公式、单位或分类属于专业科学语境" },
    D9_computing_web: { shortLabel: "计算机网络", icon: "terminal", cue: "代码、协议、编码或网页行为本身是知识对象" },
    D10_sports_boardgames: { shortLabel: "体育棋类", icon: "trophy", cue: "棋谱、赛制、比分或合法走法需要规则知识" },
    D11_art_design_typography: { shortLabel: "艺术字体", icon: "palette", cue: "作品、构图、字体或设计体系需要统一识别" },
    D12_everyday_objects_food: { shortLabel: "日常品牌", icon: "utensils", cue: "配方、品牌、包装或标准布局承载规律" }
  };

  guide.axes.forEach(function (axis) {
    Object.assign(axis, axisNavigation[axis.id] || {});
    axis.groups = axisGroups[axis.id] || [];
    axis.items.forEach(function (item) {
      Object.assign(item, mechanismPresentation[item.id] || {
        shortLabel: item.label,
        icon: "circle-dot",
        cue: (item.signals || [item.definition])[0]
      });
    });
  });

  const symptomSuggestions = {
    S0_access_render: [
      { action: "check-current-page", label: "先做资源排查", why: "区分加载故障与题目刻意留白，避免在缺失素材上继续推理。" },
      { mechanismId: "A7_web_code_interactive", why: "自定义页面可能把信息放在交互状态、源码或资源请求中。" },
      { mechanismId: "B10_reconstruct_stego", why: "页面异常空白或声称什么都没有时，隐藏层本身可能就是入口。" }
    ],
    S1_no_entry: [
      { axis: "carrier", label: "先判断信息载体", why: "先回答信息主要藏在哪里，通常比直接猜题型更容易。" },
      { mechanismId: "B1_identify_research", why: "若素材可切成同类对象，先从整组识别建立一个可靠锚点。" },
      { mechanismId: "B8_group_match_order", why: "数量整齐或两侧等量时，分组、配对和排序常是第一步。" },
      { mechanismId: "B10_reconstruct_stego", why: "可见内容异常少、格式异常多时，先检查是否存在隐藏信息。" }
    ],
    S2_recognition: [
      { mechanismId: "B1_identify_research", why: "先用整组共性限定对象集合，再确认标准名称和版本。" },
      { axis: "domain", label: "按知识域缩小范围", why: "从语言、文化、社会生活或科学技术中选择最接近的一类。" },
      { mechanismId: "B8_group_match_order", why: "暂时认不全时，已识别对象之间的分组关系可以反向约束未知项。" }
    ],
    S3_source_scope: [
      { mechanismId: "B1_identify_research", why: "把时点、地区、语言和世代写成检索约束，统一整组数据源。" },
      { axis: "domain", label: "核对对应知识域", why: "不同知识域的标准版本、命名规则和权威来源差异很大。" },
      { mechanismId: "D6_history_calendar_culture", why: "若题面给出年份或比赛时点，今天的数据可能不是正确版本。" }
    ],
    S4_rule_inference: [
      { mechanismId: "B3_lexical_transform", why: "若输入输出都是词，先比较增删替换、重排和读音变化。" },
      { mechanismId: "B4_glyph_transform", why: "若符号作用于字形或图形，暂时忽略语义，只比较部件和轮廓。" },
      { mechanismId: "B7_spatial_transform_path", why: "箭头和方向更可能描述位置、朝向或逐步移动。" },
      { mechanismId: "B9_compare_set_overlay", why: "有成对样例时，把变前变后对齐并只看差异。" }
    ],
    S5_setup_group_map: [
      { mechanismId: "B8_group_match_order", why: "先建立候选矩阵，用唯一项和硬约束传播一一对应。" },
      { mechanismId: "B5_constraint_logic", why: "当局部选择彼此影响时，把映射写成可检查的约束。" },
      { mechanismId: "C9_feeder_meta", why: "若输入来自多道小题，先核对答案数量和 Meta 容量。" },
      { mechanismId: "C10_meta_matching", why: "两组等量答案和线索通常需要唯一匹配，而非直接按题号对应。" }
    ],
    S6_logic_progress: [
      { mechanismId: "B5_constraint_logic", why: "重算候选最少处、饱和约束和两类规则的交叉影响。" },
      { mechanismId: "B6_math_formal_compute", why: "把口头规则形式化后，常能看出遗漏的边界或计数条件。" },
      { mechanismId: "B12_state_game_exploration", why: "若每步会改变合法动作，记录状态转移而不是只盯当前盘面。" }
    ],
    S7_contradiction_nonunique: [
      { action: "audit-assumptions", label: "回查首个冲突", why: "回到最后一个已验证状态，逐条开关抄录、方向、基准和默认规则。" },
      { mechanismId: "B5_constraint_logic", why: "把每条原文规则机械检查一遍，确认是否遗漏约束或私自加入熟悉规则。" },
      { mechanismId: "C2_indexed_extract", why: "索引越界或结果偏一时，优先核对零基、一基和名称版本。" },
      { mechanismId: "C6_symbol_binary_render", why: "系统性乱码常来自极性、分组或高低位方向错误。" }
    ],
    S8_execution_tool: [
      { mechanismId: "B6_math_formal_compute", why: "先把算法写成一个可手算的小样例，再决定是否批量计算。" },
      { mechanismId: "B7_spatial_transform_path", why: "用编号和状态表模拟一步，可避免工具批量放大方向错误。" },
      { mechanismId: "A4_audio_video", why: "音视频任务通常需要变速、频谱、分轨或逐帧等专门视图。" },
      { mechanismId: "A7_web_code_interactive", why: "网页或代码题先保存原始状态，再用浏览器工具观察变化。" }
    ],
    S9_ordering: [
      { mechanismId: "B8_group_match_order", why: "先清点题面自带的编号、时间、长度、颜色和标准集合顺序。" },
      { mechanismId: "C5_read_order_path", why: "二维布局、有起点或箭头时，路径可能直接给出阅读顺序。" },
      { mechanismId: "C3_initial_final_acrostic", why: "多行对象排序后，首尾或固定列常形成可快速验证的片段。" }
    ],
    S10_extraction: [
      { mechanismId: "C2_indexed_extract", why: "仍未使用的小数字、颜色、坐标或年份常用于按位取字。" },
      { mechanismId: "C3_initial_final_acrostic", why: "多行答案先检查首尾字母、首尾交替和固定列。" },
      { mechanismId: "C4_residue_intersection", why: "主体步骤若用掉大部分元素，剩余、交集或差异可能就是输出。" },
      { mechanismId: "C5_read_order_path", why: "空间布局通常还需要题面给定的起点、方向或路线。" },
      { mechanismId: "C6_symbol_binary_render", why: "两三类状态和固定分组长度适合转成位串或码表。" },
      { mechanismId: "C7_visual_negative_shape", why: "操作结果呈图形时，缩小、反色或查看负空间可能直接显字。" }
    ],
    S11_gibberish_validation: [
      { action: "audit-output", label: "先做输出校验", why: "先查方向、端序、极性、索引基准、排序和名称版本，不急着换机制。" },
      { mechanismId: "C2_indexed_extract", why: "长度对但字母错位时，检查索引基准与被索引名称。" },
      { mechanismId: "C5_read_order_path", why: "字符集合近似正确但顺序混乱时，检查起点、方向和访问路径。" },
      { mechanismId: "C6_symbol_binary_render", why: "稳定乱码通常值得翻转极性、端序或重新分组。" },
      { mechanismId: "C8_answer_transform_reapply", why: "可读但不像答案的中间串，可能仍是一条操作指令。" }
    ],
    S12_intermediate_next: [
      { mechanismId: "C8_answer_transform_reapply", why: "先判断中间产物是否是操作说明、机制名或另一题的输入。" },
      { mechanismId: "B11_iterate_reuse_recursive", why: "若产物形态与原输入相似，尝试把同一操作再执行一轮。" },
      { mechanismId: "C12_interactive_multistage", why: "页面或系统反馈变化时，记录当前阶段的目标、产物和使用位置。" }
    ],
    S13_repeat_recursion: [
      { mechanismId: "B11_iterate_reuse_recursive", why: "写成每轮输入、操作、输出表，并明确下一轮参数与终止条件。" },
      { mechanismId: "C8_answer_transform_reapply", why: "区分复用答案和复用机制，检查本轮是否有新增方向或顺序。" },
      { mechanismId: "C12_interactive_multistage", why: "若每轮伴随页面状态变化，需要同时保存阶段状态和中间产物。" }
    ],
    S14_meta_inputs: [
      { mechanismId: "C9_feeder_meta", why: "列出候选 feeder、标准答案、长度和已解状态，再核对题面容量。" },
      { mechanismId: "C11_recursive_meta", why: "多个区域或 Meta 互相引用时，先画依赖图确定可用输入层级。" },
      { mechanismId: "C12_interactive_multistage", why: "若答案会解锁新内容，当前可见状态也决定输入集合。" }
    ],
    S15_meta_matching_dependency: [
      { mechanismId: "C10_meta_matching", why: "分开验证输入选择和匹配规则，用候选矩阵寻找唯一对应。" },
      { mechanismId: "C9_feeder_meta", why: "先确认 feeder 集合完整且答案已按同一格式归一化。" },
      { mechanismId: "C11_recursive_meta", why: "看似未使用的答案可能属于更晚层级，或被另一个 Meta 消耗。" }
    ],
    S16_answer_format_normalization: [
      { action: "normalize-answer", label: "检查答案规范", why: "按题面要求依次核对语言、词数、空格、标点、简繁、词形和固定译名。" },
      { mechanismId: "C8_answer_transform_reapply", why: "若最小规范化都无效，当前结果可能仍是指令或需要二次变换。" }
    ],
    S17_need_full_checkpoint: [
      { action: "prepare-checkpoint", label: "整理可接手检查点", why: "保存原始素材、已验证规则、未知位、完整中间结果和最小下一步。" },
      { mechanismId: "C12_interactive_multistage", why: "交互题要额外记录页面状态、已触发动作和继续推进的位置。" },
      { mechanismId: "C11_recursive_meta", why: "Meta 链要标清每层输入来源、依赖和当前完成状态。" }
    ]
  };
  guide.symptoms.forEach(function (symptom) {
    symptom.suggestions = symptomSuggestions[symptom.id] || [];
  });

  const symptomPriority = [
    "S1_no_entry",
    "S2_recognition",
    "S4_rule_inference",
    "S6_logic_progress",
    "S8_execution_tool",
    "S9_ordering",
    "S10_extraction",
    "S12_intermediate_next"
  ];
  guide.symptoms.sort(function (left, right) {
    const leftIndex = symptomPriority.indexOf(left.id);
    const rightIndex = symptomPriority.indexOf(right.id);
    if (leftIndex !== -1 || rightIndex !== -1) {
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      return leftIndex - rightIndex;
    }
    return left.id.localeCompare(right.id, "en", { numeric: true });
  });
  guide.quick.stuckLadder.forEach(function (item) {
    item.title = item.label;
    item.description = item.question;
  });
  guide.quick.sorting.forEach(function (item) {
    item.title = item.name;
    item.description = item.try;
  });
  guide.quick.extraction.forEach(function (item) {
    item.title = item.name;
    item.description = item.try;
  });
  guide.fieldQuickReference = guide.quick;
  guide.encodingChecklist = guide.quick.codes;
  guide.extractionChecklist = guide.quick.extraction;
  guide.stuckSymptoms = guide.symptoms;

  window.CCBC_GUIDE = guide;
})();
