/* Connecte le "Tableau de bord" (première page vue en se connectant) aux
   vraies données Supabase : chiffre d'affaires et bénéfice réels du mois,
   commandes à traiter, alertes de stock (à partir du catalogue déjà chargé
   par production.js/realtime.js), graphique des 7 derniers jours, et le
   vrai nom/initiales de la personne connectée à la place de la démo "Amina". */
(function(){
  const q=id=>document.querySelector(id);
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dz=n=>new Intl.NumberFormat('fr-DZ').format(Math.round(n)||0)+' DZD';
  const DAY_LABELS=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

  function initials(name){const parts=(name||'').trim().split(/\s+/).filter(Boolean);if(!parts.length)return'?';return(parts[0][0]+(parts[1]?parts[1][0]:'')).toUpperCase()}

  async function loadProfileBadge(){
    if(!window.bmsDb)return;
    const {data:{user}}=await window.bmsDb.auth.getUser(); if(!user)return;
    const {data:profile}=await window.bmsDb.from('profiles').select('full_name').eq('id',user.id).single();
    const name=profile?.full_name||'';
    const badge=q('.profile'); if(badge)badge.textContent=initials(name);
    const title=q('#appTitle'); if(title&&title.textContent.includes('Amina'))title.textContent=`Bonjour${name?', '+name.split(' ')[0]:''} 👋`;
  }

  async function loadDashboard(){
    await loadProfileBadge();
    if(!window.bmsDb)return; // mode démo : les chiffres d'exemple restent affichés tels quels
    const now=new Date();
    const monthStart=new Date(now.getFullYear(),now.getMonth(),1).toISOString();
    const prevMonthStart=new Date(now.getFullYear(),now.getMonth()-1,1).toISOString();
    const weekAgo=new Date(now); weekAgo.setDate(weekAgo.getDate()-6); weekAgo.setHours(0,0,0,0);

    const [{data:monthOrders,error:e1},{data:prevOrders},{data:weekOrders}]=await Promise.all([
      window.bmsDb.from('orders').select('id,total,status,created_at').gte('created_at',monthStart),
      window.bmsDb.from('orders').select('total,status,created_at').gte('created_at',prevMonthStart).lt('created_at',monthStart),
      window.bmsDb.from('orders').select('total,created_at,status').gte('created_at',weekAgo.toISOString())
    ]);
    if(e1){console.warn('Dashboard:',e1.message);return}

    const live=(monthOrders||[]).filter(o=>o.status!=='cancelled');
    const revenue=live.reduce((s,o)=>s+Number(o.total),0);
    const prevRevenue=(prevOrders||[]).filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.total),0);
    const revenueDelta=prevRevenue>0?((revenue-prevRevenue)/prevRevenue*100):null;

    let cost=0;
    const orderIds=live.map(o=>o.id);
    if(orderIds.length){
      const {data:items}=await window.bmsDb.from('order_items').select('order_id,quantity,purchase_price').in('order_id',orderIds);
      cost=(items||[]).reduce((s,it)=>s+Number(it.purchase_price)*it.quantity,0);
    }
    const profit=revenue-cost;

    const toConfirm=(monthOrders||[]).filter(o=>o.status==='pending_confirmation').length;
    const readyDelivery=(monthOrders||[]).filter(o=>o.status==='ready_for_delivery').length;
    const lowStock=(typeof products!=='undefined'?products.filter(p=>p.stock<6).length:0);

    const cards=q('#dashboard .metric-grid');
    if(cards)cards.innerHTML=`
      <article><span>Chiffre d'affaires</span><b>${dz(revenue)}</b><small class="${revenueDelta==null?'':revenueDelta>=0?'':'warning'}">${revenueDelta==null?'Ce mois':(revenueDelta>=0?'↑ ':'↓ ')+Math.abs(revenueDelta).toFixed(1)+'% vs mois dernier'}</small></article>
      <article><span>Bénéfice net estimé</span><b>${dz(profit)}</b><small>Sur ${live.length} commande${live.length>1?'s':''} ce mois</small></article>
      <article><span>Commandes à confirmer</span><b>${toConfirm}</b><small>${readyDelivery} prête${readyDelivery>1?'s':''} à livrer</small></article>
      <article><span>Alertes de stock</span><b>${lowStock}</b><small class="${lowStock>0?'warning':''}">${lowStock>0?'À commander bientôt':'Stock sain'}</small></article>`;

    // graphique des 7 derniers jours
    const byDay={};
    (weekOrders||[]).forEach(o=>{if(o.status==='cancelled')return;const d=new Date(o.created_at);const key=d.toISOString().slice(0,10);byDay[key]=(byDay[key]||0)+Number(o.total)});
    const days=[];for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);days.push(d)}
    const values=days.map(d=>byDay[d.toISOString().slice(0,10)]||0);
    const max=Math.max(1,...values);
    const chart=q('#dashboard .chart'); if(chart)chart.innerHTML=values.map(v=>`<i style="height:${Math.max(4,Math.round(v/max*100))}%" title="${dz(v)}"></i>`).join('');
    const chartDays=q('#dashboard .chart-days'); if(chartDays)chartDays.innerHTML=days.map(d=>`<span>${DAY_LABELS[d.getDay()]}</span>`).join('');

    // liste "à traiter maintenant"
    const taskList=q('#dashboard .task-list');
    if(taskList)taskList.innerHTML=`
      <li><b>${toConfirm}</b><span>Commandes COD à confirmer</span></li>
      <li><b>${lowStock}</b><span>Produits sous le seuil de stock</span></li>
      <li><b>${readyDelivery}</b><span>Livraisons prêtes à transmettre</span></li>`;
  }

  document.querySelector('.admin-tab[data-panel="dashboard"]')?.addEventListener('click',loadDashboard);
  window.bmsRefreshDashboard=loadDashboard;
})();
