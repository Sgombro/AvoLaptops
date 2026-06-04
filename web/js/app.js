
'use strict';

let currentUser = null;
let currentToken = null;

// ─── UTILS ───────────────────────────────────────────────────────────────────

function showMessage(elementId, message, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.style.color = type === 'error' ? 'red' : 'green';
    el.style.display = 'block';
}

function hideMessage(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

function saveToken(token) {
    try {
        var expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = 'auth_token=' + encodeURIComponent(token) + '; expires=' + expires + '; path=/; SameSite=Strict';
    } catch(e) {}
    try { localStorage.setItem('auth_token', token); } catch(e) {}
    currentToken = token;
}

function loadToken() {
    try {
        var match = document.cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
        if (match) { currentToken = decodeURIComponent(match[1]); return currentToken; }
    } catch(e) {}
    try {
        currentToken = localStorage.getItem('auth_token');
        return currentToken;
    } catch(e) {}
    currentToken = null;
    return null;
}

function clearToken() {
    try { document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict'; } catch(e) {}
    try { localStorage.removeItem('auth_token'); } catch(e) {}
    currentToken = null;
}

function getAuthHeaders() {
    return { 'Content-Type': 'application/json', 'token': currentToken };
}

function decodeJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) base64 += '=';
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}

// ─── GENERIC FETCH ───────────────────────────────────────────────────────────

async function apiGet(endpoint, filters) {
    filters = filters || {};
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
        if (v !== '' && v !== null && v !== undefined) params.append(k, v);
    }
    const qs = params.toString() ? '?' + params.toString() : '';
    try {
        const response = await fetch(endpoint + qs, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (response.status === 498) {
            showMessage('dashboardMessage', 'Sessione scaduta, effettua di nuovo il login.', 'error');
            logout();
            return null;
        }
        return await response.json();
    } catch (e) {
        return null;
    }
}

async function apiPost(endpoint, params) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'token': currentToken },
            body: params.toString()
        });
        if (response.status === 498) {
            showMessage('dashboardMessage', 'Sessione scaduta, effettua di nuovo il login.', 'error');
            logout();
            return null;
        }
        const text = await response.text();
        let data = {};
        try {
            // PHP may echo JSON twice (no exit after success): take only the first object
            const cut = text.indexOf('}{');
            data = JSON.parse(cut !== -1 ? text.substring(0, cut + 1) : text);
        } catch (e) {}
        return { status: response.status, data: data };
    } catch (e) {
        return null;
    }
}

async function apiPatch(url, params) {
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, getAuthHeaders()),
            body: new URLSearchParams(params).toString()
        });
        if (response.status === 498) {
            showMessage('dashboardMessage', 'Sessione scaduta, effettua di nuovo il login.', 'error');
            logout();
            return null;
        }
        const text = await response.text();
        let data = {};
        try {
            const cut = text.indexOf('}{');
            data = JSON.parse(cut !== -1 ? text.substring(0, cut + 1) : text);
        } catch (e) {}
        return { status: response.status, data: data };
    } catch (e) {
        return null;
    }
}

async function apiDelete(url) {
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (response.status === 498) {
            showMessage('dashboardMessage', 'Sessione scaduta, effettua di nuovo il login.', 'error');
            logout();
            return null;
        }
        return { status: response.status };
    } catch (e) {
        return null;
    }
}

// ─── TABLE BUILDER ───────────────────────────────────────────────────────────

function makeBadge(text, type) {
    var span = document.createElement('span');
    span.className = 'badge badge-' + type;
    span.textContent = text;
    return span;
}

function wrapTable(table) {
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    wrap.appendChild(table);
    return wrap;
}

function makeTable(headers, rows) {
    if (rows.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Nessun risultato.';
        return p;
    }
    const table = document.createElement('table');
    const thead = table.createTHead();
    const hr = thead.insertRow();
    headers.forEach(function(h) {
        const th = document.createElement('th');
        th.textContent = h;
        hr.appendChild(th);
    });
    const tbody = table.createTBody();
    rows.forEach(function(rowData) {
        const tr = tbody.insertRow();
        rowData.forEach(function(cell) {
            const td = tr.insertCell();
            if (cell instanceof HTMLElement) { td.appendChild(cell); }
            else { td.textContent = (cell !== null && cell !== undefined) ? String(cell) : ''; }
        });
    });
    makeSortable(table);
    return wrapTable(table);
}

function makeSortable(table) {
    var tbody = table.tBodies[0];
    var thead = table.tHead;
    if (!tbody || !thead) return;
    var ths = thead.rows[0].cells;
    // stato: 0=nessuno, 1=crescente, 2=decrescente
    var sortCol = -1;
    var sortState = 0;
    // salva ordine originale
    var originalOrder = Array.prototype.slice.call(tbody.rows);

    function updateHeaders(activeCol) {
        Array.prototype.forEach.call(ths, function(h, i) {
            var base = h.textContent.replace(/\s*[▲▼\-]$/, '').trimEnd();
            if (i !== activeCol || sortState === 0) {
                h.textContent = base;
            } else {
                h.textContent = base + (sortState === 1 ? ' ▲' : ' ▼');
            }
        });
    }

    Array.prototype.forEach.call(ths, function(th, colIdx) {
        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';
        th.addEventListener('click', function() {
            if (sortCol === colIdx) {
                sortState = (sortState + 1) % 3; // 0→1→2→0
            } else {
                sortCol = colIdx;
                sortState = 1;
            }
            updateHeaders(colIdx);
            if (sortState === 0) {
                // ripristina ordine originale
                originalOrder.forEach(function(r) { tbody.appendChild(r); });
            } else {
                var rows = Array.prototype.slice.call(tbody.rows);
                var asc = sortState === 1;
                rows.sort(function(a, b) {
                    var va = a.cells[colIdx] ? a.cells[colIdx].textContent.trim() : '';
                    var vb = b.cells[colIdx] ? b.cells[colIdx].textContent.trim() : '';
                    var na = parseFloat(va.replace(/[^0-9.\-]/g, ''));
                    var nb = parseFloat(vb.replace(/[^0-9.\-]/g, ''));
                    var cmp = (!isNaN(na) && !isNaN(nb))
                        ? na - nb
                        : va.localeCompare(vb, 'it', { sensitivity: 'base' });
                    return asc ? cmp : -cmp;
                });
                rows.forEach(function(r) { tbody.appendChild(r); });
            }
        });
    });
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────

function showLoginPage(show) {
    document.getElementById('loginContainer').style.display = show ? 'flex' : 'none';
    document.getElementById('dashboardContainer').style.display = show ? 'none' : 'block';
}

function updateUserInfo() {
    if (!currentUser) return;
    const fullName = [currentUser.name, currentUser.surname].filter(Boolean).join(' ').trim();
    document.getElementById('userName').textContent = fullName || currentUser.email || String(currentUser['id-user'] || '');
    const isAdmin = currentUser.admin === true;
    const adminTabBtn = document.getElementById('adminTabBtn');
    if (adminTabBtn) adminTabBtn.style.display = isAdmin ? 'inline' : 'none';
}

function logout() {
    clearToken();
    currentUser = null;
    document.getElementById('loginForm').reset();
    hideMessage('loginMessage');
    showLoginPage(true);
    switchTab('dashboard');
}

function switchTab(tabName, subSection) {
    document.querySelectorAll('.tab-content').forEach(function(t) {
        t.style.display = 'none';
    });
    const target = document.getElementById('tab-' + tabName);
    if (target) {
        target.style.display = 'block';
        target.classList.remove('anim-in');
        void target.offsetWidth;
        target.classList.add('anim-in');
    }
    document.querySelectorAll('nav .tab').forEach(function(b) { b.removeAttribute('aria-current'); });
    var activeBtn = document.querySelector('nav .tab[data-tab="' + tabName + '"]');
    if (activeBtn) activeBtn.setAttribute('aria-current', 'page');

    if (tabName === 'laptops') loadLaptops({});
    if (tabName === 'reservations') {
        var rs = subSection || 'my';
        showResSection(rs);
        if (rs === 'my') loadMyReservations({});
        else if (rs === 'old') loadOldReservations();
        else if (rs === 'current') loadCurrentReservations();
    }
    if (tabName === 'lockers') loadLockers();
    if (tabName === 'models') loadModels();
    if (tabName === 'users') {
        if (!currentUser || currentUser.admin !== true) {
            document.getElementById('admin-reservations').style.display = 'block';
            return;
        }
        showAdminSection('reservations');
        loadAllReservations({});
    }
}

function goNewReservation() {
    switchTab('reservations', 'new');
    loadAvailableLaptops();
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

async function handleLogin(e) {
    e.preventDefault();
    hideMessage('loginMessage');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch(API_ENDPOINTS.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });
        const data = await response.json();
        if (!response.ok || !data.token) {
            showMessage('loginMessage', data.message || 'Credenziali non valide.', 'error');
            return;
        }
        const token = data.token;
        saveToken(token);
        const payload = decodeJwtPayload(token);
        if (!payload) {
            showMessage('loginMessage', 'Errore nel token ricevuto.', 'error');
            return;
        }
        currentUser = payload;
        updateUserInfo();
        showLoginPage(false);
        switchTab('dashboard');
    } catch (err) {
        showMessage('loginMessage', 'Errore di connessione.', 'error');
    }
}

// ─── LAPTOPS ─────────────────────────────────────────────────────────────────

async function loadLaptops(filters) {
    const container = document.getElementById('laptopsData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.laptops, filters);
    if (!data) { container.textContent = 'Errore nel caricamento.'; return; }
    const laptops = Array.isArray(data.laptops) ? data.laptops : [];
    container.innerHTML = '';
    container.appendChild(displayLaptops(laptops));
}

function displayLaptops(laptops) {
    const headers = ['ID', 'Marca', 'Modello', 'CPU', 'RAM (GB)', 'Storage (GB)', 'Locker', 'Stato'];
    const rows = laptops.map(function(l) {
        const m = l.model || {};
        const lk = l.locker || {};
        return [l.id_laptop, m.brand, m.model, m.cpu,
                m.ram ? m.ram + ' GB' : '', m.storage ? m.storage + ' GB' : '',
                lk.name_locker || lk.id_locker,
                makeBadge(l.status === 'available' ? 'Disponibile' : 'Non disponibile',
                          l.status === 'available' ? 'available' : 'unavailable')];
    });
    return makeTable(headers, rows);
}

// ─── RESERVATIONS ────────────────────────────────────────────────────────────

function showResSection(name) {
    ['my', 'old', 'new', 'all', 'current'].forEach(function(s) {
        const el = document.getElementById('res-' + s);
        if (el) el.style.display = 'none';
    });
    var target = document.getElementById('res-' + name);
    if (target) {
        target.style.display = 'block';
        target.classList.remove('anim-in');
        void target.offsetWidth;
        target.classList.add('anim-in');
    }
    document.querySelectorAll('.res-nav').forEach(function(b) { b.removeAttribute('aria-current'); });
    var active = document.querySelector('.res-nav[data-res="' + name + '"]');
    if (active) active.setAttribute('aria-current', 'page');
}

function getReservationEndDate(reservation) {
    return new Date(reservation.date + 'T' + reservation.time_end);
}

function isPastReservation(reservation) {
    return getReservationEndDate(reservation).getTime() <= Date.now();
}

function getReservationPhase(reservation) {
    return isPastReservation(reservation) ? 'past' : 'current';
}

function getReservationStatusLabel(reservation) {
    return reservation.status === 'active' ? 'Attiva' : 'Conclusa';
}

function filterReservations(reservations, filters) {
    const expectedUserId = currentUser ? String(currentUser['id-user']) : '';
    const expectedPhase = filters && filters.phase ? filters.phase : '';
    return reservations.filter(function(r) {
        // filtra per utente solo se la prenotazione ha dati utente confrontabili
        if (expectedUserId) {
            const userId = String((r.user && r.user.id_user) || '');
            if (userId && userId !== expectedUserId) return false;
        }
        if (expectedPhase === 'current' && r.status !== 'active') return false;
        if (expectedPhase === 'past' && r.status !== 'completed') return false;
        return true;
    });
}

function makeResTable(reservations, showUser, showDelete, afterDelete) {
    if (reservations.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Nessun risultato.';
        return p;
    }
    // Vista compatta per utenti normali (showUser=false): nasconde ID e Stato
    var compact = !showUser;
    function fmtTime(t) { return t ? String(t).substring(0, 5) : ''; }
    const table = document.createElement('table');
    const thead = table.createTHead();
    const hr = thead.insertRow();
    var baseHeaders = compact
        ? ['Data', 'Inizio', 'Fine', 'Portatile', 'Locker']
        : ['ID', 'Data', 'Inizio', 'Fine', 'Stato', 'Portatile', 'Locker'];
    baseHeaders.forEach(function(h) {
        const th = document.createElement('th'); th.textContent = h; hr.appendChild(th);
    });
    if (showUser) { const th = document.createElement('th'); th.textContent = 'Utente'; hr.appendChild(th); }
    if (showDelete) { const th = document.createElement('th'); th.textContent = 'Azioni'; hr.appendChild(th); }
    const tbody = table.createTBody();
    reservations.forEach(function(r) {
        const laptop = r.laptop || {};
        const model = laptop.model || {};
        const locker = laptop.locker || {};
        const user = r.user || {};
        const tr = tbody.insertRow();
        var cells = compact
            ? [r.date, fmtTime(r.time_start), fmtTime(r.time_end),
               (model.brand ? model.brand + ' ' + model.model : '') || laptop.id_laptop,
               locker.name_locker || locker.id_locker]
            : [r.id_reservation, r.date, fmtTime(r.time_start), fmtTime(r.time_end),
               makeBadge(getReservationStatusLabel(r), r.status === 'active' ? 'active' : 'done'),
               (model.brand ? model.brand + ' ' + model.model : '') || laptop.id_laptop,
               locker.name_locker || locker.id_locker];
        cells.forEach(function(cell) {
            const td = tr.insertCell();
            if (cell instanceof HTMLElement) { td.appendChild(cell); }
            else { td.textContent = (cell !== null && cell !== undefined) ? String(cell) : ''; }
        });
        if (showUser) {
            const td = tr.insertCell();
            td.textContent = (user.name ? user.name + ' ' + user.surname : String(user.id_user || '')) + (user.email ? ' — ' + user.email : '');
        }
        if (showDelete) {
            const td = tr.insertCell();
            const resId = r.id_reservation;
            const laptopId = laptop.id_laptop;
            if (r.status === 'active') {
                const btn = document.createElement('button');
                btn.textContent = 'Annulla';
                btn.className = 'danger';
                btn.addEventListener('click', function() {
                    var label = laptopId ? (' (Laptop ' + laptopId + ')') : '';
                    if (!confirm('Annullare la prenotazione ' + resId + label + '?')) return;
                    var url = API_ENDPOINTS.reservations + '/' + resId;
                    if (laptopId) url += '?id-laptop=' + encodeURIComponent(laptopId);
                    apiDelete(url).then(function(result) {
                        if (!result) { alert('Errore di connessione.'); return; }
                        if (result.status === 200) {
                            if (afterDelete) afterDelete();
                        } else {
                            alert('Errore durante annullamento.');
                        }
                    });
                });
                td.appendChild(btn);
            } else {
                td.appendChild(makeBadge('Conclusa', 'done'));
            }
        }
    });
    makeSortable(table);
    return wrapTable(table);
}

async function loadCurrentReservations() {
    const container = document.getElementById('currentReservationsData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.reservations, {});
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const isAdmin = currentUser && currentUser.admin === true;
    const note = document.getElementById('resCurrentNote');
    if (note) note.textContent = isAdmin
        ? 'Tutte le prenotazioni sono visibili (admin).'
        : 'Sono visibili le prenotazioni in corso e quelle scadute nelle ultime 24 ore.';
    const reservations = (data && Array.isArray(data.reservations)) ? data.reservations.filter(function(r) {
        if (r.status === 'active') return true;
        if (isAdmin) return true;
        // completed ma scaduta da meno di 24h
        var end = getReservationEndDate(r);
        return !isNaN(end.getTime()) && (now - end.getTime()) <= oneDayMs;
    }) : [];
    container.innerHTML = '';
    if (reservations.length === 0) {
        var p = document.createElement('p');
        p.textContent = 'Nessuna prenotazione in corso.';
        container.appendChild(p);
        return;
    }
    container.appendChild(makeResTable(reservations, true, false, null));
}

async function loadMyReservations(filters) {
    const container = document.getElementById('myReservationsData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.reservations, {});
    const reservations = (data && Array.isArray(data.reservations)) ? filterReservations(data.reservations, Object.assign({}, filters, { phase: 'current' })) : [];
    container.innerHTML = '';
    container.appendChild(makeResTable(reservations, false, true, function() { loadMyReservations(filters); }));
}

async function loadOldReservations() {
    const container = document.getElementById('oldReservationsData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.reservations, {});
    const reservations = (data && Array.isArray(data.reservations)) ? filterReservations(data.reservations, { phase: 'past' }) : [];
    container.innerHTML = '';
    container.appendChild(makeResTable(reservations, false, false));
}

async function loadAllReservations(filters) {
    const container = document.getElementById('adminReservationsData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.reservations, {});
    const reservations = (data && Array.isArray(data.reservations))
        ? data.reservations.filter(function(r) {
            const expectedPhase = filters && filters.status ? filters.status : '';
            if (expectedPhase === 'current') return r.status === 'active';
            if (expectedPhase === 'past') return r.status === 'completed';
            return true;
        })
        : [];
    container.innerHTML = '';
    container.appendChild(makeResTable(reservations, true, true, function() { loadAllReservations(filters); }));
}

async function loadAvailableLaptops(options) {
    const container = document.getElementById('availableLaptopsList');
    container.textContent = 'Caricamento...';
    const silent = options && options.silent;
    const date = document.getElementById('newResDate').value;
    const timeStart = getSelectTime('newResStartH', 'newResStartM');
    const timeEnd   = getSelectTime('newResEndH',   'newResEndM');

    if (!date) {
        container.textContent = '';
        if (!silent) showMessage('newResMessage', 'Seleziona una data.', 'error');
        return;
    }

    if (timeEnd <= timeStart) {
        container.textContent = '';
        if (!silent) showMessage('newResMessage', 'L\'orario di fine deve essere successivo all\'orario di inizio.', 'error');
        return;
    }

    const data = await apiGet(API_ENDPOINTS.laptops, {
        date: date,
        'time-start': timeStart,
        'time-end': timeEnd
    });
    if (!data) {
        container.textContent = 'Errore di connessione.';
        return;
    }
    if (!Array.isArray(data.laptops) && data.message && !silent) {
        showMessage('newResMessage', data.message, 'error');
    }
    container.innerHTML = '';
    const laptops = (data && Array.isArray(data.laptops)) ? data.laptops : [];
    if (laptops.length === 0) {
        container.textContent = 'Nessun portatile disponibile per questo orario.';
        document.getElementById('availableLaptopsSection').style.display = 'block';
        return;
    }

    // Nota informativa
    const note = document.createElement('p');
    note.className = 'laptop-list-note';
    note.textContent = 'Sono mostrati solo i portatili disponibili per la data e l\'orario selezionati.';
    container.appendChild(note);

    // Raggruppa per armadietto
    var byLocker = {};
    var lockerOrder = [];
    laptops.forEach(function(l) {
        const lk = l.locker || {};
        const key = String(lk.id_locker || 'unknown');
        if (!byLocker[key]) {
            byLocker[key] = { locker: lk, laptops: [] };
            lockerOrder.push(key);
        }
        byLocker[key].laptops.push(l);
    });

    lockerOrder.forEach(function(key) {
        const group = byLocker[key];
        const lk = group.locker;

        const groupEl = document.createElement('div');
        groupEl.className = 'locker-group';

        const header = document.createElement('div');
        header.className = 'locker-group-header';
        const nameEl = document.createElement('strong');
        nameEl.textContent = lk.name_locker || ('Armadietto ' + (lk.id_locker || '?'));
        header.appendChild(nameEl);
        if (lk.location) {
            const locEl = document.createElement('span');
            locEl.textContent = lk.location;
            header.appendChild(locEl);
        }
        groupEl.appendChild(header);

        const listEl = document.createElement('div');
        listEl.className = 'locker-group-laptops';

        group.laptops.forEach(function(l) {
            const m = l.model || {};
            const available = l.status === 'available';
            const row = document.createElement('label');
            row.className = 'laptop-option' + (available ? '' : ' laptop-option-busy');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = l.id_laptop;
            const info = document.createElement('div');
            info.className = 'laptop-option-info';
            const main = document.createElement('span');
            main.className = 'laptop-option-main';
            main.textContent = (m.brand || '') + ' ' + (m.model || '') + '  \u2014  ID ' + l.id_laptop;
            const sub = document.createElement('span');
            sub.className = 'laptop-option-sub';
            sub.textContent = [m.cpu, m.ram ? 'RAM ' + m.ram + ' GB' : '', m.storage ? m.storage + ' GB' : ''].filter(Boolean).join('  \u00b7  ');
            const badge = makeBadge(available ? 'Disponibile' : 'In uso ora', available ? 'available' : 'unavailable');
            info.appendChild(main);
            info.appendChild(sub);
            row.appendChild(cb);
            row.appendChild(info);
            row.appendChild(badge);
            listEl.appendChild(row);
        });

        groupEl.appendChild(listEl);
        container.appendChild(groupEl);
    });

    document.getElementById('availableLaptopsSection').style.display = 'block';
}

function getSelectTime(hId, mId) {
    return document.getElementById(hId).value + ':' + document.getElementById(mId).value + ':00';
}

function generateRecurringDates(startDate, endDate, daysOfWeek) {
    var dates = [];
    var cur = new Date(startDate + 'T00:00:00');
    var last = new Date(endDate + 'T00:00:00');
    while (cur <= last) {
        if (daysOfWeek.indexOf(cur.getDay()) !== -1) {
            dates.push(cur.toLocaleDateString('sv-SE'));
        }
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
}

async function confirmReservation() {
    hideMessage('newResMessage');
    const date = document.getElementById('newResDate').value;
    const timeStart = getSelectTime('newResStartH', 'newResStartM');
    const timeEnd   = getSelectTime('newResEndH',   'newResEndM');

    if (!date) {
        showMessage('newResMessage', 'Seleziona una data.', 'error');
        return;
    }

    const checked = document.querySelectorAll('#availableLaptopsList input[type="checkbox"]:checked');
    if (checked.length === 0) {
        showMessage('newResMessage', 'Seleziona almeno un laptop.', 'error');
        return;
    }

    const isRecurring = document.getElementById('recurringToggle').checked;
    var dates = [date];

    if (isRecurring) {
        const endDateVal = document.getElementById('recurringEndDate').value;
        if (!endDateVal || endDateVal <= date) {
            showMessage('newResMessage', 'Imposta una data di fine ricorrenza successiva alla data di inizio.', 'error');
            return;
        }
        const selectedDows = Array.from(document.querySelectorAll('.dow:checked')).map(function(el) {
            return parseInt(el.value, 10);
        });
        if (selectedDows.length === 0) {
            showMessage('newResMessage', 'Seleziona almeno un giorno della settimana.', 'error');
            return;
        }
        dates = generateRecurringDates(date, endDateVal, selectedDows);
        if (dates.length === 0) {
            showMessage('newResMessage', 'Nessuna data trovata nel periodo selezionato.', 'error');
            return;
        }
        if (dates.length > 60) {
            if (!confirm('Verranno create ' + dates.length + ' prenotazioni. Continuare?')) return;
        }
    }

    const laptopIds = Array.from(checked).map(function(cb) { return cb.value; });
    var ok = 0, fail = [];

    showMessage('newResMessage', 'Invio in corso (' + dates.length + ' date)...', 'success');

    for (var i = 0; i < dates.length; i++) {
        const params = new URLSearchParams();
        params.append('date', dates[i]);
        params.append('time-start', timeStart);
        params.append('time-end', timeEnd);
        laptopIds.forEach(function(id) { params.append('id-laptop[]', id); });
        const result = await apiPost(API_ENDPOINTS.reservations, params);
        if (result && result.status === 201) {
            ok++;
        } else {
            fail.push(dates[i] + (result && result.data && result.data.message ? ' (' + result.data.message + ')' : ''));
        }
    }

    var msg = ok + ' prenotazion' + (ok === 1 ? 'e creata' : 'i create') + '.';
    if (fail.length > 0) msg += ' Fallite: ' + fail.join(', ');
    showMessage('newResMessage', msg, fail.length > 0 ? 'error' : 'success');

    if (ok > 0) {
        document.getElementById('newResDate').value = '';
        document.getElementById('newResStartH').value = '08';
        document.getElementById('newResStartM').value = '00';
        document.getElementById('newResEndH').value   = '09';
        document.getElementById('newResEndM').value   = '00';
        document.getElementById('recurringToggle').checked = false;
        document.getElementById('recurringOptions').style.display = 'none';
        document.getElementById('recurringEndDate').value = '';
        document.querySelectorAll('.dow').forEach(function(el) { el.checked = false; });
        document.getElementById('availableLaptopsSection').style.display = 'none';
        document.getElementById('availableLaptopsList').innerHTML = '';
    }
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────

function showAdminSection(name) {
    ['reservations', 'users', 'laptops', 'lockers', 'models'].forEach(function(s) {
        const el = document.getElementById('admin-' + s);
        if (el) el.style.display = 'none';
    });
    var target = document.getElementById('admin-' + name);
    if (target) {
        target.style.display = 'block';
        target.classList.remove('anim-in');
        void target.offsetWidth;
        target.classList.add('anim-in');
    }
    document.querySelectorAll('.admin-nav').forEach(function(b) { b.removeAttribute('aria-current'); });
    var active = document.querySelector('.admin-nav[data-admin="' + name + '"]');
    if (active) active.setAttribute('aria-current', 'page');
}

function makeAdminTable(headers, rows, afterDelete) {
    // rows: [{cells:[...], deleteUrl:'...', deleteLabel:'Elimina'}]
    if (rows.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Nessun risultato.';
        return p;
    }
    const table = document.createElement('table');
    const thead = table.createTHead();
    const hr = thead.insertRow();
    headers.concat(['Azioni']).forEach(function(h) {
        const th = document.createElement('th'); th.textContent = h; hr.appendChild(th);
    });
    const tbody = table.createTBody();
    rows.forEach(function(r) {
        const tr = tbody.insertRow();
        r.cells.forEach(function(cell) {
            const td = tr.insertCell();
            if (cell instanceof HTMLElement) { td.appendChild(cell); }
            else { td.textContent = (cell !== null && cell !== undefined) ? String(cell) : ''; }
        });
        const actionTd = tr.insertCell();
        actionTd.className = 'action-cell';
        if (r.extraButtons && r.extraButtons.length) {
            r.extraButtons.forEach(function(b) { actionTd.appendChild(b); });
        }
        if (r.deleteUrl) {
            const btn = document.createElement('button');
            btn.textContent = r.deleteLabel || 'Elimina';
            btn.className = 'danger';
            const url = r.deleteUrl;
            btn.addEventListener('click', function() {
                if (!confirm('Eliminare questo elemento?')) return;
                apiDelete(url).then(function(result) {
                    if (!result) { alert('Errore di connessione.'); return; }
                    if (result.status === 200) { if (afterDelete) afterDelete(); }
                    else { alert('Errore durante eliminazione.'); }
                });
            });
            actionTd.appendChild(btn);
        }
    });
    makeSortable(table);
    return wrapTable(table);
}

async function loadAdminUsers(filters) {
    const container = document.getElementById('adminUsersData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.users, filters || {});
    const users = (data && Array.isArray(data.users)) ? data.users : [];
    container.innerHTML = '';
    const meId = currentUser ? String(currentUser['id-user']) : null;
    const rows = users.map(function(u) {
        const isSelf = (meId && String(u.id_user) === meId);
        const roleBadge = makeBadge(u.role, u.role === 'admin' ? 'accent' : 'done');
        const verBadge  = makeBadge(u.verified ? 'si' : 'no', u.verified ? 'available' : 'unavailable');
        const row = {
            cells: [u.id_user, u.name, u.surname, u.email, roleBadge, verBadge],
            extraButtons: [],
            deleteUrl: isSelf ? null : API_ENDPOINTS.users + '/' + u.id_user,
            deleteLabel: 'Elimina'
        };
        if (!isSelf) {
            const roleBtn = document.createElement('button');
            roleBtn.textContent = u.role === 'admin' ? 'Riduci a Teacher' : 'Promuovi Admin';
            roleBtn.className = 'secondary';
            roleBtn.addEventListener('click', function() {
                apiPatch(API_ENDPOINTS.users + '/' + u.id_user, { role: u.role === 'admin' ? 'teacher' : 'admin' }).then(function(r) {
                    if (r && r.status === 200) loadAdminUsers(filters);
                    else alert('Errore aggiornamento ruolo.');
                });
            });
            row.extraButtons.push(roleBtn);
            if (!u.verified) {
                const verBtn = document.createElement('button');
                verBtn.textContent = 'Verifica';
                verBtn.className = 'secondary';
                verBtn.addEventListener('click', function() {
                    apiPatch(API_ENDPOINTS.users + '/' + u.id_user, { verified: 1 }).then(function(r) {
                        if (r && r.status === 200) loadAdminUsers(filters);
                        else alert('Errore verifica utente.');
                    });
                });
                row.extraButtons.push(verBtn);
            }
        }
        return row;
    });
    container.appendChild(makeAdminTable(
        ['ID', 'Nome', 'Cognome', 'Email', 'Ruolo', 'Verificato'], rows,
        function() { loadAdminUsers(filters); }
    ));
}

async function loadAdminLaptops() {
    const container = document.getElementById('adminLaptopsData');
    container.textContent = 'Caricamento...';
    const [dataL, dataM, dataLk] = await Promise.all([
        apiGet(API_ENDPOINTS.laptops, {}),
        apiGet(API_ENDPOINTS.models, {}),
        apiGet(API_ENDPOINTS.lockers, {})
    ]);
    const laptops = (dataL && Array.isArray(dataL.laptops))   ? dataL.laptops   : [];
    const models  = (dataM && Array.isArray(dataM.models))    ? dataM.models    : [];
    const lockers = (dataLk && Array.isArray(dataLk.lockers)) ? dataLk.lockers  : [];
    container.innerHTML = '';

    // ── Form ─────────────────────────────────────────────────────────────
    var formWrap = document.createElement('div');
    formWrap.className = 'admin-form-wrap';
    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.textContent = '+ Aggiungi laptop';
    toggleBtn.className = 'secondary';
    var formInner = document.createElement('div');
    formInner.className = 'admin-form-inner';
    formInner.style.display = 'none';
    var formTitle = document.createElement('h4');
    formTitle.textContent = 'Aggiungi laptop';
    formInner.appendChild(formTitle);
    var grid = document.createElement('div');
    grid.className = 'admin-form-grid';

    function makeSelect(label, opts) {
        var wrap = document.createElement('label');
        wrap.textContent = label + ' ';
        var sel = document.createElement('select');
        opts.forEach(function(o) {
            var opt = document.createElement('option');
            opt.value = o.value; opt.textContent = o.text;
            sel.appendChild(opt);
        });
        wrap.appendChild(sel);
        return { wrap: wrap, sel: sel };
    }
    function makeLabeledSelect(label, opts) {
        var wrap = document.createElement('div');
        var lbl = document.createElement('label'); lbl.textContent = label;
        var sel = document.createElement('select');
        opts.forEach(function(o) {
            var opt = document.createElement('option');
            opt.value = o.value; opt.textContent = o.text;
            sel.appendChild(opt);
        });
        wrap.appendChild(lbl); wrap.appendChild(sel);
        return { wrap: wrap, sel: sel };
    }

    var mdl = makeLabeledSelect('Modello', models.map(function(m) {
        return { value: m.id_model, text: m.brand + ' ' + m.model + ' (' + m.cpu + ', ' + m.ram + 'GB)' };
    }));
    var lkr = makeLabeledSelect('Locker', lockers.map(function(lk) {
        return { value: lk.id_locker, text: lk.name_locker + (lk.location ? ' – ' + lk.location : '') };
    }));
    var statusSel = makeLabeledSelect('Stato', [
        { value: 'available', text: 'Disponibile' },
        { value: 'unavailable', text: 'Non disponibile' }
    ]);
    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = 'Salva';
    saveBtn.className = 'primary';
    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Annulla';
    cancelBtn.className = 'secondary';
    [mdl.wrap, lkr.wrap, statusSel.wrap, saveBtn, cancelBtn].forEach(function(el) { grid.appendChild(el); });
    formInner.appendChild(grid);
    formWrap.appendChild(toggleBtn);
    formWrap.appendChild(formInner);
    container.appendChild(formWrap);

    var editId = null;
    toggleBtn.addEventListener('click', function() {
        editId = null;
        formTitle.textContent = 'Aggiungi laptop';
        mdl.sel.selectedIndex = 0; lkr.sel.selectedIndex = 0; statusSel.sel.value = 'available';
        formInner.style.display = formInner.style.display === 'none' ? '' : 'none';
    });
    cancelBtn.addEventListener('click', function() {
        editId = null; formInner.style.display = 'none'; formTitle.textContent = 'Aggiungi laptop';
    });
    saveBtn.addEventListener('click', function() {
        var selectedModelId = String(mdl.sel.value || '');
        var selectedLockerId = String(lkr.sel.value || '');
        if (!selectedModelId || !selectedLockerId) {
            alert('Seleziona un modello e un locker.');
            return;
        }
        if (editId) {
            apiPatch(API_ENDPOINTS.laptops + '/' + editId, {
                'id-model': selectedModelId, 'id-locker': selectedLockerId, status: statusSel.sel.value
            }).then(function(r) {
                if (r && r.status === 200) loadAdminLaptops();
                else alert('Errore aggiornamento laptop.');
            });
        } else {
            apiPost(API_ENDPOINTS.laptops, new URLSearchParams({
                'id-model': selectedModelId, 'id-locker': selectedLockerId
            })).then(function(r) {
                if (r && r.status === 201) loadAdminLaptops();
                else alert('Errore creazione laptop.');
            });
        }
    });

    // ── Table ─────────────────────────────────────────────────────────────
    var rows = laptops.map(function(l) {
        const m = l.model || {}; const lk = l.locker || {};
        const statusBadge = makeBadge(l.status === 'available' ? 'Disponibile' : 'In uso', l.status === 'available' ? 'available' : 'unavailable');
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifica';
        editBtn.className = 'secondary';
        editBtn.addEventListener('click', function() {
            editId = l.id_laptop;
            formTitle.textContent = 'Modifica laptop #' + l.id_laptop;
            if (mdl.sel.querySelector('option[value="' + m.id_model + '"]'))
                mdl.sel.value = String(m.id_model);
            if (lkr.sel.querySelector('option[value="' + lk.id_locker + '"]'))
                lkr.sel.value = String(lk.id_locker);
            statusSel.sel.value = l.status;
            formInner.style.display = '';
        });
        return {
            cells: [l.id_laptop, m.brand, m.model, m.cpu, m.ram, m.storage, lk.name_locker, statusBadge],
            extraButtons: [editBtn],
            deleteUrl: API_ENDPOINTS.laptops + '/' + l.id_laptop,
            deleteLabel: 'Elimina'
        };
    });
    container.appendChild(makeAdminTable(
        ['ID', 'Marca', 'Modello', 'CPU', 'RAM', 'Storage', 'Locker', 'Stato'], rows, loadAdminLaptops
    ));
}

async function loadAdminLockers() {
    const container = document.getElementById('adminLockersData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.lockers, {});
    const lockers = (data && Array.isArray(data.lockers)) ? data.lockers : [];
    container.innerHTML = '';

    // ── Form ─────────────────────────────────────────────────────────────
    var formWrap = document.createElement('div');
    formWrap.className = 'admin-form-wrap';
    var toggleBtn = document.createElement('button');
    toggleBtn.textContent = '+ Aggiungi locker';
    toggleBtn.className = 'secondary';
    var formInner = document.createElement('div');
    formInner.className = 'admin-form-inner';
    formInner.style.display = 'none';
    var formTitle = document.createElement('h4');
    formTitle.textContent = 'Aggiungi locker';
    formInner.appendChild(formTitle);
    var grid = document.createElement('div');
    grid.className = 'admin-form-grid';

    function makeTextInput(labelText, placeholder) {
        var wrap = document.createElement('div');
        var lbl = document.createElement('label'); lbl.textContent = labelText;
        var inp = document.createElement('input');
        inp.type = 'text'; inp.placeholder = placeholder || '';
        wrap.appendChild(lbl); wrap.appendChild(inp);
        return { wrap: wrap, inp: inp };
    }
    var nameInp = makeTextInput('Nome', 'es. Locker A');
    var locInp  = makeTextInput('Posizione', 'es. Corridoio 1');
    var saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salva'; saveBtn.className = 'primary';
    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annulla'; cancelBtn.className = 'secondary';
    [nameInp.wrap, locInp.wrap, saveBtn, cancelBtn].forEach(function(el) { grid.appendChild(el); });
    formInner.appendChild(grid);
    formWrap.appendChild(toggleBtn);
    formWrap.appendChild(formInner);
    container.appendChild(formWrap);

    var editId = null;
    toggleBtn.addEventListener('click', function() {
        editId = null; formTitle.textContent = 'Aggiungi locker';
        nameInp.inp.value = ''; locInp.inp.value = '';
        formInner.style.display = formInner.style.display === 'none' ? '' : 'none';
    });
    cancelBtn.addEventListener('click', function() {
        editId = null; formInner.style.display = 'none'; formTitle.textContent = 'Aggiungi locker';
    });
    saveBtn.addEventListener('click', function() {
        var name = nameInp.inp.value.trim();
        if (!name) { alert('Inserisci il nome del locker.'); return; }
        if (editId) {
            apiPatch(API_ENDPOINTS.lockers + '/' + editId, { name: name, location: locInp.inp.value.trim() }).then(function(r) {
                if (r && r.status === 200) loadAdminLockers();
                else alert('Errore aggiornamento locker.');
            });
        } else {
            apiPost(API_ENDPOINTS.lockers, new URLSearchParams({ name: name, location: locInp.inp.value.trim() })).then(function(r) {
                if (r && r.status === 201) loadAdminLockers();
                else alert('Errore creazione locker.');
            });
        }
    });

    // ── Table ─────────────────────────────────────────────────────────────
    var rows = lockers.map(function(lk) {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifica'; editBtn.className = 'secondary';
        editBtn.addEventListener('click', function() {
            editId = lk.id_locker;
            formTitle.textContent = 'Modifica locker #' + lk.id_locker;
            nameInp.inp.value = lk.name_locker || '';
            locInp.inp.value  = lk.location || '';
            formInner.style.display = '';
        });
        return {
            cells: [lk.id_locker, lk.name_locker, lk.location],
            extraButtons: [editBtn],
            deleteUrl: API_ENDPOINTS.lockers + '/' + lk.id_locker,
            deleteLabel: 'Elimina'
        };
    });
    container.appendChild(makeAdminTable(['ID', 'Nome', 'Posizione'], rows, loadAdminLockers));
}

async function loadAdminModels() {
    const container = document.getElementById('adminModelsData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.models, {});
    const models = (data && Array.isArray(data.models)) ? data.models : [];
    container.innerHTML = '';

    // ── Form ─────────────────────────────────────────────────────────────────
    var formWrap = document.createElement('div');
    formWrap.className = 'admin-form-wrap';
    var toggleBtn = document.createElement('button');
    toggleBtn.textContent = '+ Aggiungi modello';
    toggleBtn.className = 'secondary';
    var formInner = document.createElement('div');
    formInner.className = 'admin-form-inner';
    formInner.style.display = 'none';
    var formTitle = document.createElement('h4');
    formTitle.textContent = 'Aggiungi modello';
    formInner.appendChild(formTitle);
    var grid = document.createElement('div');
    grid.className = 'admin-form-grid';

    function makeTextInput(labelText, placeholder) {
        var wrap = document.createElement('div');
        var lbl = document.createElement('label'); lbl.textContent = labelText;
        var inp = document.createElement('input');
        inp.type = 'text'; inp.placeholder = placeholder || '';
        wrap.appendChild(lbl); wrap.appendChild(inp);
        return { wrap: wrap, inp: inp };
    }
    function makeNumberInput(labelText, placeholder) {
        var wrap = document.createElement('div');
        var lbl = document.createElement('label'); lbl.textContent = labelText;
        var inp = document.createElement('input');
        inp.type = 'number'; inp.min = '0'; inp.placeholder = placeholder || '';
        inp.style.minWidth = '80px';
        wrap.appendChild(lbl); wrap.appendChild(inp);
        return { wrap: wrap, inp: inp };
    }

    var brandInp   = makeTextInput('Marca', 'es. Lenovo');
    var modelInp   = makeTextInput('Modello', 'es. ThinkPad X1');
    var cpuInp     = makeTextInput('CPU', 'es. i5-1235U');
    var ramInp     = makeNumberInput('RAM (GB)', 'es. 16');
    var storageInp = makeNumberInput('Storage (GB)', 'es. 512');
    var osInp      = makeTextInput('OS', 'es. Windows 11');
    var saveBtn    = document.createElement('button');
    saveBtn.textContent = 'Salva'; saveBtn.className = 'primary';
    var cancelBtn  = document.createElement('button');
    cancelBtn.textContent = 'Annulla'; cancelBtn.className = 'secondary';

    [brandInp.wrap, modelInp.wrap, cpuInp.wrap, ramInp.wrap, storageInp.wrap, osInp.wrap, saveBtn, cancelBtn]
        .forEach(function(el) { grid.appendChild(el); });
    formInner.appendChild(grid);
    formWrap.appendChild(toggleBtn);
    formWrap.appendChild(formInner);
    container.appendChild(formWrap);

    var editId = null;

    function clearForm() {
        [brandInp, modelInp, cpuInp, ramInp, storageInp, osInp].forEach(function(f) { f.inp.value = ''; });
    }

    toggleBtn.addEventListener('click', function() {
        editId = null; formTitle.textContent = 'Aggiungi modello';
        clearForm();
        formInner.style.display = formInner.style.display === 'none' ? '' : 'none';
    });
    cancelBtn.addEventListener('click', function() {
        editId = null; formInner.style.display = 'none';
        formTitle.textContent = 'Aggiungi modello';
    });
    saveBtn.addEventListener('click', function() {
        var brand = brandInp.inp.value.trim();
        var model = modelInp.inp.value.trim();
        if (!brand || !model) { alert('Marca e modello sono obbligatori.'); return; }
        var params = {
            brand: brand, model: model,
            cpu: cpuInp.inp.value.trim(),
            ram: ramInp.inp.value,
            storage: storageInp.inp.value,
            os: osInp.inp.value.trim()
        };
        if (editId) {
            apiPatch(API_ENDPOINTS.models + '/' + editId, params).then(function(r) {
                if (r && r.status === 200) loadAdminModels();
                else alert('Errore aggiornamento modello.');
            });
        } else {
            apiPost(API_ENDPOINTS.models, new URLSearchParams(params)).then(function(r) {
                if (r && r.status === 201) loadAdminModels();
                else alert('Errore creazione modello.');
            });
        }
    });

    // ── Table ─────────────────────────────────────────────────────────────────
    var rows = models.map(function(m) {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Modifica'; editBtn.className = 'secondary';
        editBtn.addEventListener('click', function() {
            editId = m.id_model;
            formTitle.textContent = 'Modifica modello #' + m.id_model;
            brandInp.inp.value   = m.brand   || '';
            modelInp.inp.value   = m.model   || '';
            cpuInp.inp.value     = m.cpu     || '';
            ramInp.inp.value     = m.ram     || '';
            storageInp.inp.value = m.storage || '';
            osInp.inp.value      = m.os      || '';
            formInner.style.display = '';
        });
        return {
            cells: [m.id_model, m.brand, m.model, m.cpu, m.ram, m.storage, m.os],
            extraButtons: [editBtn],
            deleteUrl: API_ENDPOINTS.models + '/' + m.id_model,
            deleteLabel: 'Elimina'
        };
    });
    container.appendChild(makeAdminTable(
        ['ID', 'Marca', 'Modello', 'CPU', 'RAM', 'Storage', 'OS'], rows, loadAdminModels
    ));
}

// ─── LOCKERS ─────────────────────────────────────────────────────────────────

async function loadLockers() {
    const container = document.getElementById('lockersData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.lockers, {});
    const lockers = (data && Array.isArray(data.lockers)) ? data.lockers : [];
    container.innerHTML = '';
    container.appendChild(makeTable(['ID', 'Nome', 'Posizione'],
        lockers.map(function(lk) { return [lk.id_locker, lk.name_locker, lk.location]; })
    ));
}

// ─── MODELS ──────────────────────────────────────────────────────────────────

async function loadModels() {
    const container = document.getElementById('modelsData');
    container.textContent = 'Caricamento...';
    const data = await apiGet(API_ENDPOINTS.models, {});
    const models = (data && Array.isArray(data.models)) ? data.models : [];
    container.innerHTML = '';
    container.appendChild(makeTable(['ID', 'Marca', 'Modello', 'CPU', 'RAM (GB)', 'Storage (GB)', 'OS'],
        models.map(function(m) { return [m.id_model, m.brand, m.model, m.cpu, m.ram, m.storage, m.os]; })
    ));
}


// ─── INIT ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // ─── THEME ───────────────────────────────────────────────────────────────
    var themeBtn = document.getElementById('themeToggleBtn');
    function applyTheme(light) {
        if (light) {
            document.documentElement.classList.add('light');
            if (themeBtn) themeBtn.textContent = 'Tema scuro';
        } else {
            document.documentElement.classList.remove('light');
            if (themeBtn) themeBtn.textContent = 'Tema chiaro';
        }
    }
    applyTheme(localStorage.getItem('theme') === 'light');
    if (themeBtn) {
        themeBtn.addEventListener('click', function() {
            var isLight = document.documentElement.classList.toggle('light');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            themeBtn.textContent = isLight ? 'Tema scuro' : 'Tema chiaro';
        });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Auto-login: eseguito subito, prima del setup dei listener
    var _savedToken = loadToken();
    if (_savedToken) {
        var _payload = decodeJwtPayload(_savedToken);
        if (_payload) {
            currentUser = _payload;
            updateUserInfo();
            showLoginPage(false);
            switchTab('dashboard');
        } else {
            clearToken();
            showLoginPage(true);
        }
    } else {
        showLoginPage(true);
    }

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Main tab navigation
    document.querySelectorAll('.tab').forEach(function(btn) {
        btn.addEventListener('click', function() { switchTab(this.getAttribute('data-tab')); });
    });

    // Reservation sub-navigation
    document.querySelectorAll('.res-nav').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const res = this.getAttribute('data-res');
            showResSection(res);
            if (res === 'my')      loadMyReservations({});
            if (res === 'old')     loadOldReservations();
            if (res === 'current') loadCurrentReservations();
            if (res === 'all')     loadAllReservations({});
        });
    });

    // Laptop filters
    document.getElementById('searchLaptopsBtn').addEventListener('click', function() {
        loadLaptops({
            brand: document.getElementById('filterLaptopBrand').value,
            cpu: document.getElementById('filterLaptopCpu').value,
            ram: document.getElementById('filterLaptopRam').value,
            status: document.getElementById('filterLaptopStatus').value
        });
    });
    document.getElementById('resetLaptopsBtn').addEventListener('click', function() {
        ['filterLaptopBrand', 'filterLaptopCpu', 'filterLaptopRam', 'filterLaptopStatus'].forEach(function(id) {
            document.getElementById(id).value = '';
        });
        loadLaptops({});
    });

    // My reservations filters
    document.getElementById('searchMyResBtn').addEventListener('click', function() {
        loadMyReservations({});
    });
    document.getElementById('searchOldResBtn').addEventListener('click', function() {
        loadOldReservations();
    });

    // New reservation — date shortcuts
    function isoToday() {
        const d = new Date();
        return d.toLocaleDateString('sv-SE'); // yyyy-mm-dd
    }
    document.getElementById('todayBtn').addEventListener('click', function() {
        document.getElementById('newResDate').value = isoToday();
    });
    document.getElementById('tomorrowBtn').addEventListener('click', function() {
        const d = new Date(); d.setDate(d.getDate() + 1);
        document.getElementById('newResDate').value = d.toLocaleDateString('sv-SE');
    });

    // New reservation — quick time slots
    var QUICK_SLOTS_DAY = [
        ['08:00', '09:00'], ['09:00', '10:00'], ['10:00', '11:00'],
        ['11:00', '12:00'], ['12:00', '13:00'], ['13:00', '14:00'],
        ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00']
    ];
    var QUICK_SLOTS_EVENING = [
        ['17:30', '18:30'], ['18:30', '19:30'], ['19:30', '20:30'],
        ['20:30', '21:30'], ['21:30', '22:30']
    ];
    var quickSlotContainer = document.getElementById('quickSlots');

    function addSlotGroup(label, slots) {
        var sep = document.createElement('span');
        sep.textContent = label + ': ';
        sep.style.marginRight = '4px';
        quickSlotContainer.appendChild(sep);
        slots.forEach(function(slot) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = slot[0] + '\u2013' + slot[1];
            btn.style.marginRight = '4px';
            btn.style.marginBottom = '4px';
            btn.addEventListener('click', function() {
                var parts0 = slot[0].split(':');
                var parts1 = slot[1].split(':');
                document.getElementById('newResStartH').value = parts0[0];
                document.getElementById('newResStartM').value = parts0[1] || '00';
                document.getElementById('newResEndH').value   = parts1[0];
                document.getElementById('newResEndM').value   = parts1[1] || '00';
                if (!document.getElementById('newResDate').value) {
                    document.getElementById('newResDate').value = isoToday();
                }
                loadAvailableLaptops();
            });
            quickSlotContainer.appendChild(btn);
        });
        quickSlotContainer.appendChild(document.createElement('br'));
    }

    addSlotGroup('Diurno', QUICK_SLOTS_DAY);
    addSlotGroup('Serale', QUICK_SLOTS_EVENING);

    document.getElementById('searchAvailableLaptopsBtn').addEventListener('click', function() {
        loadAvailableLaptops();
    });
    ['newResDate', 'newResStartH', 'newResStartM', 'newResEndH', 'newResEndM'].forEach(function(id) {
        var el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('change', function() {
            loadAvailableLaptops({ silent: true });
        });
    });
    document.getElementById('recurringToggle').addEventListener('change', function() {
        document.getElementById('recurringOptions').style.display = this.checked ? 'block' : 'none';
    });
    document.getElementById('confirmReservationBtn').addEventListener('click', confirmReservation);

    // Admin sub-navigation
    document.querySelectorAll('.admin-nav').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-admin');
            showAdminSection(section);
            if (section === 'reservations') loadAllReservations({});
            if (section === 'users')        loadAdminUsers({});
            if (section === 'laptops')      loadAdminLaptops();
            if (section === 'lockers')      loadAdminLockers();
            if (section === 'models')       loadAdminModels();
        });
    });

    // Admin reservation filters
    document.getElementById('adminResSearch').addEventListener('click', function() {
        loadAllReservations({ status: document.getElementById('adminResStatus').value });
    });
    document.getElementById('adminResReset').addEventListener('click', function() {
        document.getElementById('adminResStatus').value = '';
        loadAllReservations({});
    });

    // Admin user filters
    document.getElementById('adminUserSearch').addEventListener('click', function() {
        loadAdminUsers({ email: document.getElementById('adminUserEmail').value,
                         role: document.getElementById('adminUserRole').value });
    });
    document.getElementById('adminUserReset').addEventListener('click', function() {
        document.getElementById('adminUserEmail').value = '';
        document.getElementById('adminUserRole').value = '';
        loadAdminUsers({});
    });
});
