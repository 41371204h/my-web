// --- OpenWeatherMap API 函數 (最終版 - 主頁即時查詢) ---
// ★★★ 您的真實 Key 在這裡：83b7835fd502cff5c1fe69ce70a7fe7e ★★★
const WEATHER_API_KEY = "83b7835fd502cff5c1fe69ce70a7fe7e"; 
const CITY_LAT = 25.033; 
const CITY_LON = 121.565; 

async function fetchCurrentWeather() {
    const weatherDisplay = document.getElementById('weather-info');
    if (!weatherDisplay) return;

    // ★★★ 移除錯誤的 Key 檢測邏輯 (已刪除) ★★★
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&units=metric&appid=${WEATHER_API_KEY}`;
    
    try {
    // ... (後續程式碼保持不變)
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== 200) {
            weatherDisplay.innerHTML = `天氣資料失敗 (${data.message})`;
            return;
        }

        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;

        // 顯示天氣資訊和圖標
        weatherDisplay.innerHTML = `${temp}°C / ${description}`;
        
        // 可選：替換圖標為更準確的圖標 (需要額外 CSS/圖片支持)
        const iconElement = document.querySelector('#weather-display i');
        if(iconElement){
             // 簡易圖標替換：白天/夜晚
             if (iconCode.includes('n')) {
                 iconElement.className = 'fa fa-moon'; // 夜晚圖標
             } else {
                 iconElement.className = 'fa fa-sun'; // 白天圖標
             }
        }

    } catch (error) {
        console.error("Weather API Request Error:", error);
        weatherDisplay.innerHTML = "天氣 API 請求失敗";
    }
}
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

// 打開 Modal 視窗 (恢復為純展示內容，不再呼叫天氣 API)
window.openModal = function(key) { 
    const data = experienceData[key];
    const modal = document.getElementById('experienceModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (data && modal) {
        // 顯示基本內容
        modalTitle.innerHTML = data.title;
        // 將 details 內容包裝在 ul 中，保持排版一致性
        modalBody.innerHTML = `<p>${data.details}</p>`; 

        // 啟動彈窗
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

// --- GitHub API 串接功能 (修正 API 速率限制檢查) ---

const GITHUB_USERNAME = '41371204h'; // 您的 GitHub 用戶名

async function fetchGithubRepos() {
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`;
    const reposContainer = document.getElementById('github-repos');
    const loadingMessage = document.getElementById('github-loading');

    if (!reposContainer || !loadingMessage) return;

    // 顯示載入狀態
    reposContainer.innerHTML = '';
    reposContainer.appendChild(loadingMessage);
    loadingMessage.style.display = 'block';

    try {
        const response = await fetch(url);

        // ★★★ 關鍵修正：檢查速率限制和錯誤狀態碼 ★★★
        if (response.status === 403) {
            // 檢查是否為速率限制錯誤 (通常會返回 403 或 429)
            const rateLimitReset = response.headers.get('X-Ratelimit-Reset');
            const resetTime = rateLimitReset ? new Date(rateLimitReset * 1000).toLocaleTimeString() : '稍後';
            
            reposContainer.innerHTML = `
                <p style="color: var(--accent); text-align: center; font-weight: 600;">
                    🚨 API 請求次數已達上限。請於 ${resetTime} 後再試。
                </p>
            `;
            return;
        }

        if (!response.ok) {
            throw new Error(`GitHub API error! status: ${response.status}`);
        }
        // ★★★ 結束關鍵修正 ★★★
        
        const data = await response.json();

        // 隱藏載入訊息
        loadingMessage.style.display = 'none';

        if (data && data.length > 0) {
            let htmlContent = '';
            data.forEach(repo => {
                const name = repo.name;
                const description = repo.description || '無專案描述';
                const url = repo.html_url;
                const language = repo.language || 'N/A';
                
                const updated = new Date(repo.updated_at).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });

                htmlContent += `
                    <div class="github-card fade-in">
                        <a href="${url}" target="_blank" rel="noopener noreferrer">${name}</a>
                        <p class="description">${description}</p>
                        <div class="github-info">
                            <span class="language">${language}</span>
                            <span>更新於 ${updated}</span>
                        </div>
                    </div>
                `;
            });
            reposContainer.innerHTML = htmlContent;
            
            if (typeof setupScrollReveal === 'function') {
                document.querySelectorAll('.github-card').forEach(card => card.classList.add('fade-in'));
                setupScrollReveal(); 
            }
        } else {
            reposContainer.innerHTML = '<p style="color: var(--muted); text-align: center;">找不到公開的專案。</p>';
        }

    } catch (error) {
        console.error("Fetch GitHub Repos Error:", error);
        reposContainer.innerHTML = '<p style="color: var(--accent); text-align: center;">載入 GitHub 專案失敗，請檢查網路或用戶名。</p>';
    }
}

// --- Google Books API 串接功能 (最終穩定版 - 強制無快取 & 帶 startIndex) ---
const MAX_RESULTS = 4; // 顯示的書籍數量

async function fetchBooks(queryTopic) {
    const API_QUERY = queryTopic || 'Web Development'; 
    
    // ★★★ 關鍵修正：確保排序和起始索引的邏輯在這裡 ★★★
    let orderBy = 'relevance';
    let startIndex = 0;
    
    switch (API_QUERY) {
        case 'Web Development':
            startIndex = 0;
            break;
        case 'Critical Thinking':
            startIndex = 4; 
            break;
        case 'Time Management':
            startIndex = 8; 
            orderBy = 'newest';
            break;
        case 'Career Growth':
            startIndex = 12; 
            orderBy = 'newest';
            break;
    }

    // 構造 URL
    const encodedQuery = encodeURIComponent(API_QUERY);
    // 確保 URL 中包含 startIndex
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=${MAX_RESULTS}&startIndex=${startIndex}&langRestrict=zh-TW&orderBy=${orderBy}`;
    
    const bookResultsContainer = document.getElementById('book-results');
    const loadingMessage = document.getElementById('loading-message'); 

    if (!bookResultsContainer || !loadingMessage) return;
    
    // 顯示載入狀態
    bookResultsContainer.innerHTML = '';
    if (!document.body.contains(loadingMessage)) {
        bookResultsContainer.appendChild(loadingMessage);
    }
    loadingMessage.style.display = 'block';

    try {
        // 關鍵修正：在 fetch 請求中加入 cache: 'no-cache'
        const response = await fetch(url, { cache: 'no-cache' });
        
        if (!response.ok) {
             throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }

        const data = await response.json();
        
        loadingMessage.style.display = 'none';

        if (data.items && data.items.length > 0) {
            let htmlContent = '';
            // ... (書籍卡片 HTML 產生邏輯保持不變) ...
            data.items.forEach(item => {
                const info = item.volumeInfo;
                if (info.title && info.imageLinks) {
                    const title = info.title;
                    const authors = info.authors ? info.authors.join(', ') : '未知作者';
                    const thumbnailUrl =
                        info.imageLinks.thumbnail ||
                        info.imageLinks.smallThumbnail ||
                        'placeholder.jpg';

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
            if (typeof setupScrollReveal === 'function') {
                setupScrollReveal();
            }
        } else {
            bookResultsContainer.innerHTML =
                `<p style="color: var(--muted); text-align: center;">抱歉，找不到符合「${API_QUERY}」主題的書籍。</p>`;
        }

    } catch (error) {
        if (loadingMessage) loadingMessage.style.display = 'none';
        console.error("Fetch Books Error:", error);
        bookResultsContainer.innerHTML =
            `<p style="color: var(--accent); text-align: center;">載入書籍失敗。(${error.message})</p>`;
    }
}

// --- 互動邏輯：處理主題按鈕點擊 (確保獲取正確主題) ---
function setupBookTopicInteraction() {
    const buttons = document.querySelectorAll('.topic-btn');
    buttons.forEach(button => {
        // 使用 event.currentTarget 來確保我們引用的是按鈕元素本身，而不是內部文字
        button.addEventListener('click', (event) => {
            const clickedButton = event.currentTarget; 
            
            // 1. 取得選中的主題
            const selectedTopic = clickedButton.dataset.topic; 

            // 2. 更新按鈕的 Active 狀態
            buttons.forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active'); 

            // 3. 呼叫 API 載入新主題書籍
            if (selectedTopic) {
                fetchBooks(selectedTopic);
            } else {
                console.error("Error: data-topic attribute not found on the clicked element.");
            }
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
// --- 頁面啟動點 (最終修正版 - 確保功能存在才調用) ---
window.addEventListener('load', async () => {
    // 1. 基本設定 (在所有頁面執行)
    setupDarkModeToggle(); 
    setupScrollReveal(); 
    
    // 2. 天氣 API 數據載入：在所有頁面執行
    if (typeof fetchCurrentWeather === 'function') {
        fetchCurrentWeather();
    }
    
    // 3. 技能頁面專屬功能
    if(document.body.classList.contains('skill-page')) {
        animateBars();
        if (typeof fetchGithubRepos === 'function') fetchGithubRepos(); 
    }

    // 4. 主頁功能 (書單互動 & 天氣按鈕)
    const topicButtons = document.querySelector('.topic-buttons');
    if (topicButtons) { 
        
        // 載入書籍功能 (必須等待)
        if (typeof fetchBooks === 'function') {
            // ★★★ 確保使用 await 等待書籍載入完成 ★★★
            await fetchBooks('Web Development'); 
        }
        
        // ★★★ 確保在按鈕綁定之前，書單內容已經顯示 ★★★
        if (typeof setupBookTopicInteraction === 'function') {
             setupBookTopicInteraction(); 
        }
        
        // 天氣互動功能
        if (typeof setupWeatherInteraction === 'function') {
             setupWeatherInteraction();
        }
    }
});