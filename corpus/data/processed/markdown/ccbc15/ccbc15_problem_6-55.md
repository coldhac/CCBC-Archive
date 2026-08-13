---
record_id: "ccbc15:problem:6-55"
event_id: "ccbc15"
editions: ["CCBC 15"]
year: 2024
area: "我爱猫猫!"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc15/problems/6/55.yaml"
---

# 兜智者的游戏

## 题面

## 谎言Wordle游戏规则</BR>
1. 每组中，有且仅有一个单词持有者说的是谎话。
2. 黄色为存在该字母，但是位置不对；绿色为存在该字母，且位置对；白色为完全不存在该字母。黄色和绿色为染色格。                                     
3. 如果答案中只出现了一次某字母，但线索中出现了两次，则只有第一次出现会被标记；多次同理。
4. 第一个单词是“最上面的单词”，第五个是“最下面的单词”，相邻指两者顺序相差1。
5. 两个单词因为某条件（例如是染色的、是绿色的……等）而重合，指，存在某个序号 X，使两个单词的各第 X 个字母都满足这个条件。

COUNT: 我只有一个染色格子，它是C或者T。</BR>
UNTIL: 我和相邻的单词拥有一样的绿色格子数量，但是三者的黄色格子从上到下递增。 </BR>
MEDIA: 我的每一个染色格都和某个相邻的单词重合：一个重合了两次、两个重合了一次。</BR>
ADULT: 我与两个相邻的单词都不因“染色”而重合。答案只有一个元音。</BR>
COMIC: 我有两个绿色的格子。我的M是黄色的。</BR>
答案 = 1 2 3 4 5</BR>

GAMES: G是白色的。A是绿色的。答案包含两个元音</BR>
AMONG: 我的染色格和非染色格都是相连的。STRAY也是。我们的绿色格子数量相同。</BR>
OTHER: 我有两个非染色格。我的染色格是相连的。我和相邻单词的黄色字母数量相等。</BR>
HONEY: 我和我相邻单词的第五个格子都被染色了，其中只有一个是绿色的。</BR>
STRAY: 我和HONEY，AMONG都没有绿色格子。我比HONEY的黄色格子多1.</BR>
答案 = 6 7 8 9 10</BR>

PARIS: 我的A格是白色的。我的其他格子都是黄色的。</BR>
SPADE: 我的染色格子数量和CREAM一样，但我有两个绿色格子。</BR>
CREAM: 我没有绿色格子，且我的白色格子不相邻。</BR>
LODGE: 我的绿色格子只包含E，我的黄色格子和PARIS的黄色格子一样多。</BR>
MODEL: 我和PARIS不因“染色”而重合。我和SPADE因“染色”而重合恰好一次。</BR>
答案 = 11 12 13 14 15</BR>

FOCUS: 我有一个O的绿色格子，FIRST的颜色格被我严格包含。</BR>
FIRST: 我有一个F的绿色格子。我一共有3个颜色格子</BR>
HATER: T，S，H都在答案里。</BR>
CRUSH: 我拥有场上最多，没有之一的绿格。我也恰好拥有一个黄格。</BR>
TOAST: 我有整整3个染色格。</BR>
答案 = 16 17 18 19 20</BR>

2	4	3	10	16	7	1	19	18	3	12	14	9	2	17	10

<div style="height: 170px"></div>

## 答案

`PASTORAL`

## 解析

[解析链接](https://docs.qq.com/sheet/DR0R6UHpqa0lUdVFp?tab=BB08J2)

## 提示

### 1. 该怎么提取？

完成的这句话暗示了你怎么进行提取 ——关注撒谎者本人。每组应该提取两个字母。另外排序根据撒谎者的位置决定。


## 中间答案

| 提交 | 回复 | 附加信息 |
| --- | --- | --- |
| CLAIM | 正确！ |  |
| MAYOR | 正确！ |  |
| SOUTH | 正确！ |  |
| PLACE | 正确！ |  |
| liars actual color | 说谎者被揪了出来，它们自己应该是什么颜色呢？ |  |

来源：[https://archive.cipherpuzzles.com/ccbc15/problems/6/55.yaml](https://archive.cipherpuzzles.com/ccbc15/problems/6/55.yaml)
