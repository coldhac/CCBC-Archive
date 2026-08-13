
<!-- Triddles Puzzle -->
<template>

    <div class="triddles-container">
        <div class="welcome-page" v-if="currentPage === 0">
            <h1>三字谜</h1>
            <button @click="currentPage = 1">解谜题</button>
            <!-- <button @click="showDialog = true">删存档</button> -->
            <button @click="currentPage = 2">创作者</button>
        </div>
        <div class="welcome-page" v-if="currentPage === 2">
            <h2 class="page-top">创作者</h2>
            <p class="b">落葉子</p>
            <h2>协助者</h2>
            <p class="s">温停眉</p>
            <p class="s">七千加</p>
            <p class="s">邪恶羊</p>
            <p class="s">铽德魞</p>
            <h2>测试者</h2>
            <p class="s">护生草</p>
            <p class="s">墨辣椒</p>
            <p class="s">光之子</p>
            <p class="s">及其他</p>
            <h2>致敬于</h2>
            <p class="b">兰杰克</p>
            <button @click="currentPage = 0">回首页</button>
        </div>
        <div class="main-page" v-if="currentPage === 1">
            <div class="main-header">
                <div>已通过：{{ completedCount }}✔️</div>
                <button class="header-button" @click="currentPage = 0">回首页</button>
            </div>
            <div class="triddles-group" v-for="(group, gid) in triddles" :key="gid">
                <div class="triddle-item" v-for="(triddle, ti) in group.l" :key="triddle.i"
                    @click="showSubmitPage(triddle, ti, gid)"
                    :class="{ completed: triddle.c === 1}">
                    <div class="triddle-gram">{{ triddle.g }}</div>
                    <div class="triddle-answer">
                        <span>{{ getAnswer(triddle.i) }}</span>
                        <span v-if="triddle.c === 1">✔️</span>
                        <span v-else>❌</span>
                    </div>
                </div>
            </div>
            <div class="triddles-group unlocked" v-for="(n, i) in next" v-if="next.length > 0" :style="{ opacity: 0.7 - (0.3 * i) }">
                <div class="triddle-item" v-for="(k, ki) in n" :key="ki">
                    <div class="triddle-gram">未解锁</div>
                </div>
            </div>
            <div v-if="finished">
                <button class="finish-button" @click="currentPage = 4">完成页</button>
            </div>
        </div>
        <div class="submit-page" v-if="currentPage === 3">
            <div class="main-header">
                <div>已通过：{{ completedCount }}✔️</div>
                <div>
                    <button class="header-button" @click="returnToTriddlesList">谜列表</button>
                    <button class="header-button" @click="currentPage = 0">回首页</button>
                </div>
            </div>
            <div class="input-area">
                <div class="submit-result" v-if="currentTriddle.c === 1">已通过✔️</div>
                <div class="submit-result" v-else>未通过❌</div>
                <h2>{{ currentTriddle.g }}</h2>
                <div class="submit-extra">{{ currentTriddle.e }}</div>
                <input type="text" v-model="answers[currentTriddle.i]"
                    @input="(e) => updateInput(e, currentTriddle.i)"
                    @keydown.enter="handleEnterKey"
                    ref="triddleInput"
                    class="triddle-input" />
                <div v-if="finished && currentTriddle.f === 1">
                    <button class="finish-button" @click="currentPage = 4">完成页</button>
                </div>
                <div class="switch-buttons">
                    <button class="header-button" v-if="currentIndexOfGroup > 0"
                        @click="prevTriddle()">← 上一题</button>
                    <button class="header-button" v-if="currentIndexOfGroup < currentGroupLength - 1"
                        @click="nextTriddle()">下一题 →</button>
                    <button class="header-button" v-if="currentIndexOfGroup == currentGroupLength - 1"
                        @click="nextTriddle()">谜列表  →</button>
                </div>
                <!--<div style="font-size: 12px">debug: {{ currentIndexOfGroup }} / {{ currentGroupLength }}</div>-->
            </div>
        </div>
        <div class="welcome-page" v-if="currentPage === 4">
            <h2 class="page-top">恭喜你</h2>
            <h2>已通过</h2>
            <h2>三字谜</h2>
            <p>已通过：{{ completedCount }}✔️</p>
            <button @click="currentPage = 0">回首页</button>
        </div>
    </div>
    <div class="delete-save-dialog" v-if="showDialog">
        <div>
            <h2>删存档</h2>
            <p>全队伍</p>
            <p>存档消</p>
            <p>真删吗</p>
            <button @click="deleteSave">我确认</button>
            <button @click="showDialog = false">再想想</button>
        </div>
    </div>
    <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
            <h2>加载中...</h2>
        </div>
    </div>

</template>

<style>

.triddles-container {
    background-color: #aaccaa;
    font-family: "Fira Mono Bold", monospace;
    font-size: 100px;
    color: #113311;
    text-align: center;
    padding-bottom: 60px;
    margin-bottom: 60px;
    min-height: 100vh;
}

.triddles-group {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 10px;
}

.triddle-input {
    width: 550px;
    height: 150px;
    font-family: "Fira Mono Bold", monospace;
    font-size: 100px;
    border: 10px solid #113311;
    background-color: #77aa77;
    color: #113311;
    border-radius: 10px;
    padding: 10px;
    margin-top: 20px;
    text-align: center;
}

.triddle-item {
    height: 160px;
    width: 160px;
    border: 10px solid #113311;
    background-color: #77aa77;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}
.triddle-item:hover {
    background-color: #93c093;
}

.triddle-gram {
    font-size: 40px;
}
.triddle-answer {
    font-size: 20px;
}
.submit-result {
    font-size: 40px;
}
.submit-extra {
    font-size: 40px;
}

.input-area {
    margin-top: 80px;
}
.input-area h2 {
    margin: 0;
    line-height: 1em;
}
.switch-buttons {
    margin-top: 100px;
}

.unlocked>.triddle-item {
    cursor: not-allowed;
}
.unlocked>.triddle-item:hover {
    background-color: #77aa77;
}
.completed {
    background-color: #cccc77;
	border: 10px solid #555511;
	color: #555511;
}
.completed:hover {
    background-color: #e7e795;
}

.main-page, .submit-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

.main-header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    font-size: 40px;
}

.finish-button {
    font-size: 80px;
    font-family: "Fira Mono Bold", monospace;
    padding: 0 10px;
    background-color: #cccc77;
	border: 10px solid #555511;
	color: #555511;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    margin-top: 20px;
}
.finish-button:hover {
    background-color: #e7e795;
}

.header-button {
    font-size: 40px;
    font-family: "Fira Mono Bold", monospace;
    padding: 0 10px;
    background-color: #77aa77;
    border: 5px solid #113311;
    color: #113311;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    margin-left: 10px;
}

.header-button:hover {
    background-color: #93c093;
}

.welcome-page {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.welcome-page h1 {
    margin: 0;
    padding: 45px;
}

.welcome-page h2,.welcome-page p {
    margin: 10px;
    line-height: 1em;
}

.welcome-page h2.page-top {
    margin-top: 90px;
}

.welcome-page p.s {
    font-size: 80px;
}
.welcome-page p.b {
    font-size: 120px;
}

.welcome-page button {
    margin: 20px;
    color: #113311;
    padding: 20px;
    font-size: 100px;
    font-family: "Fira Mono Bold", monospace;
    background-color: #77aa77;
    border: 10px solid #113311;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.welcome-page button:hover {
    background-color: #93c093;
}

.delete-save-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.delete-save-dialog > div {
    background-color: #aaccaa;
    border: 10px solid #113311;
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    font-family: "Fira Mono Bold", monospace;
    color: #113311;
    max-width: 600px;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.3);
}

.delete-save-dialog h2 {
    font-size: 80px;
    margin: 0 0 30px 0;
}

.delete-save-dialog p {
    font-size: 60px;
    margin: 15px 0;
    line-height: 1.2;
}

.delete-save-dialog button {
    margin: 20px 15px;
    padding: 15px 30px;
    font-size: 50px;
    font-family: "Fira Mono Bold", monospace;
    background-color: #77aa77;
    color: #113311;
    border: 8px solid #113311;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.delete-save-dialog button:hover {
    background-color: #93c093;
}

.delete-save-dialog button:first-of-type {
    background-color: #cc7777;
    color: #551111;
}

.delete-save-dialog button:first-of-type:hover {
    background-color: #d28888;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.loading-content {
    background-color: #aaccaa;
    border: 10px solid #113311;
    border-radius: 20px;
    padding: 60px;
    text-align: center;
    font-family: "Fira Mono Bold", monospace;
    color: #113311;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
}

.loading-content h2 {
    font-size: 80px;
    margin: 0;
    animation: pulse 1.5s ease-in-out infinite alternate;
}

@keyframes pulse {
    0% {
        opacity: 0.6;
    }
    100% {
        opacity: 1;
    }
}

/* 响应式设计 - 平板设备 */
@media (max-width: 1024px) {
    .triddles-container {
        font-size: 80px;
        padding-bottom: 40px;
        margin-bottom: 40px;
    }
    
    .triddle-input {
        width: 450px;
        height: 120px;
        font-size: 80px;
        border: 8px solid #113311;
        padding: 8px;
    }
    
    .triddle-item {
        height: 130px;
        width: 130px;
        border: 8px solid #113311;
    }
    
    .triddle-gram {
        font-size: 32px;
    }
    
    .triddle-answer {
        font-size: 16px;
    }
    
    .submit-result {
        font-size: 32px;
    }
    
    .submit-extra {
        font-size: 32px;
    }
    
    .main-header {
        font-size: 32px;
    }
    
    .finish-button {
        font-size: 64px;
        border: 8px solid #555511;
    }
    
    .header-button {
        font-size: 32px;
        border: 4px solid #113311;
        padding: 0 8px;
        margin-left: 8px;
    }
    
    .welcome-page button {
        font-size: 80px;
        padding: 16px;
        border: 8px solid #113311;
    }
    
    .welcome-page p.s {
        font-size: 64px;
    }
    
    .welcome-page p.b {
        font-size: 96px;
    }
    
    .delete-save-dialog h2 {
        font-size: 64px;
    }
    
    .delete-save-dialog p {
        font-size: 48px;
    }
    
    .delete-save-dialog button {
        font-size: 40px;
        padding: 12px 24px;
        border: 6px solid #113311;
    }
    
    .loading-content h2 {
        font-size: 64px;
    }
}

/* 响应式设计 - 手机设备 */
@media (max-width: 768px) {
    .triddles-container {
        font-size: 60px;
        padding: 10px;
        padding-bottom: 30px;
        margin-bottom: 30px;
        /* 优化触摸滚动 */
        -webkit-overflow-scrolling: touch;
    }
    
    .triddle-input {
        width: calc(100vw - 40px);
        max-width: 350px;
        height: 100px;
        font-size: 60px;
        border: 6px solid #113311;
        padding: 6px;
        margin-top: 15px;
    }
    
    .triddle-item {
        height: 100px;
        width: 100px;
        border: 6px solid #113311;
        border-radius: 8px;
        /* 触摸友好的交互 */
        -webkit-tap-highlight-color: rgba(147, 192, 147, 0.3);
        touch-action: manipulation;
    }
    
    .triddles-group {
        gap: 8px;
        margin-bottom: 8px;
        justify-content: center;
    }
    
    .triddle-gram {
        font-size: 24px;
    }
    
    .triddle-answer {
        font-size: 12px;
    }
    
    .submit-result {
        font-size: 24px;
    }
    
    .submit-extra {
        font-size: 24px;
    }
    
    .input-area {
        margin-top: 60px;
    }
    
    .input-area h2 {
        font-size: 60px;
        margin: 10px 0;
    }
    
    .switch-buttons {
        margin-top: 60px;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }
    
    .main-page, .submit-page {
        padding: 15px;
    }
    
    .main-header {
        font-size: 24px;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }
    
    .main-header > div:last-child {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 5px;
    }
    
    .finish-button {
        font-size: 48px;
        border: 6px solid #555511;
        padding: 0 8px;
    }
    
    .header-button {
        font-size: 24px;
        border: 3px solid #113311;
        padding: 8px 12px;
        margin: 2px;
        /* 触摸友好的交互 */
        -webkit-tap-highlight-color: rgba(147, 192, 147, 0.3);
        touch-action: manipulation;
        min-height: 44px; /* iOS推荐的最小触摸目标 */
    }
    
    .welcome-page h1 {
        padding: 30px 20px;
        font-size: 60px;
    }
    
    .welcome-page h2 {
        font-size: 60px;
    }
    
    .welcome-page button {
        font-size: 60px;
        padding: 12px;
        margin: 15px;
        border: 6px solid #113311;
        /* 触摸友好的交互 */
        -webkit-tap-highlight-color: rgba(147, 192, 147, 0.3);
        touch-action: manipulation;
        min-height: 60px;
    }
    
    .welcome-page p.s {
        font-size: 48px;
    }
    
    .welcome-page p.b {
        font-size: 72px;
    }
    
    .delete-save-dialog > div {
        max-width: 90vw;
        padding: 30px 20px;
    }
    
    .delete-save-dialog h2 {
        font-size: 48px;
        margin: 0 0 20px 0;
    }
    
    .delete-save-dialog p {
        font-size: 36px;
        margin: 10px 0;
    }
    
    .delete-save-dialog button {
        font-size: 32px;
        padding: 10px 20px;
        margin: 15px 10px;
        border: 5px solid #113311;
    }
    
    .loading-content {
        padding: 40px 20px;
        max-width: 90vw;
    }
    
    .loading-content h2 {
        font-size: 48px;
    }
}

/* 响应式设计 - 小手机设备 */
@media (max-width: 480px) {
    .triddles-container {
        font-size: 48px;
        padding: 8px;
        padding-bottom: 20px;
        margin-bottom: 20px;
    }
    
    .triddle-input {
        width: calc(100vw - 32px);
        max-width: 280px;
        height: 80px;
        font-size: 48px;
        border: 4px solid #113311;
        padding: 4px;
        margin-top: 10px;
    }
    
    .triddle-item {
        height: 80px;
        width: 80px;
        border: 4px solid #113311;
        border-radius: 6px;
        /* 触摸友好的交互 */
        -webkit-tap-highlight-color: rgba(147, 192, 147, 0.3);
        touch-action: manipulation;
    }
    
    .triddles-group {
        gap: 6px;
        margin-bottom: 6px;
    }
    
    .triddle-gram {
        font-size: 18px;
    }
    
    .triddle-answer {
        font-size: 10px;
    }
    
    .submit-result {
        font-size: 20px;
    }
    
    .submit-extra {
        font-size: 20px;
    }
    
    .input-area {
        margin-top: 40px;
    }
    
    .input-area h2 {
        font-size: 48px;
        margin: 8px 0;
    }
    
    .switch-buttons {
        margin-top: 40px;
    }
    
    .main-page, .submit-page {
        padding: 10px;
    }
    
    .main-header {
        font-size: 20px;
    }
    
    .finish-button {
        font-size: 36px;
        border: 4px solid #555511;
        padding: 0 6px;
    }
    
    .header-button {
        font-size: 20px;
        border: 2px solid #113311;
        padding: 6px 10px;
        margin: 1px;
        /* 触摸友好的交互 */
        -webkit-tap-highlight-color: rgba(147, 192, 147, 0.3);
        touch-action: manipulation;
        min-height: 40px;
    }
    
    .welcome-page h1 {
        padding: 20px 15px;
        font-size: 48px;
    }
    
    .welcome-page h2 {
        font-size: 48px;
    }
    
    .welcome-page button {
        font-size: 48px;
        padding: 10px;
        margin: 10px;
        border: 4px solid #113311;
        /* 触摸友好的交互 */
        -webkit-tap-highlight-color: rgba(147, 192, 147, 0.3);
        touch-action: manipulation;
        min-height: 50px;
    }
    
    .welcome-page p.s {
        font-size: 36px;
    }
    
    .welcome-page p.b {
        font-size: 56px;
    }
    
    .delete-save-dialog > div {
        max-width: 95vw;
        padding: 20px 15px;
    }
    
    .delete-save-dialog h2 {
        font-size: 36px;
        margin: 0 0 15px 0;
    }
    
    .delete-save-dialog p {
        font-size: 28px;
        margin: 8px 0;
    }
    
    .delete-save-dialog button {
        font-size: 24px;
        padding: 8px 16px;
        margin: 10px 5px;
        border: 4px solid #113311;
    }
    
    .loading-content {
        padding: 30px 15px;
        max-width: 95vw;
    }
    
    .loading-content h2 {
        font-size: 36px;
    }
}

</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";return{setup(){const l=e.inject("backend"),a=e.inject("ysync"),t=e.ref(!1),u=e.ref(0),n=e.ref(!1),r=e.ref([]),s=e.ref([]),i=e.ref(""),v=e.ref(!1),d=e.ref([]),o=e.ref(null),c=e.ref(null),f=e.ref(!1),g=e.ref(0),p=a.yDoc.getMap("c16-triddles");for(let e=0;e<144;e++){let l=`a-${e}`;p.has(l)&&(r.value[e]=p.get(l))}if(p.has("triddles")){let e=p.get("triddles");s.value=JSON.parse(e)}if(p.has("completedCount")&&(i.value=p.get("completedCount")),p.has("finished")&&(v.value=1===p.get("finished")),p.has("next")){let e=p.get("next");d.value=JSON.parse(e)}else d.value=[];p.observe(((e,l)=>{e.keysChanged&&e.keysChanged.forEach((e=>{if("triddles"===e){let l=p.get(e);s.value=JSON.parse(l)}else if("completedCount"===e)i.value=p.get(e);else if("finished"===e)v.value=1===p.get(e);else if("next"===e){let l=p.get(e);d.value=JSON.parse(l)}else if(e.startsWith("a-")){let l=p.get(e),a=parseInt(e.split("-")[1]);void 0===l&&(l=""),r.value[a]=l}}))}));const h=e.ref(0),w=e.ref(0),y=e.ref(0),m=async(l,a,t,n=!0)=>{n&&1===u.value&&(g.value=window.scrollY||document.documentElement.scrollTop),o.value=l,h.value=a,w.value=t,y.value=s.value[t].l.length,u.value=3,f.value=!1,await e.nextTick(),c.value&&c.value.focus()},x=async()=>{await e.nextTick(),window.scrollTo(0,g.value)},S=async()=>{u.value=1,await x()},T=async()=>{let e=s.value[w.value].l[h.value+1];e?await m(e,h.value+1,w.value,!1):await S()},C=async()=>{var e;t.value=!0;let a=await l("c16-triddles",{answers:r.value});if(s.value=a.g,p.set("triddles",JSON.stringify(a.g)),i.value=a.c,p.set("completedCount",a.c),v.value=1===a.f,p.set("finished",a.f),d.value=a.n,p.set("next",JSON.stringify(a.n)),3===u.value){let l=null==(e=a.g[w.value])?void 0:e.l[h.value];o?o.value=l:u.value=1}t.value=!1};return e.onMounted((()=>{C()})),{currentPage:u,showDialog:n,answers:r,triddles:s,completedCount:i,finished:v,next:d,currentIndexOfGroup:h,currentGroupIndex:w,currentGroupLength:y,currentTriddle:o,loading:t,triddleInput:c,hasModifiedCompleted:f,savedScrollPosition:g,deleteSave:async()=>{for(let e=0;e<144;e++){let l=`a-${e}`;p.has(l)&&p.delete(l),r.value=[]}await C(),n.value=!1},getAnswer:e=>{let l=r.value[e];return l?l.length<=5?l:l.slice(0,3)+"..."+l.slice(-1):""},showSubmitPage:m,updateInput:(e,l)=>{var a;if(void 0!==(null==(a=null==e?void 0:e.target)?void 0:a.value)){let a=e.target.value,t=`a-${l}`;p.set(t,a),o.value&&o.value.i===l&&1===o.value.c&&(f.value=!0)}},prevTriddle:async()=>{let e=s.value[w.value].l[h.value-1];e&&await m(e,h.value-1,w.value,!1)},nextTriddle:T,handleEnterKey:async()=>{1!==o.value.c?await C():f.value?(await C(),f.value=!1):T()},restoreScrollPosition:x,returnToTriddlesList:S}}}}(Vue);


export default __vue_puzzle_component__;
</script>
