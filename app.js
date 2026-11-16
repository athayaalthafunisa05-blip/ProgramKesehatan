(() => {
  const KEY = "gizicam_v1";
  const defaults = {biodata:null, account:null, loggedIn:false, scans:[], preferences:{}};
  function load(){try{const raw=localStorage.getItem(KEY);return raw?{...defaults,...JSON.parse(raw)}:{...defaults}}catch(e){return {...defaults}}}
  function save(data){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch(e){notify("Penyimpanan browser penuh atau tidak tersedia.");return false}}
  function notify(message){const el=document.getElementById("toast");if(!el)return;el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
  function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
  function requireLogin(){const d=load();if(!d.loggedIn){location.href="login.html";return false}return true}
  function dateLabel(value){try{return new Date(value).toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"})}catch(e){return "-"}}
  function nutritionCards(n={}){const items=[["Kalori",n.calories,"kcal"],["Protein",n.protein,"g"],["Karbohidrat",n.carbs,"g"],["Lemak",n.fat,"g"],["Serat",n.fiber,"g"],["Gula",n.sugar,"g"],["Natrium",n.sodium,"mg"]];return items.map(([k,v,u])=>`<div class="nutri-card"><small>${k}</small><b>${Number.isFinite(Number(v))?v:"—"}</b><span>${u} · estimasi</span></div>`).join("")}
  window.Gizi={load,save,notify,escapeHTML,requireLogin,dateLabel,nutritionCards,KEY};
  document.addEventListener("DOMContentLoaded",()=>{
    const page=document.body.dataset.page;
    document.querySelectorAll("[data-nav]").forEach(a=>{if(a.dataset.nav===page)a.classList.add("active")});
    const toggle=document.getElementById("menuToggle"),side=document.querySelector(".sidebar");
    if(toggle&&side)toggle.addEventListener("click",()=>side.classList.toggle("open"));
    const logout=document.getElementById("logoutBtn");
    if(logout)logout.addEventListener("click",()=>{const d=load();d.loggedIn=false;save(d);location.href="index.html"});
  });
})();