
<!-- Emoji Puzzle -->
<template>

<div class="emoji" v-for="(puzzle, id) in processedPuzzles">{{ puzzle.puzBefore }}<input class="emoji" maxlength="4" style="width: 25px; font-size: 16px" @input="checkAnswer" :disabled="puzzles[id].ans != ''" v-model="puzzles[id].ans">{{ puzzle.puzAfter }}</div>
<div class="emoji" v-if="solvedAll" style="padding-top: 20px; font-size: 30px">👍💯👏</div>

</template>

<style>

@font-face {
  font-family: 'EmojiFont';
  src: url('https://static.cipherpuzzles.com/static/images/d59da9aefed14adf9939d1702a4aea14.woff2') format('woff2');
}

.emoji {
  font-family: 'EmojiFont', sans-serif;
}

</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";return{setup(){const l=e.inject("backend"),u=e.ref([]),t=e.ref(!1),s=e.computed((()=>{let e=[];for(let l=0;l<u.value.length;l++){let t=u.value[l].puz.split("❓");e.push({puzBefore:t[0],puzAfter:t[1],ans:u.value[l].ans})}return e}));return e.onMounted((()=>{(async()=>{let e=await l("c16-emoji",{type:0});u.value=e.puzzles,t.value=9==e.puzzles.length&&""!=e.puzzles[8].ans})()})),{checkAnswer:async()=>{let e=await l("c16-emoji",{type:1,lastAnswer:u.value[u.value.length-1].ans});u.value=e.puzzles,t.value=9==e.puzzles.length&&""!=e.puzzles[8].ans},puzzles:u,solvedAll:t,processedPuzzles:s}}}}(Vue);


export default __vue_puzzle_component__;
</script>
