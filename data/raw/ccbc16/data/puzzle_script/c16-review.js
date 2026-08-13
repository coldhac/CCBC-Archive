// 复习资料脚本

// @ts-check

//在后端脚本中，可以使用全局变量 ctx
//全局变量 ctx 的内容如下：
// request: string; // 从前端调用时，前端传来的请求对象，内容为JSON字符串。请调用JSON.parse转换后使用。
// uid: number; // 当前调用此后端脚本的用户 uid
// gid: number; // 当前调用此后端脚本的组队 gid
// getStatus(key: string) : string // 读取：当前用户的状态存储（注意状态信息是加密存储在每个浏览器上的，不同用户的不同进程都有不同的状态）
// setStatus(key: string, value: string) // 写入：当前用户的状态存储
// getProgress(pid: number, key: string) : string // 读取：当前组队的题目进度（组队题目进度是存在后端数据库中的，组队内部共享，每个题目有不同的状态）
// setProgress(pid: number, key: string, value: string) // 写入：当前组队的题目进度
// getPuzzleData(pid: number) : string // 获取题目的data片段（题目详情中<data></data>中的内容）
// response(body: string) // 返回给前端的数据对象。内容为JSON字符串。必须调用JSON.stringify后传入。**必须**在此脚本中至少调用这个函数一次，即使你没什么需要返回的，也请调用一次 ctx.response("{}");

const PID = 20

const exercises = [{'problem': '23457572673496516815881325215193369263109653809459061',
  'answer': 'HISTORICAL',
  'subject': 0,
  'correctMsg': 'Splendid!'},
 {'problem': '诚婴砯䞆锑鋿毰鞖流蔏',
  'answer': 'HYPOTHESIS',
  'subject': 1,
  'correctMsg': 'Unstoppable!'},
 {'problem': 'gCa Auc auG uuU cCu gcG Acu cuU cGg aGc',
  'answer': 'LITERATURE',
  'subject': 2,
  'correctMsg': 'Bravo!'},
 {'problem': 'ACKUP<br/>NCHOR<br/>IGNATURE<br/>NIFE<br/>NABLED<br/>EMPORARY<br/>EHIND<br/>RTISTIC<br/>ANGUAGE<br/>APTOPS',
  'answer': 'BASKETBALL',
  'subject': 3,
  'correctMsg': 'Marvelous!'},
 {'problem': '?=\\frac{\\mu_0}{4\\pi}\\int_{C}\\frac{I \\,\\mathrm{d}\\ell\\times \\mathbf{r}}{|\\mathbf{r}|^3}<br>?=\\frac{\\mathrm{d}Q}{\\mathrm{d}t}<br>V=I?<br>pV=nR?<br>?=p\\lambda<br>?=\\frac{F}{A}<br>?=I\\boldsymbol{\\omega}<br>\\mathbf{B} = \\nabla \\times ?<br>\\epsilon_0=\\frac 1{\\mu_0 ?^2}<br>?=mc^2',
  'answer': 'BIRTHPLACE',
  'subject': 4,
  'correctMsg': 'Incredible!'},
 {'problem': '12451142201316234659412544901330089072057',
  'answer': 'CONSISTING',
  'subject': 0,
  'correctMsg': 'Terrific!'},
 {'problem': '笽廠䞮劉峁㯐椳㺫鶇䬷',
  'answer': 'NATIONWIDE',
  'subject': 1,
  'correctMsg': 'Awesome!'},
 {'problem': 'ccA ucC cAc cgG Auu caG Gcc guC guC uAu',
  'answer': 'ORIGINALLY',
  'subject': 2,
  'correctMsg': 'Neat!'},
 {'problem': 'ASHION<br/>BTAINING<br/>PDATING<br/>OTHING<br/>EADLY<br/>UTHORITIES<br/>RADITION<br/>NDIE<br/>PTIMIZE<br/>EWLY',
  'answer': 'FOUNDATION',
  'subject': 3,
  'correctMsg': 'Splendid!'},
 {'problem': '?=\\frac{c}{v}<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>?=I/V<br>\\mathbf{B} = \\nabla \\times ?<br>pV=nR?<br>V=?R<br>?=IR<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>?=A\\sigma T^4<br>?=Z^{-1}',
  'answer': 'NEGATIVELY',
  'subject': 4,
  'correctMsg': 'Wow!'},
 {'problem': '5318711710212922714337640588888327016399631818909',
  'answer': 'NOMINATION',
  'subject': 0,
  'correctMsg': 'Excellent!'},
 {'problem': '颟盫㩲纐賌泎妈㾪晎瑫',
  'answer': 'MANAGEMENT',
  'subject': 1,
  'correctMsg': 'Right!'},
 {'problem': 'Gcg Uuc ugG gcU ucC auA aaC Uau Uug uGc',
  'answer': 'APPARENTLY',
  'subject': 2,
  'correctMsg': 'Terrific!'},
 {'problem': 'UBMIT<br/>OORDINATED<br/>NFRARED<br/>MERALD<br/>IGHTMARE<br/>ALENTED<br/>NVALID<br/>ORMULA<br/>MMIGRATION<br/>LASSROOM',
  'answer': 'SCIENTIFIC',
  'subject': 3,
  'correctMsg': 'Outstanding!'},
 {'problem': '?=m\\mathbf{v}<br>pV=n?T<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>?=-k_B \\sum \\rho\\ln\\rho<br>?=\\frac{\\mathrm{d}Q}{\\mathrm{d}t}<br>?=\\epsilon_0\\mathbf{E}+\\mathbf{P}<br>?=mc^2<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>E=m?^2<br>?=G+\\sqrt{-1}B',
  'answer': 'PRESIDENCY',
  'subject': 4,
  'correctMsg': 'Outstanding!'},
 {'problem': '731617086413560550363255465004877349901881',
  'answer': 'SUCCESSFUL',
  'subject': 0,
  'correctMsg': 'Neat!'},
 {'problem': '怱酵謢撈蟁浾鼟㮮洠鶭',
  'answer': 'COLLECTION',
  'subject': 1,
  'correctMsg': 'Excellent!'},
 {'problem': 'gcC Ccc gaC uUa Cga acA Cgc caG Ugc cUg',
  'answer': 'APPEARANCE',
  'subject': 2,
  'correctMsg': 'How nice!'},
 {'problem': 'ARAOKE<br/>SSUED<br/>EGACY<br/>RDERED<br/>ARIJUANA<br/>NHANCING<br/>OTALLY<br/>NTIRELY<br/>EVIEW<br/>ENTENCE',
  'answer': 'KILOMETERS',
  'subject': 3,
  'correctMsg': 'Unstoppable!'},
 {'problem': 'E=m?^2<br>?=mc^2<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>pV=nR?<br>?=mc^2<br>?=\\frac{c}{v}<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>?=\\frac{\\mathrm{d}Q}{\\mathrm{d}t}<br>\\mathbf{F}=m?<br>?=\\frac{\\Phi}{I}',
  'answer': 'CENTENNIAL',
  'subject': 4,
  'correctMsg': 'Neat!'},
 {'problem': '12673246978291920498716659393405017817139',
  'answer': 'STATISTICS',
  'subject': 0,
  'correctMsg': 'Delightful!'},
 {'problem': '聼澂劙侕绦閣綘㴨㹗箚',
  'answer': 'THIRTEENTH',
  'subject': 1,
  'correctMsg': 'Remarkable!'},
 {'problem': 'Gua Auc Ugc Uau ccG ucC cAu ccG uuG Agu',
  'answer': 'VICTORIOUS',
  'subject': 2,
  'correctMsg': 'Excellent!'},
 {'problem': 'HARITY<br/>PTIONAL<br/>ESIDENCE<br/>ENEWABLE<br/>TILITY<br/>RECEDING<br/>URBO<br/>NDEED<br/>PERATOR<br/>ECESSARILY',
  'answer': 'CORRUPTION',
  'subject': 3,
  'correctMsg': 'Delightful!'},
 {'problem': '?=\\rho V<br>\\mathbf{F}=m?<br>?=\\frac{c}{v}<br>\\Delta ?=Q-W<br>G=H-T?<br>\\epsilon_0=\\frac 1{\\mu_0 ?^2}<br>pV=n?T<br>\\mathbf{L}=?\\boldsymbol{\\omega}<br>?=\\frac{\\mathrm{d} E}{\\mathrm{d} t}<br>pV=nR?',
  'answer': 'MANUSCRIPT',
  'subject': 4,
  'correctMsg': 'Fabulous!'},
 {'problem': '77436633357492954816353030677835955138029',
  'answer': 'FRIENDSHIP',
  'subject': 0,
  'correctMsg': 'Outstanding!'},
 {'problem': '堾煛翋翋蓶伡烃䖎谟兖',
  'answer': 'COLLECTION',
  'subject': 1,
  'correctMsg': 'Unstoppable!'},
 {'problem': 'caG ccC Aug Aua caG gcA Acg Auu ccA aaU',
  'answer': 'NOMINATION',
  'subject': 2,
  'correctMsg': 'Right!'},
 {'problem': 'ONFLICT<br/>RGANIZATION<br/>NLIKELY<br/>EMOVAL<br/>REASURE<br/>YDROCODONE<br/>UTCOME<br/>LTIMATELY<br/>IGMA<br/>LECTORAL',
  'answer': 'COURTHOUSE',
  'subject': 3,
  'correctMsg': 'Terrific!'},
 {'problem': '?=R+\\sqrt{-1}X<br>V=?R<br>?=\\rho V<br>\\nabla\\times\\mathbf{E} = -\\frac{\\partial ?}{\\partial t}<br>?=\\frac{\\mathrm{d} \\mathbf{v}}{\\mathrm{d} t}<br>\\nabla\\times\\mathbf{E} = -\\frac{\\partial ?}{\\partial t}<br>?=\\int P \\,\\mathrm{d} V<br>?=mc^2<br>\\mathbf{F}=m?<br>?=\\frac{c}{v}',
  'answer': 'ZIMBABWEAN',
  'subject': 4,
  'correctMsg': 'How nice!'},
 {'problem': '5323767884745323784278306837952799835822275380581',
  'answer': 'GYMNASTICS',
  'subject': 0,
  'correctMsg': 'Outstanding!'},
 {'problem': '湗鍏窉㝍鮞疡㓥牃簙饍',
  'answer': 'GENERATION',
  'subject': 1,
  'correctMsg': 'Unstoppable!'},
 {'problem': 'Cgg cuA aAu Acu uaC Cgc Uug cAu gUa aaU',
  'answer': 'AUSTRALIAN',
  'subject': 2,
  'correctMsg': 'Splendid!'},
 {'problem': 'PEECH<br/>NJOYING<br/>REVIEW<br/>FFORDABLE<br/>EBOUND<br/>LLOWED<br/>HEATRE<br/>MMIGRATION<br/>RGANIZER<br/>EWBIE',
  'answer': 'SEPARATION',
  'subject': 3,
  'correctMsg': 'Awesome!'},
 {'problem': '\\mathbf{H}=\\frac{?}{\\mu_0}-\\mathbf{M}<br>\\mathbf{B} = \\nabla \\times ?<br>?=\\frac{c}{v}<br>p=\\hbar?<br>pV=n?T<br>H=?+pV<br>?=\\frac{F}{A}<br>pV=nR?<br>\\epsilon_0=\\frac 1{\\mu_0 ?^2}<br>?=Z^{-1}',
  'answer': 'BANKRUPTCY',
  'subject': 4,
  'correctMsg': 'Neat!'},
 {'problem': '720637172733794980484736724200208333393769',
  'answer': 'KINGFISHER',
  'subject': 0,
  'correctMsg': 'Delightful!'},
 {'problem': '輀䙸舥霕爂㡴麑䫿㷋潅',
  'answer': 'REPUBLICAN',
  'subject': 1,
  'correctMsg': 'Neat!'},
 {'problem': 'caC Ugu aGa aUg aGu aaU Uuu gGg Cgu aAa',
  'answer': 'SCREENPLAY',
  'subject': 2,
  'correctMsg': 'Incredible!'},
 {'problem': 'OURSELF<br/>NKNOWN<br/>HOST<br/>PERATORS<br/>PECIFICATION<br/>EGISLATIVE<br/>NTIBODY<br/>OICE<br/>MMEDIATE<br/>BILITY',
  'answer': 'YUGOSLAVIA',
  'subject': 3,
  'correctMsg': 'Neat!'},
 {'problem': '?=R+\\sqrt{-1}X<br>?=mc^2<br>\\mathbf{B} = \\nabla \\times ?<br>?=I\\boldsymbol{\\omega}<br>\\mathbf{F}=m?<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>?=\\epsilon_0\\mathbf{E}+\\mathbf{P}<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>V=I?<br>?=-k_B \\sum \\rho\\ln\\rho',
  'answer': 'ZEALANDERS',
  'subject': 4,
  'correctMsg': 'Excellent!'},
 {'problem': '396154239344963877525900817233865673009767912447',
  'answer': 'NEGLIGIBLE',
  'subject': 0,
  'correctMsg': 'Terrific!'},
 {'problem': '喵鉷滔㮢荋膥樮鴟啷㯖',
  'answer': 'MOTORCYCLE',
  'subject': 1,
  'correctMsg': 'Yes!'},
 {'problem': 'Acg auA Ugu aCu aaU ccG Aaa ccU cgC uGu',
  'answer': 'TECHNOLOGY',
  'subject': 2,
  'correctMsg': 'Splendid!'},
 {'problem': 'EMOVAL<br/>NEMY<br/>URROUNDING<br/>ZONE<br/>UXURY<br/>NLESS<br/>RANSFORMATION<br/>NTERNATIONALLY<br/>PERATOR<br/>AVIGATE',
  'answer': 'RESOLUTION',
  'subject': 3,
  'correctMsg': 'Excellent!'},
 {'problem': 'V=I?<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>?=-k_B \\sum \\rho\\ln\\rho<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>\\mathbf{F}=m?<br>pV=n?T<br>?=\\frac{1}{n}\\frac{\\mathrm{d} Q}{\\mathrm{d} T}<br>?=U+pV<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>V=I?',
  'answer': 'RESEARCHER',
  'subject': 4,
  'correctMsg': 'Very good!'},
 {'problem': '20585334935972672291849559875030876176169779',
  'answer': 'PRODUCTION',
  'subject': 0,
  'correctMsg': 'Excellent!'},
 {'problem': '坛芕厁胅㬌囕牤赔賱朜',
  'answer': 'ASSIGNMENT',
  'subject': 1,
  'correctMsg': 'Neat!'},
 {'problem': 'Ugu ccG aaC D Auc Aca Auc ccA aaU gAu',
  'answer': 'CONDITIONS',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'NFORMATIVE<br/>UMERIC<br/>ESCRIBES<br/>NTERACTIONS<br/>ISUAL<br/>NVESTING<br/>AISY<br/>NEMPLOYMENT<br/>SSOCIATIONS<br/>ATELY',
  'answer': 'INDIVIDUAL',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=-k_B \\sum \\rho\\ln\\rho<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>pV=nR?<br>pV=nR?<br>?=I\\boldsymbol{\\omega}<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>?=\\rho V<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>pV=nR?',
  'answer': 'SETTLEMENT',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '7681079409966272419153800178336977293625817',
  'answer': 'SUBSEQUENT',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '廰䏜橫䋩䊈賟妦滔仁鴯',
  'answer': 'THEREAFTER',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'cAc Aug ugG ccA uaU auG gUu aaU Ugc uuC',
  'answer': 'IMPORTANCE',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'EROX<br/>MPEROR<br/>ARRATIVE<br/>BTAIN<br/>HYSICALLY<br/>OPEFULLY<br/>CCUPATIONAL<br/>ECOMES<br/>NSURANCE<br/>DVISE',
  'answer': 'XENOPHOBIA',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': 'E=m?^2<br>\\mathbf{F}=m?<br>?=\\frac{\\mathrm{d} E}{\\mathrm{d} t}<br>V=?R<br>pV=nR?<br>\\mathbf{B} = \\nabla \\times ?<br>?=I\\boldsymbol{\\omega}<br>V=?R<br>?=-k_B \\sum \\rho\\ln\\rho<br>?=\\rho V',
  'answer': 'CAPITALISM',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '1192349053669435172797551235839141043163',
  'answer': 'BATTLESHIP',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '粩籘猺筜皬児稣䣩铏媥',
  'answer': 'LEADERSHIP',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'Ugc ccA Aug ugG gGu uCc Ugg auC Aag uAu',
  'answer': 'COMPLETELY',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'ERCENT<br/>CTIVITIES<br/>EWARD<br/>ATINO<br/>NITIALLY<br/>DMINISTRATION<br/>ANUFACTURING<br/>NABLING<br/>EWLY<br/>UITION',
  'answer': 'PARLIAMENT',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=\\frac{c}{v}<br>V=?R<br>?=I/V<br>?=U+pV<br>pV=nR?<br>G=H-T?<br>\\Delta x \\Delta p\\ge \\frac{?}{4\\pi}<br>\\mathbf{B} = \\nabla \\times ?<br>?=\\epsilon_0\\mathbf{E}+\\mathbf{P}<br>?=mc^2',
  'answer': 'NIGHTSHADE',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '5358376004402940619134189450704597119',
  'answer': 'PERMISSION',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '䴓瀯妈鬍熘揀鍮㸫瘹胀',
  'answer': 'SIMULATION',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'uCa Guc uCa aaC Aca gaA gcA guC Aag aAa',
  'answer': 'EVENTUALLY',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'OOGLE<br/>EGISTRAR<br/>FFILIATES<br/>IRECT<br/>NDERGRADUATE<br/>WESOME<br/>RANSFORMATION<br/>NSTRUMENTAL<br/>WNERSHIP<br/>EWSLETTER',
  'answer': 'GRADUATION',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': 'pV=nR?<br>H=?+pV<br>V=I?<br>\\nabla\\times\\mathbf{E} = -\\frac{\\partial ?}{\\partial t}<br>\\Delta ?=Q-W<br>?=A\\sigma T^4<br>?=mc^2<br>?=\\frac{c}{v}<br>E=m?^2<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}',
  'answer': 'TURBULENCE',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '244237183998915986997802348966292571367121981',
  'answer': 'DICTIONARY',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '馠贂柆鵭鸱埵膖㻬爺鸸',
  'answer': 'HELICOPTER',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'cUa guU cUc Aug aGu caA Ugg gcA acG ggA',
  'answer': 'ELEMENTARY',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'HROUGH<br/>CCUPATION<br/>NITED<br/>EMINDER<br/>ORTHWEST<br/>CTORS<br/>ORRIS<br/>XCEED<br/>ICKNAME<br/>RUSTEE',
  'answer': 'TOURNAMENT',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=Z^{-1}<br>\\mathbf{F}=m?<br>pV=n?T<br>pV=n?T<br>?=\\frac{\\mathrm{d} \\mathbf{v}}{\\mathrm{d} t}<br>\\nabla\\times\\mathbf{E} = -\\frac{\\partial ?}{\\partial t}<br>\\Delta ?=Q-W<br>\\nabla\\times\\mathbf{E} = -\\frac{\\partial ?}{\\partial t}<br>?=\\frac{\\mu_0}{4\\pi}\\int_{C}\\frac{I \\,\\mathrm{d}\\ell\\times \\mathbf{r}}{|\\mathbf{r}|^3}<br>?=\\frac{\\mathrm{d} \\mathbf{v}}{\\mathrm{d} t}',
  'answer': 'YARRABUBBA',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '496758279599530552737709075131965612250049943',
  'answer': 'LIGHTHOUSE',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '芲駗攏獕蚉紛鎖洏婖輷',
  'answer': 'HENCEFORTH',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'Acg cGg gUg aaC Ucu cAa gcA Uac ccA uGg',
  'answer': 'TRANSLATOR',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'ALNUT<br/>NVOLVE<br/>ETECTOR<br/>LECTRONIC<br/>EMICONDUCTOR<br/>ROMOTIONAL<br/>ECOGNIZE<br/>SPECIALLY<br/>NYTIME<br/>EPENDENT',
  'answer': 'WIDESPREAD',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': 'V=I?<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>?=-k_B \\sum \\rho\\ln\\rho<br>pV=nR?<br>\\mathbf{B} = \\nabla \\times ?<br>H=?+pV<br>pV=n?T<br>\\mathbf{B} = \\nabla \\times ?<br>?=\\frac{c}{v}<br>pV=nR?',
  'answer': 'RESTAURANT',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '156650145327736110406164456676119647133477937959023',
  'answer': 'ORCHESTRAS',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '雌㧐蘓託轜䔪喵䴶絼綎',
  'answer': 'INSTRUMENT',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'gaC Cga cGc Ugg cAc Ugc uuG cAa gcG agC',
  'answer': 'PARTICULAR',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'LLEGED<br/>NLIMITED<br/>ECHNOLOGIES<br/>PENING<br/>ACINTOSH<br/>RGANIZATIONAL<br/>ROADWAY<br/>NTEGRATING<br/>ARGELY<br/>NROLLMENT',
  'answer': 'AUTOMOBILE',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=U+pV<br>?=\\frac{\\mathrm{d}Q}{\\mathrm{d}t}<br>F=\\frac{?m_1m_2}{r^2}<br>\\Delta x \\Delta p\\ge \\frac{?}{4\\pi}<br>?=\\frac{\\Phi}{I}<br>\\mathbf{L}=?\\boldsymbol{\\omega}<br>F=\\frac{?m_1m_2}{r^2}<br>?=p\\lambda<br>pV=nR?<br>G=H-T?',
  'answer': 'HIGHLIGHTS',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '75847980998034990787990756580463493542086113',
  'answer': 'THEATRICAL',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '㗶䑕贆熘瓶澘㡃羆蔉罓',
  'answer': 'PUBLISHING',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'B Auu ccG Cuu ccU agA Auu Ugu gcA cAa',
  'answer': 'BIOLOGICAL',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'ROSTATE<br/>EACTION<br/>PERATION<br/>ELECOM<br/>VENTUALLY<br/>OMPUTATION<br/>ERRIBLE<br/>NVOLVING<br/>RGANIZER<br/>EITHER',
  'answer': 'PROTECTION',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=\\frac{\\mathrm{d} \\mathbf{v}}{\\mathrm{d} t}<br>?=q\\mathbf{v} \\times \\mathbf{B}<br>pV=nR?<br>?=mc^2<br>pV=n?T<br>?=\\int P \\,\\mathrm{d} V<br>\\mathbf{F}=m?<br>pV=n?T<br>?=\\epsilon_0\\mathbf{E}+\\mathbf{P}<br>?=-k_B \\sum \\rho\\ln\\rho',
  'answer': 'AFTERWARDS',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '50115673788622957375695970644070326606307673',
  'answer': 'RESISTANCE',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '钫鮞䯤愸誷鴭餿擢裘馪',
  'answer': 'FRIENDSHIP',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'cGg aGu gaC cuA Aca Gau Aca Auu ccA caA',
  'answer': 'REPUTATION',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'CCOMPANIED<br/>OLLECT<br/>ITLED<br/>NTERMEDIATE<br/>OYEUR<br/>NSERT<br/>OOLKIT<br/>NVESTMENTS<br/>XTENT<br/>HADE',
  'answer': 'ACTIVITIES',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': 'pV=nR?<br>?=mc^2<br>?=I\\boldsymbol{\\omega}<br>?=mc^2<br>?=I/V<br>pV=n?T<br>\\mathbf{F}=m?<br>?=\\frac{\\mathrm{d} E}{\\mathrm{d} t}<br>?=p\\lambda<br>?=G+\\sqrt{-1}B',
  'answer': 'TELEGRAPHY',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '348024622977627920900907999188954714429836007',
  'answer': 'PERCENTAGE',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '曫㥹䴸鲇㩜禥枩鍧歵艡',
  'answer': 'UNFINISHED',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'aaU uCg W Agc Uuc Gca Uuc aGu acU ugU',
  'answer': 'NEWSPAPERS',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'ENALTY<br/>EGARDLESS<br/>XPLAIN<br/>ESSELS<br/>NSTRUCTOR<br/>RGASM<br/>SEFUL<br/>IMULTANEOUSLY<br/>OGICAL<br/>ACHT',
  'answer': 'PREVIOUSLY',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=\\frac{\\mathrm{d} \\mathbf{v}}{\\mathrm{d} t}<br>?=N_A k_B<br>\\mathbf{F}=m?<br>G=H-T?<br>\\Delta x \\Delta p\\ge \\frac{?}{4\\pi}<br>\\mathbf{L}=?\\boldsymbol{\\omega}<br>?=G+\\sqrt{-1}B<br>?=\\frac{\\mathrm{d} \\mathbf{v}}{\\mathrm{d} t}<br>?=\\rho V<br>\\mathbf{B} = \\nabla \\times ?',
  'answer': 'ARASHIYAMA',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '12612430343941299392524068786159347659586053',
  'answer': 'COMPARISON',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '鯿熘欵苍鏗傷哞始鍮蛰',
  'answer': 'BLACKSMITH',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'Ugc ccC caG F aGu acC cUa caG Ugc aGu',
  'answer': 'CONFERENCE',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'LEMENTS<br/>EROX<br/>ERSONS<br/>ESULTS<br/>NTITY<br/>UPPORTING<br/>PRINGER<br/>MPROVE<br/>PTICAL<br/>EIGHBORHOOD',
  'answer': 'EXPRESSION',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=\\frac{\\mathrm{d} \\mathbf{p}}{\\mathrm{d} t}<br>?=\\frac{\\mathrm{d}Q}{\\mathrm{d}t}<br>?=\\frac{\\Phi}{I}<br>?=\\rho V<br>?=\\rho V<br>\\mathbf{B} = \\nabla \\times ?<br>p=\\hbar?<br>V=?R<br>?=\\frac{c}{v}<br>F=\\frac{?m_1m_2}{r^2}',
  'answer': 'FILMMAKING',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '349460294646854348704517526465715161707199541',
  'answer': 'MEDITATION',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '笢辶蓪塳㮬湰隭煓籗纡',
  'answer': 'NOTEWORTHY',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'cAg gUg B ccU uGg Gca auG ccC ucC ggA',
  'answer': 'LABORATORY',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'ESOLVED<br/>NEMIES<br/>ORECAST<br/>ATEST<br/>STABLISH<br/>HANGE<br/>OMORROW<br/>NDIRECT<br/>RDERING<br/>EWSPAPERS',
  'answer': 'REFLECTION',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=\\epsilon_0\\mathbf{E}+\\mathbf{P}<br>?=\\frac{\\mathrm{d}Q}{\\mathrm{d}t}<br>?=-k_B \\sum \\rho\\ln\\rho<br>?=\\frac{\\mathrm{d} \\mathbf{v}}{\\mathrm{d} t}<br>\\mathbf{H}=\\frac{?}{\\mu_0}-\\mathbf{M}<br>\\mathbf{L}=?\\boldsymbol{\\omega}<br>?=I\\boldsymbol{\\omega}<br>V=?R<br>pV=nR?<br>?=G+\\sqrt{-1}B',
  'answer': 'DISABILITY',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '5609423398935740164388764600826704981',
  'answer': 'SUGGESTION',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '飊㷄䁏镑鴯弿㲏晣则栭',
  'answer': 'BIOGRAPHER',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'uUu uCa Aug cAc ugU Uuc Cau aGc cGu cUa',
  'answer': 'HEMISPHERE',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'ARKETING<br/>OUNG<br/>HEPHERD<br/>RADITION<br/>XECUTIVE<br/>ADIO<br/>NTERACTIVE<br/>RGANIZER<br/>NDERGRADUATE<br/>ELECTION',
  'answer': 'MYSTERIOUS',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=\\epsilon_0\\mathbf{E}+\\mathbf{P}<br>\\mathbf{L}=?\\boldsymbol{\\omega}<br>pV=n?T<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>E=m?^2<br>pV=nR?<br>?=\\frac{c}{v}<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>G=H-T?<br>?=-k_B \\sum \\rho\\ln\\rho',
  'answer': 'DIRECTNESS',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '289904716131652509236655716514751732747',
  'answer': 'RECOVERING',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '㥖輝鰩熘蹽眕㙣㼚矧輀',
  'answer': 'CHALLENGER',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'aaC Auc Caa aCu auG Aug Aau acA aGc aaG',
  'answer': 'NIGHTMARES',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'AVOURITES<br/>ETRIEVAL<br/>DITING<br/>UANTITY<br/>SUAL<br/>THNIC<br/>EIGHBORHOOD<br/>YPICALLY<br/>ANGUAGES<br/>OURSELF',
  'answer': 'FREQUENTLY',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '?=\\rho V<br>\\mathbf{F}=m?<br>?=A\\sigma T^4<br>V=?R<br>?=H-TS<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>\\mathbf{B} = \\nabla \\times ?<br>?=\\frac{c}{v}<br>\\epsilon_0=\\frac 1{\\mu_0 ?^2}<br>?=Z^{-1}',
  'answer': 'MALIGNANCY',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '12453230854145506408096023771484973552611',
  'answer': 'LOCOMOTIVE',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '挩鸸减軦笘崟锑䲑茙椫',
  'answer': 'TRANSITION',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'ccU Guc auU aGa Ugu ccC Aug Auc aaU cgA',
  'answer': 'OVERCOMING',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'NIVERSITY<br/>URVIVAL<br/>XACTLY<br/>LOOR<br/>NEMPLOYMENT<br/>IFETIME<br/>OWHERE<br/>NGINEERING<br/>YNOPSIS<br/>POKESMAN',
  'answer': 'USEFULNESS',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': '\\Delta ?=Q-W<br>?=\\frac{\\mathrm{d} E}{\\mathrm{d} t}<br>?=\\frac{\\mu_0}{4\\pi}\\int_{C}\\frac{I \\,\\mathrm{d}\\ell\\times \\mathbf{r}}{|\\mathbf{r}|^3}<br>V=I?<br>\\mathbf{L}=?\\boldsymbol{\\omega}<br>?=\\frac{c}{v}<br>?=H-TS<br>?=\\frac{\\mathrm{d}Q}{\\mathrm{d}t}<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>F=\\frac{?m_1m_2}{r^2}',
  'answer': 'UPBRINGING',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '7671774830601383766963351244217818288234309',
  'answer': 'UNBUTTONED',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '䲂䄠斌赮㨍菈劧蔥剷㕇',
  'answer': 'UNBIBLICAL',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'gaG caG B aGu gcG Aca gUa B aUc aUg',
  'answer': 'UNBEATABLE',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'NEXPECTED<br/>ECAME<br/>NTRODUCE<br/>UARTER<br/>TILIZE<br/>NSERT<br/>ERRITORIES<br/>PTICAL<br/>NDERWEAR<br/>CREENING',
  'answer': 'UBIQUITOUS',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': 'H=?+pV<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>\\mathbf{H}=\\frac{?}{\\mu_0}-\\mathbf{M}<br>?=\\frac{\\mathrm{d} \\mathbf{v}}{\\mathrm{d} t}<br>?=\\frac{\\mathrm{d} E}{\\mathrm{d} t}<br>pV=nR?<br>V=?R<br>?=R+\\sqrt{-1}X<br>?=mc^2<br>?=\\epsilon_0\\mathbf{E}+\\mathbf{P}',
  'answer': 'UNBAPTIZED',
  'subject': 4,
  'correctMsg': 'Correct!'},
 {'problem': '113323227698709121797719815595734372667943883',
  'answer': 'UNBRANCHED',
  'subject': 0,
  'correctMsg': 'Correct!'},
 {'problem': '䐾鶎鲃䒩寬㓟䪎胎搪姠',
  'answer': 'UZBEKISTAN',
  'subject': 1,
  'correctMsg': 'Correct!'},
 {'problem': 'gaG caA B guU ccA Ugu K Auu caA Caa',
  'answer': 'UNBLOCKING',
  'subject': 2,
  'correctMsg': 'Correct!'},
 {'problem': 'PDATED<br/>ARRATIVE<br/>ESULTED<br/>XPENSES<br/>IBRARY<br/>NFORMATIONAL<br/>UTOMOTIVE<br/>RUSSELS<br/>EGISLATURE<br/>ASILY',
  'answer': 'UNRELIABLE',
  'subject': 3,
  'correctMsg': 'Correct!'},
 {'problem': 'H=?+pV<br>?=\\frac{\\sin\\theta_1}{\\sin\\theta_2}<br>?=\\epsilon_0\\mathbf{E}+\\mathbf{P}<br>\\alpha=\\frac{?^2}{4\\pi\\epsilon_0\\hbar c}<br>?=N_A k_B<br>G=H-T?<br>pV=nR?<br>\\mathbf{B} = \\nabla \\times ?<br>?=\\frac{c}{v}<br>?=\\epsilon_0\\mathbf{E}+\\mathbf{P}',
  'answer': 'UNDERSTAND',
  'subject': 4,
  'correctMsg': 'Correct!'}]
const showMoreWhenSolvedNSubjectsInLastBatch = 5
const numCols = 13

//在这个函数中实现你的功能，ctx定义如顶部注释，request为已解析好的传入对象。
/**
 * @param {Ctx} ctx 全局上下文对象
 * @param {object} request 用户请求
 * @returns {object} response 返回给用户的数据
 */
function main(ctx, request) {

// getProgress(pid: number, key: string) : string // 读取：当前组队的题目进度（组队题目进度是存在后端数据库中的，组队内部共享，每个题目有不同的状态）
// setProgress(pid: number, key: string, value: string) // 写入：当前组队的题目进度
    
    var solvedIDs = ctx.getProgress(PID, "solved");
    if (!solvedIDs) {
        solvedIDs = []
    } else {
        solvedIDs = solvedIDs.split(",").map(Number)
    }
    var solvedBools = Array(exercises.length).fill(false);
    for (let i = 0; i < solvedIDs.length; i++) {
        solvedBools[solvedIDs[i]] = true
    }

    var message = ""
    var hasError = false
    // if this is checking answer, see if we need to add any new solved ones
    if (request.type == 1 && request.answer && request.id) {
        if (request.id == 104097) {
            if (request.answer.toUpperCase() === "UNIQUENESS") {
                ctx.addAnswerLog(ctx.uid, ctx.gid, PID, request.answer, 8, "正确回答第104097小题");
                message = '太了不起了！你居然做到了这里！为了奖励你的努力，送你一本　<b>5年高考3年模拟</b>　！'
            } else {
                message = '答案错误'
                hasError = true
            }
        } else {
            if (request.id <= exercises.length && exercises[request.id - 1].answer.toUpperCase() == request.answer.toUpperCase()) {
                let prevSolved = solvedBools[request.id - 1]
                solvedBools[request.id - 1] = true;
                message = exercises[request.id - 1].correctMsg;
                if (!prevSolved) {
                    // add this to the solved list
                    solvedIDs.push(request.id - 1)
                    // save status
                    ctx.setProgress(PID, "solved", solvedIDs.join(","))
                }
            } else {
                message = '答案错误'
                hasError = true
            }
        }
    }

    var displayUpTo = numCols
    do {
        let solvedSubjects = new Set()
        for (let i = displayUpTo - numCols; i < displayUpTo; i++) {
            if (solvedBools[i]) {
                solvedSubjects.add(exercises[i].subject);
            }
        }
        // if (displayUpTo == numCols)
        //     x = Array.from(solvedBools).join(',');
        if (solvedSubjects.size >= showMoreWhenSolvedNSubjectsInLastBatch) {
            displayUpTo += numCols;
        } else {
            break
        }
    } while (displayUpTo <= exercises.length)

    var retExercises = []
    for (let i = 0; i < exercises.length; i++) {
        if (i >= displayUpTo) {
            break
        } else {
            retExercises.push(Object.assign({}, exercises[i]))
            if (!solvedBools[i]) {
                retExercises[i].answer = ""
            }
        }
    }

    //将你需要返回给前端的对象return出去
    return {
        pastTheEnd: displayUpTo > exercises.length,
        exercises: retExercises,
        message: message,
        hasError: hasError,
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