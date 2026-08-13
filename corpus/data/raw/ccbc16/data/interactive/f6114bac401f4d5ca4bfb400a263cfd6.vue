
<!-- PuzzleSolvingTest Puzzle -->
<template>

    <!-- 欢迎页 -->
    <div v-if="currentPage === 'welcome'" class="welcome-page">
        <div class="welcome-content">
            <img :src="TitleImg" alt="2025年度解谜能力测试" class="title-image" />

            <div class="button-container">
                <button @click="showTerms" class="terms-button">
                    阅读注意事项
                </button>

                <button
                    @click="startTest"
                    :disabled="!readTerms && data.running === 0 && data.lastScore === 0"
                    class="start-button"
                    :class="{ 'disabled': !readTerms && data.running === 0 && data.lastScore === 0 }"
                >
                    {{ getStartButtonText() }}
                </button>

                <div v-if="!readTerms && data.running === 0 && data.lastScore === 0" class="notice-text">
                    请先阅读注意事项
                </div>
            </div>

            <!-- 成绩单按钮 -->
            <div v-if="data.lastScore > 0" class="score-container">
                <button @click="showScoreDialog" class="score-button">
                    成绩单
                </button>
            </div>
        </div>
    </div>

    <!-- 注意事项页 -->
    <div v-if="currentPage === 'terms'" class="terms-page">
        <div class="terms-content">
            <img :src="TermsImg" alt="注意事项" class="terms-image" />

            <div class="button-container">
                <button @click="confirmTerms" class="confirm-button">
                    我知道了
                </button>
            </div>
        </div>
    </div>

    <!-- 主界面 -->
    <div v-if="currentPage === 'main'" class="main-page">
        <!-- 主体内容 -->
        <div class="main-content">
            <!-- 左侧题目列表 -->
            <div class="question-list">
                <!-- 左侧头部按钮 -->
                <div class="question-list-header">
                    <button @click="returnToWelcome" class="return-button">
                        <span class="return-icon">←</span>
                        {{ data.running === 0 ? '已交卷' : '返回' }}
                    </button>
                    <button v-if="data.running === 1" @click="showSubmitConfirm = true" class="submit-button">
                        交卷
                    </button>
                </div>

                <!-- 题目列表滚动区域 -->
                <div class="question-list-scroll">
                    <div
                        v-for="(question, index) in getAllQuestions()"
                        :key="index"
                        @click="selectQuestion(index)"
                        :class="['question-item', { 'active': currentQuestion === index }]"
                    >
                        <div class="question-number-container">
                            <div class="question-number">{{ question.number }}</div>
                            <div v-if="question.index < 50" class="question-score">{{ question.score }} 分</div>
                            <div class="question-answer">
                                {{ getDisplayAnswer(index) }}
                            </div>
                        </div>
                        <div class="question-users">
                            <div
                                v-for="user in getUsersOnQuestion(index)"
                                :key="user.name"
                                :class="['user-indicator', { 'typing': user.typing }]"
                                :style="{ backgroundColor: user.color || '#007bff' }"
                            >
                                {{ user.name }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 右侧题目显示区域 -->
            <div class="question-display">
                <div class="question-image-container">
                    <img
                        :src="getCurrentQuestionImage()"
                        :alt="`题目 ${getCurrentQuestionNumber()}`"
                        class="question-image"
                    />
                </div>

                <!-- 答题区域 -->
                <div class="answer-area" v-if="!isExQuestion()">
                    <!-- 选择题 -->
                    <div v-if="isSelectionQuestion()" class="selection-area">
                        <div class="selection-options">
                            <label
                                v-for="(option, optionIndex) in getCurrentSelectionOptions()"
                                :key="optionIndex"
                                class="selection-option"
                            >
                                <input
                                    type="radio"
                                    :value="(optionIndex + 1).toString()"
                                    :checked="data.answers[currentQuestion] === (optionIndex + 1).toString()"
                                    @change="updateAnswer((optionIndex + 1).toString())"
                                    :disabled="data.running === 0"
                                />
                                <span class="option-index">{{ "❶❷❸❹"[optionIndex] }}</span>
                                <span class="option-text">{{ option }}</span>
                            </label>
                        </div>
                    </div>

                    <!-- 文字题 -->
                    <div v-else class="input-area">
                        <input
                            type="text"
                            placeholder="请输入答案"
                            :value="data.answers[currentQuestion]"
                            @input="updateAnswer($event.target.value)"
                            @focus="setUserTyping(true)"
                            @blur="setUserTyping(false)"
                            :disabled="data.running === 0"
                            class="answer-input-inner"
                        />
                    </div>

                    <!-- 作答按钮 -->
                    <button
                        @click="nextQuestion"
                        :disabled="data.running === 0"
                        class="answer-button"
                    >
                        作答
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 交卷确认对话框 -->
    <div v-if="showSubmitConfirm" class="modal-overlay" @click="closeSubmitConfirm">
        <div class="modal-content" @click.stop>
            <h2>确认交卷吗？</h2>
            <div class="modal-buttons">
                <button @click="confirmSubmit" class="confirm-submit-button">
                    确认交卷
                </button>
                <button @click="closeSubmitConfirm" class="cancel-submit-button">
                    取消
                </button>
            </div>
        </div>
    </div>

    <!-- 成绩单弹窗 -->
    <div v-if="showScoreModal" class="modal-overlay" @click="closeScoreDialog">
        <div class="modal-content" @click.stop>
            <h2>成绩单</h2>
            <p>恭喜你在2025年度解谜能力测试中</p>
            <p class="score-text">获得 {{ data.lastScore }} 分！</p>
            <div class="modal-buttons" v-if="currentPage == 'main'">
                <button @click="returnToWelcomeFromScore" class="return-home-button">
                    返回首页
                </button>
                <button @click="closeScoreDialog" class="stay-button">
                    留在本页
                </button>
            </div>
            <div class="modal-buttons" v-else>
                <button @click="closeScoreDialog" class="return-home-button">
                    关闭
                </button>
            </div>
        </div>
    </div>

    <!-- 提交信息弹窗 -->
     <div v-if="showSubmitMessageModal" class="modal-overlay" @click="closeSubmitMessageDialog">
        <div class="modal-content" @click.stop>
            <h2>交卷失败</h2>
            <p>{{ submitMessage }}</p>
            <div class="modal-buttons">
                <button @click="closeSubmitMessageDialog" class="return-home-button">
                    关闭
                </button>
            </div>
        </div>
    </div>

    <!-- 给页面下方留出一点滚动空间 -->
    <div class="main-footer">

    </div>

</template>

<style>

.welcome-page, .terms-page {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    padding: 20px;
}

.welcome-content, .terms-content {
    text-align: center;
    max-width: 800px;
    width: 100%;
}

.title-image, .terms-image {
    max-width: 100%;
    height: 60vh;
    margin-bottom: 30px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.button-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

.terms-button, .start-button, .confirm-button, .score-button, .restart-button {
    padding: 15px 40px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 200px;
}

.terms-button {
    background-color: #6c757d;
    color: white;
}

.terms-button:hover {
    background-color: #5a6268;
}

.terms-button.secondary {
    background-color: #6c757d;
    margin-bottom: 10px;
}

.start-button {
    background-color: #007bff;
    color: white;
}

.start-button:hover:not(.disabled) {
    background-color: #0056b3;
}

.start-button.disabled {
    background-color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
}

.confirm-button {
    background-color: #28a745;
    color: white;
}

.confirm-button:hover {
    background-color: #218838;
}

.score-button {
    background-color: #ffc107;
    color: #212529;
}

.score-button:hover {
    background-color: #e0a800;
}

.restart-button {
    background-color: #dc3545;
    color: white;
}

.restart-button:hover {
    background-color: #c82333;
}

.notice-text {
    color: #6c757d;
    font-size: 14px;
    margin-top: 10px;
    font-style: italic;
}

.score-container {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

.main-page {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    background-color: #f8f9fa;
    border-radius: 10px;
    border: 1px solid #e9ecef;
}

.main-page * {
    box-sizing: border-box;
}

.main-content {
    display: flex;
    flex: 1;
    height: 100vh;
}

.question-list {
    height: 80vh;
    width: 250px;
    background-color: white;
    border-right: 1px solid #e9ecef;
    display: flex;
    flex-direction: column;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
}

.question-list-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 3px;
    padding: 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    border-top-left-radius: 10px;
}

.return-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
}

.return-button:hover {
    background-color: #5a6268;
}

.return-icon {
    font-size: 16px;
    font-weight: bold;
}

.submit-button {
    padding: 8px 20px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s;
}

.submit-button:hover {
    background-color: #c82333;
}

.question-list-scroll {
    flex: 1;
    overflow-y: auto;
    max-height: calc(100vh - 140px);
}

/* 自定义滚动条样式 */
.question-list-scroll::-webkit-scrollbar {
    width: 5px;
}

.question-list-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.question-list-scroll::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.3);
    transition: background-color 0.3s ease;
}

.question-list-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.5);
}

.question-item {
    padding: 12px 16px;
    border-bottom: 1px solid #f8f9fa;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
    border-bottom: 1px solid #e9ecef;
}

.question-item:hover {
    background-color: #f8f9fa;
}

.question-item.active {
    background-color: #e5e5e5;
    border-left: 4px solid #505050;
}

.question-number-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 4px;
    width: 100%;
}

.question-number {
    font-size: 14px;
    font-weight: bold;
    color: #495057;
    margin-bottom: 4px;
}

.question-score {
    font-size: 13px;
    /* font-weight: bold; */
    color: #495057;
    margin-bottom: 4px;
}

.question-answer {
    font-size: 13px;
    color: #6c757d;
    margin-bottom: 6px;
    word-break: break-all;
    min-height: 16px;
    min-width: 120px;
}

.question-users {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 32px;
}

.user-indicator {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 10px;
    color: white;
    font-weight: bold;
    line-height: 18px;
    height: 20px;
}

.user-indicator.typing {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

.question-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 20px;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
}

.question-header {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.question-number-display {
    background-color: #b8860b;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 18px;
    font-weight: bold;
}

.question-image-container {
    max-height: 60vh;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.question-image {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.answer-area {
    margin-top: 30px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 15px;
    align-items: center;
}

.selection-area {
    width: 100%;
    max-width: 600px;
}

.selection-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.selection-option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    vertical-align: middle;
}

.selection-option:hover {
    background-color: #f8f9fa;
    border-color: #007bff;
}

.selection-option input[type="radio"] {
    margin: 0;
}

.selection-option input[type="radio"]:checked + .option-text {
    color: #007bff;
    font-weight: bold;
}

.option-index {
    color: #3b7d23;
    font-size: 16px;
}

.option-text {
    font-size: 16px;
}

.input-area {
    width: 100%;
    max-width: 400px;
}

.answer-input-inner {
    box-sizing: border-box;
    width: 100%;
    padding: 12px;
    border: 2px solid #dee2e6;
    border-radius: 6px;
    font-size: 16px;
    transition: border-color 0.2s;
}

.answer-input-inner:focus {
    outline: none;
    border-color: #007bff;
}

.answer-input-inner:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
}

.answer-button {
    padding: 12px 40px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.3s;
}

.answer-button:hover:not(:disabled) {
    background-color: #5a6268;
}

.answer-button:disabled {
    background-color: #dee2e6;
    cursor: not-allowed;
}

.ex-notice {
    text-align: center;
    color: #6c757d;
    font-style: italic;
    margin-top: 20px;
}

.modal-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-top: 20px;
}

.return-home-button, .stay-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
}

.return-home-button {
    background-color: #007bff;
    color: white;
}

.return-home-button:hover {
    background-color: #0056b3;
}

.stay-button {
    background-color: #6c757d;
    color: white;
}

.stay-button:hover {
    background-color: #5a6268;
}

.submit-info {
    font-size: 16px;
    color: #dc3545;
    font-weight: bold;
    margin: 15px 0;
}

.confirm-submit-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
    background-color: #dc3545;
    color: white;
}

.confirm-submit-button:hover {
    background-color: #c82333;
}

.cancel-submit-button {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
    background-color: #6c757d;
    color: white;
}

.cancel-submit-button:hover {
    background-color: #5a6268;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 40px;
    border-radius: 12px;
    text-align: center;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
    margin-top: 0;
    color: #333;
    font-size: 24px;
}

.modal-content p {
    margin: 15px 0;
    color: #666;
    font-size: 16px;
}

.score-text {
    font-size: 20px;
    font-weight: bold;
    color: #28a745;
    margin: 20px 0;
}

.main-footer {
    height: 100px;
}



@media (max-width: 768px) {
    .welcome-content, .terms-content {
        padding: 0 10px;
    }

    .title-image, .terms-image {
        width: 100%;
        height: auto;
        margin-bottom: 20px;
    }

    .terms-button, .start-button, .confirm-button, .score-button, .restart-button {
        min-width: 180px;
        padding: 12px 30px;
    }

    .main-content {
        flex-direction: column;
        height: 100vh;
    }

    .question-list {
        width: 100%;
        height: 140px;
        border-right: none;
        border-bottom: 1px solid #e9ecef;
        border-radius: 10px 10px 0 0;
    }

    .question-list-header {
        padding: 10px 15px;
        flex-direction: row;
        gap: 10px;
        border-radius: 10px 10px 0 0;
    }

    .question-list-scroll {
        height: 80px;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
    }

    /* 移动端横向滚动条样式 */
    .question-list-scroll::-webkit-scrollbar {
        height: 5px;
        width: 5px;
    }

    .question-list-scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    .question-list-scroll::-webkit-scrollbar-thumb {
        border-radius: 3px;
        transition: background-color 0.3s ease;
        background: rgba(0, 0, 0, 0.3);
    }

    .question-list-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(0, 0, 0, 0.5);
    }

    .question-item {
        display: inline-block;
        width: 180px;
        height: 80px;
        padding: 8px;
        vertical-align: top;
        white-space: normal;
        border-right: 1px solid #e9ecef;
        border-bottom: none;
    }

    .question-item:last-child {
        margin-right: 0;
    }

    .question-item.active {
        border-left: none;
        border-top: 4px solid #505050;
    }

    .question-number-container {
        flex-direction: row;
        align-items: center;
    }

    .question-number {
        font-size: 12px;
        margin-bottom: 2px;
    }

    .question-answer {
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .question-users {
        min-height: 20px;
        margin-top: 4px;
    }

    .user-indicator {
        font-size: 8px;
        padding: 1px 4px;
        height: 16px;
        line-height: 14px;
    }

    .question-display {
        flex: 1;
        padding: 15px;
        border-radius: 0 0 10px 10px;
    }

    .question-image-container {
        margin-bottom: 15px;
    }

    .selection-options {
        grid-template-columns: 1fr;
        gap: 10px;
    }

    .modal-content {
        width: 95%;
        padding: 30px 20px;
    }

    .modal-buttons {
        flex-direction: column;
        gap: 10px;
    }

    .return-home-button, .stay-button {
        width: 100%;
    }

    .answer-button {
        padding: 10px 10px;
        width: 150px;
    }
}

</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";const t="c16-puzzle-solving-test",s=["https://static.cipherpuzzles.com/static/images/30335c82ab9f4dc8ab7cdbeb4bd50f1d.webp","https://static.cipherpuzzles.com/static/images/e046e0a5a216486592814c0fafbfebc0.webp","https://static.cipherpuzzles.com/static/images/4b4ed5e04f8d4efcbca117978601f69b.webp","https://static.cipherpuzzles.com/static/images/8e91fb4dcae3481786686634cf2ecf4e.webp","https://static.cipherpuzzles.com/static/images/a5f1c72b2fc74f90b93b110f2db06312.webp","https://static.cipherpuzzles.com/static/images/3a2380f6e7ee46769bb2de390856f09d.webp","https://static.cipherpuzzles.com/static/images/17887b3ea73f486badf8cd78601fd04b.webp","https://static.cipherpuzzles.com/static/images/b06253b53a8f4567b74a83b676f9c092.webp","https://static.cipherpuzzles.com/static/images/7bf183eb396b4d9192871b9983ad198d.webp","https://static.cipherpuzzles.com/static/images/530e5e323234472b8cc02886ba5570ca.webp","https://static.cipherpuzzles.com/static/images/b40fe7a0893645b89b16365385a3cf92.webp","https://static.cipherpuzzles.com/static/images/558ae48f5a4443ef9940d36fb2ce9e64.webp","https://static.cipherpuzzles.com/static/images/4cf33d038cec479ca7c3f0a96f881d43.webp","https://static.cipherpuzzles.com/static/images/4c7fea4fa94b4c40b76089b1343602ac.webp","https://static.cipherpuzzles.com/static/images/262411f42add413e9bb815f1732439c7.webp","https://static.cipherpuzzles.com/static/images/c6eb4748ca5c45e8b01affcc37d18384.webp","https://static.cipherpuzzles.com/static/images/82ef7799e0a2429a82ade83554a66991.webp","https://static.cipherpuzzles.com/static/images/7de45c727ce24fe48e4666bb78728777.webp","https://static.cipherpuzzles.com/static/images/38679b877e2f48868cef47865234a8a2.webp","https://static.cipherpuzzles.com/static/images/fea3df97f6cf47139ebdb18dd30ba158.webp","https://static.cipherpuzzles.com/static/images/be28b2d4d8bd413f87377dcbbb6871ad.webp","https://static.cipherpuzzles.com/static/images/2e89e6c91bb348cfb4e59717cd40482e.webp","https://static.cipherpuzzles.com/static/images/2b2ab547958240ba8dd36bdb924f5529.webp","https://static.cipherpuzzles.com/static/images/d2d831d2bbd5482aa8adbac30a619833.webp","https://static.cipherpuzzles.com/static/images/b7a187c1491d434894befb6928a3465d.webp","https://static.cipherpuzzles.com/static/images/08ee820fb10d41918677199e6776b709.webp","https://static.cipherpuzzles.com/static/images/cd15a729e2de4806a6c764859c2e9d3b.webp","https://static.cipherpuzzles.com/static/images/83dc75894d304b33aaf39cb8e4e4f68c.webp","https://static.cipherpuzzles.com/static/images/5625c8659bbd4eafbf07a46529ffc189.webp","https://static.cipherpuzzles.com/static/images/3e9ccd531ff04929919ba1b0eaa877b2.webp","https://static.cipherpuzzles.com/static/images/4649e9385d29490387dcfeacddd2d30f.webp","https://static.cipherpuzzles.com/static/images/362cd57d266846e984856bf97329cc43.webp","https://static.cipherpuzzles.com/static/images/ce05deee0dba4017a9efc02e64a7ae21.webp","https://static.cipherpuzzles.com/static/images/7559909d65574be69fcbcc3c0f3a719a.webp","https://static.cipherpuzzles.com/static/images/6a402b7724e8434a87a92bb62c4ca30b.webp","https://static.cipherpuzzles.com/static/images/1e7a7e57b0bb444bace3bb958e5f6087.webp","https://static.cipherpuzzles.com/static/images/f5fffae6887048e9baae95c43134d419.webp","https://static.cipherpuzzles.com/static/images/2fd11336796d4f28b23ed9461b50fb21.webp","https://static.cipherpuzzles.com/static/images/2baf21d353d44e0089afcdb0bf49de7a.webp","https://static.cipherpuzzles.com/static/images/12bb54c2ec074659a68b316cc5999505.webp","https://static.cipherpuzzles.com/static/images/fad335e7a31d4481a5b76a4755dc0a6d.webp","https://static.cipherpuzzles.com/static/images/bc2fbfe97d634bf8a2e7169b6cf36e2b.webp","https://static.cipherpuzzles.com/static/images/c7c68b894ad9461d8e093b54acfb2752.webp","https://static.cipherpuzzles.com/static/images/05378011b0854659843a88c4d49eb8de.webp","https://static.cipherpuzzles.com/static/images/2450c40aa40b4ac0bb586469793dcb0b.webp","https://static.cipherpuzzles.com/static/images/69e5a164e83442c69b59b3489f2a9e57.webp","https://static.cipherpuzzles.com/static/images/38d18189999e4662b6f402cf16a303a1.webp","https://static.cipherpuzzles.com/static/images/079bf7f8ce274a72a3ced985ed2009c3.webp","https://static.cipherpuzzles.com/static/images/5c36bb4765264ddb902780fd0198ee15.webp","https://static.cipherpuzzles.com/static/images/b85c8dcd5e70428f8bdd061d24379982.webp"],a={7:["无","从","将","反"],15:["力","式","网","总"],26:["分","合","异","同"],37:["平","面","结","构"],41:["切","胡","体","方"]},c=[2,2,1,2,2,1,1,3,2,1,1,1,2,1,2,1,2,1,2,2,2,2,1,3,1,1,2,1,2,2,2,1,1,4,2,2,1,3,3,2,2,2,2,4,2,2,2,4,5,5];return{setup(){const i=e.inject("backend"),p=e.inject("ysync"),r=e.reactive({running:0,answers:[...new Array(50)].map((e=>"")),lastScore:0,ex:0,aware:[]}),b=e.ref(!1),u=e.ref(!1),n=e.ref(""),o=e.ref("welcome"),l=e.ref(!1),m=e.ref(0),h=e.ref(!1),z=e.ref(!1),f=e.ref("");b.value="1"===localStorage.getItem("c16-puzzle-solving-test-readTerms");const g=p.yDoc.getMap(t);for(let e=0;e<r.answers.length;e++){let t=`a-${e}`;g.has(t)&&(r.answers[e]=g.get(t))}g.has("running")&&(r.running=g.get("running")),g.has("lastScore")&&(r.lastScore=g.get("lastScore")),g.has("ex")&&(r.ex=g.get("ex")),e.onMounted((()=>{d(),p.registerAwarenessFunc(t,(e=>{r.aware=e}))})),e.onBeforeUnmount((()=>{p.removeAwarenessState(t),p.unregisterAwarenessFunc(t)})),g.observe(((e,t)=>{e.keysChanged&&e.keysChanged.forEach((e=>{if(e.startsWith("a-")){let t=parseInt(e.split("-")[1]),s=g.get(e);void 0===s&&(s=""),r.answers[t]=s}if("running"===e&&(r.running=g.get(e)),"lastScore"===e&&(r.lastScore=g.get(e)),"ex"===e){let t=g.get(e);t>r.ex&&(r.ex=parseInt(t),d())}}))}));const d=async()=>{const e=await i("c16-puzzle-solving-test",{type:1});e.ex&&(u.value=!0,n.value=e.ex)},w=async()=>{const e=await i("c16-puzzle-solving-test",{type:2,answer:r.answers});e.ex&&(u.value=!0,n.value=e.ex,g.set("ex",(new Date).getTime())),-1==e.score?(z.value=!0,f.value=e.message):(r.lastScore=e.score,g.set("lastScore",r.lastScore),l.value=!0,r.running=0,g.set("running",0),p.removeAwarenessState(t))},v=()=>{const e=[];for(let t=0;t<50;t++)e.push({number:t+1,index:t,score:c[t]});return u.value&&e.push({number:"EX",index:50,score:"?"}),e};return{data:r,readTerms:b,showEx:u,exImg:n,currentPage:o,showScoreModal:l,currentQuestion:m,showSubmitConfirm:h,TitleImg:"https://static.cipherpuzzles.com/static/images/9e6c4aed427e472bab5bdef87fba0dd1.webp",TermsImg:"https://static.cipherpuzzles.com/static/images/50615ba8c7ed40bca1594f1f6a1e49c8.webp",PuzzleImg:s,Selections:a,PuzzleScores:c,showSubmitMessageModal:z,submitMessage:f,submit:w,showTerms:()=>{o.value="terms"},confirmTerms:()=>{b.value=!0,localStorage.setItem("c16-puzzle-solving-test-readTerms","1"),o.value="welcome"},getStartButtonText:()=>1===r.running?"恢复答题":r.lastScore>0?"重新开始":"开始",startTest:()=>{(b.value||1===r.running||r.lastScore>0)&&(o.value="main",0===r.running&&(r.running=1,g.set("running",1)),m.value=0,p.setAwarenessState(t,{ci:1,typing:!1}))},showScoreDialog:()=>{l.value=!0},closeScoreDialog:()=>{l.value=!1},closeSubmitConfirm:()=>{h.value=!1},confirmSubmit:async()=>{h.value=!1,await w()},getAllQuestions:v,getDisplayAnswer:e=>{if(50===e)return"";const t=e+1,s=r.answers[e];if(a[t]&&s){const e=parseInt(s)-1;return a[t][e]||""}return s||""},getUsersOnQuestion:e=>r.aware.filter((t=>t.ci===e+1)),selectQuestion:e=>{m.value=e,p.setAwarenessState(t,{ci:e+1,typing:!1})},getCurrentQuestionNumber:()=>{var e;return(null==(e=v()[m.value])?void 0:e.number)||1},getCurrentQuestionImage:()=>50===m.value?n.value:s[m.value],isExQuestion:()=>50===m.value,isSelectionQuestion:()=>{if(50===m.value)return!1;const e=m.value+1;return void 0!==a[e]},getCurrentSelectionOptions:()=>{if(50===m.value)return[];const e=m.value+1;return a[e]||[]},updateAnswer:e=>{0!==r.running&&(r.answers[m.value]=e,g.set(`a-${m.value}`,e))},setUserTyping:e=>{p.setAwarenessState(t,{ci:m.value+1,typing:e})},nextQuestion:()=>{const e=u.value?51:50;m.value<e-1&&(m.value++,p.setAwarenessState(t,{ci:m.value+1,typing:!1}))},returnToWelcome:()=>{o.value="welcome",p.removeAwarenessState(t)},returnToWelcomeFromScore:()=>{l.value=!1,o.value="welcome",p.removeAwarenessState(t)},closeSubmitMessageDialog:()=>{z.value=!1}}}}}(Vue);


export default __vue_puzzle_component__;
</script>
