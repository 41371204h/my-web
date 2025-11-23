// --- Modal Content Data (用於經歷頁面的彈窗) ---
const experienceData = {
    camp: {
        title: "科技營 活動股 (大一)",
        details: `
            <p><strong>擔任活動股主要負責活動的構思、流程設計與執行，從中學習到：</strong></p>
            <ul>
                <li>活動規劃與執行： 參與設計營隊中的團康遊戲及主題活動，針對不同年齡層設計互動環節，確保流程順暢且充滿樂趣。</li>
                <li>團隊協作能力： 與輔導、課程等股別緊密配合，高效解決活動現場（如道具準備不足、流程銜接等）的突發問題，展現高度應變力。</li>
                <li>時間壓力管理： 在有限的時間內高效地完成活動內容的演練與優化，並準時準備所有相關道具與物資。</li>
            </ul>
        `
    },
    night: {
        title: "科技之夜 公關股 (大一)",
        details: `
            <p><strong>作為公關股成員，主要職責是建立外部聯繫，為活動爭取資源：</strong></p>
            <ul>
                <li>對外溝通協調： 積極聯繫並拜訪校外多位贊助廠商，成功洽談活動資金與物資支持，為活動提供了充足的後勤保障。</li>
                <li>贊助提案簡報： 撰寫並優化專業的贊助方案與簡報，清晰呈現活動價值和品牌曝光機會，最終成功達成預定贊助目標。</li>
                <li>人際關係建立： 在合作過程中維護與廠商的良好互動，展現誠懇負責的態度，為系上未來活動奠定優良的合作基礎。</li>
            </ul>
        `
    },
    supper_camp: {
        title: "宿營 器材設備股 (大二)",
        details: `
            <p><strong>擔任器設股，負責活動背後的硬體支持，確保設備萬無一失：</strong></p>
            <ul>
                <li>活動拍攝與紀錄： 從活動準備時的驗收到活動當天，為每個人拍攝與紀錄</li>
                <li>危機處理應變： 提前準備多套備用設備和技術支援，確保設備在野外活動中能穩定運作，最大限度降低因設備故障導致的流程中斷風險。</li>
                <li>後勤支援統籌： 負責場地的佈置、活動結束後的拆卸與器材的運輸，是活動順利進行的強大幕後功臣。</li>
            </ul>
        `
    }
};

// --- Modal Functionality ---

// 打開 Modal 視窗
window.openModal = function(key) {
    const data = experienceData[key];
    const modal = document.getElementById('experienceModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (data && modal) {
        modalTitle.innerHTML = data.title;
        modalBody.innerHTML = data.details;
        modal.classList.add('open');
    }
}

// 關閉 Modal 視窗
window.closeModal = function(event) {
    const modal = document.getElementById('experienceModal');
    if (modal) {
        // 點擊遮罩背景時才關閉，點擊視窗內容本身不關閉
        if (!event || event.target === modal || event.target.classList.contains('modal-close')) {
            modal.classList.remove('open');
        }
    }
}


// --- Google Books API 串接功能 (修正版) ---

const MAX_RESULTS = 4; // 顯示的書籍數量

// 核心功能：根據主題來獲取書籍
async function fetchBooks(queryTopic) {
    const API_QUERY = queryTopic || 'Web Development'; // 預設主題
    const url = `https://www.googleapis.com/books/v1/volumes?q=${API_QUERY}&maxResults=${MAX_RESULTS}&langRestrict=zh-TW&orderBy=relevance`;
    
    const bookResultsContainer = document.getElementById('book-results');
    
    // 每次都重新獲取載入訊息元素
    const loadingMessage = document.getElementById('loading-message'); 

    if (!bookResultsContainer || !loadingMessage) return;
    
    // 顯示載入狀態
    bookResultsContainer.innerHTML = '';
    // 檢查 loadingMessage 是否還在 DOM 中，如果不在，就重新添加
    if (!document.body.contains(loadingMessage)) {
        bookResultsContainer.appendChild(loadingMessage);
    }
    loadingMessage.style.display = 'block';

    try {
        const response = await fetch(url);
        const data = await response.json();

        // 隱藏載入訊息
        loadingMessage.style.display = 'none';

        if (data.items && data.items.length > 0) {
            let htmlContent = '';
            data.items.forEach(item => {
                const info = item.volumeInfo;
                if (info.title && info.imageLinks) {
                    const title = info.title;
                    const authors = info.authors ? info.authors.join(', ') : '未知作者';
                    const thumbnailUrl = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail;

                    htmlContent += `
                        <div class="book-card">
                            <img src="${thumbnailUrl}" alt="${title} 封面">
                            <h4>${title}</h4>
                            <p>${authors}</p>
                        </div>
                    `;
                }
            });
            bookResultsContainer.innerHTML = htmlContent;
            // 由於書籍是動態載入，我們再次觸發 stagger 動畫
            if (typeof setupScrollReveal === 'function') {
                setupScrollReveal(); 
            }
        } else {
            bookResultsContainer.innerHTML = '<p style="color: var(--muted); text-align: center;">抱歉，找不到符合該主題的書籍。</p>';
        }

    } catch (error) {
        console.error("Fetch Books Error:", error);
        bookResultsContainer.innerHTML = '<p style="color: var(--accent); text-align: center;">載入書籍失敗，請檢查網路或 API 服務。</p>';
    }
}

// --- 互動邏輯：處理主題按鈕點擊 ---

function setupBookTopicInteraction() {
    const buttons = document.querySelectorAll('.topic-btn');
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            // 1. 取得選中的主題
            const selectedTopic = event.target.dataset.topic;

            // 2. 更新按鈕的 Active 狀態
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            // 3. 呼叫 API 載入新主題書籍
            fetchBooks(selectedTopic);
        });
    });
}


// --- 技能長條圖動畫 (只在 skills.html 執行) ---
function animateBars(){
    document.querySelectorAll('.bar').forEach((b,i)=>{
        const p = b.getAttribute('data-percent') || '0';
        const fill = b.querySelector('.fill');
        // Reset width before animation if the page is reloaded
        fill.style.width = '0%';
        fill.style.transition = 'none';

        // Staggered animation
        setTimeout(()=>{
            fill.style.transition = 'width 900ms cubic-bezier(.2,.9,.2,1)';
            fill.style.width = p + '%';
        }, 100*i + 200);
    })
}


// --- 滾動揭示動畫 (Scroll Reveal) ---
function setupScrollReveal(){
    const io = new IntersectionObserver((entries)=>{
        entries.forEach((ent)=>{
            if(ent.isIntersecting){
                // For single fade-in elements
                ent.target.classList.add('show');
                
                // For staggered containers (like Cards or Bars)
                if(ent.target.classList.contains('stagger')){
                    const children = Array.from(ent.target.children);
                    children.forEach((c,idx)=>{
                        // Apply show class with staggered delay
                        setTimeout(()=>c.classList.add('show'), idx*100);
                    });
                }
                
                // Special case for bars (trigger the bar fill animation)
                if(ent.target.classList.contains('bars')){
                    animateBars();
                }

                io.unobserve(ent.target); // Stop observing once revealed
            }
        });
    },{threshold:0.12});

    // Observe all elements marked for animation
    document.querySelectorAll('.fade-in, .stagger').forEach(el=>{
        // Hide children initially for stagger effect
        if(el.classList.contains('stagger')) {
             Array.from(el.children).forEach(c => c.classList.remove('show'));
        }
        io.observe(el);
    });
}


// --- 暗黑模式切換 (Double-click brand) ---
function setupDarkModeToggle(){
    const key = 'site-dark-mode-v1';
    const saved = localStorage.getItem(key);
    if(saved === '1') document.body.classList.add('dark-mode');
    
    const brand = document.querySelector('.brand');
    if(brand) {
        brand.addEventListener('dblclick', ()=>{
            document.body.classList.toggle('dark-mode');
            localStorage.setItem(key, document.body.classList.contains('dark-mode')? '1':'0');
        });
    }
}


// --- 頁面啟動點 (最終統一版，修復 API 互動問題) ---
window.addEventListener('load', async () => {
    // 1. 基本設定 (在所有頁面執行)
    setupDarkModeToggle(); 
    setupScrollReveal(); 
    
    // 2. 技能頁面專屬功能
    if(document.body.classList.contains('skill-page')) {
        animateBars();
    }

    // 3. 書單互動功能 (只在主頁 index.html 執行)
    const topicButtons = document.querySelector('.topic-buttons');
    if (topicButtons) {
        // A. 初始載入預設書籍 ('Web Development')，並等待 API 完成。
        await fetchBooks('Web Development'); 

        // B. 設置互動功能：書籍載入成功後，按鈕點擊事件啟動。
        setupBookTopicInteraction(); 
    }
});