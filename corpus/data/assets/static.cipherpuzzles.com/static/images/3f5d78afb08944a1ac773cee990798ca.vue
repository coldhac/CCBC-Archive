
<!-- extract Puzzle -->
<template>

<table cellspacing="0" cellpadding="0" id="onlyextract">
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/e2b8786f57754846a6f40f7348e8e605.webp"></td>
<td></td>
<td></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/9fc8f69835db42f69c2e7bf521d4ffcc.webp"></td>
<td></td>
<td></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/3948cb4ee92d423badbba608e2bbf88a.webp"></td>
<td></td>
<td></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/ca78b364bd02440c8d4d3fd8d1b1c826.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/d809855e49ff49508def9abf9c201f10.webp"></td>
<td></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/b61d69c8eda5486b940a36d9f7671db5.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/0f52220a4d97464882cdc115a34f68cd.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/d9d59339be864edd8c9bac74279ce207.webp"></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/261fd282c878424b9e48dfaa6f2f184a.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/5a60a8bddc3c46cc9c2ce27e09f9d0a7.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/30138e93263f49638c1d5a67c3e6f502.webp"></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/1ba0093c881448a6b30df94bd0c0ae23.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/77dc5b9c402847848d521c0a654b2943.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/dbc79a3696c34191b0579bd00fd8aa79.webp"></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/7f85e42b1ec641d3ba8d482583fca4cb.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/07d4b8cc238e44f49179a482fa5fb4ca.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/e269412003a8476e810c9924d232b34b.webp"></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/859224497061470eaec8b8f133f85e78.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/485a701b8d2b43d2a5fb74148468db04.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/7bee44a08c864ec7a16876cdab4b6b59.webp"></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/6d2596389958478e869e4ec1d108686d.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/3c16562848be4d1dbd90ca842dbaeb2d.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/8a5955703de64dc9852949bbb10e9667.webp"></td>
</tr>
<tr>
<td><img src="https://static.cipherpuzzles.com/static/images/5a39deed0ff547a5a6eee7441254f3b8.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/73ffbb76c3d344a29b13585e94203aba.webp"></td>
<td><img src="https://static.cipherpuzzles.com/static/images/2fb1ed41bfac479ba83ec1606b50367c.webp"></td>
</tr>
<tr id="ttlr">
<td><img src="https://static.cipherpuzzles.com/static/images/e0b3a399d64540818b4b41409453808b.webp">
  <div v-if="solved[0]" class="solvedAnswer">
  {{ answers[0] }}
  </div>
  <div v-else>
    <input type="text" v-model="guess[0]" @keyup.enter="checkAnswer(0)" placeholder="提交本题答案获取下一题" />
    <div class="msg">{{ message[0] }}</div>
  </div>
</td>
<td><img src="https://static.cipherpuzzles.com/static/images/d3ae5f80fc704a4bab612c4330d12cb1.webp">
  <div v-if="solved[1]" class="solvedAnswer">
  {{ answers[1] }}
</div>
  <div v-else>
    <input type="text" v-model="guess[1]" @keyup.enter="checkAnswer(1)" placeholder="提交本题答案获取下一题" />
    <div class="msg">{{ message[1] }}</div>
  </div>
</td>
<td><img src="https://static.cipherpuzzles.com/static/images/bc0b7c32b66a4cb98e43e7230bfae9a7.webp">
  <div v-if="solved[2]" class="solvedAnswer">
    {{ answers[2] }}
  </div>
  <div v-else>
    <input type="text" v-model="guess[2]" @keyup.enter="checkAnswer(2)" placeholder="提交本题答案获取下一题" />
    <div class="msg">{{ message[2] }}</div>
  </div>
</td>
</tr>
<tr id="stlr">
  <td v-for="n in 3">
    <div v-if="solved[n-1]">
      <img :src="meta[n-1]">
      <div v-if="solved[n+2]" class="solvedAnswer">
        {{  answers[n+2] }}
      </div>
      <div v-else>
        <input type="text" v-model="guess[n+2]" @keyup.enter="checkAnswer(n+2)" placeholder="提交本行三题获取下一题" />
        <div class="msg">{{ message[n+2] }}</div>
      </div>
        
    </div>
    <div class="unknown" v-else>
    </div>
  </td>
</tr>
<tr id="lr">
  <td colspan="3">
    <div v-if="solved[3] && solved[4] && solved[5]">
      <img :src="meta[3]">
    </div>
    <div class="unknown" v-else>
    </div>
  </td>
</tr>
</table>

</template>

<style>

#onlyextract div.unknown {
  background-color: black;
  height: 225px;
  width: 400px;
  vertical-align: middle;
  margin: auto;
}
#onlyextract tr#ttlr td, #onlyextract tr#stlr td {
  padding-bottom: 30px;
}
#onlyextract .msg {
  color: #c00;
}
#onlyextract .solvedAnswer {
  color: #080;
  font-weight: bold;
}
#onlyextract input {
  font-size: 20px;
}
#onlyextract {
  border-spacing: 10px 2px;
}
#onlyextract img {
  width: 400px;
  border: 1px solid black;
}
#onlyextract td {
  text-align: center;
  height: 225px;
  vertical-align: top;
}
#onlyextract tr#ttlr img, #onlyextract tr#lr img {
  border: 2px solid green;
}

</style>

<!-- 请将以上部分复制到后台“题目HTML”中，以下部分复制到后台“题目脚本”中，不要包含<script>标签 -->

<script>
var __vue_puzzle_component__=function(e){"use strict";return{setup(){const a=e.inject("backend"),t=e.ref([!1,!1,!1,!1,!1,!1]),s=e.ref(["","","",""]),u=e.ref(["","","","","",""]),n=e.ref(["","","","","",""]),r=e.ref(["","","","","",""]);return e.onMounted((()=>{(async()=>{let e=await a("c16-onlyextract",{type:0});t.value=e.solved,s.value=e.meta,r.value=e.answers})()})),{checkAnswer:async e=>{let c=await a("c16-onlyextract",{type:1,guess:u.value[e],puzid:e});t.value=c.solved,s.value=c.meta,r.value=c.answers,c.correct||(n.value[e]="答案错误")},solved:t,guess:u,meta:s,answers:r,message:n}}}}(Vue);


export default __vue_puzzle_component__;
</script>
