---
record_id: "ccbc15:problem:4-29"
event_id: "ccbc15"
editions: ["CCBC 15"]
year: 2024
area: "全球呼叫出题组"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc15/problems/4/29.yaml"
---

# CCBC MOE

## 题面

你来到了渥太华，这里正在举办投票活动，你凑了上去——

“欢迎来到 CCBC Moe 人气大赏！你觉得谁更萌更可爱呢？快拿上筹码，all in 给你支持的 TA 吧！”

<div class="infom">
<p>投票说明：您可在每个赛区中挑选一位支持对象投票。如果赛区中没有您支持的对象，您也可以忽略此赛区。选择完成后点击最下方的 VOTE 按钮投上你宝贵的一票吧！</p>
<p>每人每小时仅能投 1 票。投票结果将定时刷新并显示在投票页面上。</p>
</div>

<style>
.infom {
    font-size: 12px;
}
</style>

<br>

<span style="color: red">
组委会公告：

经过雪菜党的努力，小木曾雪菜获得的票数终于多过了冬马和纱，完成了反超；同时经组委会调查，「含气型汽水」作为分组名称不利于当下萌战间复杂的竞争关系，于是组委会决定将该分组的名字改为「含汽型饮料」，特此公告。
</span>

## 交互源码

### vue_template

```html
<template>
  <div id="moe-main">
    <div v-for="(group, index) in voteGroups" :key="index" class="vote-group">
      <div class="left-part">
        <div class="left-content item-name" v-html="group.left.raw"></div>
      </div>
      <div class="right-part">
        <div v-for="(item, idx) in group.right" :key="idx" class="right-item">
          <img :src="item.img" style="width: 100px; height: 100px;" />
          <div class="item-name" v-html="item.raw"></div>
          <div>{{ realResult ? '真实得票' : '得票' }}：{{ item.votes }}</div>
          <button class="el-button el-button--primary" :class="{ selected: isSelected(index, idx) }"
            @click="selectItem(index, idx)">
            SELECT
          </button>
        </div>
      </div>
    </div>
    <div class="btn-container">
      <button class="el-button el-button--primary func-button" @click="submitVote">VOTE</button>
      <button v-if="showHiddenButton" class="el-button el-button--primary func-button" @click="showRealResult">
      REAL RESULT
    </button>
    </div>
  </div>
</template>

<style>
  #moe-main {
    /* text-align: center; */
    display:flex;
    flex-direction: column;
  }

  .vote-group {
    display: flex;
    justify-content: left;
    /* justify-content: center; */
    margin-bottom: 20px;
  }

  .left-part {
    min-width: 100px;
    display: flex;
    align-items: center;
    margin-right: 20px;
    /* flex: 1; */
  }

  .left-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .right-part {
    display: flex;
    flex: 3
  }

  .right-item {
    margin: 0 10px;
    text-align: center;
  }

  .el-button.selected {
    background-color: #42b983;
    color: white;
  }

  .func-button {
    margin-top: 20px;
    margin-bottom: 20px;
    text-align: center;
  }

  .item-name {
    /* 文字加粗 */
    font-weight: bold;
    text-shadow:
      -.5px -.5px 0 #b3b3b3,
      /* 左上 */
      .5px -.5px 0 #b3b3b3,
      /* 右上 */
      -.5px .5px 0 #b3b3b3,
      /* 左下 */
      .5px .5px 0 #b3b3b3;
    /* 右下 */
  }

  r {
    /* 设置成红色字体 */
    color: red;
  }

  .btn-container {
    text-align: center;
  }
</style>
```

### vue_script

```text
const { ref, reactive, onMounted, inject } = Vue;

export default {
  setup() {
    const voteGroups = ref([
      {
        left: { name: '白色相册二', raw: '<r>白色相册二</r>' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/7d0a9253d04c4fa39dbb3972048dc5e6.webp', name: '冬马', raw: '冬马', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/d132701ac10946c4933d095c389d5bc2.webp', name: '雪菜', raw: '雪<r>菜</r>', votes: 2 },
        ],
      },
      {
        left: { name: '含汽型饮料', raw: '<r>含汽型</r>饮<r>料</r>' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/96648d8da0ff4c9f8fbc50c5582c015c.webp', name: '百事', raw: '百<r>事</r>', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/c51c6f994b5d45baba4046b89d606d73.webp', name: '可口', raw: '可口', votes: 1 },
        ],
      },
      {
        left: { name: '知名汉堡店', raw: '知<r>名汉</r>堡<r>店</r>' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/ac91062b8c6747218cba7f8be1ee6351.webp', name: '麦门', raw: '<r>麦门</r>', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/dc0f167837994154945e0861bf834ac5.webp', name: '上校', raw: '<r>上校</r>', votes: 2 },
        ],
      },
      {
        left: { name: '青〇恋物语', raw: '青〇<r>恋物</r>语' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/2b3c09ee19d34544aa3daae650ce109c.webp', name: '雪乃', raw: '雪乃', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/3c17bc2c9b5d44f3854838f8243cf8df.webp', name: '结衣', raw: '<r>结</r>衣', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/af513487f4d54677a3494ffb6ecf30d5.webp', name: '一色', raw: '一<r>色</r>', votes: 3 },
        ],
      },
      {
        left: { name: '孤独摇滚〇', raw: '孤<r>独摇</r>滚〇' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/667b62cc498246bd8a89f981746cdb66.webp', name: '妙脆', raw: '<r>妙脆</r>', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/b266778b37ef4ed5b6c826c922164d73.webp', name: '一里', raw: '一里', votes: 3 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/df6b6abbed7b4abc9c2ee8752e9c1576.webp', name: '贝斯', raw: '<r>贝</r>斯', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/d43269ffc51149ab8d83cbfe4735f408.webp', name: '郁代', raw: '<r>郁代</r>', votes: 4 },
        ],
      },
      {
        left: { name: '〇等分新娘', raw: '<r>〇</r>等分新<r>娘</r>' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/6eaf665a067d4600a9d0bc8ba713df15.webp', name: '三玖', raw: '三玖', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/9da1ce2ceb294d39970b7a8e5c017ec3.webp', name: '二乃', raw: '<r>二</r>乃', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/527685ea63a140c598cae5a9e2d8492b.webp', name: '一花', raw: '一花', votes: 4 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/a846624642fc4ea19512a2c816bbc91e.webp', name: '五月', raw: '五<r>月</r>', votes: 5 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/9264c72768de45829c84bd42e24ae0b8.webp', name: '四葉', raw: '<r>四葉</r>', votes: 3 },
        ],
      },
      {
        left: { name: '虚拟区主〇', raw: '虚拟区主〇' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/edb58160ecaa490ca997b7cc2d696f36.webp', name: '泠鸢', raw: '<r>泠</r>鸢', votes: 3 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/bc18b3fbde824f53b630096bd0b9a96d.webp', name: '七海', raw: '七海', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/fa8f53cc10934bd99cd35c5262aa786e.webp', name: '羽衣', raw: '羽衣', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/858599c3238a4a09868af62bd08e07ac.webp', name: '阿萨', raw: '阿<r>萨</r>', votes: 4 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/939ed86a2d054fb38c03a3689cfd1cab.webp', name: '绊爱', raw: '<r>绊爱</r>', votes: 5 },
        ],
      },
      {
        left: { name: '闲散解谜〇', raw: '<r>闲</r>散解<r>谜</r>〇' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/28a4b36731754a7fb2921492d2a306aa.webp', name: '五肉', raw: '五<r>肉</r>', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/f97883cbffb24dbbb51f47281ac3ed4e.webp', name: '喷菇', raw: '喷菇', votes: 4 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/3e8da04aee804226a2bc7eff0ab604c6.webp', name: '皮巨', raw: '<r>皮巨</r>', votes: 3 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/9f2f2e56b49849af9151e0bac7f8e7ab.webp', name: '可乐', raw: '可<r>乐</r>', votes: 5 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/6b12dc5fe18a4296b9eaf6b2103124d5.webp', name: '小狐', raw: '小<r>狐</r>', votes: 2 },
        ],
      },
      {
        left: { name: '节奏型〇戏', raw: '<r>节奏型</r>〇<r>戏</r>' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/3f3faf8c963d45bb8e55cb5166507572.webp', name: '玩蛇', raw: '<r>玩蛇</r>', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/0ecd9362da364981b118810ab4ec6ce7.webp', name: '中二', raw: '中<r>二</r>', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/4414a72c80ae4b999f6102f8aae951da.webp', name: '太鼓', raw: '<r>太</r>鼓', votes: 3 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/7de9637612ec4314b850870df2228324.webp', name: '喵斯', raw: '喵斯', votes: 4 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/1d1ba81811e04a01b8db581bad4b0be7.webp', name: '音击', raw: '音击', votes: 5 },
        ],
      },
      {
        left: { name: '多边〇几何', raw: '多边<r>〇</r>几<r>何</r>' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/d52de0c818fd4551b30af2438fb2834f.webp', name: '正方', raw: '<r>正</r>方', votes: 3 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/093b456dd18e429cb76c3f079e2eb87d.webp', name: '三角', raw: '三角', votes: 4 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/d3fffa6dc9214e4796c5e1ec294ffd10.webp', name: '圆圈', raw: '<r>圆</r>圈', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/75193e24401e4e7eae87e09cd4b1025d.webp', name: '六芒', raw: '<r>六芒</r>', votes: 5 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/c4701d64934d4883952e07664abf1a4c.webp', name: '五星', raw: '五星', votes: 1 },
        ],
      },
      {
        left: { name: '〇一线城市', raw: '〇一<r>线城市</r>' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/5f86d983b98648d191329e833c02d0db.webp', name: '理塘', raw: '理<r>塘</r>', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/356f3d1c379c4c8cad26fe2f7ba4e77d.webp', name: '广州', raw: '广州', votes: 3 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/f3776d33cade48c1983158eac9c0f5cf.webp', name: '北京', raw: '北京', votes: 5 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/9c65d37fa1b449b786e1324fdc2f6184.webp', name: '深圳', raw: '深<r>圳</r>', votes: 4 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/157b57236bb04e93b2cdef7b5de650de.webp', name: '上海', raw: '<r>上</r>海', votes: 1 },
        ],
      },
      {
        left: { name: '传统〇密码', raw: '<r>传</r>统〇<r>密</r>码' },
        right: [
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/b6dc22feea01431aad97a255ee8310c3.webp', name: '九键', raw: '九<r>键</r>', votes: 1 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/94a2823893e44485932714b623901a73.webp', name: '零一', raw: '<r>零</r>一', votes: 2 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/91e6275dab3e4bcfbf7c8cc738cef85b.webp', name: '替换', raw: '<r>替换</r>', votes: 6 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/2ca5b071bd6345c7bde7a13a8e421003.webp', name: '培根', raw: '<r>培</r>根', votes: 4 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/6a7aff9a958049599a17cca9e5a12072.webp', name: '盲文', raw: '<r>盲文</r>', votes: 5 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/2231514dbc5b4699944d8841de99b042.webp', name: '康托', raw: '康托', votes: 3 },
          { img: '../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/082ba0b0db34487abe7ea2848ed9d1ee.webp', name: '栅栏', raw: '<r>栅栏</r>', votes: 7 },
        ],
      },
    ]);

    const backend = inject("backend");
    const selectedItems = reactive({});

    const selectItem = (groupIndex, itemIndex) => {
      if (selectedItems[groupIndex] === itemIndex) {
        // If the same item is clicked again, deselect it
        delete selectedItems[groupIndex];
      } else {
        selectedItems[groupIndex] = itemIndex;
      }
    };

    const isSelected = (groupIndex, itemIndex) => {
      return selectedItems[groupIndex] === itemIndex;
    };

    const submitVote = async () => {
      // Create an array with all groups, defaulting to -1 for non-selected groups
      const vote = voteGroups.value.map((_, groupIndex) => {
        return selectedItems[groupIndex] !== undefined ? selectedItems[groupIndex] : -1;
      });

      console.log(vote);

      // Check if at least one vote is cast
      if (!vote.some((item) => item !== -1)) {
        alert("请至少选择一个选项");
        return;
      }

      try {
        const response = await backend("c15-ccbc-moe", { type: "vote", vote });
        if (response.status === "ok") {
          alert(response.msg);
          await fetchVotes(); // Refresh votes after submission
        } else {
          alert(response.msg);
        }
      } catch (error) {
        console.error("Error submitting vote:", error);
      }
    };

    const showHiddenButton = ref(false);

    const fetchVotes = async () => {
      try {
        const response = await backend("c15-ccbc-moe", { type: "query" });
        if (response.status === "ok") {
          const votes = response.data.votes;
          voteGroups.value.forEach((group, groupIndex) => {
            group.right.forEach((item, itemIndex) => {
              item.votes = votes[groupIndex][itemIndex];
            });
          });
          if (response.admin === true) {
            showHiddenButton.value = true;
          }
        } else {
          alert(response.msg);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    const realResult = ref(false);

    const showRealResult = async () => {
      try {
        const response = await backend("c15-ccbc-moe", { type: "query_real" });
        if (response.status === "ok") {
          const votes = response.data.votes;
          voteGroups.value.forEach((group, groupIndex) => {
            group.right.forEach((item, itemIndex) => {
              item.votes = votes[groupIndex][itemIndex];
            });
          });
          realResult.value = true;
        } else {
          alert(response.msg);
        }
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    };

    onMounted(() => {
      fetchVotes();
    });

    return {
      selectedItems,
      selectItem,
      isSelected,
      submitVote,
      voteGroups,
      showHiddenButton,
      realResult,
      showRealResult,
    };
  },
};
```

### backend_c15-ccbc-moe

```text
// 提交频率限制在每个用户每一小时一次
const LIMIT = 60 * 60 * 1000;
// const LIMIT = 1000;

// 投票结果缓存时间
const CACHE_TIME = 1 * 60 * 1000;

const FINAL_RANK = [
    [1, 2],
    [2, 1],
    [1, 2],
    [1, 2, 3],
    [2, 3, 1, 4],
    [1, 2, 4, 5, 3],
    [3, 1, 2, 4, 5],
    [1, 4, 3, 5, 2],
    [2, 1, 3, 4, 5],
    [3, 4, 2, 5, 1],
    [2, 3, 5, 4, 1],
    [1, 2, 6, 4, 5, 3, 7]
]

function initVotes() {
    let votes = [];
    for (let i = 0; i < FINAL_RANK.length; i++) {
        // 先随机生成 1~26 内的不重复的数字
        let arr = [];
        while (arr.length < FINAL_RANK[i].length) {
            let num = Math.floor(Math.random() * 26) + 1;
            if (arr.indexOf(num) === -1) {
                arr.push(num);
            }
        }
        // 排序并加上排名
        arr = arr.sort(function (a, b) {
            return a - b;
        });
        arr = arr.map(function (x, i) {
            return [i + 1, x];
        });
        // 按照预设的排名顺序排序
        arr.sort(function (a, b) {
            return FINAL_RANK[i].indexOf(a[0]) - FINAL_RANK[i].indexOf(b[0]);
        });
        // 只保留数字
        votes.push(arr.map(function (x) {
            return x[1];
        }));
    }
    return votes;
}

function query(ctx) {
    // 获取当前时间
    let now = Date.now();
    // 检查缓存是否过期
    let cache = ctx.getStorage("moeCache");
    // 如果为空，则初始化成一个空的字典
    if (cache) {
        cache = JSON.parse(cache);
    }
    if (!cache) {
        cache = {};
    }
    // 如果当前还在缓存时间内，则返回缓存数据
    if (cache.time && now - cache.time < CACHE_TIME) {
        return {
            status: "ok",
            msg: "查询成功",
            admin: ctx.uid === 164,
            data: {
                cached: true,
                votes: cache.data
            }
        }
    }

    // 否则重新获取
    let globalVotes = ctx.getStorage("moeGlobalVotes");
    if (globalVotes) {
        globalVotes = JSON.parse(globalVotes);
    }
    if (!globalVotes) {
        return {
            status: "error",
            msg: "坏啦！后端查不到数据啦！请快快通过站内信联系管理员！",
        }
    }
    // 写入缓存
    cache.time = now;
    cache.data = globalVotes;
    // 更新缓存
    ctx.setStorage("moeCache", JSON.stringify(cache));
    // 最后返回投票数据
    return {
        status: "ok",
        msg: "查询成功",
        admin: ctx.gid === 1,
        data: {
            cached: false,
            votes: globalVotes
        }
    }
}

function query_real(ctx) {
    if (ctx.gid !== 1) {
        return {
            status: "error",
            msg: "对不起，你没有权限查看真实数据，因为你不是 Nano 的同党（察觉"
        }
    }

    let globalVotes = ctx.getStorage("moeGlobalVotes");
    if (globalVotes) {
        globalVotes = JSON.parse(globalVotes);
    }
    if (!globalVotes) {
        return {
            status: "error",
            msg: "坏啦！后端查不到数据啦！请快快通过站内信联系管理员！",
        }
    }
    let fakeVotes = ctx.getStorage("moeFakeVotes");
    if (fakeVotes) {
        fakeVotes = JSON.parse(fakeVotes);
    }
    if (!fakeVotes) {
        return {
            status: "error",
            msg: "坏啦！后端查不到数据啦！请快快通过站内信联系管理员！",
        }
    }
    // 相减，获得真实数据
    for (let i = 0; i < FINAL_RANK.length; i++) {
        for (let j = 0; j < FINAL_RANK[i].length; j++) {
            globalVotes[i][j] -= fakeVotes[i][j];
        }
    }
    return {
        status: "ok",
        msg: "查询成功",
        data: {
            votes: globalVotes
        }
    }
}

function reset(ctx) {
    // 只允许 uid = 164 的人调用
    if (ctx.uid !== 164) {
        return {
            status: "error",
            msg: "对不起，你没有权限重置本题，因为你不是 Nano（察觉"
        }
    }
    let votes = initVotes();
    ctx.setStorage("moeGlobalVotes", JSON.stringify(votes));
    ctx.setStorage("moeFakeVotes", JSON.stringify(votes));
    ctx.setStorage("moeCache", JSON.stringify({}));
    ctx.setStatus("moeSubTime", "");
    return {
        status: "ok",
        msg: "重置成功"
    }
}

function reset_cache(ctx) {
    // 只允许 uid = 164 的人调用
    if (ctx.uid !== 164) {
        return {
            status: "error",
            msg: "对不起，你没有权限重置本题，因为你不是 Nano（察觉"
        }
    }
    ctx.setStorage("moeCache", JSON.stringify({}));
    ctx.setStatus("moeSubTime", "");
    return {
        status: "ok",
        msg: "重置缓存成功"
    }
}

function submit(ctx, request) {
    // 如果 request.vote 是空的，则响应
    if (!request.vote) {
        return {
            status: "error",
            msg: "请求格式不正确：vote 字段为空"
        }
    }
    // request.vote 的格式应该是 list[int]
    let vote = request.vote;
    if (!Array.isArray(vote) || vote.length !== FINAL_RANK.length) {
        return {
            status: "error",
            msg: "请求格式不正确：vote 不是数组或长度不匹配"
        }
    }
    for (let i = 0; i < FINAL_RANK.length; i++) {
        if (typeof vote[i] !== 'number' || vote[i] < -1 || vote[i] >= FINAL_RANK[i].length) {
            return {
                status: "error",
                msg: `请求格式不正确：vote[${i}] 不是合法的数字`
            }
        }
    }
    // 全是 -1 也不行
    if (vote.every(function (v) { return v === -1; })) {
        return {
            status: "error",
            msg: "无效投票：请至少选择一个选项"
        };
    }
    // 最后转成字符串
    let vote_str = new Date().toLocaleString() + ":" + vote.join(",").replace(/-1/g, "x");

    // 获取当前时间
    let now = Date.now();
    // 做第一层检查，如果提交时间在冷却时间范围内，则返回无效
    let subTime = ctx.getStatus("moeSubTime");
    if (subTime) {
        let lastTime = parseInt(subTime);
        if (now - lastTime < LIMIT) {
            return {
                status: "error",
                msg: "一小时以内只能投一次票哦，请稍后再试"
            }
        }
    }
    // 获取全局保存的数据
    let moeData = ctx.getStorage(`moeData_${ctx.uid}`);
    // 如果为空，则初始化成一个空的字典
    if (moeData) {
        moeData = JSON.parse(moeData);
    }
    if (!moeData) {
        moeData = {};
    }
    // 如果当前用户的提交时间在冷却时间范围内，则返回无效
    if (moeData.time && now - moeData.time < LIMIT) {
        return {
            status: "error",
            msg: "一小时以内只能投一次票哦，请稍后再试"
        }
    }

    // 到这里应该说明提交有效，记录提交的答案
    if (!moeData.votes) {
        moeData.votes = [];
    }
    moeData.votes.push(vote_str);

    // 更新提交时间
    ctx.setStatus("moeSubTime", now.toString());
    moeData.time = now;
    moeData = JSON.stringify(moeData);
    ctx.setStorage(`moeData_${ctx.uid}`, moeData);

    // 更新全局票数
    let globalVotes = ctx.getStorage("moeGlobalVotes");
    if (globalVotes) {
        globalVotes = JSON.parse(globalVotes);
    }
    if (!globalVotes) {
        return {
            status: "error",
            msg: "坏啦！后端查不到数据啦！请快快通过站内信联系管理员！",
        }
    }
    for (let i = 0; i < FINAL_RANK.length; i++) {
        if (vote[i] !== -1) {
            globalVotes[i][vote[i]]++;
        }
    }

    // 获取假票数量
    let fakeVotes = ctx.getStorage("moeFakeVotes");
    if (fakeVotes) {
        fakeVotes = JSON.parse(fakeVotes);
    }
    if (!fakeVotes) {
        return {
            status: "error",
            msg: "坏啦！后端查不到数据啦！请快快通过站内信联系管理员！",
        }
    }

    // 如果当然的 rank 与预设的不符合，则强行使用机器人账户做假票
    for (let o = 0; o < FINAL_RANK.length; o++) {
        // 从排名低的开始，如果有人票数比前面的高，则强行调整
        let preVote = globalVotes[o][FINAL_RANK[o].indexOf(1)];
        for (let i = 2; i <= FINAL_RANK[o].length; i++) {
            let idx = FINAL_RANK[o].indexOf(i);
            while (globalVotes[o][idx] <= preVote) {
                // 每次随机增加 1~7
                let inc = Math.floor(Math.random() * 7) + 1;
                fakeVotes[o][idx] += inc;
                globalVotes[o][idx] += inc;
            }
            preVote = globalVotes[o][idx];
        }
    }
    ctx.setStorage("moeGlobalVotes", JSON.stringify(globalVotes));
    ctx.setStorage("moeFakeVotes", JSON.stringify(fakeVotes));

    return {
        status: "ok",
        msg: "投票成功！感谢您的参与！"
    }
}

function main(ctx, request) {
    if (!request.type) {
        return {
            status: "error",
            msg: "请求格式不正确：type 字段为空"
        }
    }
    if (request.type === "query") {
        return query(ctx);
    } else if (request.type === "vote") {
        return submit(ctx, request);
    } else if (request.type === "reset") {
        return reset(ctx);
    } else if (request.type === "reset_cache") {
        return reset_cache(ctx);
    } else if (request.type === "query_real") {
        return query_real(ctx);
    } else {
        return {
            status: "error",
            msg: `请求格式不正确：未知的 type 值 ${request.type}`
        }
    }
}

// ======= 以下是 JSON 解析与调用脚本，一般不需要修改 ========
function _jsonProcessHelper(ctx) {
    let request = JSON.parse(ctx.request);
    let resBody = main(ctx, request);
    let resString = JSON.stringify(resBody);
    ctx.response(resString);
}

_jsonProcessHelper(ctx);
```


## 解题后内容

你要离开之前，获得了一份旅游指南，你注意到其中一句话被圈了出来：“欢迎你来珍珠街逛一逛！”

## 答案

`ANGELFISH`

## 解析

本题其实是一道德州扑克题。

注意到题面中很多地方都和德扑有关：

1. 题目描述中的「筹码」和「all in」
2. 左边都是五个字，右边都是两个字，和五张公共牌+若干手牌相对应
3. 字体的颜色是黑色和红色，和扑克的花色相对应

我们首先要将「字」转换成「扑克」。注意到红色字的发音都是二四声，黑色都是一三声，且声调数量为4正好对应上花色总数，同时所有字的笔画数都不超过13。因此，可以将每个字都转换成一张扑克，声调转换成花色，笔画数转换成扑克点数。

前三组是没有〇的，选项得票数的大小关系也满足手牌的大小关系，可以进一步确定是德州扑克。

后续几组都是有〇的，但可以发现选项票数的大小关系一直没有发生变化（是的为了维持这个大小关系，官方后台一直在控票刷假票，控票也是真实萌战的一环）那么可以用手牌的大小关系来反推公共牌中〇所表示的缺失的扑克大小，然后再使用扑克次序（黑桃一黑桃二……红心一红心二……）将扑克转换成字母。

最后，每组所展示的选项顺序也是有意义的。计算其康托展开的排名后可以发现每一组的康托展开排名都是1~9的平方数，使用这个对提取的字母进行排序，得到最后的答案**ANGELFISH**

| **组别** | **选项**               | **公共牌**         | **手牌一** | **手牌二** | **手牌三** | **手牌四** | **手牌五** | **手牌六** | **手牌七** | **缺失的公共牌** | **代表字母** | **大小关系** | **康托展开** | **答案次序** |
|:------:|:--------------------:|:---------------:|:-----------:|:-----------:|:-----------:|:-----------:|:-----------:|:-----------:|:-----------:|:--:|:--:|:--:|:--------:|:--:|
| 青〇恋物语  | 雪乃 结衣 一色             | ♠️8 ♦️T ♦️8 ♣️9 | ♣️J ♣️2 | ♥️9 ♠️6 | ♠️A ♦️6 |         |         |         |         | A          | A        | 123      | 1        | 1        |
| 〇等分新娘  | 三玖 二乃 一花 五月 四葉       | ♣️Q ♠️4 ♠️K ♥️T | ♠️3 ♣️7 | ♦️2 ♣️2 | ♠️A ♠️7 | ♣️4 ♦️4 | ♦️5 ♦️Q |         |         | A          | N        | 12453    | 4        | 2        |
| 孤独摇滚〇  | 妙脆 一里 贝斯 郁代          | ♠️8 ♥️9 ♥️K ♣️K | ♦️7 ♦️T | ♠️A ♣️7 | ♦️4 ♠️Q | ♦️8 ♦️5 |         |         |         | 7          | G        | 2314     | 9        | 3        |
| 闲散解谜〇  | 五肉 喷菇 皮巨 可乐 小狐       | ♥️7 ♣️Q ♣️K ♥️J | ♣️4 ♦️6 | ♠️Q ♠️J | ♥️5 ♦️4 | ♣️5 ♦️5 | ♣️3 ♥️8 |         |         | 5          | E        | 14352    | 16       | 4        |
| 节奏型〇戏  | 玩蛇 中二 太鼓 喵斯 音击       | ♥️5 ♦️9 ♥️9 ♦️6 | ♥️8 ♥️J | ♠️4 ♦️2 | ♦️4 ♣️K | ♠️J ♠️Q | ♠️9 ♠️5 |         |         | Q          | L        | 21345    | 25       | 5        |
| 〇一线城市  | 理塘 广州 北京 深圳 上海       | ♠️A ♦️8 ♥️9 ♦️5 | ♣️J ♥️K | ♣️3 ♠️6 | ♣️5 ♠️8 | ♠️J ♦️6 | ♦️3 ♣️T |         |         | 6          | F        | 23541    | 36       | 6        |
| 虚拟区主〇  | 泠鸢 七海 羽衣 阿萨 绊爱       | ♠️J ♣️7 ♠️4 ♣️5 | ♥️8 ♠️8 | ♠️2 ♣️T | ♣️6 ♠️6 | ♠️7 ♦️J | ♦️8 ♦️T |         |         | 9          | I        | 31245    | 49       | 7        |
| 多边〇几何  | 正方 三角 圆圈 六芒 五星       | ♠️6 ♠️5 ♣️2 ♥️7 | ♦️5 ♠️4 | ♠️3 ♣️7 | ♥️T ♠️J | ♦️4 ♥️6 | ♣️4 ♠️9 |         |         | 6          | S        | 34251    | 64       | 8        |
| 传统〇密码  | 九键 零一 替换 培根 盲文 康托 栅栏 | ♥️6 ♣️9 ♦️J ♣️8 | ♣️2 ♦️K | ♥️K ♠️A | ♦️Q ♦️T | ♥️J ♠️T | ♥️8 ♥️4 | ♠️J ♠️6 | ♦️9 ♥️9 | 8          | H        | 1264537  | 81       | 9        |

## 提示

### 1. 我毫无头绪

注意到题目表述中的「筹码」「all in」以及每个主题和选项的字数，左边主题都是五个字，右边选项都是两个字。
现实中有什么「事物」和这些都是有关系的呢？

### 2. 我应该做什么

将汉字转换成扑克牌。注意到汉字的笔画数都在某个范围内，且汉字的某种属性一共有四种。

### 3. 如何提取答案

注意到许多主题名字都有一个〇，这代表了一张被隐藏的公共牌，你可以通过手牌的大小关系确定这张公共牌的点数，这个点数是唯一的。注意红色的要+13！

### 4. 如何排序答案

每个主题的大小关系可以视作一个康托展开，将其转换为数字后从小到大排序即可。


## 本地附件

- [082ba0b0db34487abe7ea2848ed9d1ee.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/082ba0b0db34487abe7ea2848ed9d1ee.webp)
- [093b456dd18e429cb76c3f079e2eb87d.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/093b456dd18e429cb76c3f079e2eb87d.webp)
- [0ecd9362da364981b118810ab4ec6ce7.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/0ecd9362da364981b118810ab4ec6ce7.webp)
- [157b57236bb04e93b2cdef7b5de650de.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/157b57236bb04e93b2cdef7b5de650de.webp)
- [1d1ba81811e04a01b8db581bad4b0be7.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/1d1ba81811e04a01b8db581bad4b0be7.webp)
- [2231514dbc5b4699944d8841de99b042.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/2231514dbc5b4699944d8841de99b042.webp)
- [28a4b36731754a7fb2921492d2a306aa.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/28a4b36731754a7fb2921492d2a306aa.webp)
- [2b3c09ee19d34544aa3daae650ce109c.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/2b3c09ee19d34544aa3daae650ce109c.webp)
- [2ca5b071bd6345c7bde7a13a8e421003.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/2ca5b071bd6345c7bde7a13a8e421003.webp)
- [356f3d1c379c4c8cad26fe2f7ba4e77d.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/356f3d1c379c4c8cad26fe2f7ba4e77d.webp)
- [3c17bc2c9b5d44f3854838f8243cf8df.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/3c17bc2c9b5d44f3854838f8243cf8df.webp)
- [3e8da04aee804226a2bc7eff0ab604c6.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/3e8da04aee804226a2bc7eff0ab604c6.webp)
- [3f3faf8c963d45bb8e55cb5166507572.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/3f3faf8c963d45bb8e55cb5166507572.webp)
- [4414a72c80ae4b999f6102f8aae951da.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/4414a72c80ae4b999f6102f8aae951da.webp)
- [527685ea63a140c598cae5a9e2d8492b.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/527685ea63a140c598cae5a9e2d8492b.webp)
- [5f86d983b98648d191329e833c02d0db.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/5f86d983b98648d191329e833c02d0db.webp)
- [667b62cc498246bd8a89f981746cdb66.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/667b62cc498246bd8a89f981746cdb66.webp)
- [6a7aff9a958049599a17cca9e5a12072.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/6a7aff9a958049599a17cca9e5a12072.webp)
- [6b12dc5fe18a4296b9eaf6b2103124d5.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/6b12dc5fe18a4296b9eaf6b2103124d5.webp)
- [6eaf665a067d4600a9d0bc8ba713df15.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/6eaf665a067d4600a9d0bc8ba713df15.webp)
- [75193e24401e4e7eae87e09cd4b1025d.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/75193e24401e4e7eae87e09cd4b1025d.webp)
- [7d0a9253d04c4fa39dbb3972048dc5e6.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/7d0a9253d04c4fa39dbb3972048dc5e6.webp)
- [7de9637612ec4314b850870df2228324.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/7de9637612ec4314b850870df2228324.webp)
- [858599c3238a4a09868af62bd08e07ac.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/858599c3238a4a09868af62bd08e07ac.webp)
- [91e6275dab3e4bcfbf7c8cc738cef85b.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/91e6275dab3e4bcfbf7c8cc738cef85b.webp)
- [9264c72768de45829c84bd42e24ae0b8.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/9264c72768de45829c84bd42e24ae0b8.webp)
- [939ed86a2d054fb38c03a3689cfd1cab.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/939ed86a2d054fb38c03a3689cfd1cab.webp)
- [94a2823893e44485932714b623901a73.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/94a2823893e44485932714b623901a73.webp)
- [96648d8da0ff4c9f8fbc50c5582c015c.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/96648d8da0ff4c9f8fbc50c5582c015c.webp)
- [9c65d37fa1b449b786e1324fdc2f6184.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/9c65d37fa1b449b786e1324fdc2f6184.webp)
- [9da1ce2ceb294d39970b7a8e5c017ec3.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/9da1ce2ceb294d39970b7a8e5c017ec3.webp)
- [9f2f2e56b49849af9151e0bac7f8e7ab.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/9f2f2e56b49849af9151e0bac7f8e7ab.webp)
- [a846624642fc4ea19512a2c816bbc91e.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/a846624642fc4ea19512a2c816bbc91e.webp)
- [ac91062b8c6747218cba7f8be1ee6351.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/ac91062b8c6747218cba7f8be1ee6351.webp)
- [af513487f4d54677a3494ffb6ecf30d5.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/af513487f4d54677a3494ffb6ecf30d5.webp)
- [b266778b37ef4ed5b6c826c922164d73.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/b266778b37ef4ed5b6c826c922164d73.webp)
- [b6dc22feea01431aad97a255ee8310c3.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/b6dc22feea01431aad97a255ee8310c3.webp)
- [bc18b3fbde824f53b630096bd0b9a96d.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/bc18b3fbde824f53b630096bd0b9a96d.webp)
- [c4701d64934d4883952e07664abf1a4c.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/c4701d64934d4883952e07664abf1a4c.webp)
- [c51c6f994b5d45baba4046b89d606d73.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/c51c6f994b5d45baba4046b89d606d73.webp)
- [d132701ac10946c4933d095c389d5bc2.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/d132701ac10946c4933d095c389d5bc2.webp)
- [d3fffa6dc9214e4796c5e1ec294ffd10.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/d3fffa6dc9214e4796c5e1ec294ffd10.webp)
- [d43269ffc51149ab8d83cbfe4735f408.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/d43269ffc51149ab8d83cbfe4735f408.webp)
- [d52de0c818fd4551b30af2438fb2834f.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/d52de0c818fd4551b30af2438fb2834f.webp)
- [dc0f167837994154945e0861bf834ac5.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/dc0f167837994154945e0861bf834ac5.webp)
- [df6b6abbed7b4abc9c2ee8752e9c1576.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/df6b6abbed7b4abc9c2ee8752e9c1576.webp)
- [edb58160ecaa490ca997b7cc2d696f36.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/edb58160ecaa490ca997b7cc2d696f36.webp)
- [f3776d33cade48c1983158eac9c0f5cf.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/f3776d33cade48c1983158eac9c0f5cf.webp)
- [f97883cbffb24dbbb51f47281ac3ed4e.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/f97883cbffb24dbbb51f47281ac3ed4e.webp)
- [fa8f53cc10934bd99cd35c5262aa786e.webp](../../../assets/archive.cipherpuzzles.com/ccbc15/images/4/fa8f53cc10934bd99cd35c5262aa786e.webp)

来源：[https://archive.cipherpuzzles.com/ccbc15/problems/4/29.yaml](https://archive.cipherpuzzles.com/ccbc15/problems/4/29.yaml)
