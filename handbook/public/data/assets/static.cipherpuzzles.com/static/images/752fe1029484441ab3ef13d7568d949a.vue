
<!-- SifangPuzzle Puzzle -->
<template>

  <div class="puzzle-container">
    <!-- Stage 1: 只显示图片 -->
    <div v-if="stage === 1" class="section">
      <div class="image-container">
        <img :src="PUZZLE_IMG" alt="谜题图像" class="puzzle-image" />
      </div>
    </div>

    <!-- Stage 2: 图片在折叠面板 + 上传界面 -->
    <div v-else-if="stage === 2">
      <!-- 折叠面板 -->
      <div class="section">
        <div class="collapse-header" @click="toggleCollapse">
          <h3 class="section-title">第一阶段的题目已折叠，你可以点击展开</h3>
          <button class="collapse-btn">{{ isCollapsed ? '展开' : '收起' }}</button>
        </div>
        <div v-show="!isCollapsed" class="collapse-content">
          <div class="image-container">
            <img :src="PUZZLE_IMG" alt="谜题图像" class="puzzle-image" />
          </div>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="section hint-section">
        <h3 class="section-title">📝 请阅读以下说明并完成：</h3>
        <div class="hint-content-b">
          <p>请设计并提交一道答案为【<strong>{{ puzzleInfo.answer }}</strong>】的一图谜。说明：</p>
          <ol>
            <li>谜题全部内容在一张1000*1000像素的正方形图片上。可以<a :href="TEMPLATE_IMG" target="_blank" class="link">点击下载谜题图片模板</a>。</li>
            <li>谜题的答案必须是"{{ puzzleInfo.answer }}"。</li>
            <li>您提交的谜题可能会用于向其他队伍展示。请同时提交谜题的署名。如果没有提交署名，谜题将以你的队名署名。</li>
            <li>请同时提交谜题的解析，保证谜题合理、可解。不包含任何不适合展示的内容。</li>
            <li>您一旦提交，谜题将不可再编辑。请等待您提交的谜题进行审核，如果审核通过，您将获得本题答案。如果审核不通过，您必须修改您的谜题再次提交，您共有 {{ puzzleInfo.submit_count || 0
              }} / {{ puzzleInfo.max_submit_count || 0 }} 次提交机会。</li>
            <li>为了防止服务器被滥用，您<span style="color: red; font-weight: bold;">每小时只能上传一张图片</span>。请在上传前仔细检查。</li>
          </ol>
          
          <!-- 额外提交次数购买提示 -->
          <div v-if="puzzleInfo.submit_count >= puzzleInfo.max_submit_count" class="extra-submit-hint">
            <p>您当前已没有额外的提交次数，<a @click="buyExtraSubmit" class="link buy-link">消耗 20000 信用点增加10次额外的提交次数</a></p>
          </div>
        </div>
      </div>

      <!-- 上传工具界面 -->
      <div class="section upload-section">
        <h3 class="section-title">📤 提交谜题</h3>

        <!-- 风味文本 -->
        <div class="form-group" v-if="formData.flavor_text">
          <label class="form-label">风味文本：</label>
          <textarea v-model="formData.flavor_text" :disabled="!canEdit" class="form-textarea" rows="3"
            placeholder="请不要输入风味文本，这是一道一图谜。"></textarea>
        </div>

        <!-- 图片上传 -->
        <div class="form-group">
          <label class="form-label">谜题图片：</label>
          <div class="upload-area" :class="{ disabled: !canEdit }" @click="!canEdit || triggerFileInput()"
            @dragover.prevent @drop.prevent="handleDrop">
            <div v-if="!uploadedImage" class="upload-placeholder">
              <div class="upload-icon">📁</div>
              <p>点击或拖放图片文件</p>
              <p class="upload-hint">支持 JPG、PNG 格式</p>
            </div>
            <div v-else class="uploaded-preview">
              <img :src="uploadedImage" alt="已上传图片" class="preview-image" />
              <p class="upload-filename">{{ uploadedFileName }}</p>
            </div>
            <input ref="fileInput" type="file" accept="image/jpeg,image/jpg,image/png" @change="handleFileSelect"
              style="display: none;" />
          </div>
        </div>

        <!-- 题目解析 -->
        <div class="form-group">
          <label class="form-label">题目解析：</label>
          <textarea v-model="formData.analysis" :disabled="!canEdit" class="form-textarea" rows="4"
            placeholder="请输入题目解析..."></textarea>
        </div>

        <!-- 作者署名 -->
        <div class="form-group">
          <label class="form-label">作者署名：</label>
          <input v-model="formData.author" :disabled="!canEdit" type="text" class="form-input"
            placeholder="请输入作者署名（可选）" />
        </div>

        <!-- 提交按钮 -->
        <div class="form-group">
          <button @click="submitPuzzle" :disabled="!canEdit || isSubmitting || !formData.image_id"
            class="pl-button pl-button--primary submit-btn">
            {{ isSubmitting ? '提交中...' : '提交谜题' }}
          </button>
        </div>
      </div>

      <!-- 状态显示 -->
      <div v-if="statusInfo.show" class="section status-section" :class="statusInfo.class">
        <h3 class="section-title">📊 状态</h3>
        <p class="status-text">{{ statusInfo.text }}</p>
      </div>

      <!-- 审核消息 -->
      <div v-if="puzzleInfo.review_message" class="section review-section">
        <h3 class="section-title">💬 消息</h3>
        <p class="review-message" v-html="md(puzzleInfo.review_message)"></p>
      </div>

      <!-- 时间信息 -->
      <div v-if="timeInfo.show" class="section time-section">
        <p>
          <span class="time-label">提交时间：</span>
          <span class="time-value">{{ formatTimestamp(puzzleInfo.submit_time) }}</span>
        </p>
        <p v-if="puzzleInfo.review_time >= 0">
          <span class="time-label">审核时间：</span>
          <span class="time-value">{{ formatTimestamp(puzzleInfo.review_time) }}</span>
        </p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="section loading-section">
      <h3 class="section-title">⏳ 加载中</h3>
      <p>正在获取数据...</p>
    </div>

    <!-- 购买确认对话框 -->
    <div v-if="showBuyDialog" class="dialog-overlay" @click.self="cancelBuyExtraSubmit">
      <div class="dialog-content">
        <h3 class="dialog-title">💰 购买额外提交次数</h3>
        <p class="dialog-message">您确定要消耗 <strong>20000 信用点</strong> 来增加 <strong>10次</strong> 额外的提交次数吗？</p>
        <div class="dialog-actions">
          <button @click="cancelBuyExtraSubmit" class="pl-button cancel-btn" :disabled="isBuying">取消</button>
          <button @click="confirmBuyExtraSubmit" class="pl-button pl-button--warning" :disabled="isBuying">
            {{ isBuying ? '购买中...' : '确认购买' }}
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<style>

/* 整体容器 */
.puzzle-container {
  margin: 0 auto;
  line-height: 1.6;
  color: #333;
  min-height: 100vh;
  width: 1300px;
}

/* 区块样式 */
.section {
  margin-bottom: 20px;
}

.section-title {
  padding-left: 5px;
  font-size: 1.3em;
  color: #495057;
  margin-bottom: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图片容器 */
.image-container {
  text-align: center;
}

.puzzle-image {
  max-width: 100%;
  max-height: 750px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

/* 折叠面板 */
.collapse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 5px 0;
}

.collapse-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.collapse-btn:hover {
  background: #0056b3;
}

.collapse-content {
  border-top: 1px solid #e9ecef;
  margin-top: 10px;
  padding-top: 15px;
}

/* 提示区块 */
.hint-section {
  background: #e7f3ff;
  border-left: 4px solid #007bff;
}

.hint-content-b {
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.hint-content-b ol {
  margin: 10px 0;
  padding-left: 20px;
}

.hint-content-b li {
  margin-bottom: 8px;
}

.extra-submit-hint {
  margin-top: 15px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
}

.extra-submit-hint p {
  margin: 0;
  color: #856404;
}

.buy-link {
  cursor: pointer;
  font-weight: 500;
}

.buy-link:hover {
  text-decoration: underline;
}

/* 表单样式 */
.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  color: #495057;
  background: white;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input:disabled,
.form-textarea:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #007bff;
  border-radius: 4px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background: #f8f9fa;
}

.upload-area:hover:not(.disabled) {
  border-color: #0056b3;
  background: #e7f3ff;
}

.upload-area.disabled {
  border-color: #ced4da;
  background: #e9ecef;
  cursor: not-allowed;
  opacity: 0.6;
}

.upload-placeholder {
  color: #6c757d;
}

.upload-icon {
  font-size: 2em;
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 0.9em;
  color: #6c757d;
  margin: 5px 0 0 0;
}

.uploaded-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.preview-image {
  max-width: 150px;
  max-height: 150px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.upload-filename {
  font-weight: 500;
  color: #007bff;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
}

/* 状态区块 */
.status-section {
  border-left: 4px solid;
}

.status-section.status-pending {
  background: #f8f9fa;
  border-left-color: #6c757d;
}

.status-section.status-rejected {
  background: #f8d7da;
  border-left-color: #dc3545;
}

.status-section.status-approved {
  background: #d4edda;
  border-left-color: #28a745;
}

.status-text {
  padding: 10px;
  margin: 0;
}

/* 审核消息区块 */
.review-section {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.review-message {
  padding: 10px;
  margin: 0;
}

/* 时间信息区块 */
.time-section {
  background: #f8f9fa;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.time-label {
  font-weight: 500;
  color: #495057;
}

.time-value {
  color: #6c757d;
}

/* 加载区块 */
.loading-section {
  text-align: center;
  background: #e2e3e5;
}

/* 链接样式 */
.link {
  color: #007bff;
  text-decoration: underline;
}

.link:hover {
  color: #0056b3;
}

/* 按钮样式 */
.pl-button {
  display: inline-block;
  white-space: nowrap;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #ced4da;
  color: #495057;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  font-weight: 400;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  text-decoration: none;
  user-select: none;
}

.pl-button:hover:not(:disabled) {
  color: #495057;
  border-color: #adb5bd;
  background-color: #f8f9fa;
}

.pl-button--primary {
  color: #ffffff;
  background: #007bff;
  border-color: #007bff;
}

.pl-button--primary:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
  color: #ffffff;
}

.pl-button:disabled {
  color: #6c757d;
  cursor: not-allowed;
  background: #ffffff;
  border-color: #dee2e6;
}

.pl-button--primary:disabled {
  color: #ffffff;
  background: #6c757d;
  border-color: #6c757d;
}

.pl-button--warning {
  color: #ffffff;
  background: #ffc107;
  border-color: #ffc107;
}

.pl-button--warning:hover:not(:disabled) {
  background: #e0a800;
  border-color: #e0a800;
  color: #ffffff;
}

.pl-button--warning:disabled {
  color: #ffffff;
  background: #6c757d;
  border-color: #6c757d;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog-title {
  margin-bottom: 16px;
  color: #303133;
  font-size: 1.2rem;
  font-weight: 600;
}

.dialog-message {
  margin-bottom: 20px;
  color: #606266;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  background-color: #909399;
  color: white;
  border-color: #909399;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #767a82;
  border-color: #767a82;
}

/* 响应式设计 */
@media (max-width: 1560px) {
  .puzzle-container {
    padding: 15px;
    width: 1000px;
  }
}

@media (max-width: 1240px) {
  .puzzle-container {
    padding: 15px;
    width: 768px;
  }
}

@media (max-width: 980px) {
  .puzzle-container {
    padding: 15px;
    width: calc(100% - 30px);
  }
}

@media (max-width: 600px) {
  .puzzle-container {
    width: calc(100% - 100px);
  }

  .section-title {
    font-size: 1.2em;
  }

  .collapse-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .time-item {
    flex-direction: column;
    gap: 5px;
    align-items: flex-start;
  }
}

</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";const t="primary",a="info",o="warning",r="error",n="success",i="ccxc-message-container";function s(){let e=document.getElementById(i);return e||(e=document.createElement("div"),e.id=i,e.style.cssText="\n            position: fixed;\n            top: 20px;\n            right: 20px;\n            z-index: 10000;\n            pointer-events: none;\n        ",document.body.appendChild(e)),e}function c(e,i=a,c=3e3){const l=document.createElement("div"),d={[t]:{backgroundColor:"#722ed1",color:"#fff"},[a]:{backgroundColor:"#1890ff",color:"#fff"},[o]:{backgroundColor:"#faad14",color:"#fff"},[r]:{backgroundColor:"#f5222d",color:"#fff"},[n]:{backgroundColor:"#52c41a",color:"#fff"}},u=d[i]||d[a];l.style.cssText=`\n        background-color: ${u.backgroundColor};\n        color: ${u.color};\n        padding: 12px 20px;\n        border-radius: 6px;\n        margin-bottom: 10px;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n        font-size: 14px;\n        line-height: 1.5;\n        max-width: 300px;\n        word-wrap: break-word;\n        pointer-events: auto;\n        opacity: 0;\n        transform: translateX(100%);\n        transition: all 0.3s ease-in-out;\n    `,l.textContent=e;const p=s();return p.appendChild(l),setTimeout((()=>{l.style.opacity="1",l.style.transform="translateX(0)"}),10),setTimeout((()=>{l.style.opacity="0",l.style.transform="translateX(100%)",setTimeout((()=>{l.parentNode&&l.parentNode.removeChild(l),0===p.children.length&&p.parentNode&&p.parentNode.removeChild(p)}),300)}),c),l}const l={info:(e,t=3e3)=>c(e,a,t),warning:(e,t=4e3)=>c(e,o,t),error:(e,t=5e3)=>c(e,r,t),success:(e,t=3e3)=>c(e,n,t),primary:(e,a=3e3)=>c(e,t,a),toast(e){const{message:i,type:s="info",duration:l=3e3}=e;return c(i,{primary:t,info:a,warning:o,error:r,success:n}[s]||a,l)},notify(e){const{title:i,message:c,type:l="info",duration:d=4e3}=e;return function(e,i,c=a,l=4e3){const d=document.createElement("div"),u={[t]:{backgroundColor:"#722ed1",color:"#fff"},[a]:{backgroundColor:"#1890ff",color:"#fff"},[o]:{backgroundColor:"#faad14",color:"#fff"},[r]:{backgroundColor:"#f5222d",color:"#fff"},[n]:{backgroundColor:"#52c41a",color:"#fff"}},p=u[c]||u[a];d.style.cssText=`\n        background-color: ${p.backgroundColor};\n        color: ${p.color};\n        padding: 16px 20px;\n        border-radius: 6px;\n        margin-bottom: 10px;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n        font-size: 14px;\n        line-height: 1.5;\n        max-width: 350px;\n        word-wrap: break-word;\n        pointer-events: auto;\n        opacity: 0;\n        transform: translateX(100%);\n        transition: all 0.3s ease-in-out;\n    `;const f=document.createElement("div");f.style.cssText="\n        font-weight: bold;\n        margin-bottom: 6px;\n        font-size: 15px;\n    ",f.textContent=e;const m=document.createElement("div");m.textContent=i,d.appendChild(f),d.appendChild(m);const g=s();return g.appendChild(d),setTimeout((()=>{d.style.opacity="1",d.style.transform="translateX(0)"}),10),setTimeout((()=>{d.style.opacity="0",d.style.transform="translateX(100%)",setTimeout((()=>{d.parentNode&&d.parentNode.removeChild(d),0===g.children.length&&g.parentNode&&g.parentNode.removeChild(g)}),300)}),l),d}(i,c,{primary:t,info:a,warning:o,error:r,success:n}[l]||a,d)}};"undefined"!=typeof window&&(window.message=l);return{setup(){const t=e.ref(0),a=e.ref(!0),o=e.ref(!1),r=e.ref(""),n=e.ref(""),i=e.ref(!1),s=e.ref(!1),c=e.reactive({id:0,gid:0,cid:0,answer:"",image_id:"",flavor_text:"",author:"",analysis:"",submit_time:0,submit_count:0,max_submit_count:0,review_status:0,review_message:"",review_time:0}),d=e.reactive({flavor_text:"",image_id:"",analysis:"",author:""}),u=e.inject("api"),p=e.inject("formatTimestamp"),f=e.inject("markdownToHtml"),m=e.computed((()=>0===c.review_status||2===c.review_status)),g=e.computed((()=>0===c.review_status?{show:!1}:1===c.review_status?{show:!0,class:"status-pending",text:"已提交，等待审核"}:2===c.review_status?{show:!0,class:"status-rejected",text:"审核未通过，请查看审核消息并修改后再次提交"}:3===c.review_status||4===c.review_status?{show:!0,class:"status-approved",text:"审核已通过"}:{show:!1})),y=e.computed((()=>{const e=c.submit_time>0,t=c.review_time>0;return{show:e||t,submitTime:e,reviewTime:t}})),w=async()=>{try{const e=await u("/play/c16extra/query-puzzle-info",{});Object.assign(c,e.data),d.flavor_text=e.data.flavor_text||"",d.image_id=e.data.image_id||"",d.analysis=e.data.analysis||"",d.author=e.data.author||"",d.image_id&&(r.value=d.image_id,n.value="已上传的图片")}catch(e){console.error("获取谜题信息失败:",e)}},h=async e=>{if(e.type.match(/^image\/(jpeg|jpg|png)$/))if(e.size>10485760)l.error("文件大小不能超过 10MB");else try{const t=new FileReader;t.onload=t=>{r.value=t.target.result,n.value=e.name},t.readAsDataURL(e),await v(e)}catch(t){console.error("处理文件失败:",t),l.error("文件处理失败")}else l.error("只支持 JPG 和 PNG 格式的图片")},v=async e=>{try{const t=await u("/play/c16extra/upload-prepare",{}),{backend_root:a,token:o}=t,r=new FormData;r.append("file",e);const n=await fetch(`${a}/v1/admin/upload-image`,{method:"POST",headers:{"Upload-Token":o},body:r});if(!n.ok)throw new Error(`上传失败: ${n.status}`);const i=await n.json();d.image_id=i.image_path,l.info("图片上传成功！"),console.log("文件上传成功:",i.image_path)}catch(t){console.error("文件上传失败:",t),l.error("文件上传失败"),r.value="",n.value=""}};return e.onMounted((async()=>{await(async()=>{try{const e=await u("/play/c16extra/get-puzzle-status",{});t.value=e.stage||1}catch(e){console.error("获取谜题状态失败:",e)}})(),2===t.value&&await w()})),{PUZZLE_IMG:"https://static.cipherpuzzles.com/static/images/834faabe749b43c090daad6df78dbdc9.webp",TEMPLATE_IMG:"https://static.cipherpuzzles.com/static/images/d1c1db9aea3246f588ff6a6daf02bcce.png",stage:t,isCollapsed:a,isSubmitting:o,uploadedImage:r,uploadedFileName:n,puzzleInfo:c,formData:d,canEdit:m,statusInfo:g,timeInfo:y,formatTimestamp:e=>!e||e<=0?"---":p(e),toggleCollapse:()=>{a.value=!a.value},triggerFileInput:()=>{m.value&&document.querySelector('input[type="file"]').click()},handleFileSelect:e=>{const t=e.target.files[0];t&&h(t)},handleDrop:e=>{if(!m.value)return;const t=e.dataTransfer.files;t.length>0&&h(t[0])},submitPuzzle:async()=>{if(d.image_id)if(d.analysis.trim()){o.value=!0;try{await u("/play/c16extra/edit-puzzle",{image_id:d.image_id,flavor_text:d.flavor_text,author:d.author,analysis:d.analysis});l.info("提交成功！"),await w()}catch(e){console.error("提交失败:",e),l.error("提交失败，请稍后重试")}finally{o.value=!1}}else l.warning("请填写题目解析");else l.warning("请先上传图片")},md:f,showBuyDialog:i,isBuying:s,buyExtraSubmit:()=>{i.value=!0},confirmBuyExtraSubmit:async()=>{s.value=!0;try{await u("/play/c16extra/add-extra-count",{}),l.info("购买成功！已增加10次额外提交次数"),i.value=!1,await w()}catch(e){console.error("购买失败:",e),l.error("购买失败，请稍后重试")}finally{s.value=!1}},cancelBuyExtraSubmit:()=>{i.value=!1}}}}}(Vue);


export default __vue_puzzle_component__;
</script>
