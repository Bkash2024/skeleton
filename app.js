// *** STORAGE CONFIG ***
const STORAGE = {
    CONTEXTS: 'sk_ctx_v5',
    BANK: 'sk_bank_v5',
    ASSIGNMENTS: 'sk_assign_v5',
    HISTORY: 'sk_h_v5',
    PROGRESS: 'sk_p_v5',
    SETTINGS: 'sk_settings_v5'
};

const DEFAULT_CTX = [{ id: 'morn', l: 'Morning', i: '🌅', order: 0 }];
const DEFAULT_SETTINGS = { sections: { assignments: true, bank: false, contexts: false } };

// STATE
let contexts = JSON.parse(localStorage.getItem(STORAGE.CONTEXTS) || JSON.stringify(DEFAULT_CTX));
let bank = JSON.parse(localStorage.getItem(STORAGE.BANK) || '[]');
let assignments = JSON.parse(localStorage.getItem(STORAGE.ASSIGNMENTS) || '{}');
let history = JSON.parse(localStorage.getItem(STORAGE.HISTORY) || '{}');
let progress = JSON.parse(localStorage.getItem(STORAGE.PROGRESS) || '{}');
let settings = JSON.parse(localStorage.getItem(STORAGE.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));

let activeCtxId = '';
let currentQIndex = 0;
let answers = {};
let currentViewedDate = '';

// UI STATE FOR ACCORDIONS
let expandedItems = new Set();

// --- CORE UI ---
function showView(view) {
    ['welcomeView','loggerView','setupView','historyView'].forEach(id => document.getElementById(id).classList.add('hidden'));
    document.getElementById(view+'View').classList.remove('hidden');

    if(view === 'welcome') renderWelcome();
    if(view === 'setup') renderEditor();
    if(view === 'history') { renderCalendar(); document.getElementById('historyEntries').innerHTML=''; }
    renderChips();
}

function renderChips() {
    const chips = document.getElementById('chipContainer');
    let html = '';
    const today = new Date().toISOString().slice(0,10);
    contexts.sort((a,b)=>a.order-b.order).forEach(ctx => {
        const isDone = history[today]?.some(x => x.ctx === ctx.id);
        const isProg = progress[`${today}_${ctx.id}`];
        let style = '';
        if(isDone) style = 'border-color:#34c759; background:#f0fff4;';
        else if(isProg) style = 'border-color:#ff9f0a; background:#fffbf0;';
        html += `<div class="chip" style="${style}" onclick="startContext('${ctx.id}')">${ctx.i} ${ctx.l}</div>`;
    });
    chips.innerHTML = html;
}

function renderWelcome() {
    const grid = document.getElementById('welcomeGrid');
    let html = '';
    contexts.sort((a,b)=>a.order-b.order).forEach(ctx => {
        html += `<button class="ctx-btn" onclick="startContext('${ctx.id}')"><span>${ctx.i}</span> ${ctx.l}</button>`;
    });
    grid.innerHTML = html;
}

// --- LOGGER ---
function startContext(id) {
    activeCtxId = id;
    const today = new Date().toISOString().slice(0,10);
    const saved = progress[`${today}_${id}`];

    if(saved) {
        currentQIndex = saved.idx;
        answers = saved.ans;
        document.getElementById('resumeBanner').style.display = 'block';
    } else {
        currentQIndex = 0;
        answers = {};
        document.getElementById('resumeBanner').style.display = 'none';
    }

    const qIds = assignments[id] || [];
    if(qIds.length === 0) {
        modal.show('Empty', 'No questions in this tab.', null); return;
    }
    showView('logger');
    renderQuestion();
}

function renderQuestion() {
    const ctx = contexts.find(c => c.id === activeCtxId);
    const qIds = assignments[activeCtxId];

    if(currentQIndex >= qIds.length) { completeContext(); return; }

    const q = bank.find(x => x.id === qIds[currentQIndex]);
    if(!q) { currentQIndex++; renderQuestion(); return; }

    document.getElementById('ctxName').innerText = ctx.l;
    document.getElementById('stepText').innerText = `${currentQIndex+1}/${qIds.length}`;
    document.getElementById('questionText').innerText = q.l;

    const area = document.getElementById('inputArea');
    area.innerHTML = '';

    const val = answers[q.id];

    if(q.t === 'select' || q.t === 'multi') {
        (q.o || '').split(',').forEach(opt => {
            opt = opt.trim();
            const btn = document.createElement('div');
            btn.className = 'option-pill';
            btn.innerText = opt;
            if(q.t==='select' && val===opt) btn.classList.add('active');
            if(q.t==='multi' && Array.isArray(val) && val.includes(opt)) btn.classList.add('active');
            btn.onclick = () => {
                if(q.t==='select') { answers[q.id]=opt; handleNext(); }
                else {
                    if(!Array.isArray(answers[q.id])) answers[q.id]=[];
                    const i = answers[q.id].indexOf(opt);
                    if(i>-1) answers[q.id].splice(i,1); else answers[q.id].push(opt);
                    renderQuestion();
                }
            };
            area.appendChild(btn);
        });
    } else if (q.t === 'toggle') {
        const checked = val === true;
        area.innerHTML = `<div onclick="toggleBool('${q.id}')" class="option-pill ${checked?'active':''}" style="font-size:20px;">${checked?'YES':'NO'}</div>`;
    } else if (q.t === 'range') {
        const num = val || 5;
        area.innerHTML = `<div style="text-align:center;font-size:40px;color:#007aff;margin-bottom:10px;">${num}</div><input type="range" min="0" max="10" step="0.5" value="${num}" style="width:100%;height:40px;" oninput="updateRange(this,'${q.id}')">`;
    } else if (q.t === 'time') {
        area.innerHTML = `<input type="time" value="${val||''}" oninput="answers['${q.id}']=this.value">`;
    } else {
        area.innerHTML = `<input type="text" value="${val||''}" placeholder="Type answer..." oninput="answers['${q.id}']=this.value">`;
    }
}

window.toggleBool = (qid) => { answers[qid] = !answers[qid]; renderQuestion(); };
window.updateRange = (el, qid) => { answers[qid] = el.value; el.previousElementSibling.innerText = el.value; };

function handleSkip() { saveProgress(); moveNext(); }
function handleNext() { saveProgress(); moveNext(); }

function moveNext() {
    const qIds = assignments[activeCtxId];
    if(currentQIndex < qIds.length - 1) { currentQIndex++; renderQuestion(); }
    else { completeContext(); }
}

function handleBack() {
    saveProgress();
    if(currentQIndex > 0) { currentQIndex--; renderQuestion(); }
    else showView('welcome');
}

function saveProgress() {
    const today = new Date().toISOString().slice(0,10);
    progress[`${today}_${activeCtxId}`] = { idx: currentQIndex, ans: answers };
    localStorage.setItem(STORAGE.PROGRESS, JSON.stringify(progress));
    renderChips();
}

function resetProgress() {
    const today = new Date().toISOString().slice(0,10);
    delete progress[`${today}_${activeCtxId}`];
    localStorage.setItem(STORAGE.PROGRESS, JSON.stringify(progress));
    startContext(activeCtxId);
}

function completeContext() {
    const today = new Date().toISOString().slice(0,10);
    if(!history[today]) history[today] = [];
    history[today].push({ ctx: activeCtxId, ans: answers, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) });
    localStorage.setItem(STORAGE.HISTORY, JSON.stringify(history));
    delete progress[`${today}_${activeCtxId}`];
    localStorage.setItem(STORAGE.PROGRESS, JSON.stringify(progress));
    modal.show('Saved!', 'Log entry saved.', () => showView('welcome'));
}

// --- HISTORY ---
function renderCalendar() {
    const cal = document.getElementById('calendar');
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const firstDay = new Date(y, m, 1).getDay();

    let html = '';
    ['S','M','T','W','T','F','S'].forEach(d => html += `<div style="text-align:center;font-size:12px;color:#888;">${d}</div>`);
    for(let i=0; i<firstDay; i++) html += '<div></div>';
    for(let d=1; d<=daysInMonth; d++) {
        const dateStr = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const hasData = history[dateStr]?.length > 0;
        const isToday = (d === today.getDate());
        let cls = 'cal-day';
        if(hasData) cls += ' has-data';
        if(isToday) cls += ' today';
        html += `<div class="${cls}" onclick="viewDay('${dateStr}')">${d}</div>`;
    }
    cal.innerHTML = html;
}

function viewDay(date) {
    currentViewedDate = date;
    const list = document.getElementById('historyEntries');
    const logs = history[date] || [];
    document.getElementById('dayDownloadBtn').classList.remove('hidden');

    if(logs.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:20px; color:#999;">No logs for ${date}</div>`;
        document.getElementById('dayDownloadBtn').classList.add('hidden');
        return;
    }

    list.innerHTML = logs.map((l, idx) => {
        const c = contexts.find(x => x.id === l.ctx) || {l:l.ctx, i:'?'};
        let content = `<div class="history-entry">
            <button onclick="deleteEntry('${date}', ${idx})" style="float:right; border:none; background:none; color:#ff3b30;">✕</button>
            <div class="entry-header">${c.i} ${c.l} <span style="font-weight:400; color:#888;">${l.time}</span></div>`;

        Object.keys(l.ans).forEach(qid => {
            const q = bank.find(x => x.id === qid);
            if(q) {
                let val = l.ans[qid];
                if(Array.isArray(val)) val = val.join(', ');
                if(val === true) val = 'Yes';
                if(val === false) val = 'No';
                content += `<div class="entry-answer"><span style="color:#666;">${q.l}:</span> <b>${val}</b></div>`;
            }
        });
        return content + '</div>';
    }).join('');
}

function deleteEntry(date, idx) {
    if(confirm('Delete this entry?')) {
        history[date].splice(idx, 1);
        if(history[date].length===0) delete history[date];
        localStorage.setItem(STORAGE.HISTORY, JSON.stringify(history));
        viewDay(date);
        renderCalendar();
    }
}

function searchHistory() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    if(!term) { renderCalendar(); document.getElementById('historyEntries').innerHTML=''; return; }
    document.getElementById('calendar').innerHTML = '';
    const list = document.getElementById('historyEntries');
    let html = '';
    Object.keys(history).sort().reverse().forEach(date => {
        history[date].forEach(l => {
            const c = contexts.find(x => x.id === l.ctx) || {l:''};
            const searchStr = (c.l + ' ' + JSON.stringify(l.ans)).toLowerCase();
            if(searchStr.includes(term)) {
                html += `<div class="history-entry"><div class="entry-header">${date} · ${c.l}</div>`;
                Object.keys(l.ans).forEach(qid => {
                     const q = bank.find(x => x.id === qid);
                     if(q) html += `<div class="entry-answer">${q.l}: ${l.ans[qid]}</div>`;
                });
                html += `</div>`;
            }
        });
    });
    list.innerHTML = html || '<div style="text-align:center; padding:20px;">No matches</div>';
}

// --- SETTINGS (COLLAPSIBLE ITEMS) ---

function toggleItemExpand(id) {
    if(expandedItems.has(id)) expandedItems.delete(id);
    else expandedItems.add(id);
    renderEditor();
}

function renderEditor() {
    // Restore sections state
    Object.keys(settings.sections).forEach(k => {
        const el = document.getElementById(k+'Section');
        const tog = document.getElementById(k+'Toggle');
        if(settings.sections[k]) { el.classList.remove('collapsed'); tog.innerText='▼'; }
        else { el.classList.add('collapsed'); tog.innerText='▶'; }
    });

    // 1. Assignments
    const assignDiv = document.getElementById('assignmentEditor');
    let html = '';
    contexts.sort((a,b)=>a.order-b.order).forEach(ctx => {
        const isExpanded = expandedItems.has('assign_'+ctx.id);

        // HEADER with Toolbar
        html += `<div class="accordion-item">
            <div class="accordion-header" onclick="toggleItemExpand('assign_${ctx.id}')">
                <span>${ctx.i} ${ctx.l}</span>
                <span>${isExpanded ? '▼' : '▶'}</span>
            </div>

            <div class="accordion-toolbar">
                <select onchange="addToContext('${ctx.id}', this.value); this.value='';" style="width:100%; border-radius:8px; border:1px solid #ddd; background:#f9f9f9; padding:8px;">
                    <option value="">+ Add Question to ${ctx.l}...</option>
                    ${bank.filter(b => !(assignments[ctx.id]||[]).includes(b.id)).map(q => `<option value="${q.id}">${q.l}</option>`).join('')}
                </select>
            </div>

            <div class="accordion-body ${isExpanded ? '' : 'hidden'}">`;

        // Content
        const qIds = assignments[ctx.id] || [];
        if(qIds.length > 0) {
            qIds.forEach((qid, idx) => {
                const q = bank.find(x => x.id === qid);
                if(q) {
                    html += `<div class="assigned-item">
                        <span class="assigned-order">${idx+1}</span>
                        <span class="assigned-text">${q.l}</span>
                        <div class="reorder-controls">
                            <button class="mini-btn" onclick="moveAssign('${ctx.id}', ${idx}, -1)">↑</button>
                            <button class="mini-btn" onclick="moveAssign('${ctx.id}', ${idx}, 1)">↓</button>
                            <button class="mini-btn" style="color:red;" onclick="removeFromContext('${ctx.id}', '${qid}')">✕</button>
                        </div>
                    </div>`;
                }
            });
        } else {
            html += `<div style="color:#aaa; font-size:13px;">No questions assigned</div>`;
        }

        html += `</div></div>`; // Close Body, Close Item
    });
    assignDiv.innerHTML = html;

    // 2. Bank List (Separate from Create)
    const bankListExpanded = expandedItems.has('bankList');
    if(bankListExpanded) {
         document.getElementById('bankListBody').classList.remove('hidden');
         document.getElementById('bankListIcon').innerText = '▼';
    } else {
         document.getElementById('bankListBody').classList.add('hidden');
         document.getElementById('bankListIcon').innerText = '▶';
    }

    document.getElementById('bankEditor').innerHTML = bank.map(q => {
        const isExpanded = expandedItems.has('bank_'+q.id);
        return `
        <div class="accordion-item" style="border-left: 4px solid #007aff; margin-bottom:10px;">
            <div class="accordion-header" onclick="toggleItemExpand('bank_${q.id}')">
                <span>${q.l}</span>
                <span>${isExpanded ? '▼' : '▶'}</span>
            </div>
            <div class="accordion-body ${isExpanded ? '' : 'hidden'}">
                <div style="display:flex; gap:10px; margin-bottom:5px;">
                    <input value="${q.l}" onchange="updateBank('${q.id}', 'l', this.value)" style="flex:1; border:1px solid #ddd;">
                    <button onclick="deleteFromBank('${q.id}')" style="border:none; background:none; color:red;">Delete</button>
                </div>
                <div style="display:flex; gap:10px;">
                    <select onchange="updateBank('${q.id}','t',this.value)" style="width:100px; border:1px solid #ddd;">
                        <option value="text" ${q.t==='text'?'selected':''}>Text</option>
                        <option value="range" ${q.t==='range'?'selected':''}>Range</option>
                        <option value="toggle" ${q.t==='toggle'?'selected':''}>Yes/No</option>
                        <option value="select" ${q.t==='select'?'selected':''}>Select</option>
                        <option value="multi" ${q.t==='multi'?'selected':''}>Multi</option>
                        <option value="time" ${q.t==='time'?'selected':''}>Time</option>
                    </select>
                    <input value="${q.o||''}" placeholder="Options..." onchange="updateBank('${q.id}','o',this.value)" style="flex:1; display:${(q.t==='select'||q.t==='multi')?'block':'none'}; border:1px solid #ddd;">
                </div>
            </div>
        </div>`;
    }).join('');

    // 3. Contexts (Reorder)
    document.getElementById('contextEditor').innerHTML = contexts.map((c, i) => `
        <div style="display:flex; gap:5px; margin-bottom:10px; align-items:center;">
            <input value="${c.i}" onchange="updateCtx('${c.id}', 'i', this.value)" style="width:40px; text-align:center;">
            <input value="${c.l}" onchange="updateCtx('${c.id}', 'l', this.value)" style="flex:1;">
            <button class="mini-btn" onclick="moveContext(${i}, -1)">↑</button>
            <button class="mini-btn" onclick="moveContext(${i}, 1)">↓</button>
            <button class="mini-btn" style="color:red;" onclick="deleteContext('${c.id}')">✕</button>
        </div>
    `).join('');
}

// --- EDITOR ACTIONS ---
function toggleSection(key) {
    settings.sections[key] = !settings.sections[key];
    localStorage.setItem(STORAGE.SETTINGS, JSON.stringify(settings));
    renderEditor();
}

window.moveAssign = function(ctxId, idx, dir) {
    const arr = assignments[ctxId];
    if (dir===-1 && idx>0) { [arr[idx], arr[idx-1]] = [arr[idx-1], arr[idx]]; }
    if (dir===1 && idx<arr.length-1) { [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]]; }
    saveAll();
};

window.moveContext = function(idx, dir) {
    if (dir===-1 && idx>0) { [contexts[idx].order, contexts[idx-1].order] = [contexts[idx-1].order, contexts[idx].order]; }
    if (dir===1 && idx<contexts.length-1) { [contexts[idx].order, contexts[idx+1].order] = [contexts[idx+1].order, contexts[idx].order]; }
    contexts.sort((a,b)=>a.order-b.order);
    saveAll();
};

window.updateBank = function(id, field, val) {
    const q = bank.find(x => x.id === id);
    if(q) { q[field] = val; saveAll(); }
};

window.updateCtx = function(id, field, val) {
    const c = contexts.find(x => x.id === id);
    if(c) { c[field] = val; saveAll(); }
};

window.addToContext = function(ctxId, qId) {
    if(!assignments[ctxId]) assignments[ctxId] = [];
    assignments[ctxId].push(qId);
    saveAll();
};

window.removeFromContext = function(ctxId, qId) {
    assignments[ctxId] = assignments[ctxId].filter(x => x !== qId);
    saveAll();
};

window.addToBank = function() {
    const newId = 'q' + Date.now();
    // UNSHIFT adds to top, PUSH adds to bottom
    bank.unshift({id: newId, l:'New Question', t:'text', o:''});

    // Auto-expand the "Edit Existing" section if it's closed
    if(!expandedItems.has('bankList')) expandedItems.add('bankList');
    expandedItems.add('bank_'+newId);
    saveAll();
};

window.deleteFromBank = function(id) {
    if(confirm('Delete?')) {
        bank = bank.filter(b => b.id !== id);
        Object.keys(assignments).forEach(k => assignments[k] = assignments[k].filter(x => x !== id));
        saveAll();
    }
};

window.addContext = function() {
    const id = 'ctx' + Date.now();
    contexts.push({ id, l:'New Tab', i:'📌', order: contexts.length });
    assignments[id] = [];
    saveAll();
};

window.deleteContext = function(id) {
    if(confirm('Delete tab?')) {
        contexts = contexts.filter(c => c.id !== id);
        delete assignments[id];
        saveAll();
    }
};

function saveAll() {
    localStorage.setItem(STORAGE.ASSIGNMENTS, JSON.stringify(assignments));
    localStorage.setItem(STORAGE.BANK, JSON.stringify(bank));
    localStorage.setItem(STORAGE.CONTEXTS, JSON.stringify(contexts));
    renderEditor();
    document.getElementById('autoSaveIndicator').style.opacity = '1';
    setTimeout(() => document.getElementById('autoSaveIndicator').style.opacity = '0', 1000);
}

// --- BACKUP ---
function exportBackup() {
    const data = { contexts, bank, assignments, history, version:'efficient_v5' };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `skeleton_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click();
}

window.importBackup = function(input) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const d = JSON.parse(e.target.result);
            if(confirm('Restore data?')) {
                localStorage.setItem(STORAGE.CONTEXTS, JSON.stringify(d.contexts));
                localStorage.setItem(STORAGE.BANK, JSON.stringify(d.bank));
                localStorage.setItem(STORAGE.ASSIGNMENTS, JSON.stringify(d.assignments));
                localStorage.setItem(STORAGE.HISTORY, JSON.stringify(d.history));
                location.reload();
            }
        } catch(err) { alert('Error: '+err.message); }
    };
    reader.readAsText(file);
};

// --- TEMPLATE FUNCTIONS ---
function exportTemplate() {
    const template = {
        type: 'skeleton_template',
        version: '1.0',
        exported: new Date().toISOString(),
        contexts: contexts,
        bank: bank,
        assignments: assignments
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skeleton_template_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);

    alert('Template exported successfully! Share this file to let others use your setup.');
}

window.importTemplate = function(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const template = JSON.parse(e.target.result);

            // Validate template type
            if (template.type !== 'skeleton_template') {
                alert('Invalid template file. This is not a skeleton template.');
                input.value = '';
                return;
            }

            // Validate version
            if (!template.version) {
                alert('Invalid template file. Missing version information.');
                input.value = '';
                return;
            }

            // Check for required fields
            if (!template.contexts || !template.bank || !template.assignments) {
                alert('Invalid template file. Missing required data (contexts, bank, or assignments).');
                input.value = '';
                return;
            }

            // Ask user for import method
            const choice = confirm(
                'How would you like to import this template?\n\n' +
                'OK = Replace all templates (removes current tabs, questions, and assignments)\n' +
                'Cancel = Merge with current templates (adds to existing setup)'
            );

            if (choice) {
                // Replace all
                if (confirm('⚠️ This will replace ALL your current tabs, questions, and assignments.\n\nAre you sure you want to continue?')) {
                    contexts = template.contexts;
                    bank = template.bank;
                    assignments = template.assignments;
                    saveAll();
                    alert('✓ Template imported successfully! Your setup has been replaced.');
                    location.reload();
                }
            } else {
                // Merge with current
                mergeTemplate(template);
            }

        } catch(err) {
            alert('Error reading template file: ' + err.message);
        }
        input.value = '';
    };
    reader.readAsText(file);
};

function mergeTemplate(template) {
    // Merge contexts (avoid ID conflicts by adding suffix)
    const idMap = {};
    template.contexts.forEach(ctx => {
        const newId = ctx.id + '_' + Date.now();
        idMap[ctx.id] = newId;
        contexts.push({
            id: newId,
            l: ctx.l,
            i: ctx.i,
            order: contexts.length
        });
    });

    // Merge bank (avoid ID conflicts)
    const questionIdMap = {};
    template.bank.forEach(q => {
        const newId = q.id + '_' + Date.now();
        questionIdMap[q.id] = newId;
        bank.push({
            id: newId,
            l: q.l,
            t: q.t,
            o: q.o
        });
    });

    // Merge assignments with new IDs
    Object.keys(template.assignments).forEach(oldCtxId => {
        const newCtxId = idMap[oldCtxId];
        if (newCtxId && template.assignments[oldCtxId]) {
            assignments[newCtxId] = template.assignments[oldCtxId].map(oldQId =>
                questionIdMap[oldQId] || oldQId
            );
        }
    });

    saveAll();
    alert('✓ Template merged successfully! New tabs and questions have been added to your existing setup.');
}

window.downloadCurrentDay = function() {
    if(!currentViewedDate) return;
    const logs = history[currentViewedDate] || [];
    let txt = `LOGS: ${currentViewedDate}\n\n`;
    logs.forEach(l => {
        const c = contexts.find(x => x.id === l.ctx) || {l:l.ctx};
        txt += `--- ${c.l} (${l.time}) ---\n`;
        Object.keys(l.ans).forEach(qid => {
            const q = bank.find(x => x.id === qid);
            if(q) {
                let val = l.ans[qid];
                if(Array.isArray(val)) val = val.join(', ');
                txt += `${q.l}: ${val}\n`;
            }
        });
        txt += '\n';
    });
    const blob = new Blob([txt], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `log_${currentViewedDate}.txt`;
    document.body.appendChild(a); a.click();
};

// --- EXPORT FUNCTIONS ---
function escapeCSV(str) {
    if (str === null || str === undefined) return '';
    str = String(str);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function exportHistoryCSV() {
    const dates = Object.keys(history).sort();
    if (dates.length === 0) {
        alert('No history to export.');
        return;
    }

    // Collect all unique question labels for header
    const allQuestions = new Set();
    dates.forEach(date => {
        history[date].forEach(l => {
            Object.keys(l.ans).forEach(qid => {
                const q = bank.find(x => x.id === qid);
                if (q) allQuestions.add(q.l);
            });
        });
    });
    const questionHeaders = Array.from(allQuestions);

    let csv = 'Date,Time,Tab,' + questionHeaders.map(q => escapeCSV(q)).join(',') + '\n';

    dates.forEach(date => {
        history[date].forEach(l => {
            const c = contexts.find(x => x.id === l.ctx) || {l: l.ctx};
            let row = [date, l.time, escapeCSV(c.l)];

            questionHeaders.forEach(qLabel => {
                const q = bank.find(x => x.l === qLabel);
                if (q && l.ans[q.id] !== undefined) {
                    let val = l.ans[q.id];
                    if (Array.isArray(val)) val = val.join('; ');
                    if (val === true) val = 'Yes';
                    if (val === false) val = 'No';
                    row.push(escapeCSV(val));
                } else {
                    row.push('');
                }
            });

            csv += row.join(',') + '\n';
        });
    });

    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skeleton_history_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
}

function exportHistoryMarkdown() {
    const dates = Object.keys(history).sort();
    if (dates.length === 0) {
        alert('No history to export.');
        return;
    }

    let md = '# Skeleton Log History\n\n';
    md += `---\n`;
    md += `exported: ${new Date().toISOString()}\n`;
    md += `total_entries: ${dates.reduce((acc, d) => acc + history[d].length, 0)}\n`;
    md += `---\n\n`;

    dates.forEach(date => {
        md += `## ${date}\n\n`;
        history[date].forEach(l => {
            const c = contexts.find(x => x.id === l.ctx) || {l: l.ctx, i: '?'};
            md += `### ${c.i} ${c.l}\n\n`;
            md += `**Time:** ${l.time}\n\n`;

            Object.keys(l.ans).forEach(qid => {
                const q = bank.find(x => x.id === qid);
                if (q) {
                    let val = l.ans[qid];
                    if (Array.isArray(val)) val = val.join(', ');
                    if (val === true) val = 'Yes';
                    if (val === false) val = 'No';
                    md += `- **${q.l}:** ${val}\n`;
                }
            });
            md += '\n';
        });
    });

    const blob = new Blob([md], {type:'text/markdown'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skeleton_history_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
}

const modal = {
    el: document.getElementById('modal'),
    show(t, b, cb) {
        document.getElementById('modalTitle').innerText = t;
        document.getElementById('modalBody').innerText = b;
        const btn = document.getElementById('modalConfirm');
        btn.onclick = () => { if(cb) cb(); modal.el.classList.remove('active'); };
        document.getElementById('modalCancel').onclick = () => modal.el.classList.remove('active');
        modal.el.classList.add('active');
    }
};

window.onload = () => { renderWelcome(); renderChips(); };
