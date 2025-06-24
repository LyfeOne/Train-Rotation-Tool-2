const SCRIPT_VERSION = "7.0.3"; // Fixed Reset VIP Counts & Undo VIP Counts
// --- Firebase Configuration ---
// !!! ERSETZE DIES MIT DEINER EIGENEN FIREBASE KONFIGURATION FÜR DIE NEUE VERSION !!!
const firebaseConfig = {
  apiKey: "AIzaSyAaRF7n14TDhTltcK7ZC_vuSBVeUnd2dtM",
  authDomain: "red-train-rotation-tool-2.firebaseapp.com",
  projectId: "red-train-rotation-tool-2",
  storageBucket: "red-train-rotation-tool-2.firebasestorage.app",
  messagingSenderId: "638755313613",
  appId: "1:638755313613:web:42e2e1ce19d4b124fe1684"
};
try { firebase.initializeApp(firebaseConfig); } catch (e) { console.error("Firebase Init Error", e); alert("Could not initialize Firebase."); }
const db = firebase.firestore();
const stateDocRef = db.collection("rotationState").doc("s749_state_v7");

// --- Constants and State ---
const MVP_TECH_DAY = 1;
const MVP_VS_DAY = 0;
const RANKS = ["Member", "R4", "R5"];
const NEW_VERSION_START_DATE = "2025-06-24";

let state = {
    members: [],
    rotationState: {
        currentDate: null,
        r4r5Index: 0,
        selectedMvps: {},
        vipCounts: {},
        dailyHistory: {}
    },
    previousRotationState: null,
    editingMemberId: null,
    editingVipCountMemberId: null
};

// Helper to generate a consistent ID from a name for config matching
function generateConsistentIdFromName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/gi, '') || generateId(); // Fallback to random if name is empty after normalization
}

const initialMembersConfig = [
    { name: "LadyLaik", rank: "R5"}, { name: "Caretta", rank: "R4"},
    { name: "CornFlakes", rank: "R4"}, { name: "DaVinnie", rank: "R4"},
    { name: "Enyaisrave", rank: "R4"}, { name: "Johcar", rank: "R4"},
    { name: "Lyfe", rank: "R4"}, { name: "Motherfrogger", rank: "R4"},
    { name: "Munky", rank: "R4"}, { name: "Pabs64", rank: "R4"},
    { name: "Supersebb", rank: "R4"},
    { name: "Aminos77", rank: "Member"}, { name: "B1wizz", rank: "Member"},
    { name: "Bekim1", rank: "Member"}, { name: "Biloute 62", rank: "Member"},
    { name: "BlackPush", rank: "Member"}, { name: "BlackWizardUA", rank: "Member"},
    { name: "blacky12345", rank: "Member"}, { name: "B L A D É", rank: "Member"},
    { name: "BOREDOFTHISSHTGAME", rank: "Member"}, { name: "Charly232", rank: "Member"},
    { name: "Chris", rank: "Member"}, { name: "Cocsi29400", rank: "Member"},
    { name: "Commander BLad", rank: "Member"}, { name: "Dario217", rank: "Member"},
    { name: "Darkknight", rank: "Member"}, { name: "depechefann", rank: "Member"},
    { name: "Dfyra", rank: "Member"}, { name: "diRty freNk", rank: "Member"},
    { name: "Egius", rank: "Member"}, { name: "Ever4", rank: "Member"},
    { name: "F L A C", rank: "Member"}, { name: "Faluche", rank: "Member"},
    { name: "Fire", rank: "Member"}, { name: "FireXice (Bibot)", rank: "Member"},
    { name: "Foggis", rank: "Member"}, { name: "Gekkegerrittttt", rank: "Member"},
    { name: "GhósT", rank: "Member"}, { name: "Ghthegreat", rank: "Member"},
    { name: "Goddes Ninopatra", rank: "Member"}, { name: "Gorkiules", rank: "Member"},
    { name: "Gunnovic", rank: "Member"}, { name: "Héra217", rank: "Member"},
    { name: "ILYES B", rank: "Member"}, { name: "IRONHAMMER", rank: "Member"},
    { name: "JackToo", rank: "Member"}, { name: "Jaista", rank: "Member"},
    { name: "jarako", rank: "Member"}, { name: "jassådu", rank: "Member"},
    { name: "joneboi", rank: "Member"}, { name: "Jotersan", rank: "Member"},
    { name: "Juantxo79", rank: "Member"}, { name: "Just Melo", rank: "Member"},
    { name: "KezuaL", rank: "Member"}, { name: "KFCPov3r", rank: "Member"},
    { name: "KingStridez", rank: "Member"}, { name: "KPShafty", rank: "Member"},
    { name: "Kyuchie", rank: "Member"}, { name: "Laeta", rank: "Member"},
    { name: "Leka98", rank: "Member"}, { name: "LooseLemon", rank: "Member"},
    { name: "Lutonian", rank: "Member"}, { name: "Mala Mimi", rank: "Member"},
    { name: "Megalomanie", rank: "Member"}, { name: "Molkok", rank: "Member"},
    { name: "MRan", rank: "Member"}, { name: "NymbleV", rank: "Member"},
    { name: "ohoimarshall", rank: "Member"}, { name: "olabaf", rank: "Member"},
    { name: "Oliviax", rank: "Member"}, { name: "OnlyPerseus", rank: "Member"},
    { name: "Peckap", rank: "Member"}, { name: "Prantuan", rank: "Member"},
    { name: "Pyretta", rank: "Member"}, { name: "RaMbo0", rank: "Member"},
    { name: "Raph911", rank: "Member"}, { name: "Rikkyyyyy", rank: "Member"},
    { name: "RuiAP", rank: "Member"}, { name: "S A M U R A i", rank: "Member"},
    { name: "Sarajevo Mfrcs", rank: "Member"}, { name: "Smugwell", rank: "Member"},
    { name: "Str1ke", rank: "Member"}, { name: "Swat95s", rank: "Member"},
    { name: "Swisskilla", rank: "Member"}, { name: "Temd", rank: "Member"},
    { name: "TheFloh", rank: "Member"}, { name: "theFoxXx", rank: "Member"},
    { name: "Thirteen Squid", rank: "Member"}, { name: "TigerShana", rank: "Member"},
    { name: "Vechniy", rank: "Member"}, { name: "Villanueva 1", rank: "Member"},
    { name: "XiC", rank: "Member"}, { name: "Xyz111111", rank: "Member"},
    { name: "Zoorglub", rank: "Member"}, { name: "АЛЕКС1980", rank: "Member"},
    { name: "ЖЭКА", rank: "Member"}
].map(m => ({ ...m, id: generateConsistentIdFromName(m.name) })); // Generiere ID direkt hier

// Die Schlüssel hier sollten den *Originalnamen* aus deiner Liste entsprechen, wie oben in initialMembersConfig.
// Die getInitialVipCountsWithIds Funktion wird versuchen, dies zu matchen.
const initialVipCountsConfig = {
    "LadyLaik": 0, "Caretta": 0, "CornFlakes": 0, "DaVinnie": 0, "Enyaisrave": 0, "Johcar": 0, "Lyfe": 0, 
    "Motherfrogger": 0, "Munky": 0, "Pabs64": 0, "Supersebb": 0,
    "Aminos77": 1, "B1wizz": 1, "Bekim1": 1, "Biloute 62": 1, "BlackPush": 1, "BlackWizardUA": 1,
    "blacky12345": 2, "B L A D É": 1, "BOREDOFTHISSHTGAME": 1, "Charly232": 1, "Chris": 1, "Cocsi29400": 1,
    "Commander BLad": 2, "Dario217": 1, "Darkknight": 1, "depechefann": 1, "Dfyra": 1, "diRty freNk": 1,
    "Egius": 1, "Ever4": 1, "F L A C": 1, "Faluche": 1, "Fire": 2, "FireXice (Bibot)": 0, "Foggis": 2,
    "Gekkegerrittttt": 1, "GhósT": 1, "Ghthegreat": 1, "Goddes Ninopatra": 0, "Gorkiules": 1, "Gunnovic": 0,
    "Héra217": 1, "ILYES B": 0, "IRONHAMMER": 1, "JackToo": 1, "Jaista": 1, "jarako": 1, "jassådu": 0,
    "joneboi": 1, "Jotersan": 1, "Juantxo79": 0, "Just Melo": 1, "KezuaL": 1, "KFCPov3r": 0, "KingStridez": 2,
    "KPShafty": 1, "Kyuchie": 0, "Laeta": 1, "Leka98": 1, "LooseLemon": 0, "Lutonian": 1, "Mala Mimi": 0,
    "Megalomanie": 0, "Molkok": 0, "MRan": 1, "NymbleV": 0, "ohoimarshall": 0, "olabaf": 0, "Oliviax": 0,
    "OnlyPerseus": 0, "Peckap": 0, "Prantuan": 1, "Pyretta": 0, "RaMbo0": 0, "Raph911": 1, "Rikkyyyyy": 1,
    "RuiAP": 0, "S A M U R A i": 0, "Sarajevo Mfrcs": 0, "Smugwell": 1, "Str1ke": 1, "Swat95s": 0, "Swisskilla": 0,
    "Temd": 0, "TheFloh": 0, "theFoxXx": 0, "Thirteen Squid": 1, "TigerShana": 0, "Vechniy": 0,
    "Villanueva 1": 0, "XiC": 0, "Xyz111111": 0, "Zoorglub": 1, "АЛЕКС1980": 0, "ЖЭКА": 0
};

function getInitialVipCountsWithIds(membersArray, countsNameConfig) {
    const vipCountsById = {};
    membersArray.forEach(member => { // `membersArray` sind die Mitglieder mit bereits gesetzten IDs
        const memberId = member.id;
        const memberName = member.name;
        let countForThisMember = 0; // Default

        if (countsNameConfig[memberName] !== undefined) {
            countForThisMember = countsNameConfig[memberName];
        } else {
            // Fallback für normalisierte Namen, falls exakter Name nicht in countsNameConfig ist
            const normalizedNameLookup = generateConsistentIdFromName(memberName);
            if (countsNameConfig[normalizedNameLookup] !== undefined) { // Sollte nicht nötig sein, wenn Schlüssel in countsNameConfig die Originalnamen sind
                countForThisMember = countsNameConfig[normalizedNameLookup];
            } else {
                 console.warn(`Initial VIP count for '${memberName}' (ID: ${memberId}) not found in countsNameConfig. Defaulting to 0.`);
            }
        }
        vipCountsById[memberId] = countForThisMember;
    });
    return vipCountsById;
}

// --- DOM Elements ---
const memberListEl = document.getElementById('member-list');
const addMemberForm = document.getElementById('add-member-form');
const newMemberNameInput = document.getElementById('new-member-name');
const newMemberRankSelect = document.getElementById('new-member-rank');
const memberCountEl = document.getElementById('member-count');
const currentDateEl = document.getElementById('current-date');
const currentDayOfWeekEl = document.getElementById('current-day-of-week');
const currentConductorEl = document.getElementById('current-conductor');
const scheduleDisplayListEl = document.getElementById('schedule-display').querySelector('ul');
const undoAdvanceBtn = document.getElementById('undo-advance');
const mvpSelectionArea = document.getElementById('mvp-selection-area');
const mvpSelect = document.getElementById('mvp-select');
const resetBtn = document.getElementById('reset-data');
const vipStatsListEl = document.getElementById('vip-stats').querySelector('ul');
const todaysVipSelect = document.getElementById('select-todays-vip');
const confirmVipAdvanceDayBtn = document.getElementById('confirm-vip-advance-day');
const lastCompletedDateEl = document.getElementById('last-completed-date');
const lastCompletedConductorEl = document.getElementById('last-completed-conductor');
const lastCompletedVipEl = document.getElementById('last-completed-vip');
const vipsWithZeroCountListEl = document.getElementById('vips-with-zero-count-display').querySelector('ul');
const copyZeroVipListBtn = document.getElementById('copy-zero-vip-list');
const versionEl = document.getElementById('script-version');

// --- Utility Functions ---
function generateId() { return Math.random().toString(36).substring(2, 15); }
function getDayOfWeek(date) { return date.getDay(); }
function formatDate(date) { if (!(date instanceof Date) || isNaN(date)) return "Invalid Date"; return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
function getISODateString(date) { if (!(date instanceof Date) || isNaN(date)) { console.error("Invalid date for getISODateString:", date); return new Date().toISOString().split('T')[0]; } return date.toISOString().split('T')[0]; }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
function getMemberById(id) { return state.members?.find(m => m?.id === id); }
function getMembersByRank(rank) { if (!Array.isArray(state.members)) return []; if (rank === 'R4/R5') return state.members.filter(m => m && (m.rank === 'R4' || m.rank === 'R5')); return state.members.filter(m => m && m.rank === rank); }

// --- Core Logic ---
function calculateDailyConductor(targetDateStr, currentR4R5Index, selectedMvpsMap) {
    if (!targetDateStr || typeof currentR4R5Index !== 'number' || typeof selectedMvpsMap !== 'object') {
        console.error("calculateDailyConductor: Invalid parameters");
        return { id: 'ERR_PARAM_COND', name: 'Param Error Conductor', rank: 'Sys' };
    }
    const targetDate = new Date(targetDateStr + 'T00:00:00Z');
    if (isNaN(targetDate)) {
        console.error("calculateDailyConductor: Invalid targetDate from string", targetDateStr);
        return { id: 'ERR_DATE_COND', name: 'Date Error Conductor', rank: 'Sys' };
    }
    const dayOfWeek = getDayOfWeek(targetDate);
    let conductor = null;
    const r4r5Members = getMembersByRank('R4/R5');
    if (dayOfWeek === MVP_TECH_DAY) {
        const mvpKey = `${targetDateStr}_Mon`;
        const mvpId = selectedMvpsMap[mvpKey];
        conductor = mvpId ? getMemberById(mvpId) : { id: 'MVP_MON_SELECT', name: 'Tech MVP Needed', rank: 'MVP' };
    } else if (dayOfWeek === MVP_VS_DAY) {
        const mvpKey = `${targetDateStr}_Sun`;
        const mvpId = selectedMvpsMap[mvpKey];
        conductor = mvpId ? getMemberById(mvpId) : { id: 'MVP_SUN_SELECT', name: 'VS MVP Needed', rank: 'MVP' };
    } else {
        conductor = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length] : { id: 'NO_R4R5', name: 'No R4/R5', rank: 'Sys' };
    }
    return conductor || { id: 'ERR_COND_FALLBACK', name: 'Err Conductor Fallback', rank: 'Sys' };
}

function recordDailyHistory(dateStr, conductorId, vipId, status = 'Confirmed') {
    if (!dateStr || !conductorId || !vipId) {
        console.warn("recordDailyHistory: Missing data for history entry", { dateStr, conductorId, vipId, status });
        return;
    }
    const conductor = getMemberById(conductorId);
    const vip = getMemberById(vipId);
    console.log("In recordDailyHistory - vipId:", vipId, "Found vip object:", vip);

    if (!state.rotationState.dailyHistory) {
        state.rotationState.dailyHistory = {};
    }
    state.rotationState.dailyHistory[dateStr] = {
        conductorId: conductorId,
        conductorName: conductor ? conductor.name : `ID:${conductorId}`,
        conductorRank: conductor ? conductor.rank : 'N/A',
        vipId: vipId,
        vipName: vip ? vip.name : `ID:${vipId}`,
        vipRank: vip ? vip.rank : 'N/A',
        status: status
    };
    console.log("Recorded history for:", dateStr, JSON.parse(JSON.stringify(state.rotationState.dailyHistory[dateStr])));
}

async function handleConfirmVipAndAdvanceDay() {
    if (!state.rotationState?.currentDate) {
        alert("Rotation state is not loaded.");
        return;
    }
    
    // KORREKTUR: State für Undo *vor* allen Änderungen sichern
    try {
        const stateToBackup = JSON.parse(JSON.stringify(state.rotationState));
        console.log("Saving current state to previousRotationState for undo:", stateToBackup);
        state.previousRotationState = stateToBackup;
    } catch (e) {
        console.error("Error creating previousRotationState for advance:", e);
        state.previousRotationState = null; // Sicherstellen, dass es null ist bei Fehler
    }

    const selectedVipId = todaysVipSelect.value;
    if (!selectedVipId) {
        alert("Please select Today's VIP from the dropdown.");
        todaysVipSelect.focus();
        state.previousRotationState = null; // Ungültige Aktion, kein Undo-State
        return;
    }

    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    const dayOfWeek = getDayOfWeek(currentDate);
    let finalConductorId = null;

    if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) {
        const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`;
        const existingMvp = state.rotationState.selectedMvps?.[mvpKey];
        if (existingMvp) {
            finalConductorId = existingMvp;
        } else {
            const selectedMvpForTodayId = mvpSelect.value;
            if (!selectedMvpForTodayId) {
                alert("Please select an MVP Conductor for today.");
                mvpSelect.focus();
                state.previousRotationState = null; // Ungültige Aktion
                return;
            }
            finalConductorId = selectedMvpForTodayId;
            state.rotationState.selectedMvps[mvpKey] = selectedMvpForTodayId;
        }
    } else {
        const r4r5Members = getMembersByRank('R4/R5');
        if (r4r5Members.length > 0) {
            finalConductorId = r4r5Members[state.rotationState.r4r5Index % r4r5Members.length].id;
        } else {
            finalConductorId = 'NO_R4R5';
        }
    }

    if (!finalConductorId || finalConductorId.startsWith('NO_')) {
        alert("Conductor for today could not be determined. Cannot advance.");
        state.previousRotationState = null; // Ungültige Aktion
        return;
    }
    
    confirmVipAdvanceDayBtn.disabled = true;
    undoAdvanceBtn.disabled = true;

    if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
    state.rotationState.vipCounts[selectedVipId] = (state.rotationState.vipCounts[selectedVipId] || 0) + 1;

    console.log("VIP selected for history:", selectedVipId, "Member object:", getMemberById(selectedVipId));
    recordDailyHistory(currentDateStr, finalConductorId, selectedVipId, 'Confirmed');

    let nextR4R5Index = state.rotationState.r4r5Index ?? 0;
    if (dayOfWeek >= 2 && dayOfWeek <= 6) {
        nextR4R5Index = (nextR4R5Index + 1);
    }
    const nextDate = addDays(currentDate, 1);
    const nextDateStr = getISODateString(nextDate);

    state.rotationState.currentDate = nextDateStr;
    state.rotationState.r4r5Index = nextR4R5Index;

    try {
        await updateFirestoreState();
    } catch (error) {
        console.error("Failed to save state after advancing day:", error);
        alert("Error saving data. The day might not have advanced correctly.");
        renderCurrentDay();
    }
}

function updateFirestoreState() {
    const stateToSave = JSON.parse(JSON.stringify({
        members: state.members || [],
        rotationState: {
            currentDate: state.rotationState.currentDate,
            r4r5Index: state.rotationState.r4r5Index ?? 0,
            selectedMvps: state.rotationState.selectedMvps || {},
            vipCounts: state.rotationState.vipCounts || {},
            dailyHistory: state.rotationState.dailyHistory || {}
        }
    }));
    delete stateToSave.editingMemberId;
    delete stateToSave.editingVipCountMemberId;
    return stateDocRef.set(stateToSave)
        .then(() => { /* console.log("Firestore state updated successfully."); */ })
        .catch((e) => { console.error("Firestore write FAIL:", e); alert(`Save Error: ${e.message}`); throw e; });
}

function addMember(event) {
    event.preventDefault();
    const name = newMemberNameInput.value.trim();
    const rank = newMemberRankSelect.value;
    if (!name || !rank) { alert("Name and Rank are required."); return; }
    if (!Array.isArray(state.members)) state.members = [];
    if (state.members.some(m => m?.name.toLowerCase() === name.toLowerCase())) {
        alert(`Member with name "${name}" already exists.`); return;
    }
    const newMember = { id: generateConsistentIdFromName(name), name: name, rank: rank }; // Konsistente ID
    state.members.push(newMember);
    sortMembers();
    if (rank === 'Member') {
        if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
        state.rotationState.vipCounts[newMember.id] = 0;
    }
    updateFirestoreState().then(() => {
        render();
        newMemberNameInput.value = '';
        newMemberRankSelect.value = 'Member';
    });
}

function removeMember(id) {
    const member = getMemberById(id);
    if (!member) return;
    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
        state.members = state.members.filter(mb => mb?.id !== id);
        if (state.rotationState.vipCounts && state.rotationState.vipCounts[id] !== undefined) {
            delete state.rotationState.vipCounts[id];
        }
        if (state.rotationState.selectedMvps) {
            for (const key in state.rotationState.selectedMvps) {
                if (state.rotationState.selectedMvps[key] === id) {
                    delete state.rotationState.selectedMvps[key];
                }
            }
        }
        sortMembers(); 
        updateFirestoreState().then(render);
    }
}

function handleRankChange(event) {
    const selectElement = event.target;
    const memberId = selectElement.dataset.memberId;
    const newRank = selectElement.value;
    const member = getMemberById(memberId);
    if (!member) { console.error("Member not found for rank change:", memberId); return; }
    const oldRank = member.rank;
    if (oldRank === newRank) return;
    if (confirm(`Change ${member.name}'s rank from ${oldRank} to ${newRank}?`)) {
        member.rank = newRank;
        if (newRank === 'Member' && (state.rotationState.vipCounts?.[memberId] === undefined)) {
            if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
            state.rotationState.vipCounts[memberId] = 0;
        }
        sortMembers();
        updateFirestoreState().then(render);
    } else {
        selectElement.value = oldRank;
    }
}

function sortMembers() {
    if (!Array.isArray(state.members)) return;
    const rankOrder = { 'R5': 1, 'R4': 2, 'Member': 3 };
    state.members.sort((a, b) => {
        const rankA = a?.rank; const rankB = b?.rank;
        const nameA = a?.name || ""; const nameB = b?.name || "";
        const rankDiff = (rankOrder[rankA] || 99) - (rankOrder[rankB] || 99);
        if (rankDiff !== 0) return rankDiff;
        return nameA.localeCompare(nameB);
    });
}

function toggleRenameMode(memberId) {
    state.editingMemberId = state.editingMemberId === memberId ? null : memberId;
    renderMemberList();
}

async function saveNewName(memberId, newNameInput) {
    const newName = newNameInput.value.trim();
    if (!newName) { alert("Name cannot be empty."); newNameInput.focus(); return; }
    const originalMember = getMemberById(memberId);
    if (!originalMember) return;
    if (state.members.some(m => m.id !== memberId && m.name.toLowerCase() === newName.toLowerCase())) {
        alert(`Another member with the name "${newName}" already exists.`); newNameInput.focus(); return;
    }
    originalMember.name = newName; // ID bleibt gleich, Name ändert sich
    state.editingMemberId = null;
    sortMembers();
    try {
        await updateFirestoreState();
        render();
    } catch (error) {
        alert("Error saving new name: " + error.message);
    }
}

function renderMemberList() {
    memberListEl.innerHTML = '';
    if (!Array.isArray(state.members)) { memberCountEl.textContent = '0'; return; }
    memberCountEl.textContent = state.members.length;
    sortMembers();
    if (state.members.length === 0) { memberListEl.innerHTML = '<li>No members.</li>'; return; }
    state.members.forEach(member => {
        if (!member?.id || !member.name || !member.rank) return;
        const li = document.createElement('li'); li.dataset.memberId = member.id;
        const infoDiv = document.createElement('div'); infoDiv.classList.add('member-info');
        if (state.editingMemberId === member.id) {
            const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.value = member.name; nameInput.classList.add('inline-edit-name'); infoDiv.appendChild(nameInput);
            const saveNameBtn = document.createElement('button'); saveNameBtn.textContent = 'Save'; saveNameBtn.classList.add('btn-primary', 'btn-small'); saveNameBtn.onclick = () => saveNewName(member.id, nameInput); infoDiv.appendChild(saveNameBtn);
            const cancelNameBtn = document.createElement('button'); cancelNameBtn.textContent = 'Cancel'; cancelNameBtn.classList.add('btn-secondary', 'btn-small'); cancelNameBtn.onclick = () => toggleRenameMode(member.id); infoDiv.appendChild(cancelNameBtn);
        } else {
            const nameSpan = document.createElement('span'); nameSpan.textContent = member.name; nameSpan.classList.add('member-name-display'); infoDiv.appendChild(nameSpan);
            const rankSelect = document.createElement('select'); rankSelect.classList.add('rank-select-inline'); rankSelect.dataset.memberId = member.id;
            RANKS.forEach(rankValue => { const option = document.createElement('option'); option.value = rankValue; option.textContent = rankValue; if (member.rank === rankValue) option.selected = true; rankSelect.appendChild(option); });
            rankSelect.addEventListener('change', handleRankChange); infoDiv.appendChild(rankSelect);
        }
        const actionsDiv = document.createElement('div'); actionsDiv.classList.add('member-actions');
        if (state.editingMemberId !== member.id) {
            const renameButton = document.createElement('button'); renameButton.textContent = 'Rename'; renameButton.classList.add('btn-secondary', 'btn-small'); renameButton.onclick = () => toggleRenameMode(member.id); actionsDiv.appendChild(renameButton);
            const removeButton = document.createElement('button'); removeButton.textContent = 'Remove'; removeButton.classList.add('btn-remove', 'btn-small'); removeButton.onclick = () => removeMember(member.id); actionsDiv.appendChild(removeButton);
        }
        li.appendChild(infoDiv); li.appendChild(actionsDiv); memberListEl.appendChild(li);
    });
}

function renderCurrentDay() {
    if (!state.rotationState?.currentDate) { currentDateEl.textContent = "Loading state..."; return; }
    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    if (isNaN(currentDate)) { currentDateEl.textContent = "Invalid Date!"; currentDayOfWeekEl.textContent = "---"; currentConductorEl.textContent = "---"; confirmVipAdvanceDayBtn.disabled = true; return; }
    const dayOfWeek = getDayOfWeek(currentDate);
    const safeSelectedMvps = state.rotationState.selectedMvps || {};
    const calculatedConductor = calculateDailyConductor(currentDateStr, state.rotationState.r4r5Index ?? 0, safeSelectedMvps);
    currentDateEl.textContent = formatDate(currentDate);
    currentDayOfWeekEl.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    let isMvpSelectionNeededToday = false;
    if (dayOfWeek === MVP_TECH_DAY || dayOfWeek === MVP_VS_DAY) {
        const mvpKey = dayOfWeek === MVP_TECH_DAY ? `${currentDateStr}_Mon` : `${currentDateStr}_Sun`;
        const selectedMvpId = safeSelectedMvps[mvpKey];
        if (selectedMvpId) {
            const storedMvp = getMemberById(selectedMvpId);
            currentConductorEl.textContent = storedMvp ? `${storedMvp.name} (${storedMvp.rank})` : `Stored MVP (ID: ${selectedMvpId}) not found!`;
            mvpSelectionArea.style.display = 'none';
        } else {
            currentConductorEl.innerHTML = `<span class="mvp-selection-required">${calculatedConductor.name}</span>`;
            populateMvpSelect(); mvpSelectionArea.style.display = 'block'; mvpSelect.value = ""; isMvpSelectionNeededToday = true;
        }
    } else {
        currentConductorEl.textContent = `${calculatedConductor.name} (${calculatedConductor.rank})`;
        mvpSelectionArea.style.display = 'none';
    }
    populateTodaysVipSelect(); todaysVipSelect.value = "";
    handleMvpAndVipSelectionChange(); // Stellt sicher, dass der Button-Status korrekt ist
    undoAdvanceBtn.disabled = !state.previousRotationState;
}

function populateMvpSelect() {
    mvpSelect.innerHTML = '<option value="">-- Select MVP --</option>';
    if (!Array.isArray(state.members)) return;
    const memberRankMembers = getMembersByRank('Member');
    memberRankMembers.forEach(m => { if (!m?.id) return; const option = document.createElement('option'); option.value = m.id; option.textContent = `${m.name} (Member)`; mvpSelect.appendChild(option); });
}

function populateTodaysVipSelect() {
    todaysVipSelect.innerHTML = '<option value="">-- Select Today\'s VIP --</option>';
    const members = getMembersByRank('Member');
    if (!members || members.length === 0) { const option = document.createElement('option'); option.textContent = "No members available"; option.disabled = true; todaysVipSelect.appendChild(option); return; }
    members.forEach(member => { if (!member?.id) return; const option = document.createElement('option'); option.value = member.id; option.textContent = `${member.name} (VIPs: ${state.rotationState.vipCounts?.[member.id] || 0})`; todaysVipSelect.appendChild(option); });
}

function renderSchedule() {
    scheduleDisplayListEl.innerHTML = '';
    if (!state.rotationState?.currentDate || !state.members) { scheduleDisplayListEl.innerHTML = '<li>Schedule not ready...</li>'; return; }
    const history = state.rotationState.dailyHistory || {};
    const todayForSchedule = new Date(state.rotationState.currentDate + 'T00:00:00Z');
    if (isNaN(todayForSchedule)) { scheduleDisplayListEl.innerHTML = '<li>Error: Invalid date.</li>'; return; }
    const daysToShowPast = 3; const futureDaysNeeded = 14;
    for (let i = daysToShowPast; i >= 1; i--) {
        const pastDate = addDays(todayForSchedule, -i); const pastDateStr = getISODateString(pastDate);
        const historyEntry = history[pastDateStr];
        const li = document.createElement('li'); li.classList.add('past-day');
        const dateSpan = document.createElement('span'); dateSpan.classList.add('schedule-date'); dateSpan.textContent = formatDate(pastDate);
        const conductorSpan = document.createElement('span'); conductorSpan.classList.add('schedule-conductor');
        const vipSpan = document.createElement('span'); vipSpan.classList.add('schedule-vip');
        if (historyEntry) {
            conductorSpan.textContent = `C: ${historyEntry.conductorName} (${historyEntry.conductorRank || 'N/A'})`;
            vipSpan.textContent = `VIP: ${historyEntry.vipName} (${historyEntry.vipRank || 'N/A'})`;
        } else {
            conductorSpan.textContent = `C: (No history)`; vipSpan.textContent = `VIP: (No history)`;
        }
        li.appendChild(dateSpan); li.appendChild(conductorSpan); li.appendChild(vipSpan);
        scheduleDisplayListEl.appendChild(li);
    }
    let simDate = new Date(todayForSchedule); let simR4R5Idx = state.rotationState.r4r5Index ?? 0;
    let simMvps = JSON.parse(JSON.stringify(state.rotationState.selectedMvps || {}));
    for (let i = 0; i < futureDaysNeeded; i++) {
        if (isNaN(simDate)) { break; }
        const dateStr = getISODateString(simDate); const dayOfWeek = getDayOfWeek(simDate); const isCurrentDay = (i === 0);
        const conductor = calculateDailyConductor(dateStr, simR4R5Idx, simMvps);
        const li = document.createElement('li'); if (isCurrentDay) li.classList.add('current-day');
        const dateSpan = document.createElement('span'); dateSpan.classList.add('schedule-date'); dateSpan.textContent = formatDate(simDate);
        const conductorSpan = document.createElement('span'); conductorSpan.classList.add('schedule-conductor');
        const conductorName = conductor.name || "?"; const conductorRank = conductor.rank || "N/A";
        if (conductor.id === 'MVP_MON_SELECT' || conductor.id === 'MVP_SUN_SELECT') {
            const mvpKeyToCheck = dayOfWeek === MVP_TECH_DAY ? `${dateStr}_Mon` : `${dateStr}_Sun`;
            const simMvpId = simMvps[mvpKeyToCheck];
            if (simMvpId) { const mvpMember = getMemberById(simMvpId); conductorSpan.textContent = `C: ${mvpMember ? mvpMember.name : 'Stored MVP'} (${mvpMember ? mvpMember.rank : 'MVP'})`; }
            else { conductorSpan.innerHTML = `<span class="mvp-selection-required">${conductorName}</span>`; }
        } else { conductorSpan.textContent = `C: ${conductorName} (${conductorRank})`; }
        li.appendChild(dateSpan); li.appendChild(conductorSpan);
        const vipPlaceholderSpan = document.createElement('span'); vipPlaceholderSpan.classList.add('schedule-vip');
        vipPlaceholderSpan.textContent = (isCurrentDay) ? "VIP: (Select from Dropdown)" : "VIP: (Manual Selection)";
        li.appendChild(vipPlaceholderSpan);
        scheduleDisplayListEl.appendChild(li);
        if (dayOfWeek >= 2 && dayOfWeek <= 6) { simR4R5Idx++; } simDate = addDays(simDate, 1);
    }
}

function renderVipsWithZeroCount() {
    vipsWithZeroCountListEl.innerHTML = '';
    if (!state.members || !state.rotationState.vipCounts) { vipsWithZeroCountListEl.innerHTML = '<li>Loading data...</li>'; return; }
    const members = getMembersByRank('Member');
    const zeroCountVips = members.filter(m => (state.rotationState.vipCounts[m.id] || 0) === 0);
    sortMembersByName(zeroCountVips);
    if (zeroCountVips.length === 0) { vipsWithZeroCountListEl.innerHTML = '<li>All members have at least 1 VIP count.</li>'; return; }
    zeroCountVips.forEach(member => { const li = document.createElement('li'); li.textContent = member.name; vipsWithZeroCountListEl.appendChild(li); });
}

function sortMembersByName(memberArray) {
    if (!Array.isArray(memberArray)) return;
    memberArray.sort((a,b) => (a.name || "").localeCompare(b.name || ""));
}

function toggleEditVipCountMode(memberId) {
    state.editingVipCountMemberId = state.editingVipCountMemberId === memberId ? null : memberId;
    renderStatistics();
}

async function saveVipCount(memberId, newCountInput) {
    const newCountString = newCountInput.value;
    const newCount = parseInt(newCountString, 10);
    if (isNaN(newCount) || newCount < 0) { alert("VIP count must be a non-negative number."); newCountInput.focus(); return; }
    if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
    state.rotationState.vipCounts[memberId] = newCount;
    state.editingVipCountMemberId = null;
    try {
        await updateFirestoreState();
        render();
    } catch (error) {
        alert("Error saving VIP count: " + error.message);
    }
}

function renderStatistics() {
    vipStatsListEl.innerHTML = '';
    if (!state.members?.length) { vipStatsListEl.innerHTML = '<li>No members to display stats for.</li>'; return; }
    const vipCounts = state.rotationState.vipCounts || {};
    const memberRankMembers = getMembersByRank('Member');
    sortMembersByName(memberRankMembers);
    if (memberRankMembers.length === 0) { vipStatsListEl.innerHTML = '<li>No "Member" rank members in the alliance.</li>'; return; }
    let hasVipStats = false;
    memberRankMembers.forEach(member => {
        if (!member?.id || !member.name) return;
        const currentVipCount = vipCounts[member.id] || 0;
        hasVipStats = true; 
        const li = document.createElement('li'); li.dataset.memberId = member.id;
        const nameSpan = document.createElement('span'); nameSpan.textContent = member.name; nameSpan.classList.add('stats-name'); li.appendChild(nameSpan);
        const controlsDiv = document.createElement('div'); controlsDiv.classList.add('stats-controls');
        if (state.editingVipCountMemberId === member.id) {
            const countInput = document.createElement('input'); countInput.type = 'number'; countInput.value = currentVipCount; countInput.min = "0"; countInput.classList.add('inline-edit-count'); controlsDiv.appendChild(countInput);
            const saveBtn = document.createElement('button'); saveBtn.textContent = 'Save'; saveBtn.classList.add('btn-primary', 'btn-small'); saveBtn.onclick = () => saveVipCount(member.id, countInput); controlsDiv.appendChild(saveBtn);
            const cancelBtn = document.createElement('button'); cancelBtn.textContent = 'Cancel'; cancelBtn.classList.add('btn-secondary', 'btn-small'); cancelBtn.onclick = () => toggleEditVipCountMode(member.id); controlsDiv.appendChild(cancelBtn);
        } else {
            const countSpan = document.createElement('span'); countSpan.classList.add('stats-count'); countSpan.textContent = currentVipCount; controlsDiv.appendChild(countSpan);
            const editBtn = document.createElement('button'); editBtn.innerHTML = '✎'; editBtn.title = "Edit VIP Count"; editBtn.classList.add('btn-secondary', 'btn-small', 'btn-edit-stat'); editBtn.onclick = () => toggleEditVipCountMode(member.id); controlsDiv.appendChild(editBtn);
        }
        li.appendChild(controlsDiv); vipStatsListEl.appendChild(li);
    });
    if (!hasVipStats) {
        vipStatsListEl.innerHTML = '<li>No VIPs have been assigned yet.</li>';
    }
}

function renderLastCompletedDay() {
    lastCompletedDateEl.textContent = "---";
    lastCompletedConductorEl.textContent = "---";
    lastCompletedVipEl.textContent = "---";
    if (!state.rotationState?.currentDate) return;
    const today = new Date(state.rotationState.currentDate + 'T00:00:00Z');
    if (isNaN(today)) return;
    const lastDayDate = addDays(today, -1);
    const lastDateStr = getISODateString(lastDayDate);
    const historyEntry = state.rotationState.dailyHistory?.[lastDateStr];
    if (historyEntry) {
        lastCompletedDateEl.textContent = formatDate(lastDayDate);
        lastCompletedConductorEl.textContent = `${historyEntry.conductorName} (${historyEntry.conductorRank || 'N/A'})`;
        lastCompletedVipEl.textContent = `${historyEntry.vipName} (${historyEntry.vipRank || 'N/A'}) (${historyEntry.status || 'Confirmed'})`;
    } else if (state.previousRotationState?.currentDate) {
        const prevDateFromUndo = new Date(state.previousRotationState.currentDate + 'T00:00:00Z');
        if (!isNaN(prevDateFromUndo) && getISODateString(prevDateFromUndo) === lastDateStr) {
            lastCompletedDateEl.textContent = formatDate(prevDateFromUndo);
            lastCompletedConductorEl.textContent = "(Data from pre-history)";
            lastCompletedVipEl.textContent = "(Data from pre-history)";
        }
    }
}

function render() {
    renderMemberList();
    renderCurrentDay();
    renderSchedule();
    renderVipsWithZeroCount();
    renderStatistics();
    renderLastCompletedDay();
    undoAdvanceBtn.disabled = !state.previousRotationState;
    if (versionEl) versionEl.textContent = SCRIPT_VERSION;
}

function handleMvpAndVipSelectionChange() {
    let isMvpSelectedOrNotNeeded = true;
    if (mvpSelectionArea.style.display === 'block') {
        isMvpSelectedOrNotNeeded = mvpSelect.value !== "";
    }
    const isVipSelected = todaysVipSelect.value !== "";
    confirmVipAdvanceDayBtn.disabled = !(isMvpSelectedOrNotNeeded && isVipSelected);
}

copyZeroVipListBtn.addEventListener('click', () => {
    const listItems = vipsWithZeroCountListEl.getElementsByTagName('li');
    if (listItems.length === 0 || (listItems.length === 1 && (listItems[0].textContent.startsWith('All members have') || listItems[0].textContent.startsWith('Loading')))) {
        alert("No VIPs with count 0 to copy."); return;
    }
    let textToCopy = "VIP Queue (Count 0):\n";
    for (let i = 0; i < listItems.length; i++) { textToCopy += `- ${listItems[i].textContent}\n`; }
    navigator.clipboard.writeText(textToCopy)
        .then(() => alert("List of VIPs with count 0 copied to clipboard!"))
        .catch(err => { console.error('Failed to copy list: ', err); alert("Failed to copy list."); });
});

undoAdvanceBtn.addEventListener('click', async () => {
    console.log("Undo button clicked."); 
    console.log("Current state.previousRotationState BEFORE undo action:", JSON.parse(JSON.stringify(state.previousRotationState))); 

    if (!state.previousRotationState) {
        alert("No previous state available to undo.");
        console.log("Undo aborted: state.previousRotationState is null or undefined.");
        return;
    }
    if (confirm("Are you sure you want to undo the last day advancement? This will revert to the previous day's state.")) {
        console.log("Undo confirmed by user.");
        undoAdvanceBtn.disabled = true;
        try {
            if (typeof state.previousRotationState !== 'object' || state.previousRotationState === null) {
                console.error("Undo Error: Invalid undo data structure in state.previousRotationState.");
                throw new Error("Invalid undo data structure.");
            }
            console.log("Restoring state FROM previousRotationState:", JSON.parse(JSON.stringify(state.previousRotationState)));
            state.rotationState = JSON.parse(JSON.stringify(state.previousRotationState));
            console.log("State AFTER restoring state.rotationState:", JSON.parse(JSON.stringify(state.rotationState)));
            
            state.previousRotationState = null; // Clear after restore, only one step undo
            console.log("state.previousRotationState set to null.");
            
            console.log("Attempting to save restored state to Firestore...");
            await updateFirestoreState();
            console.log("Restored state saved to Firestore. Render should be triggered by onSnapshot.");
        } catch (error) {
            console.error("Undo error during processing:", error);
            alert("Error during undo operation: " + error.message + "\nThe state might be inconsistent.");
            undoAdvanceBtn.disabled = !state.previousRotationState; 
        }
    } else {
        console.log("Undo cancelled by user.");
    }
});

resetBtn.addEventListener('click', async () => {
    console.log("Reset button clicked.");
    if (confirm("!! WARNING !! This will reset ALL rotation data (current day, VIP counts, history) to the initial defaults for THIS version (v7). This cannot be undone! Are you absolutely sure?")) {
        console.log("First confirmation for reset OK.");
        if (confirm("SECOND WARNING: Confirm again to reset all data. Your current member list and all progress will be lost and replaced by the defaults for this version (v7).")) {
            console.log("Second confirmation for reset OK. Proceeding with reset.");
            resetBtn.disabled = true;
            
            state.members = initialMembersConfig.map(m => ({ ...m })); // IDs are already set in initialMembersConfig
            sortMembers(); 
            
            state.rotationState = {
                currentDate: NEW_VERSION_START_DATE,
                r4r5Index: 0,
                selectedMvps: {},
                vipCounts: getInitialVipCountsWithIds(state.members, initialVipCountsConfig),
                dailyHistory: {}
            };
            state.previousRotationState = null;

            console.log("State prepared for reset. Members:", JSON.parse(JSON.stringify(state.members)));
            console.log("State prepared for reset. VIP Counts:", JSON.parse(JSON.stringify(state.rotationState.vipCounts)));

            try {
                await updateFirestoreState();
                alert(`All data has been reset to defaults for v7. The rotation will start from ${formatDate(new Date(NEW_VERSION_START_DATE + 'T00:00:00Z'))}. The page will now refresh to apply changes.`);
                window.location.reload();
            } catch (error) {
                console.error("Reset error:", error);
                alert("Error resetting data. Please check the console. " + error.message);
                resetBtn.disabled = false;
            }
        } else {
            console.log("Second confirmation for reset CANCELLED.");
        }
    } else {
        console.log("First confirmation for reset CANCELLED.");
    }
});

stateDocRef.onSnapshot((doc) => {
    console.log("Firestore data received/updated for document:", stateDocRef.path);
    const localPrevStateForUndo = state.previousRotationState;
    if (doc.exists) {
        const data = doc.data();
        const loadedMembersFromDB = data.members || [];
        if (loadedMembersFromDB.length > 0) {
            state.members = loadedMembersFromDB.map(m => ({ ...m, id: m.id || generateConsistentIdFromName(m.name) }));
        } else {
            console.warn("No members array found in Firestore. Using initialMembersConfig.");
            state.members = initialMembersConfig.map(m => ({ ...m })); // IDs are already set
        }
        sortMembers();

        const loadedRotState = data.rotationState || {};
        state.rotationState = {
            currentDate: loadedRotState.currentDate || NEW_VERSION_START_DATE,
            r4r5Index: loadedRotState.r4r5Index ?? 0,
            selectedMvps: loadedRotState.selectedMvps || {},
            vipCounts: loadedRotState.vipCounts || getInitialVipCountsWithIds(state.members, initialVipCountsConfig),
            dailyHistory: loadedRotState.dailyHistory || {}
        };
        
        let needsSaveToFirebase = false;
        if (!loadedRotState.currentDate || isNaN(new Date(loadedRotState.currentDate + 'T00:00:00Z'))) {
            console.warn("Current date from Firebase is invalid or missing. Resetting to new version start date.");
            state.rotationState.currentDate = NEW_VERSION_START_DATE;
            needsSaveToFirebase = true;
        }

        // Ensure vipCounts object exists and all current members have an entry
        if (!state.rotationState.vipCounts) {
            console.warn("VIP counts object missing. Initializing.");
            state.rotationState.vipCounts = getInitialVipCountsWithIds(state.members, initialVipCountsConfig);
            needsSaveToFirebase = true;
        } else {
            let countsWereModified = false;
            state.members.forEach(member => {
                if (member.rank === 'Member' && state.rotationState.vipCounts[member.id] === undefined) {
                    state.rotationState.vipCounts[member.id] = 0; // Neue Member bekommen Count 0
                    countsWereModified = true;
                }
            });
            if (countsWereModified) needsSaveToFirebase = true;
        }
        
        const essentialFields = ['currentDate', 'r4r5Index', 'selectedMvps', 'vipCounts', 'dailyHistory'];
        essentialFields.forEach(key => {
            if (state.rotationState[key] === undefined) {
                console.warn(`Essential rotation state field '${key}' was missing. Initializing.`);
                if (key === 'vipCounts') state.rotationState[key] = getInitialVipCountsWithIds(state.members, initialVipCountsConfig);
                else if (key === 'currentDate') state.rotationState[key] = NEW_VERSION_START_DATE;
                else if (typeof state.rotationState[key] === 'number') state.rotationState[key] = 0;
                else state.rotationState[key] = {};
                needsSaveToFirebase = true;
            }
        });
        
        if (needsSaveToFirebase) {
            console.log("Attempting to save corrected/initialized state to Firebase due to missing/invalid fields during load.");
            updateFirestoreState().catch(err => console.error("Automatic state correction save during load FAIL:", err));
        }

    } else { // Document doesn't exist, first time run for this doc path
        console.log(`No existing Firebase document '${stateDocRef.path}' found. Initializing new version state.`);
        state.members = initialMembersConfig.map(m => ({ ...m })); // IDs from config
        sortMembers();
        state.rotationState = {
            currentDate: NEW_VERSION_START_DATE,
            r4r5Index: 0,
            selectedMvps: {},
            vipCounts: getInitialVipCountsWithIds(state.members, initialVipCountsConfig),
            dailyHistory: {}
        };
        console.log("Initial state for new document:", JSON.parse(JSON.stringify(state)));
        updateFirestoreState().catch(err => console.error("Initial setup save to Firebase FAIL:", err));
    }
    state.previousRotationState = localPrevStateForUndo;
    render();
    resetBtn.disabled = false;
}, (error) => {
    console.error("Firestore Listener FATAL ERROR:", error);
    alert(`FATAL DATABASE ERROR (${error.message}). App might not work. Check console, connection, config, rules.`);
    document.body.innerHTML = `<div style="padding:20px;text-align:center;color:red;"><h1>App Error</h1><p>DB Error: ${error.message}</p></div>`;
});

// Event Listeners
addMemberForm.addEventListener('submit', addMember);
mvpSelect.addEventListener('change', handleMvpAndVipSelectionChange);
todaysVipSelect.addEventListener('change', handleMvpAndVipSelectionChange);
confirmVipAdvanceDayBtn.addEventListener('click', handleConfirmVipAndAdvanceDay);
// undoAdvanceBtn und resetBtn Listener sind schon weiter oben im Code definiert.
