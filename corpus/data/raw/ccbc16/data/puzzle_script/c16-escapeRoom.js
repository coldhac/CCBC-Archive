// 密室逃脱脚本

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



const PID = 43;



// the rotation of mirror that starts fire

const MIRROR_ROTATION_FIRE = -1



const WATER_THERMO_PASSWORD = 309

const BOOKMARK_BOOK = 5

const BOOKMARK_PAGE = 253

const CRYPTEX_ANSWER = "MUOVE"

const CRATER_IMG = "https://static.cipherpuzzles.com/static/images/924963feaf6b4fe8b4b228f537ffbae0.webp"

const CRATER_ANSWER = "0000000000000000000000000001000002000000000000000001000003000010000000000002000000000000000000000000"

const BOOKMARK_DOT = "https://static.cipherpuzzles.com/static/images/57387c5fd47247d99c3ed3fa8b0ef852.webp"

const ALT_MIRRORS = [

    { alias: "mirror1b", src: "https://static.cipherpuzzles.com/static/images/f630a0691db64ef69dd64481768e815b.webp" },

    { alias: "mirror2b", src: "https://static.cipherpuzzles.com/static/images/ce0a685637964631a1c7dfb16b6d3bca.webp" },

    { alias: "mirror3b", src: "https://static.cipherpuzzles.com/static/images/c3bc929de8604ccc828e7ba16ce1f0b7.webp" },

]

const FINAL_MESSAGE = "https://static.cipherpuzzles.com/static/images/7b15961f1a3847d0bcf0e1b71622d879.webp"



const LENS_ID = 1

const BOOKMARK_ID = 2

const POT_ID = 3

const WATER_POT_ID = 4

const PENDULUM_ID = 5

const AUTOMATON_KEY_ID = 6

const GEAR_ID = 7

const MATH_NOTE_ID = 8

const itemData = {

    [LENS_ID]: { name: "LENS", image: "https://static.cipherpuzzles.com/static/images/919bb519b97249e5b85485301451e1eb.webp" },

    [BOOKMARK_ID]: { name: "BOOKMARK", image: "https://static.cipherpuzzles.com/static/images/eff0eea30675466c806c4a5ce086cc3c.webp" },

    [POT_ID]: { name: "POT", image: "https://static.cipherpuzzles.com/static/images/d294b86524ab432cbc88ec0e24543ed0.webp" },

    [WATER_POT_ID]: { name: "POT WITH WATER", image: "https://static.cipherpuzzles.com/static/images/c8029976520a408b805bde64057e6b6b.webp" },

    [PENDULUM_ID]: { name: "PENDULUM", image: "https://static.cipherpuzzles.com/static/images/0521b7d7aa214933925930b4157eb845.webp" },

    [AUTOMATON_KEY_ID]: { name: "SMALL KEY", image: "https://static.cipherpuzzles.com/static/images/72e5623919d641148d9cd84af69fea1b.webp" },

    [GEAR_ID]: { name: "TOWER SECTION", image: "https://static.cipherpuzzles.com/static/images/237803a885484403bf7d6418fffdeab5.webp" },

    [MATH_NOTE_ID]: { name: "NOTE", image: "https://static.cipherpuzzles.com/static/images/e2cad9e9156a4440a7b474f536e4a07b.webp" },

}



// for game of 8

function areAdjacent(a, b) {

    const dx = Math.abs((a % 3) - (b % 3)); // column difference

    const dy = Math.abs(Math.floor(a / 3) - Math.floor(b / 3)); // row difference



    return (dx + dy === 1); // Manhattan distance of 1

}

//在这个函数中实现你的功能，ctx定义如顶部注释，request为已解析好的传入对象。

/**

 * @param {Ctx} ctx 全局上下文对象

 * @param {object} request 用户请求

 * @returns {object} response 返回给用户的数据

 */

function getCtxStatusJSON(ctx, key, defaultValue) {

    let val = ctx.getStatus(key);

    if (val === null || val === undefined) {

        val = defaultValue

    } else {

        val = JSON.parse(val)

    }

    return val

}



function findItemInInventory(currentItems, id) {

    for (let i = 0; i < currentItems.length; i++) {

        if (currentItems[i] == id) {

            return i

        }

    }

    return -1

}



function main(ctx, request) {

    //你可以直接使用传入对象

    if (!request.a) {

        request.a = 0;

    }



    var reset = ctx.uid == 3

    reset = false

    if (reset) {

        // hack

        ctx.setStatus("currentItems", JSON.stringify([1, 4]));

        ctx.setStatus("gotLensFromBox", JSON.stringify(true));

        ctx.setStatus("eightPieces", JSON.stringify([0,1,2,3,4,5,6,7,8]));

        ctx.setStatus("eightPieces", JSON.stringify([4,1,2,3,8,5,6,7,0]));

        ctx.setStatus("eightBoxOpen", JSON.stringify(true));

        ctx.setStatus("lensOnStand", JSON.stringify(false));

        ctx.setStatus("fireStarted", JSON.stringify(true));

        ctx.setStatus("openDoorSuccess", JSON.stringify(true));

        ctx.setStatus("mirrorRotation", JSON.stringify(0));

        ctx.setStatus("mirrorRotateLeft", JSON.stringify(true));

        ctx.setStatus("lensInTelescope", JSON.stringify(false));

        ctx.setStatus("gotNoteFromShelf", JSON.stringify(false))

        ctx.setStatus("onRightPage", JSON.stringify(false));

        ctx.setStatus("gotBookmark", JSON.stringify(false));

        ctx.setStatus("bookmarkInMicroscope", JSON.stringify(true));

        ctx.setStatus("potInFireplace", JSON.stringify(false));

        ctx.setStatus("waterPotInFireplace", JSON.stringify(true));

        ctx.setStatus("safeOpen", JSON.stringify(false));

        ctx.setStatus("faucetOn", JSON.stringify(false));

        ctx.setStatus("cryptex", JSON.stringify("MUOVE"));

        ctx.setStatus("gotPendulumFromSafe", JSON.stringify(false));

        ctx.setStatus("clockHasPendulum", JSON.stringify(true));

        ctx.setStatus("clockHasGear", JSON.stringify(true));

        ctx.setStatus("moonBoxOpen", JSON.stringify(false));

        ctx.setStatus("gotKeyFromMoonBox", JSON.stringify(false));

        ctx.setStatus("towerState", JSON.stringify(2));

        ctx.setStatus("automatonRunning", JSON.stringify(false));

    }



    var currentItems = getCtxStatusJSON(ctx, "currentItems", []);



    var eightPieces = getCtxStatusJSON(ctx, "eightPieces", [0,1,2,3,4,5,6,7,8]);

    var eightBoxOpen = getCtxStatusJSON(ctx, "eightBoxOpen", false);



    var gotLensFromBox = getCtxStatusJSON(ctx, "gotLensFromBox", false);

    var lensOnStand = getCtxStatusJSON(ctx, "lensOnStand", false);

    var fireStarted = getCtxStatusJSON(ctx, "fireStarted", false);

    var potInFireplace = getCtxStatusJSON(ctx, "potInFireplace", true);

    var waterPotInFireplace = getCtxStatusJSON(ctx, "waterPotInFireplace", false);



    var mirrorRotation = getCtxStatusJSON(ctx, "mirrorRotation", 0);

    var mirrorRotateLeft = getCtxStatusJSON(ctx, "mirrorRotateLeft", true);



    var openDoorSuccess = getCtxStatusJSON(ctx, "openDoorSuccess", false);



    var lensInTelescope = getCtxStatusJSON(ctx, "lensInTelescope", false);



    var gotNoteFromShelf = getCtxStatusJSON(ctx, "gotNoteFromShelf", false);

    var onRightPage = getCtxStatusJSON(ctx, "onRightPage", false);

    var gotBookmark = getCtxStatusJSON(ctx, "gotBookmark", false);



    var bookmarkInMicroscope = getCtxStatusJSON(ctx, "bookmarkInMicroscope", false);



    var faucetOn = getCtxStatusJSON(ctx, "faucetOn", false);



    var cryptex = getCtxStatusJSON(ctx, "cryptex", "AAAAA");

    var safeOpen = getCtxStatusJSON(ctx, "safeOpen", false);

    var gotPendulumFromSafe = getCtxStatusJSON(ctx, "gotPendulumFromSafe", false);

    var clockHasPendulum = getCtxStatusJSON(ctx, "clockHasPendulum", false);

    var towerState = getCtxStatusJSON(ctx, "towerState", 1);

    var clockHasGear = getCtxStatusJSON(ctx, "clockHasGear", false);



    var moonBoxOpen = getCtxStatusJSON(ctx, "moonBoxOpen", false);

    var gotKeyFromMoonBox = getCtxStatusJSON(ctx, "gotKeyFromMoonBox", false);



    var automatonRunning = getCtxStatusJSON(ctx, "automatonRunning", false);



    // init

    var isRoom1 = false

    if (request.type === 57) {

        let room2thumbnail = "https://static.cipherpuzzles.com/static/images/ab0fda5fc28c427487c1d70b87555f5a.webp"

        if (openDoorSuccess) {

            room2thumbnail = "https://static.cipherpuzzles.com/static/images/d53bccc8ef564a98a61ab0edbd620af1.webp"

        }

        return {

            tn: room2thumbnail

        }

    } else if (request.type === 0) {

        // init for room1, do nothing

        isRoom1 = true

    } else if (request.type === 1) {

        isRoom1 = true

        // move eight puzzle

        var piece_loc = eightPieces[request.piece_idx];

        var blank_loc = eightPieces[8];

        if (areAdjacent(piece_loc, blank_loc)) {

          // Swap the clicked piece with the blank piece

          eightPieces[request.piece_idx] = blank_loc;

          eightPieces[8] = piece_loc;

          ctx.setStatus("eightPieces", JSON.stringify(eightPieces));

        }

    } else if (request.type === 2) {

        // try open eight box

        isRoom1 = true

        var correctAnswer = [4,1,2,3,8,5,6,7,0]

        var checkSolved = true

        for (let i = 0; i < 9; i++) {

            if (correctAnswer[i] != eightPieces[i]) {

                checkSolved = false;

                break;

            }

        }

        if (checkSolved) {

          eightBoxOpen = true;

          ctx.setStatus("eightBoxOpen", JSON.stringify(eightBoxOpen));

        }

    } else if (request.type === 3) {

        isRoom1 = true

        // get lens from box

        if (!gotLensFromBox && eightBoxOpen) {

            gotLensFromBox = true

            ctx.setStatus("gotLensFromBox", JSON.stringify(gotLensFromBox));

            currentItems.push(LENS_ID)

        }

    } else if (request.type === 4) {

        isRoom1 = true

        // put lens on stand

        // first check that we indeed have the lens

        let lensIndex = findItemInInventory(currentItems, LENS_ID);

        if (lensIndex > -1) {

            currentItems.splice(lensIndex, 1);

            lensOnStand = true;

            ctx.setStatus("lensOnStand", JSON.stringify(lensOnStand))

            if (mirrorRotation == MIRROR_ROTATION_FIRE && !fireStarted) {

                fireStarted = true

                ctx.setStatus("fireStarted", JSON.stringify(fireStarted))

            }

        }

    } else if (request.type === 5) {

        isRoom1 = true

        // remove lens from stand

        if (lensOnStand) {

            currentItems.push(LENS_ID);

            lensOnStand = false;

            ctx.setStatus("lensOnStand", JSON.stringify(lensOnStand))

        }

    } else if (request.type === 6) {

        isRoom1 = true

        // rotate mirror

        if (mirrorRotation == 0) {

            mirrorRotateLeft = !mirrorRotateLeft;

        }

        if (mirrorRotation == 0) {

            if (mirrorRotateLeft) {

                mirrorRotation = 1

            } else {

                mirrorRotation = -1

            }

        } else {

            mirrorRotation = 0

        }

        ctx.setStatus("mirrorRotation", JSON.stringify(mirrorRotation));

        ctx.setStatus("mirrorRotateLeft", JSON.stringify(mirrorRotateLeft));

        if (mirrorRotation == MIRROR_ROTATION_FIRE && lensOnStand && !fireStarted) {

            fireStarted = true

            ctx.setStatus("fireStarted", JSON.stringify(fireStarted))

        }

    } else if (request.type === 7) {

        isRoom1 = true

        // try open door

        let password = ('0000000' + WATER_THERMO_PASSWORD.toString(2)).slice(-9)

        let trySuccess = true

        for (let i = 0; i < 9; i++) {

            if (request.pressedDoorButtons[i] != (password.charAt(i) == '1')) {

                trySuccess = false

                break

            }

        }

        if (trySuccess) {

            if (!openDoorSuccess) {

                ctx.addAnswerLog(ctx.uid, ctx.gid, PID, "", 8, "成功推开了密室的门");

            }

            openDoorSuccess = true

            ctx.setStatus("openDoorSuccess", JSON.stringify(openDoorSuccess))

        }

    } else if (request.type === 8) {

        isRoom1 = true

        // put lens in telescope

        // first check that we indeed have the lens

        let lensIndex = findItemInInventory(currentItems, LENS_ID);

        if (lensIndex > -1) {

            currentItems.splice(lensIndex, 1);

            lensInTelescope = true;

            ctx.setStatus("lensInTelescope", JSON.stringify(lensInTelescope))

        }

    } else if (request.type === 9) {

        isRoom1 = true

        // remove lens from telescope

        if (lensInTelescope) {

            currentItems.push(LENS_ID);

            lensInTelescope = false;

            ctx.setStatus("lensInTelescope", JSON.stringify(lensInTelescope))

        }

    } else if (request.type == 10) {

        isRoom1 = false

        // go to a page

        onRightPage = (request.selectedBook == BOOKMARK_BOOK && request.selectedPage == BOOKMARK_PAGE)

        ctx.setStatus("onRightPage", JSON.stringify(onRightPage))

    } else if (request.type === 11) {

        isRoom1 = false

        // get bookmark

        if (!gotBookmark) {

            // check that box is open

            if (onRightPage) {

                gotBookmark = true

                ctx.setStatus("gotBookmark", JSON.stringify(gotBookmark));

                currentItems.push(BOOKMARK_ID)

            }

        }

    } else if (request.type == 12) {

        isRoom1 = false

        // put bookmark on microscope

        // first check that we indeed have the bookmark

        let bmIndex = findItemInInventory(currentItems, BOOKMARK_ID);

        if (bmIndex > -1) {

            currentItems.splice(bmIndex, 1);

            bookmarkInMicroscope = true;

            ctx.setStatus("bookmarkInMicroscope", JSON.stringify(bookmarkInMicroscope))

        }

    } else if (request.type === 13) {

        isRoom1 = false

        // remove bookmark from microscope

        if (bookmarkInMicroscope) {

            currentItems.push(BOOKMARK_ID);

            bookmarkInMicroscope = false;

            ctx.setStatus("bookmarkInMicroscope", JSON.stringify(bookmarkInMicroscope))

        }

    } else if (request.type == 14) {

        isRoom1 = true

        // get pot from fireplace

        if (potInFireplace) {

            potInFireplace = false

            ctx.setStatus("potInFireplace", JSON.stringify(potInFireplace));

            currentItems.push(POT_ID)

        }

    } else if (request.type == 15) {

        isRoom1 = true

        // put pot back in fireplace

        // first check that we indeed have the pot

        let index = findItemInInventory(currentItems, POT_ID)

        if (index > -1) {

            currentItems.splice(index, 1);

            potInFireplace = true;

            ctx.setStatus("potInFireplace", JSON.stringify(potInFireplace))

        }

    } else if (request.type == 16) {

        isRoom1 = false

        // toggle faucet

        faucetOn = !faucetOn

        ctx.setStatus("faucetOn", JSON.stringify(faucetOn))

    } else if (request.type == 17) {

        isRoom1 = false

        // fill bucket faucet

        // faucet is on

        if (faucetOn) {

            // check that we have pot

            let index = findItemInInventory(currentItems, POT_ID)

            if (index > -1) {

                currentItems.splice(index, 1, WATER_POT_ID);

            }

        }

    } else if (request.type == 18) {

        isRoom1 = true

        // put water pot back in fireplace

        // first check that we indeed have the water pot

        let index = findItemInInventory(currentItems, WATER_POT_ID)

        if (index > -1) {

            currentItems.splice(index, 1);

            waterPotInFireplace = true;

            ctx.setStatus("waterPotInFireplace", JSON.stringify(waterPotInFireplace))

        }

    } else if (request.type == 19) {

        isRoom1 = false

        // move cryptex

        let col = request.cryptexColumn

        let newLet = String.fromCharCode(((cryptex.charCodeAt(col) - 65) + request.shift + 26) % 26 + 65)

        cryptex = cryptex.slice(0, col) + newLet + cryptex.slice(col + 1)

        ctx.setStatus("cryptex", JSON.stringify(cryptex))

    } else if (request.type == 20) {

        isRoom1 = false

        if (cryptex == CRYPTEX_ANSWER) {

            safeOpen = true

            ctx.setStatus("safeOpen", JSON.stringify(safeOpen))

        }

    } else if (request.type == 21) {

        isRoom1 = false

        // init for room 2, do nothing

    } else if (request.type == 22) {

        isRoom1 = false

        // try get weight from room

        if (!gotPendulumFromSafe) {

            // check that safe is open

            if (safeOpen) {

                gotPendulumFromSafe = true

                ctx.setStatus("gotPendulumFromSafe", JSON.stringify(gotPendulumFromSafe));

                currentItems.push(PENDULUM_ID)

            }

        }

    } else if (request.type == 23) {

        isRoom1 = true

        // put pendulum on clock

        // first check that we indeed have the pendulum

        let wIndex = findItemInInventory(currentItems, PENDULUM_ID)

        if (wIndex > -1) {

            currentItems.splice(wIndex, 1);

            clockHasPendulum = true;

            ctx.setStatus("clockHasPendulum", JSON.stringify(clockHasPendulum))

        }

    } else if (request.type == 24) {

        // start automaton

        isRoom1 = false

        let keyIndex = findItemInInventory(currentItems, AUTOMATON_KEY_ID)

        if (keyIndex > -1) {

            // try to do something

            currentItems.splice(keyIndex, 1);

            automatonRunning = true;

            ctx.setStatus("automatonRunning", JSON.stringify(automatonRunning))

        }



    } else if (request.type == 25) {

        isRoom1 = true

        // put gear on clock

        // first check that we indeed have the pendulum

        let wIndex = findItemInInventory(currentItems, GEAR_ID)

        if (wIndex > -1) {

            currentItems.splice(wIndex, 1);

            clockHasGear = true;

            ctx.setStatus("clockHasGear", JSON.stringify(clockHasGear))

        }

    } else if (request.type == 26) {

        // check craters answer

        isRoom1 = false

        if (request.craters == CRATER_ANSWER) {

            moonBoxOpen = true;

            ctx.setStatus("moonBoxOpen", JSON.stringify(moonBoxOpen))

        }

    } else if (request.type == 27) {

        // get key from moon box

        isRoom1 = false

        if (moonBoxOpen && !gotKeyFromMoonBox) {

            currentItems.push(AUTOMATON_KEY_ID)

            gotKeyFromMoonBox = true

            ctx.setStatus("gotKeyFromMoonBox", JSON.stringify(gotKeyFromMoonBox))

        }

    } else if (request.type == 28) {

        // break tower

        isRoom1 = false

        if (waterPotInFireplace) {

            towerState = 2;

            ctx.setStatus("towerState", JSON.stringify(towerState))

        }

    } else if (request.type == 29) {

        // break tower

        isRoom1 = false

        if (towerState == 2) {

            towerState = 3;

            ctx.setStatus("towerState", JSON.stringify(towerState))

            currentItems.push(GEAR_ID)

        }

    } else if (request.type == 30 && ctx.gid == 1) {

        isRoom1 = true

        // reset

        ctx.setStatus("currentItems", JSON.stringify([]));

        ctx.setStatus("gotLensFromBox", JSON.stringify(false));

        ctx.setStatus("eightPieces", JSON.stringify([0,1,2,3,4,5,6,7,8]));

        ctx.setStatus("eightBoxOpen", JSON.stringify(false));

        ctx.setStatus("lensOnStand", JSON.stringify(false));

        ctx.setStatus("fireStarted", JSON.stringify(false));

        ctx.setStatus("openDoorSuccess", JSON.stringify(false));

        ctx.setStatus("mirrorRotation", JSON.stringify(0));

        ctx.setStatus("mirrorRotateLeft", JSON.stringify(true));

        ctx.setStatus("lensInTelescope", JSON.stringify(false));

        ctx.setStatus("gotNoteFromShelf", JSON.stringify(false))

        ctx.setStatus("onRightPage", JSON.stringify(false));

        ctx.setStatus("gotBookmark", JSON.stringify(false));

        ctx.setStatus("bookmarkInMicroscope", JSON.stringify(false));

        ctx.setStatus("potInFireplace", JSON.stringify(true));

        ctx.setStatus("waterPotInFireplace", JSON.stringify(false));

        ctx.setStatus("safeOpen", JSON.stringify(false));

        ctx.setStatus("faucetOn", JSON.stringify(false));

        ctx.setStatus("cryptex", JSON.stringify("AAAAA"));

        ctx.setStatus("gotPendulumFromSafe", JSON.stringify(false));

        ctx.setStatus("clockHasPendulum", JSON.stringify(false));

        ctx.setStatus("clockHasGear", JSON.stringify(false));

        ctx.setStatus("moonBoxOpen", JSON.stringify(false));

        ctx.setStatus("gotKeyFromMoonBox", JSON.stringify(false));

        ctx.setStatus("towerState", JSON.stringify(1));

        ctx.setStatus("automatonRunning", JSON.stringify(false));

    } else if (request.type == 31) {

        isRoom1 = false

        if (!gotNoteFromShelf) {

            currentItems.push(MATH_NOTE_ID)

            gotNoteFromShelf = true

            ctx.setStatus("gotNoteFromShelf", JSON.stringify(gotNoteFromShelf))

        }

    }



    let moonImg = ""

    var waterNumber = 0;

    if (request.type != 30) {

        if (clockHasGear && clockHasPendulum && lensInTelescope) {

            // we can now return the image of the moon

            moonImg = CRATER_IMG

        }



        if (fireStarted) {

            waterNumber = WATER_THERMO_PASSWORD;

        }



        ctx.setStatus("currentItems", JSON.stringify(currentItems));

    }



    var currentItemsExpanded = []

    for (let i = 0; i < currentItems.length; i++) {

        let id = currentItems[i]

        currentItemsExpanded.push({id: id, name: itemData[id].name, image: itemData[id].image})

    }



    //将你需要返回给前端的对象return出去

    if (isRoom1) {

        return {

            gid: ctx.gid,

            ep: eightPieces,

            ebo: eightBoxOpen,

            glfb: gotLensFromBox,

            ci: currentItemsExpanded,

            los: lensOnStand,

            pif: potInFireplace,

            wif: waterPotInFireplace,

            am : waterPotInFireplace && fireStarted ? ALT_MIRRORS : null,

            mr: mirrorRotation,

            fs: fireStarted,

            wn: waterNumber,

            ods: openDoorSuccess,

            lit: lensInTelescope,

            chp: clockHasPendulum,

            chg: clockHasGear,

            mi: moonImg,

            bi: gotBookmark ? BOOKMARK_DOT : "",

        }

    } else {

        // room 2

        return {

            ci: currentItemsExpanded,

            ods: openDoorSuccess,

            gnfs: gotNoteFromShelf,

            orp: onRightPage,

            gb: gotBookmark,

            bim: bookmarkInMicroscope,

            bi: (gotBookmark || onRightPage) ? BOOKMARK_DOT : "",

            fo: faucetOn,

            cpt: cryptex,

            so: safeOpen,

            gpfs: gotPendulumFromSafe,

            ar: automatonRunning,

            fm: automatonRunning ? FINAL_MESSAGE : "",

            mbo: moonBoxOpen,

            gkfmb: gotKeyFromMoonBox,

            ts: towerState,

        }

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