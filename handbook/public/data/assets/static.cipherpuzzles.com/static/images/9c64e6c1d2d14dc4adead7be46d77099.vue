
<!-- PokerPuzzle Puzzle -->
<template>

  <div class="puzzle-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载题目...</p>
    </div>

    <!-- 整题完成提示 -->
    <div v-if="isFinished && !loading" class="completion-banner">
      <div class="completion-content">
        <div class="completion-icon">🎉</div>
        <h2 class="completion-title">恭喜你完成最终小题，整题已通过！</h2>
      </div>
    </div>

    <!-- 多组扑克牌展示区域 -->
    <div>
      <div 
        v-for="group in puzzleGroups" 
        :key="group.gid"
        class="group-container"
      >
        
        <div class="poker-hand-container">
          <div class="poker-hand">
            <div 
              v-for="(puzzle, index) in group.data" 
              :key="`${group.gid}-${index}`"
              class="poker-card"
              :class="{ 
                'flipped': puzzle.status === 1, 
                'answered': puzzle.finished === 1,
                'hover': hoveredCard === `${group.gid}-${index}`
              }"
              :style="{ 
                zIndex: hoveredCard === `${group.gid}-${index}` ? 999 : index,
                transform: `translateX(${getCardXPosition(group.gid, index)}px) ${hoveredCard === `${group.gid}-${index}` ? 'scale(1.1) translateY(-20px)' : ''}`,
                transition: 'transform 0.3s ease, z-index 0s'
              }"
              @mouseenter="onCardHover(`${group.gid}-${index}`)"
              @mouseleave="onCardLeave"
              @click="onCardClick(group.gid, index)"
            >
              <div class="card-front">
                <img :src="puzzle.card" :alt="`扑克牌 ${group.gid}-${index + 1}`">
                <div v-if="puzzle.finished === 1" class="answer-label">
                  {{ puzzle.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header-h">
          <button class="close-button" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="card-display">
            <img :src="currentPuzzle?.card" :alt="`扑克牌 ${currentPuzzle?.gid}-${currentPuzzle?.pid}`">
          </div>
          <div v-if="currentPuzzle?.finished === 0" class="input-section">
            <div class="error-count-section">
              <div class="error-count-display">
                错误次数：{{ currentPuzzle?.errorCount || 0 }} / 20 次
              </div>
              <button 
                @click="showResetConfirm" 
                class="reset-button"
                :disabled="submitting"
              >
                重置错误计数
              </button>
            </div>
            <div class="input-group">
              <label>请输入答案：</label>
              <input 
                v-model="userAnswer" 
                @keyup.enter="submitAnswer"
                type="text" 
                placeholder="输入你的答案"
                class="answer-input-d"
                ref="answerInput"
                :disabled="submitting"
              >
            </div>
            <div class="button-group">
              <button @click="submitAnswer" class="submit-button" :disabled="submitting">
                {{ submitting ? '提交中...' : '确认答案' }}
              </button>
              <button @click="closeDialog" class="cancel-button">取消</button>
            </div>
          </div>
          <div v-else class="answer-display">
            <div class="answer-content">{{ currentPuzzle?.answer }}</div>
            <div class="button-group">
              <button @click="closeDialog" class="done-button">完成</button>
            </div>
          </div>
          <div v-if="showResult" class="result-message" :class="resultClass">
            {{ resultMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- 重置错误计数确认对话框 -->
    <div v-if="showResetDialog" class="dialog-overlay" @click="closeResetDialog">
      <div class="dialog-content reset-dialog" @click.stop>
        <div class="dialog-header-h">
          <button class="close-button" @click="closeResetDialog">×</button>
        </div>
        <div class="dialog-body">
          <div class="warning-message">
            <p>重置错误计数将消耗 <strong>20000 信用点</strong>。</p>
            <p>确定要继续吗？</p>
          </div>
          <div class="button-group">
            <button @click="resetErrorCount" class="confirm-button" :disabled="resetting">
              {{ resetting ? '处理中...' : '确认重置' }}
            </button>
            <button @click="closeResetDialog" class="cancel-button">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style>

/* 整体容器 */
.puzzle-container {
  background: #dddddd;
  min-height: 100vh;
  padding: 20px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 整题完成提示 */
.completion-banner {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 40px 20px;
  margin: 20px 0 40px 0;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(76, 175, 80, 0.3);
  border: 2px solid #4CAF50;
  animation: celebration 2s ease-in-out;
}

.completion-content {
  max-width: 600px;
  margin: 0 auto;
}

.completion-icon {
  font-size: 48px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.completion-title {
  font-size: 28px;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.completion-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

@keyframes celebration {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* 组容器 */
.group-container {
  margin: 0;
}


/* 扑克牌手牌容器 */
.poker-hand-container {
  display: flex;
  justify-content: center;
  padding: 0 50px;
  overflow-x: auto;
}

.poker-hand {
  position: relative;
  height: 350px;
  width: 100%;
  display: flex;
  align-items: center;
}

/* 扑克牌样式 */
.poker-card {
  position: absolute;
  height: 180px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 7px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.poker-card.hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.poker-card.answered {
  box-shadow: 0 4px 4px rgba(76, 175, 80, 0.9);
}

.card-front {
  width: 100%;
  height: 100%;
  position: relative;
  background: white;
  border-radius: 7px;
}

.card-front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 7px;
}

.answer-label {
  position: absolute;
  bottom: -35px;
  left: 0;
  background: rgba(76, 175, 80, 0.9);
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: bold;
  text-align: left;
  border-radius: 15px;
  white-space: nowrap;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.dialog-content {
  background: white;
  border-radius: 15px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header-h {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.close-button {
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.close-button:hover {
  background-color: #f0f0f0;
}

.dialog-body {
  text-align: center;
}

.card-display {
  margin-bottom: 30px;
}

.card-display img {
  max-width: 100%;
  width: 300px;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.input-section {
  margin-bottom: 20px;
}

.error-count-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.error-count-display {
  font-size: 16px;
  font-weight: 600;
}

.reset-button {
  padding: 8px 16px;
  background: #fde18e;
  color: #212529;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.reset-button:hover:not(:disabled) {
  background: #e0a800;
  transform: translateY(-1px);
}

.reset-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-group {
  margin-bottom: 20px;
}

.answer-display {
  margin-bottom: 20px;
  text-align: center;
}

.answer-content {
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
  background: linear-gradient(135deg, #e8f5e8, #f0f8f0);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
}

.input-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.answer-input-d {
  width: 100%;
  padding: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.answer-input-d:focus {
  border-color: #667eea;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.submit-button, .cancel-button, .done-button, .confirm-button {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.submit-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.cancel-button {
  background: #f8f9fa;
  color: #6c757d;
  border: 2px solid #e9ecef;
}

.cancel-button:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.done-button {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
}

.done-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
}

.confirm-button {
  background: linear-gradient(45deg, #dc3545, #c82333);
  color: white;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
}

.reset-dialog {
  max-width: 400px;
}

.reset-dialog .dialog-header-h h3 {
  margin: 0;
  color: #dc3545;
  font-size: 20px;
}

.warning-message {
  text-align: center;
  margin-bottom: 25px;
}

.warning-message p {
  margin: 10px 0;
  font-size: 16px;
  color: #495057;
}

.warning-message strong {
  color: #dc3545;
  font-weight: 700;
}

.result-message {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
}

.result-message.correct {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.result-message.incorrect {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.result-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .puzzle-container {
    padding: 10px;
  }
  
  .group-container {
    margin-bottom: 40px;
    padding: 15px;
  }
  
  .group-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .poker-hand {
    height: 280px;
  }
  
  .poker-card {
    width: 80px;
    height: 120px;
  }
  
  .answer-label {
    bottom: -25px;
    font-size: 10px;
    padding: 4px 8px;
  }
  
  .dialog-content {
    padding: 20px;
  }
  
  .loading-spinner {
    width: 30px;
    height: 30px;
  }
  
  .error-count-section {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .reset-button {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .reset-dialog {
    max-width: 350px;
  }
  
  .warning-message p {
    font-size: 14px;
  }
  
  .completion-banner {
    padding: 30px 15px;
    margin: 15px 0 30px 0;
  }
  
  .completion-icon {
    font-size: 36px;
    margin-bottom: 15px;
  }
  
  .completion-title {
    font-size: 22px;
    margin-bottom: 8px;
  }
  
  .completion-subtitle {
    font-size: 16px;
  }
}

</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";return{setup(){const a=e.inject("backend"),l=e.inject("ysync").yDoc.getMap("c16-poker"),u=e.ref(!0),t=e.ref([]),r=e.ref(!1),s=e.ref(null),n=e.ref(!1),i=e.ref(null),o=e.ref(0),v=e.ref(0),c=e.ref(""),d=e.ref(!1),f=e.ref(""),g=e.ref(""),p=e.ref(null),w=e.ref(!1),h=e.ref(!1),y=e.ref(!1),m=e.ref(0);if(l.has("last_answer_time")){let e=l.get("last_answer_time");m.value=parseInt(e)}const _=async()=>{try{u.value=!0;const e=await a("c16-poker",{type:1});e&&e.puzzles&&(t.value=e.puzzles,r.value=e.isFinished||!1),console.log("获取题目列表成功:",e)}catch(e){console.error("获取题目列表失败:",e)}finally{u.value=!1}},C=()=>{n.value=!1,i.value=null,c.value="",d.value=!1,w.value=!1},z=()=>{h.value=!1,y.value=!1},k=e.computed((()=>t.value.reduce(((e,a)=>e+a.data.filter((e=>1===e.finished)).length),0)));return e.onMounted((()=>{_()})),l.observe(((e,a)=>{e.keysChanged&&e.keysChanged.forEach((e=>{if("last_answer_time"===e){let a=l.get(e);a>m.value&&(m.value=parseInt(a),_())}}))})),{loading:u,puzzleGroups:t,isFinished:r,hoveredCard:s,showDialog:n,currentPuzzle:i,currentGroupIndex:o,currentCardIndex:v,userAnswer:c,showResult:d,resultMessage:f,resultClass:g,answerInput:p,submitting:w,showResetDialog:h,resetting:y,totalAnsweredCount:k,onCardHover:e=>{s.value=e},onCardLeave:()=>{s.value=null},onCardClick:(a,l)=>{const u=t.value.find((e=>e.gid===a));if(!u)return;const r=u.data[l];r&&1===r.status&&(i.value=r,o.value=t.value.findIndex((e=>e.gid===a)),v.value=l,c.value="",d.value=!1,n.value=!0,e.nextTick((()=>{p.value&&0===r.finished&&p.value.focus()})))},closeDialog:C,submitAnswer:async()=>{if(c.value.trim()&&!w.value)try{w.value=!0,d.value=!1;const e=await a("c16-poker",{type:2,gid:i.value.gid,pid:i.value.pid,answer:c.value.trim()});console.log("提交答案结果:",e),await _(),m.value=(new Date).getTime(),l.set("last_answer_time",m.value.toString());const u=t.value.find((e=>e.gid===i.value.gid));if(u){const e=u.data.find((e=>e.pid===i.value.pid));e&&(i.value=e)}1===e.status?(f.value="恭喜你答对了！",g.value="correct",setTimeout((()=>{C()}),1e3)):2===e.status?(f.value="答案错误，请重试！",g.value="incorrect"):3===e.status&&(f.value="答题次数已用尽，无法继续答题！",g.value="error"),d.value=!0}catch(e){console.error("提交答案失败:",e),f.value="提交失败，请重试！",g.value="error",d.value=!0}finally{w.value=!1}},getCardXPosition:(e,a)=>{let l=60*a;if(null===s.value)return l;const[u,t]=s.value.split("-");return parseInt(u)!==e?l:a>parseInt(t)?l+50:l},getPuzzles:_,showResetConfirm:()=>{h.value=!0},closeResetDialog:z,resetErrorCount:async()=>{if(i.value&&!y.value)try{y.value=!0;const e=await a("c16-poker",{type:3,gid:i.value.gid,pid:i.value.pid});if(console.log("重置错误计数结果:",e),!0===e.result){await _();const e=t.value.find((e=>e.gid===i.value.gid));if(e){const a=e.data.find((e=>e.pid===i.value.pid));a&&(i.value=a)}f.value="错误计数已成功重置！",g.value="correct",d.value=!0,setTimeout((()=>{z()}),1500)}else f.value="重置失败，信用点余额不足！",g.value="error",d.value=!0,setTimeout((()=>{z()}),2e3)}catch(e){console.error("重置错误计数失败:",e),f.value="重置失败，请稍后重试！",g.value="error",d.value=!0,setTimeout((()=>{z()}),2e3)}finally{y.value=!1}}}}}}(Vue);


export default __vue_puzzle_component__;
</script>
