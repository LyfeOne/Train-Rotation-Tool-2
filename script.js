const SCRIPT_VERSION = "7.0"; // Simplified VIP Selection, Manual Advance, Zero VIP Count List
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
// NEUER DOKUMENTENNAME FÜR DIESE VERSION
const stateDocRef = db.collection("rotationState").doc("s749_state_v7");

// --- Constants and State ---
const MVP_TECH_DAY = 1; // Montag
const MVP_VS_DAY = 0;   // Sonntag
const RANKS = ["Member", "R4", "R5"];
const NEW_VERSION_START_DATE = "2025-06-24";

let state = {
    members: [], // Wird aus Firebase oder initialMembersConfig geladen
    rotationState: {
        currentDate: null, // Wird aus Firebase oder NEW_VERSION_START_DATE geladen
        r4r5Index: 0,
        // memberIndex entfällt für VIP-Rotation
        selectedMvps: {},
        vipCounts: {}, // Wird aus Firebase oder initialVipCountsConfig geladen
        // mvpCounts entfällt
        // alternativeVips entfällt
        // completedSubstituteVipsThisRound entfällt (da keine automatische VIP-Rotation mehr)
        dailyHistory: {}
    },
    previousRotationState: null,
    editingMemberId: null,
    editingVipCountMemberId: null
};

// --- Initial Data for THIS Version (v7) ---
// Wird für Reset oder allerersten Start mit s749_state_v7 verwendet.
const initialMembersConfig = [
    { id: "ladylaik", name: "LadyLaik", rank: "R5"}, { id: "caretta", name: "Caretta", rank: "R4"},
    { id: "cornflakes", name: "CornFlakes", rank: "R4"}, { id: "davinnie", name: "DaVinnie", rank: "R4"},
    { id: "enyaisrave", name: "Enyaisrave", rank: "R4"}, { id: "johcar", name: "Johcar", rank: "R4"},
    { id: "lyfe", name: "Lyfe", rank: "R4"}, { id: "motherfrogger", name: "Motherfrogger", rank: "R4"},
    { id: "munky", name: "Munky", rank: "R4"}, { id: "pabs64", name: "Pabs64", rank: "R4"},
    { id: "supersebb", name: "Supersebb", rank: "R4"},
    { id: "aminos77", name: "Aminos77", rank: "Member"}, { id: "b1wizz", name: "B1wizz", rank: "Member"},
    { id: "bekim1", name: "Bekim1", rank: "Member"}, { id: "biloute62", name: "Biloute 62", rank: "Member"},
    { id: "blackpush", name: "BlackPush", rank: "Member"}, { id: "blackwizardua", name: "BlackWizardUA", rank: "Member"},
    { id: "blacky12345", name: "blacky12345", rank: "Member"}, { id: "blade", name: "B L A D É", rank: "Member"},
    { id: "boredofthisshtgame", name: "BOREDOFTHISSHTGAME", rank: "Member"}, { id: "charly232", name: "Charly232", rank: "Member"},
    { id: "chris", name: "Chris", rank: "Member"}, { id: "cocsi29400", name: "Cocsi29400", rank: "Member"},
    { id: "commanderblad", name: "Commander BLad", rank: "Member"}, { id: "dario217", name: "Dario217", rank: "Member"},
    { id: "darkknight", name: "Darkknight", rank: "Member"}, { id: "depechefann", name: "depechefann", rank: "Member"},
    { id: "dfyra", name: "Dfyra", rank: "Member"}, { id: "dirtyfrenk", name: "diRty freNk", rank: "Member"},
    { id: "egius", name: "Egius", rank: "Member"}, { id: "ever4", name: "Ever4", rank: "Member"},
    { id: "flac", name: "F L A C", rank: "Member"}, { id: "faluche", name: "Faluche", rank: "Member"},
    { id: "fire", name: "Fire", rank: "Member"}, { id: "firexice", name: "FireXice (Bibot)", rank: "Member"}, // Name angepasst
    { id: "foggis", name: "Foggis", rank: "Member"}, { id: "gekkegerrittttt", name: "Gekkegerrittttt", rank: "Member"},
    { id: "ghost", name: "GhósT", rank: "Member"}, { id: "ghthegreat", name: "Ghthegreat", rank: "Member"},
    { id: "goddesninopatra", name: "Goddes Ninopatra", rank: "Member"}, { id: "gorkiules", name: "Gorkiules", rank: "Member"},
    { id: "gunnovic", name: "Gunnovic", rank: "Member"}, { id: "hera217", name: "Héra217", rank: "Member"},
    { id: "ilyesb", name: "ILYES B", rank: "Member"}, { id: "ironhammer", name: "IRONHAMMER", rank: "Member"},
    { id: "jacktoo", name: "JackToo", rank: "Member"}, { id: "jaista", name: "Jaista", rank: "Member"},
    { id: "jarako", name: "jarako", rank: "Member"}, { id: "jassadu", name: "jassådu", rank: "Member"},
    { id: "joneboi", name: "joneboi", rank: "Member"}, { id: "jotersan", name: "Jotersan", rank: "Member"},
    { id: "juantxo79", name: "Juantxo79", rank: "Member"}, { id: "justmelo", name: "Just Melo", rank: "Member"},
    { id: "kezual", name: "KezuaL", rank: "Member"}, { id: "kfcpover", name: "KFCPov3r", rank: "Member"},
    { id: "kingstridez", name: "KingStridez", rank: "Member"}, { id: "kpshafty", name: "KPShafty", rank: "Member"},
    { id: "kyuchie", name: "Kyuchie", rank: "Member"}, { id: "laeta", name: "Laeta", rank: "Member"},
    { id: "leka98", name: "Leka98", rank: "Member"}, { id: "looselemon", name: "LooseLemon", rank: "Member"},
    { id: "lutonian", name: "Lutonian", rank: "Member"}, { id: "malamimi", name: "Mala Mimi", rank: "Member"},
    { id: "megalomanie", name: "Megalomanie", rank: "Member"}, { id: "molkok", name: "Molkok", rank: "Member"},
    { id: "mran", name: "MRan", rank: "Member"}, { id: "nymblev", name: "NymbleV", rank: "Member"}, // NymbleV von R4 zu Member in deiner Liste? Ich nehme Member an.
    { id: "ohoimarshall", name: "ohoimarshall", rank: "Member"}, { id: "olabaf", name: "olabaf", rank: "Member"},
    { id: "oliviax", name: "Oliviax", rank: "Member"}, { id: "onlyperseus", name: "OnlyPerseus", rank: "Member"},
    { id: "peckap", name: "Peckap", rank: "Member"}, { id: "prantuan", name: "Prantuan", rank: "Member"},
    { id: "pyretta", name: "Pyretta", rank: "Member"}, { id: "rambo0", name: "RaMbo0", rank: "Member"},
    { id: "raph911", name: "Raph911", rank: "Member"}, { id: "rikkyyyyy", name: "Rikkyyyyy", rank: "Member"},
    { id: "ruiap", name: "RuiAP", rank: "Member"}, { id: "samurai", name: "S A M U R A i", rank: "Member"},
    { id: "sarajevomfrcs", name: "Sarajevo Mfrcs", rank: "Member"}, { id: "smugwell", name: "Smugwell", rank: "Member"},
    { id: "str1ke", name: "Str1ke", rank: "Member"}, { id: "swat95s", name: "Swat95s", rank: "Member"},
    { id: "swisskilla", name: "Swisskilla", rank: "Member"}, { id: "temd", name: "Temd", rank: "Member"},
    { id: "thefloh", name: "TheFloh", rank: "Member"}, { id: "thefoxxx", name: "theFoxXx", rank: "Member"},
    { id: "thirteensquid", name: "Thirteen Squid", rank: "Member"}, { id: "tigershana", name: "TigerShana", rank: "Member"},
    { id: "vechniy", name: "Vechniy", rank: "Member"}, { id: "villanueva1", name: "Villanueva 1", rank: "Member"},
    { id: "xic", name: "XiC", rank: "Member"}, { id: "xyz111111", name: "Xyz111111", rank: "Member"},
    { id: "zoorglub", name: "Zoorglub", rank: "Member"}, { id: "aleks1980", name: "АЛЕКС1980", rank: "Member"},
    { id: "zheka", name: "ЖЭКА", rank: "Member"}
].map(m => { // Ensure unique IDs and lowercase for matching counts
    const generatedId = m.id || m.name.toLowerCase().replace(/[^a-z0-9]/gi, '') || generateId();
    return { ...m, id: generatedId };
});

const initialVipCountsConfig = {
    "ladylaik": 0, "caretta": 0, "cornflakes": 0, "davinnie": 0, "enyaisrave": 0, "johcar": 0, "lyfe": 0, 
    "motherfrogger": 0, "munky": 0, "pabs64": 0, "supersebb": 0,
    "aminos77": 1, "b1wizz": 1, "bekim1": 1, "biloute62": 1, "blackpush": 1, "blackwizardua": 1,
    "blacky12345": 2, "blade": 1, "boredofthisshtgame": 1, "charly232": 1, "chris": 1, "cocsi29400": 1,
    "commanderblad": 2, "dario217": 1, "darkknight": 1, "depechefann": 1, "dfyra": 1, "dirtyfrenk": 1,
    "egius": 1, "ever4": 1, "flac": 1, "faluche": 1, "fire": 2, "firexice": 0, "foggis": 2,
    "gekkegerrittttt": 1, "ghost": 1, "ghthegreat": 1, "goddesninopatra": 0, "gorkiules": 1, "gunnovic": 0,
    "hera217": 1, "ilyesb": 0, "ironhammer": 1, "jacktoo": 1, "jaista": 1, "jarako": 1, "jassadu": 0,
    "joneboi": 1, "jotersan": 1, "juantxo79": 0, "justmelo": 1, "kezual": 1, "kfcpover": 0, "kingstridez": 2,
    "kpshafty": 1, "kyuchie": 0, "laeta": 1, "leka98": 1, "looselemon": 0, "lutonian": 1, "malamimi": 0,
    "megalomanie": 0, "molkok": 0, "mran": 1, "nymblev": 0, "ohoimarshall": 0, "olabaf": 0, "oliviax": 0,
    "onlyperseus": 0, "peckap": 0, "prantuan": 1, "pyretta": 0, "rambo0": 0, "raph911": 1, "rikkyyyyy": 1,
    "ruiap": 0, "samurai": 0, "sarajevomfrcs": 0, "smugwell": 1, "str1ke": 1, "swat95s": 0, "swisskilla": 0,
    "temd": 0, "thefloh": 0, "thefoxxx": 0, "thirteensquid": 1, "tigershana": 0, "vechniy": 0,
    "villanueva1": 0, "xic": 0, "xyz111111": 0, "zoorglub": 1, "aleks1980": 0, "zheka": 0
};
// Helper to map initial counts to member IDs
function getInitialVipCountsWithIds(members, countsConfig) {
    const vipCounts = {};
    members.forEach(member => {
        const normalizedName = member.name.toLowerCase().replace(/[^a-z0-9]/gi, ''); // Simple normalization
        let foundCount = 0;
        // Try to find a match in countsConfig, allowing for some flexibility
        for (const configName in countsConfig) {
            if (normalizedName.includes(configName.toLowerCase().replace(/[^a-z0-9]/gi, '')) || 
                configName.toLowerCase().replace(/[^a-z0-9]/gi, '').includes(normalizedName)) {
                foundCount = countsConfig[configName];
                break;
            }
        }
         // Fallback if no direct match, check if member.name is a key
        if (foundCount === 0 && countsConfig[member.name] !== undefined) {
            foundCount = countsConfig[member.name];
        }
        vipCounts[member.id] = foundCount;

    });
    // Ensure all members from initialMembersConfig have an entry, default to 0 if not in countsConfig
    initialMembersConfig.forEach(m => {
        if (vipCounts[m.id] === undefined) {
            vipCounts[m.id] = 0; // Default to 0 if somehow missed
        }
    });
    return vipCounts;
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
// const currentVipEl = document.getElementById('current-vip'); // Removed, VIP selected manually
const scheduleDisplayListEl = document.getElementById('schedule-display').querySelector('ul');
const undoAdvanceBtn = document.getElementById('undo-advance');
const mvpSelectionArea = document.getElementById('mvp-selection-area');
const mvpSelect = document.getElementById('mvp-select');
const resetBtn = document.getElementById('reset-data');
// const mvpStatsListEl = document.getElementById('mvp-stats').querySelector('ul'); // Removed
const vipStatsListEl = document.getElementById('vip-stats').querySelector('ul');
const todaysVipSelect = document.getElementById('select-todays-vip'); // New VIP selection dropdown
const confirmVipAdvanceDayBtn = document.getElementById('confirm-vip-advance-day'); // New button
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

    if (dayOfWeek === MVP_TECH_DAY) { // Montag
        const mvpKey = `${targetDateStr}_Mon`;
        const mvpId = selectedMvpsMap[mvpKey];
        conductor = mvpId ? getMemberById(mvpId) : { id: 'MVP_MON_SELECT', name: 'Tech MVP Needed', rank: 'MVP' };
    } else if (dayOfWeek === MVP_VS_DAY) { // Sonntag
        const mvpKey = `${targetDateStr}_Sun`;
        const mvpId = selectedMvpsMap[mvpKey];
        conductor = mvpId ? getMemberById(mvpId) : { id: 'MVP_SUN_SELECT', name: 'VS MVP Needed', rank: 'MVP' };
    } else { // Reguläre Tage
        conductor = r4r5Members.length > 0 ? r4r5Members[currentR4R5Index % r4r5Members.length] : { id: 'NO_R4R5', name: 'No R4/R5', rank: 'Sys' };
    }
    return conductor || { id: 'ERR_COND_FALLBACK', name: 'Err Conductor Fallback', rank: 'Sys' };
}

function recordDailyHistory(dateStr, conductorId, vipId, status = 'Confirmed') { // Status optional
    if (!dateStr || !conductorId || !vipId) {
        console.warn("recordDailyHistory: Missing data for history entry", { dateStr, conductorId, vipId, status });
        return;
    }
    const conductor = getMemberById(conductorId);
    const vip = getMemberById(vipId);

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
}

async function handleConfirmVipAndAdvanceDay() {
    if (!state.rotationState?.currentDate) {
        alert("Rotation state is not loaded.");
        return;
    }

    const selectedVipId = todaysVipSelect.value;
    if (!selectedVipId) {
        alert("Please select Today's VIP from the dropdown.");
        todaysVipSelect.focus();
        return;
    }

    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');
    const dayOfWeek = getDayOfWeek(currentDate);
    let finalConductorId = null;

    // MVP-Logik für Conductor
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
                return;
            }
            finalConductorId = selectedMvpForTodayId;
            state.rotationState.selectedMvps[mvpKey] = selectedMvpForTodayId; // MVP Auswahl speichern
            // MVP Count für den MVP Conductor wird hier nicht mehr separat gezählt
        }
    } else { // Regulärer Conductor
        const r4r5Members = getMembersByRank('R4/R5');
        if (r4r5Members.length > 0) {
            finalConductorId = r4r5Members[state.rotationState.r4r5Index % r4r5Members.length].id;
        } else {
            finalConductorId = 'NO_R4R5';
        }
    }

    if (!finalConductorId || finalConductorId.startsWith('NO_')) {
        alert("Conductor for today could not be determined. Cannot advance.");
        return;
    }
    
    confirmVipAdvanceDayBtn.disabled = true;
    undoAdvanceBtn.disabled = true;

    // VIP Count für den ausgewählten VIP erhöhen
    if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
    state.rotationState.vipCounts[selectedVipId] = (state.rotationState.vipCounts[selectedVipId] || 0) + 1;

    // Historie schreiben
    recordDailyHistory(currentDateStr, finalConductorId, selectedVipId, 'Confirmed');

    // Nächsten Tag vorbereiten
    let nextR4R5Index = state.rotationState.r4r5Index ?? 0;
    if (dayOfWeek >= 2 && dayOfWeek <= 6) { // Di-Sa (Nicht-MVP-Tage)
        nextR4R5Index = (nextR4R5Index + 1);
    }
    const nextDate = addDays(currentDate, 1);
    const nextDateStr = getISODateString(nextDate);

    // State für Undo sichern
    try {
        state.previousRotationState = JSON.parse(JSON.stringify(state.rotationState));
    } catch (e) {
        console.error("Error creating previousRotationState for advance:", e);
        state.previousRotationState = null;
    }

    // State aktualisieren
    state.rotationState.currentDate = nextDateStr;
    state.rotationState.r4r5Index = nextR4R5Index;
    // memberIndex, alternativeVips, completedSubstituteVipsThisRound sind nicht mehr relevant für Hauptrotation

    try {
        await updateFirestoreState();
        // render() wird durch onSnapshot aufgerufen
    } catch (error) {
        console.error("Failed to save state after advancing day:", error);
        alert("Error saving data. The day might not have advanced correctly.");
        // Buttons im Fehlerfall wiederherstellen
        renderCurrentDay(); // Um Button-Status ggf. zu korrigieren
    }
}


function updateFirestoreState() {
    const stateToSave = JSON.parse(JSON.stringify({
        members: state.members || [],
        rotationState: {
            currentDate: state.rotationState.currentDate,
            r4r5Index: state.rotationState.r4r5Index ?? 0,
            // memberIndex nicht mehr speichern (da VIP manuell)
            selectedMvps: state.rotationState.selectedMvps || {},
            vipCounts: state.rotationState.vipCounts || {},
            // mvpCounts nicht mehr speichern
            dailyHistory: state.rotationState.dailyHistory || {}
            // alternativeVips, completedSubstituteVipsThisRound nicht mehr speichern
        }
    }));
    delete stateToSave.editingMemberId;
    delete stateToSave.editingVipCountMemberId;

    return stateDocRef.set(stateToSave)
        .then(() => { /* console.log("Firestore state updated successfully."); */ })
        .catch((e) => { console.error("Firestore write FAIL:", e); alert(`Save Error: ${e.message}`); throw e; });
}

// --- Member Management ---
// addMember, removeMember, handleRankChange, saveNewName werden vereinfacht,
// da die komplexe memberIndex-Anpassung für VIPs entfällt.
// Sie müssen nur noch die state.members Liste pflegen und sortMembers() aufrufen.

function addMember(event) {
    event.preventDefault();
    const name = newMemberNameInput.value.trim();
    const rank = newMemberRankSelect.value;
    if (!name || !rank) {
        alert("Name and Rank are required to add a member.");
        return;
    }
    if (!Array.isArray(state.members)) state.members = [];
    if (state.members.some(m => m?.name.toLowerCase() === name.toLowerCase())) {
        alert(`Member with name "${name}" already exists.`);
        return;
    }
    const newMember = { id: generateId(), name: name, rank: rank };
    state.members.push(newMember);
    sortMembers();

    // VIP Count für neues Mitglied initialisieren (falls es ein Member ist)
    if (rank === 'Member') {
        if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
        state.rotationState.vipCounts[newMember.id] = 0; // Neue Member starten mit 0 VIPs
    }

    updateFirestoreState().then(() => {
        render(); // Umfassendes Rendern, um alle Listen (inkl. VIP 0 Liste) zu aktualisieren
        newMemberNameInput.value = '';
        newMemberRankSelect.value = 'Member';
    });
}

function removeMember(id) {
    const member = getMemberById(id);
    if (!member) return;
    if (confirm(`Are you sure you want to remove ${member.name}? This action cannot be undone.`)) {
        state.members = state.members.filter(mb => mb?.id !== id);
        // VIP Count des entfernten Mitglieds auch löschen
        if (state.rotationState.vipCounts && state.rotationState.vipCounts[id] !== undefined) {
            delete state.rotationState.vipCounts[id];
        }
        // Aus selectedMvps entfernen, falls es dort als MVP für einen Tag gespeichert war
        if (state.rotationState.selectedMvps) {
            for (const key in state.rotationState.selectedMvps) {
                if (state.rotationState.selectedMvps[key] === id) {
                    delete state.rotationState.selectedMvps[key];
                }
            }
        }
        // sortMembers() ist nicht unbedingt nötig nach dem Filtern, aber schadet nicht für Konsistenz
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
        // Wenn ein Mitglied von/zu Member wechselt, VIP Count ggf. initialisieren/beibehalten
        if (newRank === 'Member' && (state.rotationState.vipCounts?.[memberId] === undefined)) {
            if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
            state.rotationState.vipCounts[memberId] = 0; // Neuer Member startet mit 0
        } else if (oldRank === 'Member' && newRank !== 'Member') {
            // VIP Count könnte beibehalten oder gelöscht werden. Wir behalten ihn für historische Zwecke.
            // Aber es wird nicht mehr in der "VIPs mit Count 0" Liste erscheinen.
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
    if (!newName) {
        alert("Name cannot be empty."); newNameInput.focus(); return;
    }
    const originalMember = getMemberById(memberId);
    if (!originalMember) return;

    if (state.members.some(m => m.id !== memberId && m.name.toLowerCase() === newName.toLowerCase())) {
        alert(`Another member with the name "${newName}" already exists.`); newNameInput.focus(); return;
    }
    originalMember.name = newName;
    state.editingMemberId = null;
    sortMembers(); // Nur sortieren, keine Index-Anpassung mehr nötig für VIP-Rotation
    try {
        await updateFirestoreState();
        render();
    } catch (error) {
        alert("Error saving new name: " + error.message);
    }
}

// --- Rendering Functions ---
function renderMemberList() {
    memberListEl.innerHTML = '';
    if (!Array.isArray(state.members)) { memberCountEl.textContent = '0'; return; }
    memberCountEl.textContent = state.members.length;
    sortMembers();
    if (state.members.length === 0) { memberListEl.innerHTML = '<li>No members.</li>'; return; }

    state.members.forEach(member => {
        if (!member?.id || !member.name || !member.rank) return;
        const li = document.createElement('li');
        li.dataset.memberId = member.id;
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('member-info');
        if (state.editingMemberId === member.id) {
            const nameInput = document.createElement('input');
            nameInput.type = 'text'; nameInput.value = member.name; nameInput.classList.add('inline-edit-name');
            infoDiv.appendChild(nameInput);
            const saveNameBtn = document.createElement('button');
            saveNameBtn.textContent = 'Save'; saveNameBtn.classList.add('btn-primary', 'btn-small');
            saveNameBtn.onclick = () => saveNewName(member.id, nameInput);
            infoDiv.appendChild(saveNameBtn);
            const cancelNameBtn = document.createElement('button');
            cancelNameBtn.textContent = 'Cancel'; cancelNameBtn.classList.add('btn-secondary', 'btn-small');
            cancelNameBtn.onclick = () => toggleRenameMode(member.id);
            infoDiv.appendChild(cancelNameBtn);
        } else {
            const nameSpan = document.createElement('span');
            nameSpan.textContent = member.name; nameSpan.classList.add('member-name-display');
            infoDiv.appendChild(nameSpan);
            const rankSelect = document.createElement('select');
            rankSelect.classList.add('rank-select-inline'); rankSelect.dataset.memberId = member.id;
            RANKS.forEach(rankValue => {
                const option = document.createElement('option');
                option.value = rankValue; option.textContent = rankValue;
                if (member.rank === rankValue) option.selected = true;
                rankSelect.appendChild(option);
            });
            rankSelect.addEventListener('change', handleRankChange);
            infoDiv.appendChild(rankSelect);
        }
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('member-actions');
        if (state.editingMemberId !== member.id) {
            const renameButton = document.createElement('button');
            renameButton.textContent = 'Rename'; renameButton.classList.add('btn-secondary', 'btn-small');
            renameButton.onclick = () => toggleRenameMode(member.id);
            actionsDiv.appendChild(renameButton);
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove'; removeButton.classList.add('btn-remove', 'btn-small');
            removeButton.onclick = () => removeMember(member.id);
            actionsDiv.appendChild(removeButton);
        }
        li.appendChild(infoDiv); li.appendChild(actionsDiv);
        memberListEl.appendChild(li);
    });
}

function renderCurrentDay() {
    if (!state.rotationState?.currentDate) { currentDateEl.textContent = "Loading state..."; return; }
    const currentDateStr = state.rotationState.currentDate;
    const currentDate = new Date(currentDateStr + 'T00:00:00Z');

    if (isNaN(currentDate)) {
        currentDateEl.textContent = "Invalid Date!"; currentDayOfWeekEl.textContent = "---";
        currentConductorEl.textContent = "---"; confirmVipAdvanceDayBtn.disabled = true; return;
    }

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
            populateMvpSelect(); // MVP Dropdown füllen
            mvpSelectionArea.style.display = 'block';
            mvpSelect.value = "";
            isMvpSelectionNeededToday = true;
        }
    } else {
        currentConductorEl.textContent = `${calculatedConductor.name} (${calculatedConductor.rank})`;
        mvpSelectionArea.style.display = 'none';
    }
    
    populateTodaysVipSelect(); // VIP Dropdown immer füllen
    todaysVipSelect.value = ""; // Auswahl zurücksetzen

    // Button-Logik: Aktivieren, wenn MVP (falls nötig) UND VIP ausgewählt wurden
    const isVipSelected = todaysVipSelect.value !== "";
    confirmVipAdvanceDayBtn.disabled = isMvpSelectionNeededToday || !isVipSelected; // Startet disabled bis VIP gewählt

    undoAdvanceBtn.disabled = !state.previousRotationState;
}

function populateMvpSelect() { // Bleibt wie bisher: Alle Member als potenzielle MVPs
    mvpSelect.innerHTML = '<option value="">-- Select MVP --</option>';
    if (!Array.isArray(state.members)) return;
    const memberRankMembers = getMembersByRank('Member'); // Nur Member für MVP Auswahl
    memberRankMembers.forEach(m => {
        if (!m?.id) return;
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = `${m.name} (Member)`;
        mvpSelect.appendChild(option);
    });
}

function populateTodaysVipSelect() {
    todaysVipSelect.innerHTML = '<option value="">-- Select Today\'s VIP --</option>';
    const members = getMembersByRank('Member'); // Alle Member zur Auswahl
    if (!members || members.length === 0) {
        const option = document.createElement('option');
        option.textContent = "No members available";
        option.disabled = true;
        todaysVipSelect.appendChild(option);
        return;
    }
    members.forEach(member => {
        if (!member?.id) return;
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (VIPs: ${state.rotationState.vipCounts?.[member.id] || 0})`;
        todaysVipSelect.appendChild(option);
    });
}


function renderSchedule() { // Zeigt nur Conductor Schedule
    scheduleDisplayListEl.innerHTML = '';
    if (!state.rotationState?.currentDate || !state.members) {
        scheduleDisplayListEl.innerHTML = '<li>Schedule not ready...</li>'; return;
    }
    const history = state.rotationState.dailyHistory || {};
    const todayForSchedule = new Date(state.rotationState.currentDate + 'T00:00:00Z');
    if (isNaN(todayForSchedule)) { scheduleDisplayListEl.innerHTML = '<li>Error: Invalid date.</li>'; return; }

    const daysToShowPast = 3;
    const futureDaysNeeded = 14;

    for (let i = daysToShowPast; i >= 1; i--) { // Vergangene Tage
        const pastDate = addDays(todayForSchedule, -i);
        const pastDateStr = getISODateString(pastDate);
        const historyEntry = history[pastDateStr];
        const li = document.createElement('li'); li.classList.add('past-day');
        const dateSpan = document.createElement('span'); dateSpan.classList.add('schedule-date'); dateSpan.textContent = formatDate(pastDate);
        const conductorSpan = document.createElement('span'); conductorSpan.classList.add('schedule-conductor');
        if (historyEntry) {
            conductorSpan.textContent = `C: ${historyEntry.conductorName} (${historyEntry.conductorRank || 'N/A'})`;
        } else {
            conductorSpan.textContent = `C: (No history)`;
        }
        li.appendChild(dateSpan); li.appendChild(conductorSpan);
        scheduleDisplayListEl.appendChild(li);
    }

    let simDate = new Date(todayForSchedule);
    let simR4R5Idx = state.rotationState.r4r5Index ?? 0;
    let simMvps = JSON.parse(JSON.stringify(state.rotationState.selectedMvps || {}));

    for (let i = 0; i < futureDaysNeeded; i++) { // Aktueller und zukünftige Tage
        if (isNaN(simDate)) { break; }
        const dateStr = getISODateString(simDate);
        const dayOfWeek = getDayOfWeek(simDate);
        const isCurrentDay = (i === 0);
        const conductor = calculateDailyConductor(dateStr, simR4R5Idx, simMvps);

        const li = document.createElement('li');
        if (isCurrentDay) li.classList.add('current-day');
        const dateSpan = document.createElement('span'); dateSpan.classList.add('schedule-date'); dateSpan.textContent = formatDate(simDate);
        const conductorSpan = document.createElement('span'); conductorSpan.classList.add('schedule-conductor');
        const conductorName = conductor.name || "?";
        const conductorRank = conductor.rank || "N/A";

        if (conductor.id === 'MVP_MON_SELECT' || conductor.id === 'MVP_SUN_SELECT') {
            const mvpKeyToCheck = dayOfWeek === MVP_TECH_DAY ? `${dateStr}_Mon` : `${dateStr}_Sun`;
            const simMvpId = simMvps[mvpKeyToCheck]; // Prüfe, ob für diesen simulierten Tag schon ein MVP im State wäre
            if (simMvpId) { // MVP ist bereits für diesen Tag im (simulierten) State gesetzt
                const mvpMember = getMemberById(simMvpId);
                conductorSpan.textContent = `C: ${mvpMember ? mvpMember.name : 'Stored MVP'} (${mvpMember ? mvpMember.rank : 'MVP'})`;
            } else { // MVP muss noch ausgewählt werden
                conductorSpan.innerHTML = `<span class="mvp-selection-required">${conductorName}</span>`;
            }
        } else {
            conductorSpan.textContent = `C: ${conductorName} (${conductorRank})`;
        }
        li.appendChild(dateSpan); li.appendChild(conductorSpan);
        scheduleDisplayListEl.appendChild(li);

        if (dayOfWeek >= 2 && dayOfWeek <= 6) { simR4R5Idx++; } // Di-Sa
        simDate = addDays(simDate, 1);
    }
}

function renderVipsWithZeroCount() {
    vipsWithZeroCountListEl.innerHTML = '';
    if (!state.members || !state.rotationState.vipCounts) {
        vipsWithZeroCountListEl.innerHTML = '<li>Loading data...</li>';
        return;
    }
    const members = getMembersByRank('Member');
    const zeroCountVips = members.filter(m => (state.rotationState.vipCounts[m.id] || 0) === 0);
    
    sortMembersByName(zeroCountVips); // Alphabetisch sortieren

    if (zeroCountVips.length === 0) {
        vipsWithZeroCountListEl.innerHTML = '<li>All members have at least 1 VIP count.</li>';
        return;
    }
    zeroCountVips.forEach(member => {
        const li = document.createElement('li');
        li.textContent = member.name;
        vipsWithZeroCountListEl.appendChild(li);
    });
}
function sortMembersByName(memberArray) { // Hilfsfunktion zum Sortieren nach Name
    if (!Array.isArray(memberArray)) return;
    memberArray.sort((a,b) => (a.name || "").localeCompare(b.name || ""));
}

function toggleEditVipCountMode(memberId) {
    state.editingVipCountMemberId = state.editingVipCountMemberId === memberId ? null : memberId;
    renderStatistics(); // Ruft renderStatistics erneut auf, um das Edit-Feld anzuzeigen/auszublenden
}

async function saveVipCount(memberId, newCountInput) { // Manuelle Anpassung in Statistik
    const newCountString = newCountInput.value;
    const newCount = parseInt(newCountString, 10);
    if (isNaN(newCount) || newCount < 0) {
        alert("VIP count must be a non-negative number."); newCountInput.focus(); return;
    }
    if (!state.rotationState.vipCounts) state.rotationState.vipCounts = {};
    state.rotationState.vipCounts[memberId] = newCount;
    state.editingVipCountMemberId = null;
    try {
        await updateFirestoreState();
        render(); // Umfassendes Rendern, um VIP 0 Liste und Statistiken zu aktualisieren
    } catch (error) {
        alert("Error saving VIP count: " + error.message);
    }
}

function renderStatistics() { // Zeigt nur noch VIP-Statistiken
    vipStatsListEl.innerHTML = '';
    if (!state.members?.length) {
        vipStatsListEl.innerHTML = '<li>No members to display stats for.</li>'; return;
    }
    const vipCounts = state.rotationState.vipCounts || {};
    // Nur Mitglieder vom Rang "Member" in der VIP-Statistik anzeigen
    const memberRankMembers = getMembersByRank('Member');
    sortMembersByName(memberRankMembers); // Alphabetisch sortieren

    if (memberRankMembers.length === 0) {
        vipStatsListEl.innerHTML = '<li>No "Member" rank members in the alliance.</li>';
        return;
    }

    let hasVipStats = false;
    memberRankMembers.forEach(member => {
        if (!member?.id || !member.name) return;
        const currentVipCount = vipCounts[member.id] || 0;
        if (currentVipCount > 0) hasVipStats = true; // Zählt auch, wenn Count 0 ist, um alle anzuzeigen

        const li = document.createElement('li');
        li.dataset.memberId = member.id;
        const nameSpan = document.createElement('span');
        nameSpan.textContent = member.name; nameSpan.classList.add('stats-name');
        li.appendChild(nameSpan);
        const controlsDiv = document.createElement('div');
        controlsDiv.classList.add('stats-controls');
        if (state.editingVipCountMemberId === member.id) {
            const countInput = document.createElement('input');
            countInput.type = 'number'; countInput.value = currentVipCount; countInput.min = "0";
            countInput.classList.add('inline-edit-count');
            controlsDiv.appendChild(countInput);
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Save'; saveBtn.classList.add('btn-primary', 'btn-small');
            saveBtn.onclick = () => saveVipCount(member.id, countInput);
            controlsDiv.appendChild(saveBtn);
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel'; cancelBtn.classList.add('btn-secondary', 'btn-small');
            cancelBtn.onclick = () => toggleEditVipCountMode(member.id);
            controlsDiv.appendChild(cancelBtn);
        } else {
            const countSpan = document.createElement('span');
            countSpan.classList.add('stats-count'); countSpan.textContent = currentVipCount;
            controlsDiv.appendChild(countSpan);
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '✎'; editBtn.title = "Edit VIP Count";
            editBtn.classList.add('btn-secondary', 'btn-small', 'btn-edit-stat');
            editBtn.onclick = () => toggleEditVipCountMode(member.id);
            controlsDiv.appendChild(editBtn);
        }
        li.appendChild(controlsDiv);
        vipStatsListEl.appendChild(li);
    });

    if (!hasVipStats && memberRankMembers.length > 0) { // Besser: Prüfen ob überhaupt Einträge generiert wurden
         if (vipStatsListEl.children.length === 0) vipStatsListEl.innerHTML = '<li>No VIPs have been assigned yet or all have 0.</li>';
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
    renderCurrentDay(); // Füllt auch VIP Dropdown und setzt Button-Status
    renderSchedule();
    renderVipsWithZeroCount();
    renderStatistics();
    renderLastCompletedDay();
    undoAdvanceBtn.disabled = !state.previousRotationState;
    if (versionEl) versionEl.textContent = SCRIPT_VERSION;
}

// --- Event Handlers ---
function handleMvpAndVipSelectionChange() { // Kombinierter Handler
    let isMvpSelectedOrNotNeeded = true;
    if (mvpSelectionArea.style.display === 'block') { // Nur prüfen, wenn MVP-Auswahl sichtbar ist
        isMvpSelectedOrNotNeeded = mvpSelect.value !== "";
    }
    const isVipSelected = todaysVipSelect.value !== "";
    confirmVipAdvanceDayBtn.disabled = !(isMvpSelectedOrNotNeeded && isVipSelected);
}

copyZeroVipListBtn.addEventListener('click', () => {
    const listItems = vipsWithZeroCountListEl.getElementsByTagName('li');
    if (listItems.length === 0 || 
        (listItems.length === 1 && listItems[0].textContent.startsWith('All members have') || listItems[0].textContent.startsWith('Loading'))) {
        alert("No VIPs with count 0 to copy.");
        return;
    }
    let textToCopy = "VIP Queue (Count 0):\n";
    for (let i = 0; i < listItems.length; i++) {
        textToCopy += `- ${listItems[i].textContent}\n`;
    }
    navigator.clipboard.writeText(textToCopy)
        .then(() => alert("List of VIPs with count 0 copied to clipboard!"))
        .catch(err => {
            console.error('Failed to copy list: ', err);
            alert("Failed to copy list. Please try again or copy manually.");
        });
});


// --- Initialization and Realtime Updates ---
stateDocRef.onSnapshot((doc) => {
    console.log("Firestore data received/updated for document:", stateDocRef.path);
    const localPrevStateForUndo = state.previousRotationState;

    if (doc.exists) {
        const data = doc.data();
        state.members = (data.members || initialMembersConfig).map(m => ({ ...m, id: m.id || generateId() }));
        sortMembers(); // Sicherstellen, dass Memberliste sofort sortiert ist

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
        if (!loadedRotState.vipCounts) { // Wenn vipCounts nicht im FB-Dokument sind, initialisiere sie.
            console.warn("VIP counts not found in Firebase. Initializing with config.");
            state.rotationState.vipCounts = getInitialVipCountsWithIds(state.members, initialVipCountsConfig);
            needsSaveToFirebase = true;
        } else { // Stelle sicher, dass alle aktuellen Member einen Eintrag in vipCounts haben
            let countsUpdated = false;
            state.members.forEach(member => {
                if (member.rank === 'Member' && state.rotationState.vipCounts[member.id] === undefined) {
                    state.rotationState.vipCounts[member.id] = 0; // Neue Member default 0
                    countsUpdated = true;
                }
            });
            if(countsUpdated) needsSaveToFirebase = true;
        }


        const essentialFields = ['currentDate', 'r4r5Index', 'selectedMvps', 'vipCounts', 'dailyHistory'];
        essentialFields.forEach(key => {
            if (state.rotationState[key] === undefined) {
                console.warn(`Essential rotation state field '${key}' was missing. Initializing.`);
                state.rotationState[key] = (key === 'vipCounts') ? getInitialVipCountsWithIds(state.members, initialVipCountsConfig) : ( (key === 'currentDate') ? NEW_VERSION_START_DATE : ( (typeof state.rotationState[key] === 'number') ? 0 : {} ) );
                needsSaveToFirebase = true;
            }
        });
        
        if (needsSaveToFirebase) {
            console.log("Attempting to save corrected/initialized state to Firebase due to missing/invalid fields.");
            updateFirestoreState().catch(err => console.error("Automatic state correction save FAIL:", err));
        }

    } else {
        console.log(`No existing Firebase document '${stateDocRef.path}' found. Initializing new version state.`);
        state.members = initialMembersConfig.map(m => ({ ...m, id: m.id || generateId() }));
        sortMembers();
        state.rotationState = {
            currentDate: NEW_VERSION_START_DATE,
            r4r5Index: 0,
            selectedMvps: {},
            vipCounts: getInitialVipCountsWithIds(state.members, initialVipCountsConfig),
            dailyHistory: {}
        };
        updateFirestoreState().catch(err => console.error("Initial setup save to Firebase FAIL:", err));
    }
    state.previousRotationState = localPrevStateForUndo; // Wiederherstellen nach Laden
    render();
    resetBtn.disabled = false;
}, (error) => {
    console.error("Firestore Listener FATAL ERROR:", error);
    alert(`FATAL DATABASE ERROR (${error.message}). App might not work. Check console, connection, config, rules.`);
    document.body.innerHTML = `<div style="padding:20px;text-align:center;color:red;"><h1>App Error</h1><p>DB Error: ${error.message}</p></div>`;
});

addMemberForm.addEventListener('submit', addMember);
mvpSelect.addEventListener('change', handleMvpAndVipSelectionChange); // MVP-Auswahl beeinflusst Button
todaysVipSelect.addEventListener('change', handleMvpAndVipSelectionChange); // VIP-Auswahl beeinflusst Button
confirmVipAdvanceDayBtn.addEventListener('click', handleConfirmVipAndAdvanceDay);
// undoAdvanceBtn Event Listener ist schon oben
// resetBtn Event Listener ist schon oben
