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
};

window.closeModal = function(event) {
    const modal = document.getElementById('experienceModal');
    if (modal) {
        if (!event || event.target === modal || event.target.classList.contains('modal-close')) {
            modal.classList.remove('open');
        }
    }
};

// --- GitHub API ---
const GITHUB_USERNAME = '41371204h';

async function fetchGithubRepos() {
    const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=3`;
    const reposContainer = document.getElementById('github-repos');
    const loadingMessage = document.getElementById('github-loading');

    if (!reposContainer || !loadingMessage) return;

    reposContainer.innerHTML = '';
    reposContainer.appendChild(loadingMessage);
    loadingMessage.style.display = 'block';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

        const data = await response.json();
        loadingMessage.style.display = 'none';

        if (data && data.length > 0) {
            reposContainer.innerHTML = data.map(repo => {
                const updated = new Date(repo.updated_at).toLocaleDateString('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit'});
                return `
                    <div class="github-card fade-in">
                        <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                        <p class="description">${repo.description || '無專案描述'}</p>
                        <div class="github-info">
                            <span class="language">${repo.language || 'N/A'}</span>
                            <span>更新於 ${updated}</span>
                        </div>
                    </div>`;
            }).join('');

            if (typeof setupScrollReveal === 'function') {
                document.querySelectorAll('.github-card').forEach(card => card.classList.add('show'));
                setupScrollReveal();
            }

        } else {
            reposContainer.innerHTML = '<p style="color: var(--muted); text-align: center;">找不到公開的專案。</p>';
        }

    } catch (err) {
        console.error(err);
        reposContainer.innerHTML = '<p style="color: var(--accent); text-align: center;">GitHub 載入失敗</p>';
    }
}

// --- Google Books API ---
const MAX_RESULTS = 4;

async function fetchBooks(queryTopic) {
    const topic = queryTopic || 'Web Development';
    let orderBy = 'relevance';
    let startIndex = 0;

    switch (topic) {
        case 'Web Development': startIndex = 0; orderBy = 'relevance'; break;
        case 'Critical Thinking': startIndex = 4; break;
        case 'Time Management': startIndex = 8; orderBy = 'newest'; break;
        case 'Career Growth': startIndex = 12; orderBy = 'newest'; break;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(topic)}&maxResults=${MAX_RESULTS}&startIndex=${startIndex}&langRestrict=zh-TW&orderBy=${orderBy}&cache=${Math.random()}`;

    const container = document.getElementById('book-results');
    const loading = document.getElementById('loading-message');

    if (!container || !loading) return;

    container.innerHTML = '';
    container.appendChild(loading);
    loading.style.display = 'block';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.status);

        const data = await response.json();
        loading.style.display = 'none';

        if (data.items && data.items.length > 0) {
            container.innerHTML = data.items.filter(item => item.volumeInfo.title && item.volumeInfo.imageLinks)
            .map(item => {
                const info = item.volumeInfo;
                const img = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || 'placeholder.jpg';

                return `
                    <div class="book-card">
                        <img src="${img}" alt="${info.title} 封面">
                        <h4>${info.title}</h4>
                        <p>${info.authors ? info.authors.join(', ') : '未知作者'}</p>
                    </div>`;
            }).join('');

            if (typeof setupScrollReveal === 'function') {
                document.querySelectorAll('.book-card').forEach(card => card.classList.add('show'));
                setupScrollReveal();
            }

        } else {
            container.innerHTML = `<p style="color: var(--muted); text-align: center;">找不到符合「${topic}」的書籍。</p>`;
        }

    } catch (err) {
        console.error("Books API Error:", err);
        container.innerHTML = `<p style="color: var(--accent); text-align: center;">載入失敗：${topic}</p>`;
    }
}

// --- 書單主題按鈕 ---
function setupBookTopicInteraction() {
    const buttons = document.querySelectorAll('.topic-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', e => {
            const target = e.currentTarget;
            const topic = target.dataset.topic;

            buttons.forEach(b => b.classList.remove('active'));
            target.classList.add('active');

            fetchBooks(topic);
        });
    });
}

// --- 技能長條圖動畫 ---
function animateBars(){
    document.querySelectorAll('.bar').forEach((b,i)=>{
        const percent = b.getAttribute('data-percent') || '0';
        const fill = b.querySelector('.fill');
        fill.style.width = '0%';
        fill.style.transition = 'none';

        setTimeout(()=>{
            fill.style.transition = 'width 900ms cubic-bezier(.2,.9,.2,1)';
            fill.style.width = percent + '%';
        }, 100*i + 200);
    })
}

// --- Scroll Reveal ---
function setupScrollReveal(){
    const io = new IntersectionObserver((entries)=>{
        entries.forEach(ent=>{
            if(ent.isIntersecting){
                ent.target.classList.add('show');

                if(ent.target.classList.contains('stagger')){
                    [...ent.target.children].forEach((c,idx)=>{
                        setTimeout(()=>c.classList.add('show'), idx*100);
                    });
                }

                if(ent.target.classList.contains('bars')){
                    animateBars();
                }

                io.unobserve(ent.target);
            }
        });
    },{threshold:0.12});

    document.querySelectorAll('.fade-in, .stagger').forEach(el=>{
        if(el.classList.contains('stagger')){
            [...el.children].forEach(c=>c.classList.remove('show'));
        }
        io.observe(el);
    });
}

// --- Dark Mode ---
function setupDarkModeToggle(){
    const key = 'site-dark-mode-v1';
    if(localStorage.getItem(key)==='1'){
        document.body.classList.add('dark-mode');
    }

    const brand = document.querySelector('.brand');
    if(brand){
        brand.addEventListener('dblclick',()=>{
            document.body.classList.toggle('dark-mode');
            localStorage.setItem(key, document.body.classList.contains('dark-mode') ? '1' : '0');
        });
    }
}

// --- Page Init ---
window.addEventListener('load', async () => {
    setupDarkModeToggle();
    setupScrollReveal();

    if(document.body.classList.contains('skill-page')){
        animateBars();
        fetchGithubRepos();
    }

    const topicButtons = document.querySelector('.topic-buttons');
    if(topicButtons){
        await fetchBooks('Web Development');
        setupBookTopicInteraction();
    }
});
