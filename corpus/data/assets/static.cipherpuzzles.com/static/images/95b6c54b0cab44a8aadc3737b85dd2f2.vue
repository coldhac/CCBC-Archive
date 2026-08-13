
<!-- FinalMeta Puzzle -->
<template>

    <div class="example-container">
        <div class="example-block">
            <div class="block-content">
                <div class="character">
                    例
                </div>
                <div class="status-lights">
                    <div class="light example-pending-light"></div>
                    <div class="example-text">8</div>
                    <div class="example-text">li</div>
                    <div class="example-text">4</div>
                </div>
            </div>
        </div>
    </div>
    <div class="puzzle-container">
        <div class="main-board-container">
            <div class="puzzle-board">
                <div class="puzzle-grid">
                    <div 
                        v-for="(item, index) in 16" 
                        :key="index"
                        class="puzzle-block"
                        :class="{ 'disabled': data.running, 'selected': selectedIndex === index }"
                        :draggable="!data.running"
                        @dragstart="handleDragStart($event, index)"
                        @dragover="handleDragOver"
                        @drop="handleDrop($event, index)"
                        @touchstart="handleTouchStart($event, index)"
                        @touchend="handleTouchEnd($event, index)"
                    >
                        <div class="block-content">
                            <div class="character">
                                {{ answerBank ? answerBank[data.answer[index]] : '' }}
                            </div>
                            <div class="status-lights">
                                <div 
                                    v-for="lightIndex in 4" 
                                    :key="lightIndex"
                                    class="light"
                                    :class="getLightClass(index, lightIndex - 1)"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div v-if="data.finalResult" class="completion-message-container">
            <div class="completion-message">
                {{ data.message }}
            </div>
        </div>
        
        <div v-show="showControlButtons" class="control-buttons">
            <button 
                @click="submitAnswer" 
                class="btn btn-primary"
            >
                判定
            </button>
            <button 
                @click="resetPuzzle" 
                class="btn btn-secondary"
            >
                重置
            </button>
            <button 
                @click="randomizePuzzle" 
                class="btn btn-secondary"
            >
                随机
            </button>
        </div>
        
        <div v-if="data.running" class="loading-overlay">
            <div class="loading-spinner">处理中...</div>
        </div>


    </div>


</template>

<style>


.example-container {
    display: flex;
    justify-content: center;
    align-items: flex-end;
}

.example-block {
    background: linear-gradient(145deg, #2C3E50, #34495E);
    border: 2px solid #1ABC9C;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
    width: 120px;
    height: 120px;
    box-shadow: 
        inset 2px 2px 8px rgba(52, 152, 219, 0.3),
        inset -2px -2px 8px rgba(0, 0, 0, 0.6),
        0 4px 12px rgba(26, 188, 156, 0.2),
        0 0 20px rgba(52, 152, 219, 0.1);
}

.example-block::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(26, 188, 156, 0.1), transparent);
    transform: rotate(45deg);
    pointer-events: none;
}

.example-black-light {
    background: radial-gradient(circle, #2C3E50, #1B2631);
    border: 1px solid #566573;
    box-shadow: 
        0 0 5px rgba(44, 62, 80, 0.8),
        inset 0 1px 2px rgba(255, 255, 255, 0.1);
}

.example-text {
    width: clamp(8px, 1.5vw, 12px);
    height: clamp(8px, 1.5vw, 12px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: #E8F4FD;
    text-shadow: 0 0 3px rgba(26, 188, 156, 0.5);
}

.puzzle-container {
    height: 916px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    box-sizing: border-box;
}

.main-board-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.puzzle-board {
    width: min(600px, 60vw);
    height: min(600px, 60vw);
    display: flex;
    align-items: center;
    justify-content: center;
}

.puzzle-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 5px;
    width: 100%;
    height: 100%;
    max-width: 550px;
    max-height: 550px;
}

.puzzle-block {
    background: linear-gradient(145deg, #2C3E50, #34495E);
    border: 2px solid #1ABC9C;
    border-radius: 8px;
    cursor: grab;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 
        inset 2px 2px 8px rgba(52, 152, 219, 0.3),
        inset -2px -2px 8px rgba(0, 0, 0, 0.6),
        0 4px 12px rgba(26, 188, 156, 0.2),
        0 0 20px rgba(52, 152, 219, 0.1);
    position: relative;
    overflow: hidden;
    /* 移动端优化 */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

.puzzle-block::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(26, 188, 156, 0.1), transparent);
    transform: rotate(45deg);
    pointer-events: none;
}

.puzzle-block:hover:not(.disabled) {
    transform: translateY(-2px);
    border-color: #3ECDFF;
    box-shadow: 
        inset 2px 2px 10px rgba(62, 205, 255, 0.4),
        inset -2px -2px 10px rgba(0, 0, 0, 0.7),
        0 8px 16px rgba(26, 188, 156, 0.3),
        0 0 30px rgba(62, 205, 255, 0.2);
}

.puzzle-block:active:not(.disabled) {
    cursor: grabbing;
    transform: translateY(0);
}

.puzzle-block.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    filter: grayscale(0.5);
    border-color: #566573;
    box-shadow: 
        inset 2px 2px 8px rgba(86, 101, 115, 0.3),
        inset -2px -2px 8px rgba(0, 0, 0, 0.6),
        0 2px 6px rgba(86, 101, 115, 0.2);
}

.block-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    box-sizing: border-box;
}

.character {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: bold;
    color: #E8F4FD;
    text-shadow: 
        0 0 10px rgba(26, 188, 156, 0.5),
        2px 2px 4px rgba(0, 0, 0, 0.8),
        0 0 5px rgba(52, 152, 219, 0.3);
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.status-lights {
    display: flex;
    gap: 16px;
    margin-top: auto;
}

.light {
    width: clamp(8px, 1.5vw, 12px);
    height: clamp(8px, 1.5vw, 12px);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
}

.light.error {
    background: radial-gradient(circle, #FF073A, #C0392B);
    box-shadow: 
        0 0 8px rgba(255, 7, 58, 0.9),
        0 0 15px rgba(255, 7, 58, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.light.correct {
    background: radial-gradient(circle, #00FF88, #27AE60);
    box-shadow: 
        0 0 8px rgba(0, 255, 136, 0.9),
        0 0 15px rgba(0, 255, 136, 0.4),
        inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.light.pending {
    background: radial-gradient(circle, #5DADE2, #2980B9);
    box-shadow: 
        0 0 5px rgba(93, 173, 226, 0.6),
        inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

.light.invalid {
    background: transparent;
    border: none;
}

.completion-message-container {
    display: flex;
    justify-content: center;
    z-index: 1;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.completion-message {
    margin-top: 2rem;
    width: min(600px, 100%);
    background: rgba(0, 0, 0, 0.8);
    color: #ccbc16;
    border-radius: 8px;
    font-size: 1.2rem;
    line-height: 3rem;
    font-weight: bold;
    text-align: center;
    border: 2px solid #ccbc16;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
    padding-left: 1rem;
    padding-right: 1rem;
}

.control-buttons {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    z-index: 1005;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 80px;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: linear-gradient(145deg, #4CAF50, #45a049);
    color: white;
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover:not(:disabled) {
    background: linear-gradient(145deg, #45a049, #4CAF50);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(76, 175, 80, 0.4);
}

.btn-secondary {
    background: linear-gradient(145deg, #757575, #616161);
    color: white;
    box-shadow: 0 4px 8px rgba(117, 117, 117, 0.3);
}

.btn-secondary:hover:not(:disabled) {
    background: linear-gradient(145deg, #616161, #757575);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(117, 117, 117, 0.4);
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-spinner {
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 2rem 3rem;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: bold;
    border: 2px solid #4CAF50;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .puzzle-container {
        padding: 1rem;
    }
    
    .puzzle-board {
        width: min(600px, 90vw);
        height: min(600px, 90vw);
    }
    
    .control-buttons {
        flex-direction: column;
        align-items: center;
        width: 100%;
        max-width: 300px;
    }
    
    .btn {
        width: 100%;
    }
    
    .example-container {
        top: 20px;
    }
    
    .example-block {
        width: 100px;
        height: 100px;
    }
    
    .example-text {
        font-size: 10px;
    }
}

@media (max-width: 480px) {
    .puzzle-board {
        width: min(400px, 95vw);
        height: min(400px, 95vw);
    }
    
    .puzzle-grid {
        gap: 4px;
    }
    
    .example-container {
        top: 15px;
    }
    
    .example-block {
        width: 80px;
        height: 80px;
    }
    
    .example-text {
        font-size: 10px;
    }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
    .puzzle-block {
        cursor: pointer;
    }
    
    .puzzle-block:hover {
        /* 移除悬停效果 */
        transform: none;
        border-color: #1ABC9C;
        box-shadow: 
            inset 2px 2px 8px rgba(52, 152, 219, 0.3),
            inset -2px -2px 8px rgba(0, 0, 0, 0.6),
            0 4px 12px rgba(26, 188, 156, 0.2),
            0 0 20px rgba(52, 152, 219, 0.1);
    }
    
    .puzzle-block.selected {
        border-color: #FFD700;
        background: linear-gradient(145deg, #3A4F66, #455A77);
        box-shadow: 
            inset 2px 2px 10px rgba(255, 215, 0, 0.4),
            inset -2px -2px 10px rgba(0, 0, 0, 0.7),
            0 0 20px rgba(255, 215, 0, 0.6),
            0 0 30px rgba(255, 215, 0, 0.3),
            0 4px 15px rgba(255, 215, 0, 0.2);
        transform: scale(1.05);
        animation: pulse-selected 2s ease-in-out infinite;
    }

    @keyframes pulse-selected {
        0%, 100% {
            box-shadow: 
                inset 2px 2px 10px rgba(255, 215, 0, 0.4),
                inset -2px -2px 10px rgba(0, 0, 0, 0.7),
                0 0 20px rgba(255, 215, 0, 0.6),
                0 0 30px rgba(255, 215, 0, 0.3),
                0 4px 15px rgba(255, 215, 0, 0.2);
        }
        50% {
            box-shadow: 
                inset 2px 2px 12px rgba(255, 215, 0, 0.5),
                inset -2px -2px 12px rgba(0, 0, 0, 0.8),
                0 0 25px rgba(255, 215, 0, 0.8),
                0 0 40px rgba(255, 215, 0, 0.5),
                0 4px 20px rgba(255, 215, 0, 0.3);
        }
    }
}

</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";return{setup(){const n=e.inject("backend"),t=e.inject("ysync"),a=e.ref(""),s=e.ref(null),r=e.ref(!1),u=e.ref(null),l=e.ref(0);e.ref("ontouchstart"in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0);const o=e.reactive({answer:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],status:["","","","","","","","","","","","","","","",""],running:0,finalResult:!1,message:""}),i=t.yDoc.getMap("c16-finalmeta");if(i.has("answer")){let e=i.get("answer");o.answer=JSON.parse(e)}if(i.has("status")){let e=i.get("status");o.status=JSON.parse(e)}i.has("running")&&(o.running=i.get("running")),i.has("finalResult")&&(o.finalResult=i.get("finalResult")),i.has("message")&&(o.message=i.get("message")),i.observe(((e,n)=>{e.keysChanged&&e.keysChanged.forEach((e=>{if("answer"===e){let n=i.get(e);o.answer=JSON.parse(n)}if("status"===e){let n=i.get(e);o.status=JSON.parse(n)}"running"===e&&(o.running=i.get(e)),"finalResult"===e&&(o.finalResult=i.get(e)),"message"===e&&(o.message=i.get(e))}))})),e.onMounted((()=>{g(),window.addEventListener("keydown",f)})),e.onBeforeUnmount((()=>{window.removeEventListener("keydown",f)}));const g=async()=>{const e=await n("c16-finalmeta",{type:1});a.value=e.data},f=e=>{e.ctrlKey&&"m"===e.key.toLowerCase()&&(e.preventDefault(),r.value=!r.value)},d=async()=>{o.running=1,i.set("running",o.running),i.set("answer",JSON.stringify(o.answer));let e="";for(let n=0;n<o.answer.length;n++)e+=a.value[o.answer[n]];const t=await n("c16-finalmeta",{type:2,answer:e});o.finalResult=t.result,o.status=t.status,o.message=t.message,i.set("finalResult",o.finalResult),i.set("status",JSON.stringify(o.status)),i.set("message",o.message),o.running=0,i.set("running",o.running)};return{answerBank:a,data:o,selectedIndex:u,showControlButtons:r,submitAnswer:d,resetPuzzle:()=>{o.answer=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],d()},randomizePuzzle:()=>{const e=[...Array(16).keys()];for(let n=e.length-1;n>0;n--){const t=Math.floor(Math.random()*(n+1));[e[n],e[t]]=[e[t],e[n]]}o.answer=e,d()},handleDragStart:(e,n)=>{if(o.running)return void e.preventDefault();s.value=n,e.dataTransfer.effectAllowed="move";const t=document.createElement("div"),r=a.value?a.value[o.answer[n]]:"";t.textContent=r,t.style.cssText="\n                font-size: 2.5rem;\n                font-weight: bold;\n                color: #E8F4FD;\n                text-shadow: \n                    0 0 10px rgba(26, 188, 156, 0.5),\n                    2px 2px 4px rgba(0, 0, 0, 0.8),\n                    0 0 5px rgba(52, 152, 219, 0.3);\n                background: transparent;\n                border: none;\n                padding: 10px;\n                pointer-events: none;\n                position: absolute;\n                top: -1000px;\n                left: -1000px;\n                z-index: -1;\n            ",document.body.appendChild(t),e.dataTransfer.setDragImage(t,25,25),setTimeout((()=>{document.body.contains(t)&&document.body.removeChild(t)}),0)},handleDragOver:e=>{e.preventDefault(),e.dataTransfer.dropEffect="move"},handleDrop:(e,n)=>{if(e.preventDefault(),o.running||null===s.value||s.value===n)return;const t=s.value,a=o.answer[t];o.answer[t]=o.answer[n],o.answer[n]=a,s.value=null,d()},handleTouchStart:(e,n)=>{o.running||(e.preventDefault(),l.value=Date.now())},handleTouchEnd:(e,n)=>{if(o.running)return;e.preventDefault();if(Date.now()-l.value>500)return;if(null===u.value)return void(u.value=n);if(u.value===n)return void(u.value=null);const t=u.value,a=n,s=o.answer[t];o.answer[t]=o.answer[a],o.answer[a]=s,u.value=null,d()},getLightClass:(e,n)=>{switch((o.status[e]||"")[n]||"2"){case"0":return"error";case"1":return"correct";case"2":default:return"pending";case"3":return"invalid"}}}}}}(Vue);


export default __vue_puzzle_component__;
</script>
