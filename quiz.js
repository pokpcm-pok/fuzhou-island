/* 印刷小任務：每座島 3 題選擇題，答對 2 題以上得徽章。題目可在 Google Sheet「任務」分頁修改。 */
(function(){
  var DEFAULT=[{"island_id": "prepress", "q": "CMYK 四個字母中，K 代表哪一個顏色？", "opts": ["青色", "黑色（Key）", "洋紅色", "黃色"], "ans": 1, "why": "K 是 Key plate（主色版）的縮寫，在印刷中指黑色。"}, {"island_id": "prepress", "q": "螢幕靠發光顯示色彩，主要採用哪一種色彩模式？", "opts": ["CMYK", "Pantone 專色", "灰階", "RGB"], "ans": 3, "why": "螢幕以紅、綠、藍三色光相加混色；印刷則以 CMYK 油墨減色混色。"}, {"island_id": "prepress", "q": "為避免裁切後露出白邊，檔案四周通常會多留約 3 mm 的哪個區域？", "opts": ["出血", "摺線", "留白", "浮水印"], "ans": 0, "why": "出血是讓底色或圖片延伸到裁切線之外的安全範圍。"}, {"island_id": "offset", "q": "平版印刷的基本原理是什麼？", "opts": ["凹槽儲墨", "鏤空漏墨", "油與水互相排斥", "凸起壓印"], "ans": 2, "why": "圖文處吸附油墨、非圖文處吸水而排斥油墨，所以稱為平版。"}, {"island_id": "offset", "q": "為什麼平版印刷又稱為 Offset 印刷？", "opts": ["紙張會先偏移位置", "影像先轉印到橡皮布，再轉印到紙張", "印版直接壓在紙上", "油墨用噴霧方式落墨"], "ans": 1, "why": "Offset 指「間接轉印」：版 → 橡皮布 → 承印物。"}, {"island_id": "offset", "q": "平版印刷中，潤版液（水）的主要作用是什麼？", "opts": ["讓紙張變軟", "加快油墨乾燥", "替印版降溫上色", "讓非圖文部分保持排斥油墨"], "ans": 3, "why": "水分維持空白處不沾墨，避免整版髒污。"}, {"island_id": "screen", "q": "網版印刷時，油墨是怎麼轉印到承印物上？", "opts": ["刮刀施壓讓油墨穿過網孔", "靠滾筒轉印", "由噴頭噴出", "靠加熱昇華"], "ans": 0, "why": "網版上圖文處的網孔是通的，刮刀把油墨擠過去即可成像。"}, {"island_id": "screen", "q": "網布的目數（mesh）數字越大，代表什麼？", "opts": ["網孔越粗", "網布越厚", "網孔越細，下墨量較少", "油墨越黏"], "ans": 2, "why": "高目數適合細緻線條與網點，低目數適合厚墨層。"}, {"island_id": "screen", "q": "網版印刷特別適合下列哪種情況？", "opts": ["只能印在紙上", "可印在 T 恤、玻璃、塑膠等多種材質", "只能做單色影印", "只能做大量報紙"], "ans": 1, "why": "網版能印的材質與形狀彈性大，墨層也較厚。"}, {"island_id": "special", "q": "在紙面做出局部亮面效果，突顯圖案的加工是什麼？", "opts": ["軋型", "騎馬釘", "打孔", "局部上光（Spot UV）"], "ans": 3, "why": "局部上光讓指定圖案更亮、更有層次。"}, {"island_id": "special", "q": "燙金的原理是什麼？", "opts": ["加熱加壓，把金屬箔轉印到紙面", "用金色油墨噴印", "用雷射燒出金色", "用水轉印金粉"], "ans": 0, "why": "燙金需要金屬版、熱與壓力，讓箔片只附著在圖文處。"}, {"island_id": "special", "q": "壓凸（Emboss）加工會讓圖案呈現什麼效果？", "opts": ["圖案凹陷變色", "圖案變得透明", "圖案凸起，有立體感", "圖案自動發光"], "ans": 2, "why": "壓凸以凹凸版對壓紙張，形成浮雕效果；凹下去的是壓凹。"}, {"island_id": "digital", "q": "相較傳統平版印刷，數位印刷最大的優勢之一是什麼？", "opts": ["單張成本永遠最低", "免製版，適合少量多樣與快速交件", "只能印黑白", "一定要先做大量庫存"], "ans": 1, "why": "數位印刷省去製版與開機調整，小量印製更有彈性。"}, {"island_id": "digital", "q": "UV 數位列印的墨水，通常是靠什麼來乾燥固化？", "opts": ["自然風乾", "噴灑冷水", "加入乾燥劑粉末", "紫外線（UV）照射"], "ans": 3, "why": "UV 墨水含光起始劑，照射紫外線後瞬間硬化。"}, {"island_id": "digital", "q": "「可變資料印刷」（VDP）指的是什麼？", "opts": ["每一份可以印不同內容，例如姓名、編號", "每一份的紙張大小都不同", "每一份使用不同的印刷機", "每一份的價格不同"], "ans": 0, "why": "獎狀、邀請函與票券常用，一次批次產出個人化內容。"}, {"island_id": "ai", "q": "向生成式 AI 下指令時，哪個做法最能提升結果品質？", "opts": ["只輸入一個關鍵字", "每次都換不同說法", "說清楚角色、背景、具體任務與限制", "要求越短越好"], "ans": 2, "why": "角色、背景、具體指令與約束條件，能讓 AI 更貼近需求。"}, {"island_id": "ai", "q": "向量圖形（如 AI、SVG）放大後會怎麼樣？", "opts": ["會出現馬賽克方格", "不會失真，邊緣依然清晰", "顏色會變淡", "檔案會變成點陣圖"], "ans": 1, "why": "向量以數學描述路徑，可無限縮放；點陣圖則由像素組成。"}, {"island_id": "ai", "q": "版面設計中，把相關資訊放在一起形成群組，屬於哪一個原則？", "opts": ["對比", "重複", "留白錯置", "親密性（Proximity）"], "ans": 3, "why": "靠近的元素會被視為有關聯，有助於資訊分區與閱讀。"}, {"island_id": "post", "q": "紙盒要折得整齊，常在摺線處先做哪一種加工？", "opts": ["壓線", "打孔", "燙金", "上光"], "ans": 0, "why": "壓線是在紙張上壓出凹痕，讓折疊時不爆裂、位置準確。"}, {"island_id": "post", "q": "要把紙張切出特定的外形輪廓，通常使用哪種加工？", "opts": ["裱貼", "過油", "模切", "壓凸"], "ans": 2, "why": "模切用刀模壓切，可做出任意形狀與開窗。"}, {"island_id": "post", "q": "用膠把書頁與書背黏在一起的裝訂方式，常稱為什麼？", "opts": ["騎馬釘", "無線膠裝", "線圈裝", "活頁夾裝"], "ans": 1, "why": "無線膠裝以熱熔膠黏合書背，常用於書籍與雜誌。"}, {"island_id": "photo", "q": "光圈值 f 的數字越小，代表什麼？", "opts": ["光圈越小", "快門越慢", "感光度越高", "光圈越大，進光量越多"], "ans": 3, "why": "例如 f/1.8 的進光量比 f/8 多，景深也比較淺。"}, {"island_id": "photo", "q": "快門速度設得很慢，最容易出現什麼問題？", "opts": ["手震或動態模糊", "畫面變黑白", "色彩變成 CMYK", "解析度自動提高"], "ans": 0, "why": "曝光時間長，相機或被攝者移動就會造成模糊，必要時使用腳架。"}, {"island_id": "photo", "q": "RAW 檔相較 JPG 的主要優點是什麼？", "opts": ["檔案一定更小", "可以直接上傳網頁", "保留較多影像資訊，後製調整空間大", "不需要任何軟體"], "ans": 2, "why": "RAW 是未壓縮或少處理的感光資料，適合精細調色。"}, {"island_id": "media", "q": "網頁色碼 #FF0000 代表哪個顏色？", "opts": ["純藍色", "純紅色", "純綠色", "純黑色"], "ans": 1, "why": "十六進位 RGB：FF 代表紅色滿格，00 代表綠與藍為零。"}, {"island_id": "media", "q": "解析度 1920×1080 的影片，常被稱為什麼？", "opts": ["4K UHD", "SD 標清", "8K", "Full HD"], "ans": 3, "why": "1920×1080 即全高畫質（Full HD）；4K UHD 通常是 3840×2160。"}, {"island_id": "media", "q": "撰寫網頁時，CSS 的主要工作是什麼？", "opts": ["決定外觀樣式，例如顏色與排版", "儲存使用者資料", "建立資料庫", "加密網路連線"], "ans": 0, "why": "HTML 負責結構，CSS 負責外觀，JavaScript 負責互動。"}, {"island_id": "discuss", "q": "哪個做法最能讓小組討論更有品質？", "opts": ["搶先發言壓過別人", "只附和大多數人", "先聆聽並整理他人重點，再提出自己的想法", "全程低頭滑手機"], "ans": 2, "why": "聽懂再回應，能讓討論累積而不是各說各話。"}, {"island_id": "discuss", "q": "引用他人研究或圖片時，應該怎麼做？", "opts": ["改成自己的名字", "清楚標示出處", "只引用但不標示", "刪除作者資訊"], "ans": 1, "why": "標示出處是學術與創作倫理，也方便讀者查證。"}, {"island_id": "discuss", "q": "哪一種提問方式比較容易引出深入的討論？", "opts": ["只能回答是或否的問題", "用質疑口氣的問題", "與主題無關的問題", "開放式問題，例如「為什麼」「如何」"], "ans": 3, "why": "開放式問題給對方空間說明想法與理由。"}, {"island_id": "courses", "q": "印刷五大要素通常包含原稿、印版、油墨、壓力，還有哪一項？", "opts": ["承印物", "電腦", "燈光", "紙箱"], "ans": 0, "why": "原稿、印版、油墨、承印物與壓力，缺一不可。"}, {"island_id": "courses", "q": "CMYK 四色印刷能呈現豐富色彩，主要靠什麼原理？", "opts": ["每個顏色各用一種專用紙", "把顏色全部先調成一桶", "網點大小與疊印混色", "靠印刷機轉速決定顏色"], "ans": 2, "why": "青、洋紅、黃、黑以不同網點面積疊印，眼睛會把它們混成各種顏色。"}, {"island_id": "courses", "q": "「圖文傳播」最貼近下列哪一種說法？", "opts": ["只研究紙張的化學成分", "運用文字與圖像設計、製作並傳遞訊息", "只學習拍照", "只學習影片剪接"], "ans": 1, "why": "從設計、印前、印刷到數位媒體，都屬於圖文傳播的範圍。"}, {"island_id": "stats", "q": "平均數與中位數相比，哪一個比較不受極端值影響？", "opts": ["平均數", "兩者都一樣", "兩者都完全受影響", "中位數"], "ans": 3, "why": "中位數只看排序後的中間位置，極端值對它影響較小。"}, {"island_id": "stats", "q": "在假設檢定中，p < .05 通常代表什麼？", "opts": ["結果達到統計顯著，可拒絕虛無假設", "研究一定完全正確", "樣本一定很大", "效果一定很強"], "ans": 0, "why": "p 值只說明資料與虛無假設不相容的程度，不代表效果大小。"}, {"island_id": "stats", "q": "研究中的「樣本」指的是什麼？", "opts": ["整個母體", "研究者本人", "從母體中抽出的一部分研究對象", "研究使用的軟體"], "ans": 2, "why": "樣本要具有代表性，推論到母體才可靠。"}, {"island_id": "mgmt", "q": "印刷估價時，下列哪一項較屬於會隨印量增加的變動成本？", "opts": ["製版費", "紙張與油墨", "設計稿費", "開機設定費"], "ans": 1, "why": "製版與設計多為固定成本；紙張與油墨用量會跟著印量增加。"}, {"island_id": "mgmt", "q": "印刷時的「放損」是指什麼？", "opts": ["客戶額外加印的份數", "設計稿的修改次數", "印刷機的保養時間", "為開機調色與裁切多準備的紙張"], "ans": 3, "why": "開機調整難免產生廢紙，估價時要預留放損。"}, {"island_id": "mgmt", "q": "專案管理中的甘特圖，最適合用來做什麼？", "opts": ["呈現工作項目與時程安排", "計算紙張面積", "比較色彩差異", "檢查文字錯字"], "ans": 0, "why": "甘特圖以橫條呈現各工作的起訖時間，便於追蹤進度。"}, {"island_id": "harbor", "q": "使用不熟悉的機器或設備之前，應該先做什麼？", "opts": ["憑感覺直接操作", "請同學代按開關", "接受操作說明與安全教育", "拆掉防護蓋試試看"], "ans": 2, "why": "先了解安全規範與正確操作，才能保護自己和設備。"}, {"island_id": "harbor", "q": "靠近旋轉滾筒的機台時，哪個習慣比較安全？", "opts": ["戴上鬆垮手套靠近操作", "束好長髮與衣袖，不戴垂掛飾品", "一邊滑手機一邊調整", "把外套拖在機台邊"], "ans": 1, "why": "長髮、衣袖與飾品可能被捲入轉動部位，工作前先整理好。"}, {"island_id": "harbor", "q": "參訪工廠或實驗室時，要拍攝照片之前應該怎麼做？", "opts": ["想拍就拍", "全部直播上網", "拍完再刪掉就好", "先取得現場負責人同意"], "ans": 3, "why": "有些製程與客戶資料屬於機密，先詢問才不會造成困擾。"}, {"island_id": "clubs", "q": "策劃社團活動時，第一步通常是什麼？", "opts": ["先確定活動目標與對象", "先印一千張海報", "先決定要不要下雨", "先挑吉祥物顏色"], "ans": 0, "why": "目標與對象明確了，場地、預算、宣傳才有依據。"}, {"island_id": "clubs", "q": "社團經費使用上，哪個做法比較正確？", "opts": ["私下記在腦中", "由一個人全權保管現金", "保留單據並公開帳目", "不用留任何紀錄"], "ans": 2, "why": "透明的帳目能讓社員信任，也方便日後交接。"}, {"island_id": "clubs", "q": "活動宣傳海報最重要的是什麼？", "opts": ["用最多的字", "一眼看懂主題、時間與地點", "用最多種字體", "把所有細節都縮小塞滿"], "ans": 1, "why": "清楚的視覺層級能讓路過的人在幾秒內抓到重點。"}, {"island_id": "showcase", "q": "展覽作品的說明牌，最需要包含哪些資訊？", "opts": ["只寫價格", "只寫日期", "完全不放文字", "作品名稱、創作者與創作概念或媒材"], "ans": 3, "why": "基本資訊讓觀眾理解作品，也尊重創作者。"}, {"island_id": "showcase", "q": "作品正式送印前，為確認顏色與版面常會做什麼？", "opts": ["打樣", "直接大量開印", "把檔案轉成低解析度", "只看螢幕不用確認"], "ans": 0, "why": "打樣能在量產前發現色偏與排版問題，降低重印風險。"}, {"island_id": "showcase", "q": "規劃展覽空間時，哪個設計最能幫助觀眾？", "opts": ["把作品隨機擺放", "讓走道越窄越好", "設計清楚的參觀動線與主視覺", "把標示全部藏起來"], "ans": 2, "why": "好的動線讓觀眾自然看完全部作品，主視覺則營造第一印象。"}];
  var Q={rows:DEFAULT.slice()},run=null,ctx={};
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function qs(id){return Q.rows.filter(function(r){return r.island_id===id;});}
  function need(n){return Math.ceil(n*2/3);}
  function name(id){var d=(ctx.D||[]).filter(function(x){return x.id===id;})[0];return d?d.name:id;}
  function set(rows){
    if(!Array.isArray(rows)||!rows.length)return;
    var ok=rows.filter(function(r){return r&&r.island_id&&r.q&&Array.isArray(r.opts)&&r.opts.length===4&&r.ans>=0&&r.ans<4;})
      .map(function(r){return {island_id:String(r.island_id),q:String(r.q).slice(0,100),opts:r.opts.map(function(x){return String(x).slice(0,60);}),ans:+r.ans,why:String(r.why||'').slice(0,120)};});
    if(ok.length)Q.rows=ok;
  }
  function section(id){
    var n=qs(id).length;if(!n)return '';
    var have=window.Students&&Students.hasBadge(id);
    return '<h3>🏅 印刷小任務</h3><p>'+n+' 題選擇題，答對 '+need(n)+' 題以上就能拿到「'+esc(name(id))+'」徽章。</p>'+
      (have?'<p class="qok">✓ 你已經拿到這座島的徽章了！</p>':'')+
      '<div class="actrow"><button class="primary" data-qz="start" data-id="'+esc(id)+'">'+(have?'再挑戰一次':'開始挑戰')+'</button></div><p class="note" id="qzNote"></p>';
  }
  function frame(id,inner){return '<button class="back" data-qz="exit" data-id="'+esc(id)+'">← 回到'+esc(name(id))+'</button><h2>🏅 '+esc(name(id))+'小任務</h2>'+inner;}
  function render(){
    var r=run,list=qs(r.id),q=list[r.i],h;
    h='<p class="note">第 '+(r.i+1)+' / '+list.length+' 題</p><p class="qq"><b>'+esc(q.q)+'</b></p><div role="group" aria-label="選項">';
    q.opts.forEach(function(o,k){
      var cls='opt qopt'+(r.picked!=null?(k===q.ans?' ok':(k===r.picked?' bad':'')):'');
      h+='<button type="button" class="'+cls+'" data-qz="pick" data-k="'+k+'"'+(r.picked!=null?' disabled':'')+'>'+'ABCD'.charAt(k)+'．'+esc(o)+'</button>';
    });
    h+='</div>';
    if(r.picked!=null){
      h+='<p class="qfb">'+(r.picked===q.ans?'答對了！':'答案是「'+esc(q.opts[q.ans])+'」。')+(q.why?' '+esc(q.why):'')+'</p>'+
        '<div class="actrow"><button class="primary" data-qz="next">'+(r.i+1<list.length?'下一題':'交卷')+'</button></div>';
    }
    ctx.detail.innerHTML=frame(r.id,h);ctx.detail.scrollTop=0;
  }
  function result(res){
    var r=run,n=res.total,h;
    h='<p class="qq"><b>你答對了 '+res.score+' / '+n+' 題</b></p>';
    if(res.passed){
      h+='<p class="qok">🎉 恭喜！拿到「'+esc(name(r.id))+'」徽章！</p>';
      if(res.local)h+='<p class="note">'+esc(res.msg)+'</p>';
    }else h+='<p>差一點點，答對 '+need(n)+' 題以上就能拿到徽章。看看解析，再挑戰一次吧！</p>';
    h+='<div class="actrow"><button class="primary" data-qz="start" data-id="'+esc(r.id)+'">'+(res.passed?'再玩一次':'再挑戰一次')+'</button><button data-qz="exit" data-id="'+esc(r.id)+'">回到島嶼</button></div>';
    ctx.detail.innerHTML=frame(r.id,h);ctx.detail.scrollTop=0;
  }
  function finish(){
    var r=run,list=qs(r.id);
    ctx.detail.innerHTML=frame(r.id,'<p>交卷中，請稍等…</p>');
    var local=function(msg){
      var s=0;list.forEach(function(q,i){if(r.answers[i]===q.ans)s++;});
      result({passed:s>=need(list.length),score:s,total:list.length,local:true,msg:msg});
    };
    if(!window.Students||!Students.canSave()){local(Students&&Students.loginHint?Students.loginHint():'目前是示範模式，徽章不會保存。');return;}
    Students.submitBadge(r.id,r.answers).then(function(res){result(res);}).catch(function(e){
      ctx.detail.innerHTML=frame(r.id,'<p>'+esc(e.message)+'</p><div class="actrow"><button class="primary" data-qz="exit" data-id="'+esc(r.id)+'">回到島嶼</button></div>');});
  }
  function onClick(e){
    var b=e.target.closest('[data-qz]');if(!b)return;e.stopPropagation();
    var a=b.dataset.qz,id=b.dataset.id;
    if(a==='start'){
      if(window.World&&World.onIsland&&!World.onIsland(id)){
        World.walkTo(id);var nt=document.getElementById('qzNote');
        if(nt)nt.textContent='正在走向「'+name(id)+'」，到了再按一次「開始挑戰」。';return;}
      run={id:id,i:0,answers:[],picked:null};render();
    }else if(a==='pick'&&run&&run.picked==null){
      var k=+b.dataset.k;run.picked=k;run.answers[run.i]=k;render();
    }else if(a==='next'&&run){
      if(run.i+1<qs(run.id).length){run.i++;run.picked=null;render();}else finish();
    }else if(a==='exit'){run=null;if(window.World)World.select(id,false);}
  }
  window.Quiz={
    set:set,section:section,count:function(id){return qs(id).length;},
    init:function(o){ctx=o;o.detail.addEventListener('click',onClick,true);
      if(o.api)fetch(o.api+(o.api.indexOf('?')>-1?'&':'?')+'action=quiz').then(function(r){return r.json();}).then(function(j){set(j&&j.quiz);}).catch(function(){});}
  };
})();
