// Full application script moved from hospital_queue_system.html
// Priority mapping: Critical=3, Moderate=2, else=1
const PQ = [];
let idCounter = 0;
let exited = false;
let maxSize = 100; // 0 = unlimited

function priorityFromSeverity(s){
	if(s === 'Critical') return 3;
	if(s === 'Moderate') return 2;
	return 1;
}

function getSelectedSeverity(groupId){
	const active = document.querySelector('#'+groupId+' .sev-btn.active');
	return active ? active.dataset.severity : 'Mild';
}

function setSeverityActive(groupId, severity){
	const buttons = document.querySelectorAll('#'+groupId+' .sev-btn');
	buttons.forEach(b=>{ b.classList.toggle('active', b.dataset.severity === severity); });
}

// attach click handlers for severity buttons
function initSeverityButtons(){
	document.querySelectorAll('#severity-buttons .sev-btn').forEach(b=>{
		b.addEventListener('click', ()=>{ setSeverityActive('severity-buttons', b.dataset.severity); });
	});
	document.querySelectorAll('#modal-severity-buttons .sev-btn').forEach(b=>{
		b.addEventListener('click', ()=>{ setSeverityActive('modal-severity-buttons', b.dataset.severity); });
	});
}

function addPatient(){
	if(exited) return showToast('Session ended — cannot add');
	const name = document.getElementById('name').value.trim();
	const age = parseInt(document.getElementById('age').value,10);
	const severity = getSelectedSeverity('severity-buttons');
	if(!name || Number.isNaN(age)) return showToast('Please provide valid name and age');

	if(maxSize > 0 && PQ.length >= maxSize) return showToast('Queue is full — max ' + maxSize);

	const priority = priorityFromSeverity(severity);
	const patient = { id: ++idCounter, name, age, severity, priority, time: Date.now() };
	PQ.push(patient);
	sortQueue();
	updateQueueSize();
	clearForm();
	// ensure severity buttons are initialized
	initSeverityButtons();
	showToast('Patient added — ' + name);
}

function sortQueue(){
	PQ.sort((a,b)=>{
		if(b.priority !== a.priority) return b.priority - a.priority; // higher first
		return a.time - b.time; // earlier first
	});
}

function displayQueue(){
	const container = document.getElementById('queue-container');
	container.innerHTML = '';
	if(PQ.length === 0){
		container.innerHTML = '<div class="empty">No patients in queue</div>';
		return;
	}

	const table = document.createElement('table');
	const thead = document.createElement('thead');
	thead.innerHTML = '<tr><th>Patient</th><th>Age</th><th>Severity</th><th>Priority</th></tr>';
	table.appendChild(thead);
	const tbody = document.createElement('tbody');
	for(const p of PQ){
		const tr = document.createElement('tr');
		const badgeClass = p.priority === 3 ? 'high' : p.priority === 2 ? 'med' : 'low';
		tr.innerHTML = `<td>${escapeHtml(p.name)}</td><td>${p.age}</td><td>${escapeHtml(p.severity)}</td><td><span class="badge ${badgeClass}">${p.priority}</span></td>`;
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	container.appendChild(table);
}

function treatPatient(){
	// open modal to allow changing priority or treating
	if(exited) return showToast('Session ended — cannot treat');
	if(PQ.length === 0) return showToast('No patients to treat');
	openTreatModal();
}

function openTreatModal(){
	sortQueue();
	const p = PQ[0];
	if(!p) return showToast('No patients to treat');
	document.getElementById('modal-name').textContent = p.name;
	document.getElementById('modal-age').textContent = p.age;
	setSeverityActive('modal-severity-buttons', p.severity);
	document.getElementById('treat-modal').style.display = 'flex';
}

function closeTreatModal(){
	document.getElementById('treat-modal').style.display = 'none';
}

function downgradeSeverity(s){
	if(s === 'Critical') return 'Moderate';
	if(s === 'Moderate') return 'Mild';
	return 'Mild';
}

function treatNowFromModal(){
	// Treating downgrades the patient's severity (but keeps them in queue)
	if(PQ.length === 0) { closeTreatModal(); return showToast('No patients to treat'); }
	const p = PQ[0];
	const oldSeverity = p.severity;
	const newSeverity = downgradeSeverity(oldSeverity);
	p.severity = newSeverity;
	p.priority = priorityFromSeverity(newSeverity);
	p.time = Date.now();
	sortQueue();
	updateQueueSize();
	displayQueueIfVisible();
	closeTreatModal();
	showToast('Patient treated — ' + p.name + ' (now ' + newSeverity + ')');
}

function dischargeFromModal(){
	if(PQ.length === 0) { closeTreatModal(); return showToast('No patients to discharge'); }
	const patient = PQ.shift();
	updateQueueSize();
	displayQueueIfVisible();
	closeTreatModal();
	showToast('Patient discharged — ' + patient.name);
}

function updatePriorityFromModal(){
	if(PQ.length === 0) return showToast('No patients to update');
	const newSeverity = getSelectedSeverity('modal-severity-buttons');
	const newPriority = priorityFromSeverity(newSeverity);
	const name = PQ[0].name;
	// update top patient
	PQ[0].severity = newSeverity;
	PQ[0].priority = newPriority;
	PQ[0].time = Date.now();
	sortQueue();
	updateQueueSize();
	displayQueueIfVisible();
	closeTreatModal();
	showToast('Priority updated for ' + name);
}

function clearQueue(confirmPrompt){
	if(confirmPrompt && !confirm('Clear the entire queue?')) return;
	PQ.length = 0;
	updateQueueSize();
	displayQueueIfVisible();
	showToast('Queue cleared');
}

function exitApp(){
	if(exited) return;
	if(!confirm('Exit the application? This will lock further actions.')) return;
	exited = true;
	document.querySelectorAll('input,select,button').forEach(el=>el.disabled = true);
	document.getElementById('queue-container').innerHTML = '<div class="empty">Session ended. Refresh page to restart.</div>';
	document.getElementById('queue-size').textContent = PQ.length;
	showToast('Session ended');
}

function showSection(name){
	['add','display'].forEach(s=>{
		document.getElementById('section-'+s).style.display = (s===name)?'block':'none';
	});
	document.querySelectorAll('.menu button').forEach(btn=>btn.classList.remove('active'));
	document.getElementById('menu-'+name).classList.add('active');
	if(name==='display') displayQueue();
}

function clearForm(){
	document.getElementById('name').value = '';
	document.getElementById('age').value = '';
	setSeverityActive('severity-buttons','Critical');
}

function updateQueueSize(){
	document.getElementById('queue-size').textContent = PQ.length + (maxSize>0 ? ' / ' + maxSize : '');
}

function applyMaxSize(){
	const v = parseInt(document.getElementById('max-size').value,10);
	if(Number.isNaN(v) || v < 0) return showToast('Invalid max size');
	maxSize = v;
	updateQueueSize();
	showToast('Max queue size set to ' + (maxSize === 0 ? 'unlimited' : maxSize));
}

function displayQueueIfVisible(){
	if(document.getElementById('section-display').style.display !== 'none') displayQueue();
}

// small utility: escape text for HTML
function escapeHtml(str){ return String(str).replace(/[&<>\"]+/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;' }[s])); }

// toast
let toastTimer = null;
function showToast(msg){
	const t = document.getElementById('toast'); t.textContent = msg; t.style.display = 'block';
	clearTimeout(toastTimer); toastTimer = setTimeout(()=>{ t.style.display = 'none'; }, 3000);
}

// initial
sortQueue(); updateQueueSize();
// initialize severity button handlers
initSeverityButtons();
// Theme: load saved or default to dark
function applyTheme(theme){
	document.body.classList.toggle('light-theme', theme === 'light');
	const btn = document.getElementById('theme-toggle');
	if(btn) btn.textContent = theme === 'light' ? '☀️' : '🌙';
	try{ localStorage.setItem('hqs-theme', theme); }catch(e){}
}

function toggleTheme(){
	const current = document.body.classList.contains('light-theme') ? 'light' : 'dark';
	const next = current === 'light' ? 'dark' : 'light';
	applyTheme(next);
}

(function(){
	try{
		const saved = localStorage.getItem('hqs-theme');
		applyTheme(saved === 'light' ? 'light' : 'dark');
	}catch(e){ applyTheme('dark'); }
})();
// map menu ids to sections
document.getElementById('menu-add').id = 'menu-add';
document.getElementById('menu-display').id = 'menu-display';
document.getElementById('menu-treat').id = 'menu-treat';
document.getElementById('menu-exit').id = 'menu-exit';

alert("Hello, User!");