
<!-- Brackets Puzzle -->
<template>

    <div class="groups-container">
        <div class="group" v-for="(puzzleGroup, i) in puzzleList" :key="puzzleGroup.g">
            <div class="puzzles-row">
                <div class="puzzle" v-for="(puzzle, j) in puzzleGroup.p" :key="puzzle.id"
                    :style="{ borderColor: getAwareBorderColor(puzzle.id) }"
                    :class="{ correct: puzzle.f === 1, locked: puzzle.l === 1, error: puzzle.error === 1 }">
                    <div class="puzzle-text stroke" v-html="puzzle.clue" :class="{ small : useSmallText(puzzle.clue) }"></div>
                    <input type="text" class="answer-input-d stroke" maxlength="5" :placeholder="getPlaceholder(puzzle.al)"
                        v-model="answer[puzzle.id]"
                        @input="(e) => updateInput(e, puzzle.id)"
                        @keydown.enter="handleEnterKey(puzzle)"
                        @focus="setCursor(puzzle.id)"
                        @blur="unsetCursor()"
                        :disabled="puzzle.l === 1"
                        :tabindex="puzzle.id"
                        >
                    <!-- 悬浮用户标签 -->
                    <div v-if="getAwareUser(puzzle.id)" 
                         class="user-label"
                         :style="{ 
                             backgroundColor: getAwareUser(puzzle.id).color,
                             color: adjustTextColor(getAwareUser(puzzle.id).color)
                         }">
                        {{ getAwareUser(puzzle.id).name }}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 全屏透明遮罩 -->
        <div v-if="loading" class="loading-overlay">
            <div class="loading-label">加载中...</div>
        </div>
    </div>

</template>

<style>

.groups-container > * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.groups-container {
    display: flex;
    flex-direction: column;
    gap: 40px;
    /*background: #FAEBD7;*/
    min-height: 100vh;
    padding: 20px 20px;
    background-attachment: fixed;
}

.group {
    background: #7D8FA1;
    flex-direction: row;
    padding: 30px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(100, 150, 255, 0.2);
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
}

.group.hidden {
    display: none;
}

.puzzles-row {
    display: flex;
    flex-wrap: wrap;
    gap: 30px;
    justify-content: center;
}

.puzzle {
    background: #383B42;
    color: #fff;
    border-style: solid;
    border-width: thick;
    border-color: #0C131E;
    width: 200px;
    height: 200px;
    font-size: 15px;
    padding: 0px 5px 5px 5px;
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    flex-direction: column;
}

.puzzle:focus-within {
    background: #528BCA;
}

.puzzle.correct {
    background: #4DB64A;
}

.puzzle.error {
    background: #871F27;
    animation: shake 0.3s ease-in-out;
}

.puzzle.locked {
    background: #871F27;
    pointer-events: none;
}

.user-label {
    position: absolute;
    bottom: -20px;
    left: 0px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8em;
    font-weight: bold;
    z-index: 10;
    white-space: nowrap;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.puzzle-text {
    font-size: 1.5em;
    text-align: center;
    margin: auto -100%;
    /* padding-bottom: 10%; */
    white-space: nowrap;
    font-weight: bold;
}

.puzzle-text.small {
    font-size: 1em;
}

.stroke {
    -webkit-text-stroke: 3px black;
    paint-order: stroke;
}

.answer-input-d {
    font-size: 1.5em;
    /* width: 100%; */
    min-height: 50%;
    border-width: 0;
    background: rgba(0, 0, 0, 0);
    color: white;
    transition: all 0.3s ease;
    text-align: center;
    font-weight: bold;
}

.answer-input-d:focus {
    outline: none;
    background: rgba(0, 0, 0, 0.2);
}

/* 全屏透明遮罩样式 */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-label {
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    padding: 20px 40px;
    border-radius: 8px;
    font-size: 1.2em;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes shake {
    0%, 100% {
        transform: translateX(0);
    }
    10%, 50%, 90% {
        transform: translateX(-10px);
    }
    30%, 70% {
        transform: translateX(10px);
    }
}

/* 重置按钮样式 */
.reset-button {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc3545;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    animation: fadeIn 0.3s ease-in-out;
}

.reset-button:hover {
    background: #c82333;
    transform: scale(1.05);
}

.reset-button:active {
    transform: scale(0.95);
}




</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";const t="c16-brackets-ticket";return{setup(){const a=e.inject("backend"),r=e.inject("ysync"),s=e.inject("adjustTextColor"),n=e.ref(!1),l=e.ref(0),u=e.reactive({}),o=e.ref([]),i=e.ref([]),c=e.ref(!1),v=r.yDoc.getMap(t);v.forEach(((e,t)=>{if("last_answer_time"===t)l.value=e;else{let a=parseInt(t.replace("t-",""));u[a]=e}})),e.onMounted((()=>{r.registerAwarenessFunc(t,(e=>{o.value=e})),w()})),e.onBeforeUnmount((()=>{r.removeAwarenessState(t),r.unregisterAwarenessFunc(t)})),v.observe(((e,t)=>{e.keysChanged&&e.keysChanged.forEach((e=>{let t=v.get(e);if("last_answer_time"===e)t>l.value&&(l.value=t,w());else{let a=parseInt(e.replace("t-",""));u[a]=t}}))}));const w=async()=>{n.value=!0;let e=await a("c16-brackets",{type:1});e.data?i.value=e.data:i.value=[],n.value=!1};return{loading:n,puzzleList:i,answer:u,aware:o,showResetButton:c,getPlaceholder:e=>"－".repeat(e),updateInput:(e,t)=>{var a;if(void 0!==(null==(a=null==e?void 0:e.target)?void 0:a.value)){let a=e.target.value;v.set(`t-${t}`,a)}},handleEnterKey:async e=>{await(async e=>{let t=e.id;1==(await a("c16-brackets",{type:2,answer:u[t],id:t})).r?(await w(),l.value=Date.now(),v.set("last_answer_time",l.value)):(e.error=1,setTimeout((()=>{e.error=0}),2e3))})(e)},useSmallText:e=>e.split("<br>").some((e=>e.length>8)),adjustTextColor:s,getAwareBorderColor:e=>{for(let t in o.value)if(o.value[t].ci===e)return o.value[t].color;return"#0C131E"},getAwareUser:e=>{for(let t in o.value)if(o.value[t].ci===e)return o.value[t];return null},setCursor:e=>{r.setAwarenessState(t,{ci:e})},unsetCursor:()=>{r.removeAwarenessState(t)}}}}}(Vue);


export default __vue_puzzle_component__;
</script>
