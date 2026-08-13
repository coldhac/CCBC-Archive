---
record_id: "ccbc15:problem:5-43"
event_id: "ccbc15"
editions: ["CCBC 15"]
year: 2024
area: "爆吧大战"
kind: "puzzle"
source_url: "https://archive.cipherpuzzles.com/ccbc15/problems/5/43.yaml"
---

# 幻境

## 题面

<span style="color:red">更新说明：修复了使用wait n之后，再使用一个【r?】开头的命令时的程序异常退出。</span><br><br>

这次可终于把时空的空给补上了。

<a href="../../../assets/static.cipherpuzzles.com/static/images/e7fb2e94cc9642f7afd6145a3c3e10eb.exe" target="_blank" download="adventure_game.exe">点击下载离线版游戏（需要在 Windows 环境下运行）</a>

<span style="color:red">更新说明：在线版的行为预期应该是与离线版保持一致，但如果在线版的行为与离线版有一定出入，请及时通过站内信报告给管理员</span><br><br>

## 交互源码

### vue_template

```html
<template>
    <div class="gameplay-wrapper">
        <div class="gameplay-scroll">
            <ul class="gameplay-content">
                <li v-for="item in contents" :class="item.type" v-html="item.content"></li>
            </ul>
        </div>
        <div class="instruction-field">
            <form class="instruction-form" @submit.prevent="checkReply">
                <div class="el-input el-input-group el-input-group--append">
                    <div class="el-input__wrapper" tabindex="-1">
                        <input type="text" class="el-input__inner instruction-text" placeholder="输入你的指令" required
                            v-model="userInput">
                    </div>
                    <div class="el-input-group__append">
                        <button class="el-button instruction-submit" type="submit">输入</button>
                    </div>
                </div>
            </form>
        </div>
        <div style="height: 170px"></div>
    </div>
</template>

<style>
    .gameplay-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .gameplay-scroll {
        background-color: aliceblue;
        height: 62vh;
        width: 65vw;
        overflow: auto;
    }

    .gameplay-content li {
        width: 95%;
        list-style-type: none;
        margin: 10px auto;
    }

    .instruction-field {
        margin-top: 10px;
        width: 65vw;
    }

    .system-response {
        color: black;
    }

    .game-status {
        color: black;
        font-weight: bold;
    }

    .user-response {
        color: gray;
        font-style: italic;
    }
</style>
```

### vue_script

```text
const { ref, inject, onMounted, nextTick } = Vue;

export default {
    setup() {
        const userInput = ref("");
        const contents = ref([]);

        const backend = inject("backend");

        let isProcessing = false;

        const checkReply = async () => {
            if (isProcessing) return;
            isProcessing = true;

            try {
                let inputValue = userInput.value;
                userInput.value = "";
                contents.value.push({
                    type: "user-response",
                    content: `> ${inputValue}`
                });
                await processBackend(inputValue);
            } finally {
                isProcessing = false;
            }
        }

        const processBackend = async (command) => {
            let data = await backend("c15-dreamland", {
                command
            });

            if (data.reply) {
                for (let i = 0; i < data.reply.length; i++) {
                    contents.value.push({
                        type: "system-response",
                        content: data.reply[i]
                    });
                }
            }
            for (let i = 0; i < data.current.length; i++) {
                contents.value.push({
                    type: "game-status",
                    content: data.current[i]
                });
            }

            await scrollToBottom();
        }

        const processInit = async (command) => {
            let data = await backend("c15-dreamland", {
                'type': 'init',
            });

            if (data.reply) {
                for (let i = 0; i < data.reply.length; i++) {
                    contents.value.push({
                        type: "system-response",
                        content: data.reply[i]
                    });
                }
            }
            for (let i = 0; i < data.current.length; i++) {
                contents.value.push({
                    type: "game-status",
                    content: data.current[i]
                });
            }

            await scrollToBottom();
        }

        const scrollToBottom = async () => {
            await nextTick();
            let container = document.querySelector(".gameplay-scroll");
            container.scrollTop = container.scrollHeight;
        }

        onMounted(() => {
            processInit();
        });

        return {
            userInput,
            contents,
            checkReply,
            processInit
        }
    }
}
```

### backend_c15-dreamland

```text
const roomBriefTable = [
    ["", "", "", "", "", "", ""],
    ["",
        "跳下这个深坑 (the pit) 时，你感觉到一阵刺痛 (a tingling)。",
        "地上好像有什么……",
        "地上好像有什么……",
        "",
        "这个房间有一门很明显的绿色加农炮 (cannon)，炮口朝西。你很好奇！",
        ""],
    ["",
        "",
        "",
        "墙上好像有什么……",
        "",
        "这个房间有个深坑 (pit)。",
        ""],
    ["",
        "",
        "",
        "",
        "有面墙好像不太对劲……",
        "这个房间的地面渗出强烈的白光。你被照得睁不开眼。",
        ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
];

const roomDetailTable = [
    ["", "", "", "", "", "", ""],
    ["",
        "一旦跌入她脚下的土地 (the ground beneath her feet)，你是否觉得无可挽回 (irreversible)？",
        "你发现这个房间东北角的地面上画着一个巨大 1/4 圆，圆心就在房间的东北角。",
        "你发现这个房间西北角的地面上画着一个巨大 1/4 圆，圆心就在房间的西北角。",
        "",
        "你发现这个房间中有一门绿色的加农炮 (cannon)，这门加农炮朝向西方。由于后坐力，东侧的墙已经有了裂痕。",
        ""],
    ["",
        "",
        "",
        "你发现这个房间的墙上挂着一株大喷菇的字迹：\n    「时于一切的东南角开始，空在此处的东南角结束。」",
        "",
        "这个房间有个深坑 (pit)。你觉得跳下去 (jump into) 绝对是个坏主意。",
        ""],
    ["",
        "",
        "",
        "",
        "你发现这个房间东侧的墙壁是双层墙，墙上还有一个实心的六边形记号。这个六边形记号有一组水平的对边。",
        "你惊讶地发现自己变绿了。",
        ""],
    ["",
        "",
        "",
        "",
        "",
        "这里是你起始的房间。这个房间北侧的墙似乎是后来砌的，本不属于这个房间。",
        ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
];

const pieceTable = [
    "",
    "红色的拼图，上面有三个正方形房间的鸟瞰图：\n  第一个房间倾斜了 45°，而且缺失了东北方、西北方的两面墙；\n  第二个房间缺失了东方的一面墙，而且其中有一个拼图；\n  第三个房间缺失了东方、北方的两面墙，而且其中有一个拼图。",
    "橙色的拼图，上面有三个正方形房间的鸟瞰图：\n  第一个房间倾斜了 45°，而且缺失了东南方、西南方的两面墙；\n  第二个房间的四面墙都完好；\n  第三个房间倾斜了 45°，而且缺失了西南方、西北方的两面墙。",
    "黄色的拼图，上面有三个正方形房间的鸟瞰图：\n  第一个房间缺失了南方的一面墙；\n  第二个房间的四面墙都完好；\n  第三个房间倾斜了 45°，缺失了东北方、西北方的两面墙，而且其中有一个拼图。",
    "青色的拼图，上面有三个正方形房间的鸟瞰图：\n  第一个房间缺失了东方、南方的两面墙；\n  第二个房间倾斜了 45°，而且缺失了西南方、西北方的两面墙；\n  第三个房间的四面墙都完好，而且其中有一个拼图。",
    "蓝色的拼图，上面有三个正方形房间的鸟瞰图：\n  第一个房间的四面墙都完好；\n  第二个房间倾斜了 45°，而且缺失了东北方、西北方的两面墙；\n  第三个房间倾斜了 45°，而且缺失了东北方、西北方的两面墙。",
];

const northWalls = [
    [1, 1], [1, 2], [1, 3], [1, 4], [1, 5],
    [2, 1], [2, 2], [2, 3], [2, 5],
    [3, 1],
    [4, 2], [4, 4], [4, 5],
    [5, 3], [5, 5],
];

const southWalls = [
    [1, 1], [1, 2], [1, 3], [1, 5],
    [2, 1],
    [3, 2], [3, 4], [3, 5],
    [4, 3], [4, 5],
    [5, 4],
];

const westWalls = [
    [1, 1], [1, 2],
    [2, 1], [2, 3],
    [3, 2], [3, 4], [3, 5],
    [4, 3],
    [5, 4], [5, 5],
];

const eastWalls = [
    [1, 1], [1, 5],
    [2, 2], [2, 5],
    [3, 1], [3, 3], [3, 4], [3, 5],
    [4, 2], [4, 5],
    [5, 3], [5, 4],
];

class Coord {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    equals(other) {
        return this.row === other.row && this.col === other.col;
    }
}

class Player {
    constructor() {
        this.coord = new Coord(4, 5);
        this.isTakingKey1 = false;
        this.isTakingKey2 = false;
        this.piecesTaking = [0, 0, 0, 0, 0, 0];
    }
}
Player.lastTimeGreen = 0;
Player.isTakingGreenKey = false;

class Room {
    constructor() {
        this.coord = null;
        this.brief = "";
        this.detail = "";
        this.wallNorth = false;
        this.wallSouth = false;
        this.wallWest = false;
        this.wallEast = false;
        this.pieceId = null;
        this.doorWest = false;
        this.doorEast = false;
        this.doorNorth = false;
        this.doorSouth = false;
    }
}

class State {
    constructor() {
        this.rooms = this.initRooms();
        this.key1Coord = new Coord(5, 4);
        this.key2Coord = new Coord(1, 5);
        this.clock = 0;
        this.player = new Player();
    }

    initRooms() {
        const rooms = Array.from({ length: 7 }, function () {
            return Array.from({ length: 7 }, function () {
                return new Room();
            });
        });

        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 5; j++) {
                const room = rooms[i][j];
                room.coord = new Coord(i, j);
                room.brief = roomBriefTable[i][j];
                room.detail = roomDetailTable[i][j];
                room.wallNorth = room.wallSouth = room.wallWest = room.wallEast = false;
            }
        }

        eastWalls.forEach(function (position) {
            rooms[position[0]][position[1]].wallEast = true;
        });

        westWalls.forEach(function (position) {
            rooms[position[0]][position[1]].wallWest = true;
        });

        southWalls.forEach(function (position) {
            rooms[position[0]][position[1]].wallSouth = true;
        });

        northWalls.forEach(function (position) {
            rooms[position[0]][position[1]].wallNorth = true;
        });

        rooms[4][3].pieceId = 1;
        rooms[3][2].pieceId = 2;
        rooms[1][2].pieceId = 3;
        rooms[2][1].pieceId = 4;
        rooms[3][4].pieceId = 5;

        rooms[4][4].doorWest = true; rooms[4][3].doorEast = true;
        rooms[3][3].doorWest = true; rooms[3][2].doorEast = true;
        rooms[2][2].doorWest = true; rooms[2][1].doorEast = true;
        // rooms[3][2].doorNorth = true; rooms[2][2].doorSouth = true; // it's green

        return rooms;
    }

    roomAt(coord) {
        return this.rooms[coord.row][coord.col];
    }

    currentRoom() {
        return this.roomAt(this.player.coord);
    }

    possibleMoves(coord) {
        const room = this.rooms[coord.row][coord.col];
        const dirs = [];
        let res = "";

        if (!room.wallEast && !room.doorEast) dirs.push("东");
        if (!room.wallWest && !room.doorWest) dirs.push("西");
        if (!room.wallSouth && !room.doorSouth) {
            if (coord.equals(new Coord(2, 2))) {
                if (State.greenDoorOpen) dirs.push("南");
            } else {
                dirs.push("南");
            }
        }
        if (!room.wallNorth && !room.doorNorth) {
            if (coord.equals(new Coord(3, 2))) {
                if (State.greenDoorOpen) dirs.push("北");
            } else {
                dirs.push("北");
            }
        }
        if (dirs.length === 0) {
            res += "这里是死路。";
        } else {
            res += "你可以向" + dirs.join("、") + "方向走。";
        }
        return res;
    }

    doorsInfo(coord) {
        const doors = [];
        let msg = "";
        const room = this.rooms[coord.row][coord.col];

        if (room.doorEast) doors.push("东方");
        if (room.doorWest) doors.push("西方");
        if (room.doorSouth) doors.push("南方");
        if (room.doorNorth) doors.push("北方");

        if (doors.length > 0) {
            msg += "这个房间的" + doors.join("、") + (doors.length > 1 ? "各" : "") + "有一扇上锁的门。";
        }

        if (coord.equals(new Coord(2, 2)) && !State.greenDoorOpen) {
            msg += "这个房间的南方有一扇上锁的绿色的门。";
        } else if (coord.equals(new Coord(3, 2)) && !State.greenDoorOpen) {
            msg += "这个房间的北方有一扇上锁的绿色的门。";
        }

        if (msg.length > 0) {
            msg += '\n';
        }

        return msg;
    }

    roomBrief(coord) {
        const room = this.rooms[coord.row][coord.col];
        let brief = room.brief;

        if (brief.length === 0) {
            brief = "这是一个普通的房间。";
        }

        return brief + this.doorsInfo(coord) + this.possibleMoves(coord);
    }

    roomDetail(coord) {
        const room = this.rooms[coord.row][coord.col];
        let detail = room.detail;

        if (room.pieceId > 0) {
            detail += "这个房间有一个拼图 (piece)。";
        }

        const keyCount = (this.key1Coord.equals(coord) ? 1 : 0) + (this.key2Coord.equals(coord) ? 1 : 0);
        if (keyCount > 0) {
            if (!this.player.coord.equals(new Coord(1, 5))) {
                detail += "这个房间有" + (keyCount === 1 ? "一" : "两") + "把钥匙 (key)。";
            }
        }

        if (State.greenKeyCoord.equals(coord)) {
            detail += "这个房间有一把绿色钥匙 (green_key)。";
        }

        return detail + this.doorsInfo(coord) + this.possibleMoves(coord);
    }

    stringify() {
        this.roomsInfo = Array.from({ length: 5 }, function () {
            return Array.from({ length: 5 }, function () {
                return {};
            });
        });
        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 5; j++) {
                let room = this.rooms[i][j];
                this.roomsInfo[i-1][j-1].wN = room.wallNorth
                this.roomsInfo[i-1][j-1].wS = room.wallSouth
                this.roomsInfo[i-1][j-1].wW = room.wallWest
                this.roomsInfo[i-1][j-1].wE = room.wallEast
                this.roomsInfo[i-1][j-1].pId = room.pieceId
                this.roomsInfo[i-1][j-1].dW = room.doorWest
                this.roomsInfo[i-1][j-1].dE = room.doorEast
                this.roomsInfo[i-1][j-1].dN = room.doorNorth
                this.roomsInfo[i-1][j-1].dS = room.doorSouth
            }
        }
        return JSON.stringify(this, function (key, value) {
            if (key === 'rooms') {
                return undefined;
            }
            return value;
        });
    }

    static reviver(key, value) {
        if (key === '') {
            let state = new State();
            state.key1Coord = new Coord(value.key1Coord.row, value.key1Coord.col);
            state.key2Coord = new Coord(value.key2Coord.row, value.key2Coord.col);
            state.clock = value.clock;
            state.player = new Player();
            state.player.coord = new Coord(value.player.coord.row, value.player.coord.col);
            state.player.isTakingKey1 = value.player.isTakingKey1;
            state.player.isTakingKey2 = value.player.isTakingKey2;
            state.player.piecesTaking = value.player.piecesTaking;
            for (let i = 1; i <= 5; i++) {
                for (let j = 1; j <= 5; j++) {
                    let room = state.rooms[i][j];
                    room.wallNorth = value.roomsInfo[i-1][j-1].wN;
                    room.wallSouth = value.roomsInfo[i-1][j-1].wS;
                    room.wallWest = value.roomsInfo[i-1][j-1].wW;
                    room.wallEast = value.roomsInfo[i-1][j-1].wE;
                    room.pieceId = value.roomsInfo[i-1][j-1].pId;
                    room.doorWest = value.roomsInfo[i-1][j-1].dW;
                    room.doorEast = value.roomsInfo[i-1][j-1].dE;
                    room.doorNorth = value.roomsInfo[i-1][j-1].dN;
                    room.doorSouth = value.roomsInfo[i-1][j-1].dS;
                }
            }
            return state;
        }
        return value;
    }

    static parse(jsonString) {
        return JSON.parse(jsonString, State.reviver);
    }
}
State.greenKeyCoord = new Coord(1, 1);
State.greenDoorOpen = false;
State.greenClock = 0;

class Info {
    constructor() {
        this.isTracingFatal = false;
        this.needIntroduce = true;
        this.isTracingEvent = true;
        this.moveWest = false;
        this.moveEast = false;
        this.moveNorth = false;
        this.moveSouth = false;
        this.moveWait = false;
        this.isDead = false;
    }

    stringify() {
        this.Player_lastTimeGreen = Player.lastTimeGreen;
        this.Player_isTakingGreenKey = Player.isTakingGreenKey;
        this.State_greenKeyCoord = State.greenKeyCoord;
        this.State_greenDoorOpen = State.greenDoorOpen;
        this.State_greenClock = State.greenClock;
        return JSON.stringify(this);
    }

    static reviver(key, value) {
        if (key === '') {
            let info = new Info();
            info.isTracingFatal = value.isTracingFatal;
            info.needIntroduce = value.needIntroduce;
            info.isTracingEvent = value.isTracingEvent;
            info.moveWest = value.moveWest;
            info.moveEast = value.moveEast;
            info.moveNorth = value.moveNorth;
            info.moveSouth = value.moveSouth;
            info.moveWait = value.moveWait;
            info.isDead = value.isDead;
            Player.lastTimeGreen = value.Player_lastTimeGreen;
            Player.isTakingGreenKey = value.Player_isTakingGreenKey;
            State.greenKeyCoord = new Coord(value.State_greenKeyCoord.row, value.State_greenKeyCoord.col);
            State.greenDoorOpen = value.State_greenDoorOpen;
            State.greenClock = value.State_greenClock;
            return info;
        }
        return value;
    }

    static parse(jsonString) {
        return JSON.parse(jsonString, Info.reviver);
    }
}


function currentMsg(now, info) {
    let output = [];

    if (now.player.coord.equals(new Coord(3, 5))) {
        Player.lastTimeGreen = now.clock;
    }

    if (info.isDead) {
        output.push("你死了。使用 \"rewind\" 可以倒流时间。");
    }
    if (!info.isDead && info.isTracingFatal) {
        if (State.greenClock % 3 === 1) {
            if (info.moveWait && (now.player.coord.equals(new Coord(1, 2)) || now.player.coord.equals(new Coord(1, 3)))) {
                info.isDead = true;
            } else if (info.moveEast && (now.player.coord.equals(new Coord(1, 3)) || now.player.coord.equals(new Coord(1, 4)))) {
                info.isDead = true;
            } else if (info.moveWest && now.player.coord.equals(new Coord(1, 2))) {
                info.isDead = true;
            } else if (info.moveSouth && now.player.coord.equals(new Coord(2, 4))) {
                info.isDead = true;
            }
        } else if (State.greenClock % 3 === 2) {
            if (info.moveWait && (now.player.coord.equals(new Coord(1, 3)) || now.player.coord.equals(new Coord(1, 4)))) {
                info.isDead = true;
            } else if (info.moveEast && (now.player.coord.equals(new Coord(1, 3)) || now.player.coord.equals(new Coord(1, 4)) || now.player.coord.equals(new Coord(1, 5)))) {
                info.isDead = true;
            } else if (info.moveWest && now.player.coord.equals(new Coord(1, 3))) {
                info.isDead = true;
            }
        } else if (State.greenClock % 3 === 0) {
            if (info.moveWait && (now.player.coord.equals(new Coord(1, 2)) || now.player.coord.equals(new Coord(1, 4)))) {
                info.isDead = true;
            } else if (info.moveEast && (now.player.coord.equals(new Coord(1, 3)) || now.player.coord.equals(new Coord(1, 4)) || now.player.coord.equals(new Coord(1, 5)))) {
                info.isDead = true;
            } else if (info.moveWest && now.player.coord.equals(new Coord(1, 4))) {
                info.isDead = true;
            } else if (info.moveNorth && now.player.coord.equals(new Coord(1, 4))) {
                info.isDead = true;
            }
        }
        if (info.isDead) {
            output.push("你被一枚向西飞行的炮弹击中。一瞬间，时间像是暂停 (pause) 了一刻。你死了。");
            output.push("使用 \"rewind\" 可以倒流时间。");
            State.greenClock += 1;
        }
        info.isTracingFatal = false;
    }

    if (!info.isDead && info.needIntroduce) {
        output.push(now.roomBrief(now.player.coord));
        info.needIntroduce = false;
    }

    if (!info.isDead && info.isTracingEvent) {
        if (now.clock >= 5 && !(now.rooms[2][4].wallSouth && now.rooms[3][4].wallNorth)) {
            if (info.moveWait) {
                output.push("在等待的这段时间中，");
            }
            if (now.player.coord.equals(new Coord(2, 4))) {
                output.push("你看到这个房间南边的墙壁重重落在地面上，传来一声巨大的闷响。");
            } else if (now.player.coord.equals(new Coord(3, 4))) {
                output.push("你看到这个房间北边的墙壁重重落在地面上，传来一声巨大的闷响。");
            } else if (now.player.coord.equals(new Coord(2, 3)) || now.player.coord.equals(new Coord(3, 3)) || now.player.coord.equals(new Coord(2, 5)) || now.player.coord.equals(new Coord(3, 5))) {
                output.push("你听到近处的某处传来一声巨大的闷响，像是什么非常厚而沉的东西重重落在地面上的声音。");
            } else {
                output.push("你听到远处的某处传来一声巨大的闷响，似乎是什么非常沉的东西重重落在地面上的声音。");
            }
            now.rooms[2][4].wallSouth = true;
            now.rooms[3][4].wallNorth = true;
        }
        info.isTracingEvent = false;
    }
    return output;
}

function main(ctx, request) {
    if (request.type == "init") {
        let now = new State();
        let info = new Info();
        let current = currentMsg(now, info);
        ctx.setStatus("dreamlandState", now.stringify());
        ctx.setStatus("dreamlandStateHistory", JSON.stringify([]));
        ctx.setStatus("dreamlandInfo", info.stringify());
        return {
            'status': 'ok',
            'current': current
        };
    }

    let now = ctx.getStatus("dreamlandState")
    if (!now) {
        now = new State();
    } else {
        now = State.parse(now);
    }

    let history = ctx.getStatus("dreamlandStateHistory");
    if (!history) {
        history = [];
    } else {
        history = JSON.parse(history);
        // 对每个元素进行一次 State.parse
        history = history.map(State.parse);
    }

    let info = ctx.getStatus("dreamlandInfo");
    if (!info) {
        info = new Info();
    } else {
        info = Info.parse(info);
    }

    let command = request.command.split(' ');
    if (command.length == 0) {
        return {
            'status': 'ok',
            'current': currentMsg(now, info)
        };
    }
    let action = command[0];

    if (action === "") {
        return {
            'status': 'ok',
            'current': currentMsg(now, info)
        };
    }

    if (info.isDead && action !== "rewind" && action !== "rw" && action !== "pause") {
        return {
            'status': 'ok',
            'current': currentMsg(now, info)
        };
    }

    const lookActions = new Set(["look", "l", "examine", "x", "search", "check", "inspect"]);
    const moveActions = new Set(["north", "n", "south", "s", "west", "w", "east", "e", "go", "move", "walk", "run"]);
    const directions = new Set(["north", "n", "south", "s", "west", "w", "east", "e"]);
    const getActions = new Set(["get", "take", "pick", "grab", "obtain", "acquire"]);
    const dropActions = new Set(["drop", "discard", "throw"]);
    const useActions = new Set(["use", "open", "unlock"]);
    const invActions = new Set(["inventory", "inv", "i", "bag", "backpack", "items", "stuff"]);

    let output = [];

    function run() {
        if (action === "help") {
            output.push("你可以使用这些指令：");
            output.push("  查看：look, examine, search, check, inspect");
            output.push("  移动：north, south, west, east, go, move");
            output.push("  拿取：get, take, grab, obtain, acquire");
            output.push("  放下：drop, discard, throw");
            output.push("  使用：use");
            output.push("  背包：inventory, backpack, items");
            output.push("  等待：wait");
            output.push("……以及，一些可能未列出的其它指令 ;)");
        } else if (lookActions.has(action)) {
            if (command.length === 1) {
                output.push(now.roomDetail(now.player.coord));
            } else if (command.length === 2) {
                let target = command[1];
                if (target === "room") {
                    output.push(now.roomDetail(now.player.coord));
                } else if (["puzzle_piece", "piece", "puzzlepiece", "jigsaw"].includes(target)) {
                    let pieceId = now.currentRoom().pieceId;
                    if (pieceId > 0) {
                        output.push("这个房间有一个" + pieceTable[pieceId]);
                    } else {
                        output.push("别乱看（");
                    }
                } else if (target === "cannon" && now.player.coord.equals(new Coord(1, 5))) {
                    if (State.greenClock % 3 === 0) {
                        let cannonOutput = "这门绿色的加农炮没什么动静。";
                        if (now.key1Coord.equals(new Coord(1, 5)) || now.key2Coord.equals(new Coord(1, 5))) {
                            cannonOutput += "你发现炮口竟然有一把钥匙！";
                        }
                        output.push(cannonOutput);
                    } else if (State.greenClock % 3 === 1) {
                        let cannonOutput = "这门绿色的加农炮";
                        if (now.key1Coord.equals(new Coord(1, 5)) || now.key2Coord.equals(new Coord(1, 5))) {
                            cannonOutput += "的炮口有一把钥匙。但加农炮";
                        }
                        cannonOutput += "好像刚刚开火过，炮口非常烫。你不禁后退一步。";
                        output.push(cannonOutput);
                    } else if (State.greenClock % 3 === 2) {
                        let cannonOutput = "这门绿色的加农炮";
                        if (now.key1Coord.equals(new Coord(1, 5)) || now.key2Coord.equals(new Coord(1, 5))) {
                            cannonOutput += "的炮口有一把钥匙。但加农炮";
                        }
                        cannonOutput += "看起来很危险，像是马上就要开火了。你不禁后退一步。";
                        output.push(cannonOutput);
                    }
                } else if (["pit", "hole"].includes(target)) {
                    if (now.player.coord.equals(new Coord(2, 5))) {
                        output.push("这个深坑挺深的，虽然不会摔断腿，但一定爬不出来。你觉得跳下去 (jump into) 绝对是个坏主意。");
                    } else {
                        output.push("别乱看（");
                    }
                } else {
                    output.push("别乱看（");
                }
            }
        } else if (moveActions.has(action)) {
            let direction;
            if (command.length === 1 && directions.has(action)) {
                direction = action;
            } else if (command.length === 2 && !directions.has(action) && directions.has(command[1])) {
                direction = command[1];
            } else if (command.length === 1) {
                output.push("要往哪个方向走？");
                return;
            } else {
                output.push("只能 \"" + action + " <方向>\" 或仅使用 \"<方向>\"。");
                return;
            }
            if (direction === "") {
                return;
            }

            let direcName;
            let ok = false;
            let drow, dcol;
            if (direction === "north" || direction === "n") {
                direcName = "北";
                drow = -1;
                dcol = 0;
                ok = !now.currentRoom().wallNorth && !now.currentRoom().doorNorth;
                if (ok && now.player.coord.equals(new Coord(3, 2)) && !State.greenDoorOpen) {
                    ok = false;
                }
            } else if (direction === "south" || direction === "s") {
                direcName = "南";
                drow = 1;
                dcol = 0;
                ok = !now.currentRoom().wallSouth && !now.currentRoom().doorSouth;
                if (ok && now.player.coord.equals(new Coord(2, 2)) && !State.greenDoorOpen) {
                    ok = false;
                }
            } else if (direction === "west" || direction === "w") {
                direcName = "西";
                drow = 0;
                dcol = -1;
                ok = !now.currentRoom().wallWest && !now.currentRoom().doorWest;
            } else if (direction === "east" || direction === "e") {
                direcName = "东";
                drow = 0;
                dcol = 1;
                ok = !now.currentRoom().wallEast && !now.currentRoom().doorEast;
            }
            if (ok) {
                history.push(State.parse(now.stringify()));
                now.player.coord.row += drow;
                now.player.coord.col += dcol;
                output.push("你向" + direcName + "走去。");
                info.moveWait = false;
                info.moveEast = dcol > 0;
                info.moveWest = dcol < 0;
                info.moveSouth = drow > 0;
                info.moveNorth = drow < 0;
                now.clock += 1;
                State.greenClock += 1;
                info.needIntroduce = true;
                info.isTracingFatal = info.isTracingEvent = true;
            } else {
                output.push("不能向" + direcName + "走。");
            }
        } else if (getActions.has(action)) {
            if (command.length === 1) {
                output.push("你要拿什么？");
            } else if (command.length === 2) {
                let item = command[1];
                if (item === "key") {
                    if (now.player.coord.equals(new Coord(1, 5))) {
                        if (State.greenClock % 3 !== 0) {
                            output.push("这里没有 key。");
                            return;
                        }
                    }
                    if (now.key1Coord.equals(now.player.coord)) {
                        output.push("你拿到了一把钥匙 (key)。");
                        now.key1Coord = new Coord(0, 0);
                        now.player.isTakingKey1 = true;
                    } else if (now.key2Coord.equals(now.player.coord)) {
                        output.push("你拿到了一把钥匙 (key)。");
                        now.key2Coord = new Coord(0, 0);
                        now.player.isTakingKey2 = true;
                    } else {
                        output.push("这里没有 key。");
                    }
                } else if (item === "green_key" || item === "greenkey") {
                    if (State.greenKeyCoord.equals(now.player.coord)) {
                        output.push("你拿到了绿色钥匙 (green_key)。");
                        State.greenKeyCoord = new Coord(0, 0);
                        Player.isTakingGreenKey = true;
                    } else {
                        output.push("这里没有 green_key。");
                    }
                } else if (["piece", "puzzle_piece", "puzzlepiece", "jigsaw"].includes(item)) {
                    let pieceId = now.currentRoom().pieceId;
                    if (pieceId < 1) {
                        output.push("这里没有 " + item + "。");
                    } else {
                        output.push("你拿到了拼图 (piece)。");
                        now.currentRoom().pieceId = 0;
                        now.player.piecesTaking[pieceId] = 1;
                    }
                } else if (item === "cannon" && now.player.coord.equals(new Coord(1, 5))) {
                    output.push("你不能拿那个");
                } else if (["pit", "hole"].includes(item) && now.player.coord.equals(new Coord(2, 5))) {
                    output.push("你不能拿那个");
                } else {
                    output.push("这里没有 " + item + "。");
                }
            } else {
                output.push("只能 \"" + action + " <东西>\"");
            }
        } else if (dropActions.has(action)) {
            output.push("这个命令没有实现喵~");
        } else if (useActions.has(action)) {
            let useName = action === "use" ? "用" : "打开";
            if (command.length === 1) {
                output.push("你要" + useName + "什么？");
            } else if (command.length === 2) {
                let item = command[1];
                if (action === "use" && ["key", "green_key", "greenkey"].includes(item)) {
                    let itemName = item === "key" ? "钥匙" : item === "green_key" || item === "greenkey" ? "绿色钥匙" : item;
                    let isKey = item === "key" || item === "green_key" || item === "greenkey";
                    let willUseKey = item === "key" && (now.player.isTakingKey1 || now.player.isTakingKey2);
                    let willUseGreenKey = (item === "green_key" || item === "greenkey") && Player.isTakingGreenKey;
                    if (!isKey || (!willUseKey && !willUseGreenKey)) {
                        output.push("你没有 " + itemName + "。");
                        return;
                    }

                    let cur = now.currentRoom();
                    if (cur.doorEast) {
                        output.push("你用" + itemName + "打开了东边的门。");
                        cur.doorEast = false;
                        now.rooms[cur.coord.row][cur.coord.col + 1].doorWest = false;
                    } else if (cur.doorWest) {
                        output.push("你用" + itemName + "打开了西边的门。");
                        cur.doorWest = false;
                        now.rooms[cur.coord.row][cur.coord.col - 1].doorEast = false;
                    } else if (cur.doorNorth) {
                        output.push("你用" + itemName + "打开了北边的门。");
                        cur.doorNorth = false;
                        now.rooms[cur.coord.row - 1][cur.coord.col].doorSouth = false;
                    } else if (cur.doorSouth) {
                        output.push("你用" + itemName + "打开了南边的门。");
                        cur.doorSouth = false;
                        now.rooms[cur.coord.row + 1][cur.coord.col].doorNorth = false;
                    } else if (cur.coord.equals(new Coord(2, 2)) && !State.greenDoorOpen) {
                        output.push("你用" + itemName + "打开了南边绿色的门。");
                        State.greenDoorOpen = true;
                    } else if (cur.coord.equals(new Coord(3, 2)) && !State.greenDoorOpen) {
                        output.push("你用" + itemName + "打开了北边绿色的门。");
                        State.greenDoorOpen = true;
                    } else {
                        output.push("这里没有要开的门。");
                        return;
                    }
                    if (item === "key") {
                        if (now.player.isTakingKey1) {
                            now.player.isTakingKey1 = false;
                        } else {
                            now.player.isTakingKey2 = false;
                        }
                    } else if (item === "green_key" || item === "greenkey") {
                        Player.isTakingGreenKey = false;
                    }
                } else if (action !== "use" && ["door", "green_door"].includes(item)) {
                    output.push("这个命令没有实现喵~ 请用 \"use <物品>\"");
                } else {
                    output.push("你不能用 " + item + "。");
                }
            } else {
                if (action === "use") {
                    output.push("只能 \" use <物品>\"");
                } else {
                    output.push("这个命令没有实现喵~ 请用 \"use <物品>\"");
                }
            }
        } else if (invActions.has(action)) {
            output.push("你有：");
            let pieceCnt = now.player.piecesTaking.reduce(function (a, b) {
                return a + b;
            }, 0);
            if (!now.player.isTakingKey1 && !now.player.isTakingKey2 && !Player.isTakingGreenKey && pieceCnt === 0) {
                output.push("    你咋啥也没有啊");
            } else {
                if (now.player.isTakingKey1 || now.player.isTakingKey2 || Player.isTakingGreenKey) {
                    output.push("    ");
                }
                if (now.player.isTakingKey1) {
                    output.push("钥匙 (key)  ");
                }
                if (now.player.isTakingKey2) {
                    output.push("钥匙 (key)  ");
                }
                if (Player.isTakingGreenKey) {
                    output.push("绿色钥匙 (green_key)  ");
                }
                if (now.player.isTakingKey1 || now.player.isTakingKey2 || Player.isTakingGreenKey) {
                    output.push("");
                }
                for (let i = 1; i <= 5; i++) {
                    if (now.player.piecesTaking[i]) {
                        output.push("一个" + pieceTable[i]);
                    }
                }
            }
        } else if (action === "wait") {
            let lapse = 0;
            if (command.length === 1) {
                lapse = 1;
            } else if (command.length === 2) {
                lapse = parseInt(command[1]);
                if (isNaN(lapse)) {
                    output.push("等待的时长应该是整数");
                    return;
                }
                if (lapse <= 0 || lapse > 20) {
                    output.push("等待的时长应该在 1~20 之间");
                    return;
                }
            } else {
                output.push("只能 \"wait\" 或 \"wait <时长>\"");
                return;
            }
            if (lapse <= 0 || lapse > 20) {
                throw new Error("Assertion failed: lapse should be greater than 0 and less than or equal to 20");
            }
            output.push("原地等待了 " + lapse + " 个单位时长。");
            info.moveWait = true;
            info.moveEast = info.moveWest = info.moveSouth = info.moveNorth = false;
            info.isTracingFatal = info.isTracingEvent = true;
            for (let i = 0; i < lapse; i++)
                history.push(State.parse(now.stringify()));
            now.clock += lapse;
            State.greenClock += lapse;
        } else if (action === "rewind" || action === "rw") {
            let lapse = 0;
            if (command.length === 1) {
                if (now.clock === 0) {
                    output.push("已经是最早的时刻了。");
                    return;
                }
                lapse = 1;
            } else if (command.length === 2) {
                lapse = parseInt(command[1]);
                if (isNaN(lapse)) {
                    output.push("倒流的时长应该是整数");
                    return;
                }
                if (now.clock === 0) {
                    output.push("已经是最早的时刻了。");
                    return;
                }
                if (lapse <= 0 || lapse > now.clock) {
                    output.push("倒流的时长应该在 1~" + now.clock + " 之间");
                    if (lapse === 0) {
                        output.push("如果你想暂停时间，可以使用 \"pause\"");
                    }
                    return;
                }
            } else {
                output.push("只能 \"rewind\" 或 \"rewind <时长>\"");
                return;
            }
            if (lapse <= 0 || lapse > now.clock) {
                throw new Error("Assertion failed: lapse should be greater than 0 and less than or equal to now.clock");
            }
            output.push("倒流了 " + lapse + " 个单位时长。");

            let targetClock = now.clock - lapse;
            if (targetClock < Player.lastTimeGreen) {
                let savedPlayer = now.clock === Player.lastTimeGreen ? now.player : history[Player.lastTimeGreen].player;
                history[targetClock].player = savedPlayer;
                if (savedPlayer.isTakingKey1) {
                    history[targetClock].key1Coord = new Coord(0, 0);
                }
                if (savedPlayer.isTakingKey2) {
                    history[targetClock].key2Coord = new Coord(0, 0);
                }
            }
            info.isDead = false;
            State.greenClock += lapse;
            info.isTracingEvent = true;
            now = history[targetClock];
            history.length = targetClock;
            info.needIntroduce = true;
        } else if (action === "pause") {
            let lapse = 0;
            if (command.length === 1) {
                lapse = 1;
            } else if (command.length === 2) {
                lapse = parseInt(command[1]);
                if (isNaN(lapse)) {
                    output.push("暂停的时长应该是整数");
                    return;
                }
                if (lapse <= 0 || lapse > 20) {
                    output.push("暂停的时长应该在 1~20 之间");
                    return;
                }
            } else {
                output.push("只能 \"pause\" 或 \"pause <时长>\"");
                return;
            }
            if (lapse <= 0 || lapse > 20) {
                throw new Error("Assertion failed: lapse should be greater than 0 and less than or equal to 20");
            }
            output.push("暂停了 " + lapse + " 个单位时长。");
            State.greenClock += lapse;
        } else if (["jump", "descend"].includes(action)) {
            if (command.length === 2 && command[1] === "into") {
                output.push("你要跳到哪里？");
                return;
            } else if (command.length === 3 && command[1] === "into") {
                let target = command[2];
                if (["hole", "pit"].includes(target)) {
                    if (now.player.coord.equals(new Coord(2, 5))) {
                        output.push("你跳进了洞里。");
                        history.push(State.parse(now.stringify()));
                        now.player.coord = new Coord(1, 1);
                        info.needIntroduce = true;
                    } else {
                        output.push("这里没有 hole。");
                    }
                } else if (now.player.coord.equals(new Coord(1, 5)) && target === "cannon") {
                    output.push("从常识上考虑，你最终还是放弃了跳进加农炮的打算。");
                } else {
                    output.push("这里没有 " + target + "。");
                }
            } else {
                output.push("只能 \"jump into <位置>\"");
            }
        } else {
            output.push("不认识这个命令喵~");
        }
    }

    run();
    let current = currentMsg(now, info);

    ctx.setStatus("dreamlandState", now.stringify());
    ctx.setStatus("dreamlandStateHistory", JSON.stringify(history.map(function (state) {
        return state.stringify()
    })));
    ctx.setStatus("dreamlandInfo", info.stringify());

    if (ctx.uid == 164) {
        return {
            'status': 'ok',
            'reply': output,
            'current': current,
            'debug': {
                now_str: now.stringify(),
                now,
                info_str: info.stringify(),
                info,
            }
        };
    }
    
    return {
        'status': 'ok',
        'reply': output,
        'current': current,
    };
}

//======= 以下是 JSON 解析与调用脚本，一般不需要修改 ========

function _jsonProcessHelper(ctx) {
    let request = JSON.parse(ctx.request);
    let resBody = main(ctx, request);
    let resString = JSON.stringify(resBody);
    ctx.response(resString);
}

_jsonProcessHelper(ctx);
```


## 答案

`ROLLBACK`

## 解析

[解析链接](https://docs.qq.com/sheet/DTnJ2U25BbUlvYnFa?tab=BB08J2)

## 提示

### 1. 我毫无头绪

启动游戏，试试help指令查看可用的指令。部分指令后可以附加操作对象，例如"get mushroom"。

### 2. 本题的主题是什么？

标题和迷宫中的一些现象，指向本题的主题是游戏时空幻境/Braid，本题一些规则和Braid相同。

### 3. 我已经破译了密码，但如何提取？

破译的密码，提示你再用某方法解一遍此题。请注意一些本题的主题不存在、却又在本题中出现的元素：房间中地面上的几何图形、墙壁上的符号、和所谓“空间的终点”。
这之后，你需要以破译该密码相同的方法再解码一次。


## 中间答案

| 提交 | 回复 | 附加信息 |
| --- | --- | --- |
| SOLVE THE WITNESS | 继续加油喵~ |  |

## 本地附件

- [e7fb2e94cc9642f7afd6145a3c3e10eb.exe](../../../assets/static.cipherpuzzles.com/static/images/e7fb2e94cc9642f7afd6145a3c3e10eb.exe)

来源：[https://archive.cipherpuzzles.com/ccbc15/problems/5/43.yaml](https://archive.cipherpuzzles.com/ccbc15/problems/5/43.yaml)
