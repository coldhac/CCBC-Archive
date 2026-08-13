
<!-- QianPuzzle Puzzle -->
<template>

    <div class="qian-puzzle">
        <!-- 未解锁状态 -->
        <div v-if="stage === 1" class="not-unlocked">
            <h2>请先通过《四方谜》</h2>
        </div>

        <!-- 谜题矩阵 -->
        <div v-else-if="stage === 2" class="puzzle-matrix">
            <div>
                <ul>
                    <li>如果需要确定文本版本，请提交所需文本的标题。</li>
                    <li>排序相同时使用原文顺序。</li>
                </ul>
            </div>
            <!-- 列号行 -->
            <div
                ref="columnHeaderRef"
                class="column-header"
                :class="{ fixed: isHeaderFixed }"
            >
                <div class="column-numbers">
                    <div
                        v-for="colNum in cols"
                        :key="`col-${colNum}`"
                        class="column-number"
                    >
                        {{ numberToChinese(11-colNum) }}
                    </div>
                </div>
                <div class="row-number-placeholder"></div>
            </div>

            <!-- 矩阵行 -->
            <div v-for="rowNum in rows" :key="rowNum" class="matrix-row">

                <!-- 该行的按钮 -->
                <div class="row-buttons">
                    <button
                        v-for="colNum in cols"
                        :key="`${rowNum}-${colNum}`"
                        class="puzzle-button"
                        :class="getButtonClass(rowNum, colNum)"
                        :disabled="!getPuzzleByPosition(rowNum, colNum)"
                        @click="openPuzzleModal(rowNum, colNum)"
                    >
                        <img
                            v-if="getPuzzleByPosition(rowNum, colNum) && !getPuzzleByPosition(rowNum, colNum).is_finished"
                            :src="getPuzzleByPosition(rowNum, colNum).image"
                            class="puzzle-image"
                            alt="谜题图片"
                        />
                        <span
                            v-else-if="getPuzzleByPosition(rowNum, colNum) && getPuzzleByPosition(rowNum, colNum).is_finished"
                            class="puzzle-answer"
                        >
                            {{ getPuzzleByPosition(rowNum, colNum).answer }}
                        </span>
                    </button>
                </div>

                <!-- 行号 -->
                <div class="row-number">{{ numberToChinese(rowNum) }}</div>
            </div>
        </div>

        <!-- 题目详情弹窗 -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>第{{ numberToChinese(11-selectedPuzzle.col) }}列第{{ numberToChinese(selectedPuzzle.row) }}字</h3>
                    <button class="close-btn" @click="closeModal">×</button>
                </div>

                <div class="modal-body">
                    <p><strong>作者：</strong>{{ selectedPuzzle.author }}</p>
                    <p class="flavor-text">{{ selectedPuzzle.flavor_text }}</p>

                    <div class="puzzle-image-container">
                        <img
                            :src="selectedPuzzle.image"
                            class="modal-puzzle-image"
                            @click="showLargeImage = true"
                            alt="谜题图片"
                        />
                    </div>

                    <!-- 解析 -->
                    <div v-if="showAnalysis" class="analysis-section">
                        <details>
                            <summary class="analysis-title">解析</summary>
                            <div>{{ selectedPuzzle.analysis ?? '暂无' }}</div>
                        </details>
                    </div>

                    <!-- 已回答正确 -->
                    <div v-if="selectedPuzzle.is_finished" class="finished-section">
                        <p><strong>答案：</strong>{{ selectedPuzzle.answer }}</p>
                    </div>

                    <!-- 未回答正确 -->
                    <div v-else class="unfinished-section">
                        <div class="count-section">
                            <p>提交次数：{{ selectedPuzzle.count }} / {{ selectedPuzzle.max_count }}</p>

                            <button
                                class="add-count-btn"
                                @click="showConfirmDialog"
                            >
                                增加总次数
                            </button>
                        </div>

                        <div class="answer-section">
                            <input
                                v-model="userAnswer"
                                type="text"
                                placeholder="请输入答案"
                                class="answer-input-d"
                                @keyup.enter="submitAnswer"
                            />
                            <button
                                class="submit-btn"
                                @click="submitAnswer"
                                :disabled="!userAnswer.trim()"
                            >
                                提交
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 确认对话框 -->
        <div v-if="showConfirm" class="modal-overlay">
            <div class="confirm-modal-content" @click.stop>
                <div class="confirm-header">
                    <h3>确认操作</h3>
                </div>

                <div class="confirm-body">
                    <p>{{ confirmMessage }}</p>
                </div>

                <div class="confirm-footer">
                    <button class="cancel-btn" @click="cancelConfirm">取消</button>
                    <button class="confirm-btn" @click="acceptConfirm">确认</button>
                </div>
            </div>
        </div>

        <!-- 大图查看弹窗 -->
        <div v-if="showLargeImage" class="image-modal-overlay" @click="showLargeImage = false">
            <div class="image-modal-content" @click.stop>
                <img :src="selectedPuzzle.image" class="large-image" alt="谜题大图" />
                <button class="close-btn" @click="showLargeImage = false">×</button>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
            加载中...
        </div>
    </div>

</template>

<style>

.qian-puzzle {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.not-unlocked {
    text-align: center;
    padding: 50px;
}

.not-unlocked h2 {
    color: #666;
    font-size: 24px;
}

.puzzle-matrix {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

/* 列号行样式 */
.column-header {
    display: flex;
    align-items: center;
    gap: 5px;
    background: white;
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 10px 0;
    margin-bottom: 5px;
    border-bottom: 1px solid #e0e0e0;
    transition: all 0.2s linear;
}

.column-header.fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    padding-left: 20px;
    padding-right: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.row-number-placeholder {
    width: 80px;
    text-align: center;
}

.column-numbers {
    display: flex;
    gap: 10px;
}

.column-number {
    width: 60px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    white-space: nowrap;
}

.matrix-row {
    display: flex;
    align-items: center;
    gap: 5px;
}

.row-number {
    width: 80px;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    white-space: nowrap;
}

.row-buttons {
    display: flex;
    gap: 10px;
}

.puzzle-button {
    width: 60px;
    height: 60px;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    background-color: white;
}

.puzzle-button:hover:not(:disabled) {
    border-color: #007bff;
    transform: translateY(-2px);
}

.puzzle-button:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.6;
}

.puzzle-button.finished {
    background-color: #28a745;
    color: white;
    font-weight: bold;
    font-size: 18px;
}

.puzzle-button.finished-blue {
    background-color: #0070c0;
    color: white;
    font-weight: bold;
    font-size: 18px;
}

.puzzle-button.finished-red {
    background-color: #ff0000;
    color: white;
    font-weight: bold;
    font-size: 18px;
}

.puzzle-image {
    max-width: 40px;
    max-height: 40px;
    object-fit: contain;
}

.puzzle-answer {
    font-size: 18px;
    font-weight: bold;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
}

.close-btn:hover {
    color: #000;
}

.modal-body p {
    margin: 10px 0;
}

.flavor-text {
    font-style: italic;
    color: #666;
    margin: 15px 0;
}

.puzzle-image-container {
    text-align: center;
    margin: 20px 0;
}

.modal-puzzle-image {
    max-width: 200px;
    max-height: 200px;
    cursor: pointer;
    /*border-radius: 8px;*/
    transition: transform 0.3s ease;
}

.modal-puzzle-image:hover {
    transform: scale(1.05);
}

.analysis-section {
    border-left: 5px solid var(--el-color-warning);
    background: rgba(var(--el-color-warning-rgb),.1);
    max-width: 100%;
    padding: 12px 26px 12px 12px;
    border-radius: 4px;
    color: rgba(var(--pz-text-color),.87);
    margin: 20px 0;
}

.analysis-title {
    font-weight: bold;
}

.finished-section {
    background: #d4edda;
    padding: 15px;
    border-radius: 8px;
    margin-top: 20px;
}

.unfinished-section {
    margin-top: 20px;
}

.count-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.add-count-btn {
    background: #fcd35a;
    color: #000;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    margin: 10px 0;
    font-size: 14px;
}

.add-count-btn:hover {
    background: #e0a800;
}

.answer-section {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.answer-input-d {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 16px;
}

.submit-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
}

.submit-btn:hover:not(:disabled) {
    background: #0056b3;
}

.submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

/* 确认对话框样式 */
.confirm-modal-content {
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 400px;
    width: 90%;
    position: relative;
}

.confirm-header {
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.confirm-header h3 {
    margin: 0;
    color: #333;
    text-align: center;
}

.confirm-body {
    margin-bottom: 20px;
    text-align: center;
}

.confirm-body p {
    margin: 0;
    color: #666;
    line-height: 1.6;
}

.confirm-footer {
    display: flex;
    justify-content: center;
    gap: 15px;
}

.cancel-btn, .confirm-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    min-width: 80px;
}

.cancel-btn {
    background: #f8f9fa;
    color: #666;
    border: 1px solid #ddd;
}

.cancel-btn:hover {
    background: #e9ecef;
}

.confirm-btn {
    background: #dc3545;
    color: white;
}

.confirm-btn:hover {
    background: #c82333;
}

.image-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
}

.image-modal-content {
    position: absolute;
    top: 30px;
    max-width: 100%;
    height: calc(100vh - 110px);
}

.large-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.loading {
    text-align: center;
    padding: 50px;
    font-size: 18px;
    color: #666;
}

</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";const o="primary",t="info",n="warning",r="error",a="success",l="ccxc-message-container";function s(){let e=document.getElementById(l);return e||(e=document.createElement("div"),e.id=l,e.style.cssText="\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            z-index: 10000;\n            pointer-events: none;\n        ",document.body.appendChild(e)),e}function i(e,l=t,i=3e3){const c=document.createElement("div"),u={[o]:{backgroundColor:"#722ed1",color:"#fff"},[t]:{backgroundColor:"#1890ff",color:"#fff"},[n]:{backgroundColor:"#faad14",color:"#fff"},[r]:{backgroundColor:"#f5222d",color:"#fff"},[a]:{backgroundColor:"#52c41a",color:"#fff"}},d=u[l]||u[t];c.style.cssText=`\n        background-color: ${d.backgroundColor};\n        color: ${d.color};\n        padding: 12px 20px;\n        border-radius: 6px;\n        margin-bottom: 10px;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n        font-size: 14px;\n        line-height: 1.5;\n        max-width: 300px;\n        word-wrap: break-word;\n        pointer-events: auto;\n        opacity: 0;\n        transform: translateX(100%);\n        transition: all 0.3s ease-in-out;\n    `,c.textContent=e;const f=s();return f.appendChild(c),setTimeout((()=>{c.style.opacity="1",c.style.transform="translateX(0)"}),10),setTimeout((()=>{c.style.opacity="0",c.style.transform="translateX(100%)",setTimeout((()=>{c.parentNode&&c.parentNode.removeChild(c),0===f.children.length&&f.parentNode&&f.parentNode.removeChild(f)}),300)}),i),c}const c={info:(e,o=3e3)=>i(e,t,o),warning:(e,o=4e3)=>i(e,n,o),error:(e,o=5e3)=>i(e,r,o),success:(e,o=3e3)=>i(e,a,o),primary:(e,t=3e3)=>i(e,o,t),toast(e){const{message:l,type:s="info",duration:c=3e3}=e;return i(l,{primary:o,info:t,warning:n,error:r,success:a}[s]||t,c)},notify(e){const{title:l,message:i,type:c="info",duration:u=4e3}=e;return function(e,l,i=t,c=4e3){const u=document.createElement("div"),d={[o]:{backgroundColor:"#722ed1",color:"#fff"},[t]:{backgroundColor:"#1890ff",color:"#fff"},[n]:{backgroundColor:"#faad14",color:"#fff"},[r]:{backgroundColor:"#f5222d",color:"#fff"},[a]:{backgroundColor:"#52c41a",color:"#fff"}},f=d[i]||d[t];u.style.cssText=`\n        background-color: ${f.backgroundColor};\n        color: ${f.color};\n        padding: 16px 20px;\n        border-radius: 6px;\n        margin-bottom: 10px;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n        font-size: 14px;\n        line-height: 1.5;\n        max-width: 350px;\n        word-wrap: break-word;\n        pointer-events: auto;\n        opacity: 0;\n        transform: translateX(100%);\n        transition: all 0.3s ease-in-out;\n    `;const p=document.createElement("div");p.style.cssText="\n        font-weight: bold;\n        margin-bottom: 6px;\n        font-size: 15px;\n    ",p.textContent=e;const v=document.createElement("div");v.textContent=l,u.appendChild(p),u.appendChild(v);const m=s();return m.appendChild(u),setTimeout((()=>{u.style.opacity="1",u.style.transform="translateX(0)"}),10),setTimeout((()=>{u.style.opacity="0",u.style.transform="translateX(100%)",setTimeout((()=>{u.parentNode&&u.parentNode.removeChild(u),0===m.children.length&&m.parentNode&&m.parentNode.removeChild(m)}),300)}),c),u}(l,i,{primary:o,info:t,warning:n,error:r,success:a}[c]||t,u)}};"undefined"!=typeof window&&(window.message=c);var u="object"==typeof global&&global&&global.Object===Object&&global,d="object"==typeof self&&self&&self.Object===Object&&self,f=(u||d||Function("return this")()).Symbol,p=Object.prototype,v=p.hasOwnProperty,m=p.toString,g=f?f.toStringTag:void 0;var w=Object.prototype.toString;var y=f?f.toStringTag:void 0;function b(e){return null==e?void 0===e?"[object Undefined]":"[object Null]":y&&y in Object(e)?function(e){var o=v.call(e,g),t=e[g];try{e[g]=void 0;var n=!0}catch(a){}var r=m.call(e);return n&&(o?e[g]=t:delete e[g]),r}(e):function(e){return w.call(e)}(e)}return{setup(){const o=e.inject("api"),t=e.inject("ysync").yDoc.getMap("c16-qian"),n=e.ref(!0),r=e.ref(0),a=e.ref(0),l=e.ref(0),s=e.ref([]),i=e.ref(0);if(t.has("last_answer_time")){let e=t.get("last_answer_time");i.value=parseInt(e)}const u=e.ref(!1),d=e.ref(!1),f=e.ref(null),p=e.ref(""),v=e.ref(!1),m=e.ref(""),g=e.ref(null),w=e.ref(null),y=e.ref(!1);let h=0;const x=e.ref(!1),C=e=>{if(0===e)return"零";const o=["","十","百","千","万","十万","百万","千万"],t=["零","一","二","三","四","五","六","七","八","九"];let n=e.toString(),r="",a=n.length;if(a>4){let o=Math.floor(e/1e4);r+=C(o)+"万",n=(e%=1e4).toString(),a=n.length,e>0&&e<1e3&&(r+="零")}let l=!1;for(let s=0;s<a;s++){let e=parseInt(n[s]),i=a-s-1;0===e?l=!0:(l&&""!==r&&(r+="零",l=!1),1===e&&1===i&&""===r?r+="十":(r+=t[e],i>0&&(r+=o[i])))}return r},k=()=>{if(!w.value)return;const e=window.pageYOffset||document.documentElement.scrollTop;y.value=e>h},_=()=>{w.value&&(h=w.value.offsetTop)},T=async()=>{try{const{show_analysis:t}=await o("/play/get-main-info",{});("number"==typeof(e=t)||function(e){return null!=e&&"object"==typeof e}(e)&&"[object Number]"==b(e))&&(x.value=!!t)}catch(t){console.error("获取主要信息失败:",t),c.error("获取主要信息失败，请重试")}var e},j=async()=>{try{n.value=!0;const e=await o("/play/c16extra/get-qian-grid",{});a.value=e.rows,l.value=e.cols,s.value=e.grid,r.value=e.stage,setTimeout(_,100)}catch(e){console.error("获取谜题数据失败:",e),c.error("获取谜题数据失败，请重试")}finally{n.value=!1}},z=(e,o)=>s.value.find((t=>t.row===e&&t.col===o)),E=()=>{u.value=!1,f.value=null,p.value=""},N=async()=>{try{await o("/play/c16extra/add-qian-max-count",{row:f.value.row,col:f.value.col}),await j();const e=z(f.value.row,f.value.col);e&&(f.value=e),c.info("增加次数成功！")}catch(e){console.error("增加次数失败:",e),c.error("增加次数失败，请重试")}};return e.onMounted((()=>{T(),j(),window.addEventListener("scroll",k,{passive:!0}),window.addEventListener("resize",_)})),e.onUnmounted((()=>{window.removeEventListener("scroll",k),window.removeEventListener("resize",_)})),t.observe(((e,o)=>{e.keysChanged&&e.keysChanged.forEach((e=>{if("last_answer_time"===e){let o=t.get(e);o>i.value&&(i.value=parseInt(o),j())}}))})),{loading:n,stage:r,rows:a,cols:l,grid:s,showModal:u,showLargeImage:d,selectedPuzzle:f,userAnswer:p,showConfirm:v,confirmMessage:m,columnHeaderRef:w,isHeaderFixed:y,showAnalysis:x,numberToChinese:C,getPuzzleByPosition:z,getButtonClass:(e,o)=>{const t=z(e,o);if(!t)return"disabled";const n=[[3,4],[23,9],[41,3],[45,7],[50,6],[50,8],[83,1],[87,0],[90,5],[97,2]],r=[[4,8],[8,4],[19,5],[22,3],[36,1],[49,7],[78,6],[83,0],[90,2],[92,9]];return t.is_finished?n.some((([t,n])=>t+1===e&&n+1===o))?"finished-red":r.some((([t,n])=>t+1===e&&n+1===o))?"finished-blue":"finished":""},openPuzzleModal:(e,o)=>{const t=z(e,o);t&&(f.value=t,p.value="",u.value=!0)},closeModal:E,showConfirmDialog:()=>{m.value="将扣除 10000 信用点以增加 10 次额外答题机会，确认吗？",g.value=N,v.value=!0},acceptConfirm:()=>{v.value=!1,g.value&&g.value(),g.value=null},cancelConfirm:()=>{v.value=!1,g.value=null},submitAnswer:async()=>{if(p.value.trim())try{const e=(await o("/play/c16extra/check-qian-answer",{row:f.value.row,col:f.value.col,answer:p.value.trim()})).answer_status;if(1===e?(E(),i.value=(new Date).getTime(),t.set("last_answer_time",i.value.toString()),await j(),c.info("回答正确！")):2===e?(c.error("回答错误，请重试"),p.value=""):3===e?(c.warning("回答错误次数超限"),p.value=""):4===e&&(E(),i.value=(new Date).getTime(),t.set("last_answer_time",i.value.toString()),await j(),c.info("本题已通过，您可返回完成其他题目，也可继续完成本题剩余内容。")),2===e||3===e){await j();const e=z(f.value.row,f.value.col);e&&(f.value=e)}}catch(e){console.error("提交答案失败:",e),c.error("提交答案失败，请重试")}}}}}}(Vue);


export default __vue_puzzle_component__;
</script>
