/* Connecte le panneau "Commandes" du back-office aux vraies commandes en ligne
   (Supabase), avec changement de statut. Reste en mode démo (données statiques
   d'app.js) tant que Supabase n'est pas configuré. */
(function(){
  const statusLabels={
    pending_confirmation:'À confirmer', confirmed:'Confirmée', preparing:'En préparation',
    ready_for_delivery:'Prête livraison', out_for_delivery:'En livraison',
    delivered:'Livrée', cancelled:'Annulée', returned:'Retournée'
  };
  const statusTone={pending_confirmation:'low',confirmed:'ok',preparing:'ok',ready_for_delivery:'ok',out_for_delivery:'ok',delivered:'ok',cancelled:'out',returned:'out'};
  const q=id=>document.querySelector(id);
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dzMoney=n=>new Intl.NumberFormat('fr-DZ').format(Number(n)||0)+' DZD';

  async function loadOrders(){
    if(!window.bmsDb)return; // mode démo : on laisse app.js afficher ses données d'exemple
    const holder=q('#ordersList'); if(!holder)return;
    const {data,error}=await window.bmsDb.from('orders').select('*,customers(full_name,phone,wilaya)').neq('source','pos').order('created_at',{ascending:false}).limit(100);
    if(error){holder.innerHTML='<p class="pos-empty">Commandes indisponibles : '+esc(error.message)+'</p>';return}
    if(!data||!data.length){holder.innerHTML='<p class="pos-empty">Aucune commande en ligne pour le moment.</p>';return}
    holder.innerHTML=data.map(o=>{
      const name=o.customers?.full_name||'Client';
      const options=Object.keys(statusLabels).map(k=>`<option value="${k}" ${k===o.status?'selected':''}>${statusLabels[k]}</option>`).join('');
      return `<article class="order"><div><b>${esc(o.order_number)}</b><p>${esc(name)}</p></div><span>${esc(o.delivery_wilaya||o.customers?.wilaya||'—')}</span><b>${dzMoney(o.total)}</b><span class="stock-tag ${statusTone[o.status]||'ok'}">${statusLabels[o.status]||o.status}</span><select data-order-status="${o.id}">${options}</select></article>`;
    }).join('');
    holder.querySelectorAll('[data-order-status]').forEach(sel=>sel.addEventListener('change',async()=>{
      const id=sel.dataset.orderStatus;
      const {error}=await window.bmsDb.from('orders').update({status:sel.value}).eq('id',id);
      if(error){toast('Mise à jour refusée : '+error.message);return}
      toast('Statut mis à jour.');
      loadOrders();
    }));
  }

  document.querySelector('.admin-tab[data-panel="orders"]')?.addEventListener('click',loadOrders);
  window.bmsRefreshOrders=loadOrders;
})();
