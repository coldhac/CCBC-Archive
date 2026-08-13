---
record_id: "ccbc15:problem:4-31"
event_id: "ccbc15"
editions: ["CCBC 15"]
year: 2024
area: "全球呼叫出题组"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc15/problems/4/31.yaml"
---

# 西提沃克刮刮乐

## 题面

<span style="color: #999999">存档版说明：在CCBC 15进行期间，此页面的状态为全队共享。由于存档版限制，目前解锁状态只能在当前设备上显示。</span>

<!-- <span style="color: red;">说明：由于题目服务故障，本题暂时无法完成。请等待后续服务恢复公告。</span> -->

你来到了吉隆坡。这个接近赤道的美丽城市，气温高得让人难以忍受。此时，这个城市正在举办定向大赛，你收到了一张大赛的刮刮乐卡片，上面写着——

「赶快拿起手机，去探索周围的世界，揭开刮刮卡底下隐藏的秘密吧！」

<div class="infom">
<p>隐私权限使用说明：本页面将请求您的高精确度定位权限。CCBC 承诺，本次获取的权限仅限本题目展示需要，网站不会存储您的位置信息。并在使用完成后从您的浏览器缓存以及网站服务器中删除这些敏感信息。您的这些敏感信息会始终加密保存和传输，并按我们的<a href="https://ccbc15.cipherpuzzles.com/info/privacypolicy" target="_blank">隐私政策</a>受到保护。</p>
<p>若您无法完成定位，请先确保您使用的设备搭载了 GPS 等定位系统。然后尝试关闭页面上所有其他 APP 提供的浮窗和气泡，刷新本页面再试一次。</p>
</div>

<style>
.infom {
    font-size: 12px;
}
</style>

## 交互源码

### vue_template

```html
<template>
    <div>
      <div class="grids">
        <div v-for="grids in gridGroups" class="grids-row">
          <div v-for="color in grids.color" :style="{ backgroundColor: color }">
          </div>
        </div>
      </div>
      <div v-if="geoPosition.loading">
        定位中……
      </div>
      <div v-else-if="geoPosition.timestamp !== 0">
        定位成功！上次定位时间: {{ formatTimestamp(geoPosition.timestamp) }}
      </div>
      <div v-else>
        定位失败 :( 请检查所持设备的定位设置
      </div>
      <div>{{ tempMsg }}</div>
    </div>
</template>

<style>
.grids-row {
    display: flex;
    flex-wrap: wrap;
    width: 1024px;
}
.grids-row > div {
    height: 30px;
    width: 30px;
    border: 1px solid black;
}
</style>
```

### vue_script

```text
const { ref, reactive, inject, onMounted, onBeforeUnmount } = Vue;

export default {
    setup() {
        const gridGroups = ref([
            { color: Array(32).fill("#808080") },
            { color: Array(32).fill("#808080") },
            { color: Array(32).fill("#808080") }
        ]);

        const tempMsg = ref("");

        const geoPosition = reactive({
            loading: true,
            longitude: null,
            latitude: null,
            timestamp: 0,
        });

        const geoPositionErr = {
            code: null,
            message: null
        };

        const backend = inject("backend");
        const formatTimestamp = inject("formatTimestamp");
        const processBackend = async () => {
            const response = await backend("c15-geom", {
                type: "query"
            });
            console.log(response);
            if (response.status === "ok") {
                const colors = response.color;
                gridGroups.value = [
                    { color: colors[0] },
                    { color: colors[1] },
                    { color: colors[2] }
                ];
                if (response.temp_msg) {
                    tempMsg.value = response.temp_msg;
                }
            }
        }
        const processSummit = async () => {
            try {
                const response = await backend("c15-geom", {
                    type: "summit",
                    latitude: geoPosition.latitude,
                    longitude: geoPosition.longitude
                });
                console.log(response);
                if (response.status === "ok") {
                    const colors = response.color;
                    gridGroups.value = [
                        { color: colors[0] },
                        { color: colors[1] },
                        { color: colors[2] }
                    ];
                }
            } catch (error) {
                console.error(error);
                tempMsg.value = "Error: " + error.message;
            }
        }

        let watchId;

        onMounted(() => {
            processBackend();
            watchId = navigator.geolocation.watchPosition((pos) => {
                geoPosition.longitude = pos.coords.longitude;
                geoPosition.latitude = pos.coords.latitude;
                geoPosition.timestamp = pos.timestamp;
                geoPosition.loading = false;
                console.log(geoPosition);
                processSummit();
            }, (err) => {
                geoPositionErr.code = err.code;
                geoPositionErr.message = err.message;
                geoPosition.loading = false;
                console.log(geoPositionErr);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });

        onBeforeUnmount(() => {
            navigator.geolocation.clearWatch(watchId);
        });

        return {
            gridGroups,
            geoPosition,
            formatTimestamp,
            tempMsg
        }
    }
}
```

### backend_c15-geom

```text
// 提交频率限制在每个用户每分钟一次
const LIMIT = 60 * 1000;

// 检查周围范围为 100
const AROUND_RANGE = 100;

const COLORS = [
    ["#FF5245", "#FF4420", "#FF6973", "#FF2065", "#FF7665", "#FF7279", "#FF7768", "#FF6572", "#FF6520", "#FF424C", "#FF5545", "#FF2069", "#FF7320", "#FF7761", "#FF7465", "#FF7220", "#FF7265", "#FF6C61", "#FF7465", "#FF6420", "#FF4752", "#FF4545", "#FF4E20", "#FF6973", "#FF2076", "#FF6567", "#FF6574", "#FF6174", "#FF696F", "#FF6E20", "#FF474F", "#FF2121"],
    ["#4120FF", "#7375FF", "#7267FF", "#6963FF", "#616CFF", "#2070FF", "#726FFF", "#6365FF", "#6475FF", "#7265FF", "#2074FF", "#6861FF", "#7420FF", "#696EFF", "#766FFF", "#6C76FF", "#6573FF", "#2063FF", "#7574FF", "#7469FF", "#6E67FF", "#2061FF", "#6E64FF", "#2072FF", "#6561FF", "#6C69FF", "#676EFF", "#696EFF", "#6720FF", "#626FFF", "#6E65FF", "#7320FF"],
    ["#74FF6F", "#20FF63", "#6FFF72", "#72FF65", "#63FF74", "#20FF64", "#65FF66", "#6FFF72", "#6DFF69", "#74FF69", "#65FF73", "#2CFF20", "#72FF65", "#6CFF69", "#65FF76", "#65FF20", "#70FF61", "#69FF6E", "#2CFF20", "#6FFF72", "#20FF69", "#6DFF70", "#72FF6F", "#76FF65", "#20FF6A", "#6FFF69", "#6EFF74", "#20FF66", "#75FF6E", "#63FF74", "#69FF6F", "#6EFF2E"],
]

// ====================   copy from node-geohash ====================
var BASE32_CODES = "0123456789bcdefghjkmnpqrstuvwxyz";
var BASE32_CODES_DICT = {};
for (var i = 0; i < BASE32_CODES.length; i++) {
    BASE32_CODES_DICT[BASE32_CODES.charAt(i)] = i;
}

var ENCODE_AUTO = 'auto';

var MIN_LAT = -90;
var MAX_LAT = 90;
var MIN_LON = -180;
var MAX_LON = 180;
/**
* Significant Figure Hash Length
*
* This is a quick and dirty lookup to figure out how long our hash
* should be in order to guarantee a certain amount of trailing
* significant figures. This was calculated by determining the error:
* 45/2^(n-1) where n is the number of bits for a latitude or
* longitude. Key is # of desired sig figs, value is minimum length of
* the geohash.
* @type Array
*/
// Desired sig figs:  0  1  2  3  4   5   6   7   8   9  10
var SIGFIG_HASH_LENGTH = [0, 5, 7, 8, 11, 12, 13, 15, 16, 17, 18];
/**
* Encode
*
* Create a Geohash out of a latitude and longitude that is
* `numberOfChars` long.
*
* @param {Number|String} latitude
* @param {Number|String} longitude
* @param {Number} numberOfChars
* @returns {String}
*/
const encodeGeoHash = function (latitude, longitude, numberOfChars) {
    if (numberOfChars === ENCODE_AUTO) {
        if (typeof (latitude) === 'number' || typeof (longitude) === 'number') {
            throw new Error('string notation required for auto precision.');
        }
        var decSigFigsLat = latitude.split('.')[1].length;
        var decSigFigsLong = longitude.split('.')[1].length;
        var numberOfSigFigs = Math.max(decSigFigsLat, decSigFigsLong);
        numberOfChars = SIGFIG_HASH_LENGTH[numberOfSigFigs];
    } else if (numberOfChars === undefined) {
        numberOfChars = 9;
    }

    var chars = [],
        bits = 0,
        bitsTotal = 0,
        hash_value = 0,
        maxLat = MAX_LAT,
        minLat = MIN_LAT,
        maxLon = MAX_LON,
        minLon = MIN_LON,
        mid;
    while (chars.length < numberOfChars) {
        if (bitsTotal % 2 === 0) {
            mid = (maxLon + minLon) / 2;
            if (longitude > mid) {
                hash_value = (hash_value << 1) + 1;
                minLon = mid;
            } else {
                hash_value = (hash_value << 1) + 0;
                maxLon = mid;
            }
        } else {
            mid = (maxLat + minLat) / 2;
            if (latitude > mid) {
                hash_value = (hash_value << 1) + 1;
                minLat = mid;
            } else {
                hash_value = (hash_value << 1) + 0;
                maxLat = mid;
            }
        }

        bits++;
        bitsTotal++;
        if (bits === 5) {
            var code = BASE32_CODES[hash_value];
            chars.push(code);
            bits = 0;
            hash_value = 0;
        }
    }
    return chars.join('');
};
// ==================== end ====================


// ==================== openstreetmap ====================
async function api(query) {
    let formData = { 'data': query };
    let responseStr = await ctx.httpPostForm("https://overpass-api.de/api/interpreter", formData, {});
    // let responseStr = await ctx.httpPostForm("https://overpass.private.coffee/api/interpreter", formData, {});
    return responseStr;
}

async function apiQuery(lat, lon) {
    const query = `[out:json];
    (
        nwr["natural"~"coastline|water|wetland|wood|grassland|heath|scrub|tree|tree_row"](around:${AROUND_RANGE}, ${lat}, ${lon});
        nwr["landuse"~"reservoir|basin|salt_pond|allotments|farmland|farmyard|flowerbed|forest|greenhouse_horticulture|meadow|orchard|plant_nursery|vineyard|grass"](around:${AROUND_RANGE}, ${lat}, ${lon});
        is_in(${lat}, ${lon});
    );
    out tags;`;
    let water = false;
    let forest = false;
    // return { water, forest };
    let apiQueryResult = await api(query);
    const data = JSON.parse(apiQueryResult);
    for (let i = data.elements.length - 1; i >= 0; i--) {
        const element = data.elements[i];
        if (element.tags) {
            if (element.tags.natural && ['water', 'coastline', 'wetland', 'bay', 'strait'].includes(element.tags.natural)) {
                water = true;
            }
            if (element.tags.landuse && ['reservoir', 'basin', 'salt_pond'].includes(element.tags.landuse)) {
                water = true;
            }
            if (element.tags.natural && ['wood', 'grassland', 'heath', 'scrub', 'tree', 'tree_row'].includes(element.tags.natural)) {
                forest = true;
            }
            if (element.tags.landuse && ['allotments', 'farmland', 'farmyard', 'flowerbed', 'forest', 'greenhouse_horticulture', 'meadow', 'orchard', 'plant_nursery', 'vineyard', 'grass'].includes(element.tags.landuse)) {
                forest = true;
            }
        }
    }
    return { water, forest };
}
// ==================== end ====================

// 将字符串转换为数字并计算哈希值
function hash2int(str, mod) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 32 + BASE32_CODES_DICT[str[i]]) % mod;
    }
    return hash * 107 % mod % COLORS[0].length;
}

function getUser(ctx) {
    const varName = `GeoPuzzle_Team${ctx.gid}`;
    let user = ctx.getStorage(varName);
    if (user) {
        user = JSON.parse(user);
    }
    if (!user) {
        user = {
            data: [
                Array(32).fill(false),
                Array(32).fill(false),
                Array(32).fill(false)
            ],
            timestamp: 0
        };
        ctx.setStorage(varName, JSON.stringify(user));
    }
    return user;
}

function setUser(ctx, user) {
    const varName = `GeoPuzzle_Team${ctx.gid}`;
    ctx.setStorage(varName, JSON.stringify(user));
}

function addLog(data) {
    let logs = ctx.getStorage("GeoPuzzleLogs");
    if (logs) {
        logs = JSON.parse(logs);
    } else {
        logs = [];
    }
    logs.push(data);
    ctx.setStorage("GeoPuzzleLogs", JSON.stringify(logs));
}

function query(ctx) {
    const user = getUser(ctx);
    // TRUE 的话取对应的颜色，FALSE 的话取灰色 #808080
    const colors = user.data.map(function (row, i) {
        return row.map(function (cell, j) {
            return cell ? COLORS[i][j] : "#808080";
        });
    });
    const count = user.data.reduce(function (acc, row) {
        return acc + row.reduce(function (acc, cell) {
            return acc + (cell ? 1 : 0);
        }, 0);
      }, 0)
    if (count == 32 * 3) {
        return {
            status: "ok",
            color: colors,
            temp_msg: "恭喜你刮开了所有的格子！这里是一张兑奖券，你可以拿着这张兑奖券通过站内信向 Nano 领取奖品！（仅限比赛时有效）",
        }
    }
    return {
        status: "ok",
        color: colors
    }
}

async function summit(ctx, request) {
    let user = getUser(ctx);
    // 检查提交频率
    const timestamp = Date.now();
    if (timestamp - user.timestamp < LIMIT) {
        const colors = user.data.map(function (row, i) {
            return row.map(function (cell, j) {
                return cell ? COLORS[i][j] : "#808080";
            });
        });
        return {
            status: "ok",
            color: colors
        }
    }
    user.timestamp = timestamp;
    // 计算提交的 GeoHash
    const latitude = request.latitude;
    const longitude = request.longitude;
    const geoHash = encodeGeoHash(latitude, longitude, 7); // 范围 100m
    let red = hash2int(geoHash, 10007);
    let blue = hash2int(geoHash, 10009);
    let green = hash2int(geoHash, 10037);
    // red: 默认都为 true
    user.data[0][red] = true;
    // 在请求 api 之前先更新用户数据
    setUser(ctx, user);
    const apiQueryResult = await apiQuery(latitude, longitude);
    // blue: 检查是否在水周围或者在水中
    if (apiQueryResult.water)   {
        user.data[1][blue] = true;
    } else { blue = -1; }
    // green: 检查是否在森林周围或者在森林中
    if (apiQueryResult.forest) {
        user.data[2][green] = true;
    } else { green = -1; }
    // 再次更新用户数据
    setUser(ctx, user);
    // 把 geoHash, red, blue, green 添加进日志
    addLog([(new Date()).toISOString(), ctx.gid, ctx.uid, geoHash, red, blue, green]);
    const colors = user.data.map(function (row, i) {
        return row.map(function (cell, j) {
            return cell ? COLORS[i][j] : "#808080";
        });
    });
    return {
        status: "ok",
        color: colors,
        // geoHash, // DEBUG
        // red, // DEBUG
        // blue, // DEBUG
        // green, // DEBUG
    }
}


function getLog(ctx, request) {
    if (ctx.uid !== 164) {
        return {
            status: "error",
            msg: "对不起，你没有权限，因为你不是 Nano（察觉"
        }
    }
    let logs = ctx.getStorage("GeoPuzzleLogs");
    if (logs) {
        logs = JSON.parse(logs);
    } else {
        logs = [];
    }
    // 筛选出第二列为 request.id 的日志，查询队伍日志
    return {
        status: "ok",
        logs: logs.filter(function (log) {
            return log[1] === request.id;
        })
    };
}

function getAllLog(ctx) {
    if (ctx.uid !== 164) {
        return {
            status: "error",
            msg: "对不起，你没有权限，因为你不是 Nano（察觉"  
        }
    }
    let logs = ctx.getStorage("GeoPuzzleLogs");
    if (logs) {
        logs = JSON.parse(logs);
    } else {
        logs = [];
    }
    return {
        status: "ok",
        logs
    }
}

function resetAllLog(ctx) {
    if (ctx.uid !== 164) {
        return {
            status: "error",
            msg: "对不起，你没有权限，因为你不是 Nano（察觉"
        }
    }
    ctx.setStorage("GeoPuzzleLogs", "[]");
    return {
        status: "ok",
        msg: "日志已清空"
    }
}

async function debug(ctx, request) {
    if (ctx.uid !== 164) {
          return {
            status: "error",
            msg: "对不起，你没有权限，因为你不是 Nano（察觉"
        }
    }
    const lat = 30.27605, lon = 120.16817;
    const query = `[out:json];
    (
        nwr["natural"~"coastline|water|wetland|wood|grassland|heath|scrub|tree|tree_row"](around:${AROUND_RANGE}, ${lat}, ${lon});
        nwr["landuse"~"reservoir|basin|salt_pond|allotments|farmland|farmyard|flowerbed|forest|greenhouse_horticulture|meadow|orchard|plant_nursery|vineyard|grass"](around:${AROUND_RANGE}, ${lat}, ${lon});
        is_in(${lat}, ${lon});
    );
    out tags;`;
    return {
        status: "ok",
        data: await api(query)
    }
}

async function main(ctx, request) {
    if (!request.type) {
        return {
            status: "error",
            msg: "请求格式不正确：type 字段为空"
        }
    }
    if (request.type === "query") {
        return query(ctx);
    } else if (request.type === "summit") {
        return await summit(ctx, request);
    } else if (request.type === "getLog") {
        return getLog(ctx, request);
    } else if (request.type === "getAllLog") {
        return getAllLog(ctx);
    } else if (request.type === "resetAllLog") {
        return resetAllLog(ctx);
    } else if (request.type === "debug") {
        return await debug(ctx, request);
    } else {
        return {
            status: "error",
            msg: `请求格式不正确：未知的 type 值 ${request.type}`
        }
    }
}


// ======= 以下是 JSON 解析与调用脚本，一般不需要修改 ========
async function _jsonProcessHelper(ctx) {
    let request = JSON.parse(ctx.request);
    let resBody = await main(ctx, request);
    let resString = JSON.stringify(resBody);
    ctx.response(resString);
}

await _jsonProcessHelper(ctx);
```


## 解题后内容

你要离开之前，获得了一份旅游指南，你注意到其中一句话被圈了出来：“每个国民都应当有责任感。”

## 答案

`OSTEOTOMY`

## 解析

这是一个黑箱+线下题。玩家需要用过线下移动位置来解锁像素，并获得描述答案的一句话。
本题使用到的技术：Geohash（精度为7）和OpenStreetMap

- 红色像素解锁规则：访问了一个未曾访问的geogrid

- 蓝色像素解锁规则：访问了一个未曾访问的geogrid且此时定位点在水域附近（包括江河湖海、湿地、水库等）

- 绿色像素解锁规则：访问了一个未曾访问的geogrid且此时定位点在植被附近（包括森林、草地、公园等）

以及就是信息是如何被隐藏到像素中的呢？观察像素的色码可以发现，出了某一个RGB颜色通道是FF，其他通道的值范围都在32~127范围内，也就是ASCII的可打印字体范围。所以，只需要将其通过ASCII转换成字符即可。

红色线索隐藏的信息：红、蓝、绿三种像素的解锁规则。

RED is everywhere BLUE is water related GREEN is vegetation GO!!

蓝、绿色线索隐藏的信息：描述答案的短句。

A surgical procedure that involves cutting and realigning bones to correct deformities, relieve pain, or improve joint function.

答案是**OSTEOTOMY**

## 提示

### 1. 我毫无头绪

遵循题目的建议，拿起你的手机，登录 CCBC，打开本题，出去走走吧！

### 2. 我点亮许多色块了，接下来该做什么

获取色块的 RGB 色码，每个色块除了数值是满的某个颜色通道之外，剩下两个通道的色码可以转换成字符。

### 3. 我获得了第一行像素所隐藏的的信息，但理解不了

第一行像素所隐藏的信息的含义是：每到达一个新的地方可以解锁新的像素；同时，无需满足其他条件即可解锁红色像素，靠近水可以解锁蓝色像素，靠近植被可以解锁绿色像素。

### 4. 我实在没有条件做这道题，请告诉我最终得到的信息吧

好的，第一行解出的信息为：“RED is everywhere BLUE is water related GREEN is vegetation GO!!”；第二行解出的信息为：“A surgical procedure that involves cutting and realigning bones ”；第三行解出的信息为：“to correct deformities, relieve pain, or improve joint function.”


来源：[https://archive.cipherpuzzles.com/ccbc15/problems/4/31.yaml](https://archive.cipherpuzzles.com/ccbc15/problems/4/31.yaml)
