/* Connecte le panneau "Clients" du back-office aux vrais clients Supabase,
   avec nombre de commandes et total dépensé calculés côté client (petit
   volume attendu ; à remplacer par une vue SQL si le nombre de clients
   devient important). Reste en mode démo tant que Supabase n'est pas configuré. */
(function(){
  const q=id=>document.querySelector(id);
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dzMoney=n=>new Intl.NumberFormat('fr-DZ').format(Number(n)||0)+' DZD';

  async function loadCustomers(){
    if(!window.bmsDb)return; // mode démo : app.js/index.html gardent leurs 3 exemples
    const holder=q('#customers .contact-grid'); if(!holder)return;
    const [{data:customers,error:custError},{data:orders,error:ordError}]=await Promise.all([
      window.bmsDb.from('customers').select('*').order('created_at',{ascending:false}).limit(200),
      window.bmsDb.from('orders').select('customer_id,total')
    ]);
    if(custError){holder.innerHTML='<p class="pos-empty">Clients indisponibles : '+esc(custError.message)+'</p>';return}
    const stats={};
    (orders||[]).forEach(o=>{if(!o.customer_id)return;const s=stats[o.customer_id]||{count:0,total:0};s.count++;s.total+=Number(o.total)||0;stats[o.customer_id]=s});
    if(!customers||!customers.length){holder.innerHTML='<p class="pos-empty">Aucun client enregistré pour le moment.</p>';return}
    holder.innerHTML=customers.map(c=>{
      const s=stats[c.id]||{count:0,total:0};
      return `<article><b>${esc(c.full_name)}</b><span>${esc(c.wilaya||'—')} · ${s.count} commande${s.count>1?'s':''} · ${dzMoney(s.total)}</span><button class="secondary" data-contact-phone="${esc(c.phone||'')}">Contacter</button></article>`;
    }).join('');
    holder.querySelectorAll('[data-contact-phone]').forEach(btn=>btn.addEventListener('click',()=>{
      const phone=btn.dataset.contactPhone;
      if(!phone)return toast('Aucun numéro enregistré pour ce client.');
      toast('Numéro : '+phone+' — copiez-le pour appeler ou écrire sur WhatsApp.');
    }));
  }

  document.querySelector('.admin-tab[data-panel="customers"]')?.addEventListener('click',loadCustomers);
  window.bmsRefreshCustomers=loadCustomers;
})();
