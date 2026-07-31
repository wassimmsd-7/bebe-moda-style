/* Connecte le panneau "Offres & saisons" à la table promotions. */
(function(){
  const q=id=>document.querySelector(id);
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  async function loadPromos(){
    if(!window.bmsDb)return;
    const holder=q('#promos'); if(!holder)return;
    const {data,error}=await window.bmsDb.from('promotions').select('*').order('starts_at',{ascending:false});
    if(error){holder.querySelector('h2').insertAdjacentHTML('afterend',`<p class="pos-empty">Offres indisponibles : ${esc(error.message)}</p>`);return}
    const cards=holder.querySelectorAll('.promo-card'); cards.forEach(c=>c.remove());
    if(!data||!data.length){
      holder.insertAdjacentHTML('beforeend','<p class="pos-empty">Aucune offre enregistrée. Ajoutez-en une dans Supabase &gt; Table Editor &gt; promotions.</p>');
      return;
    }
    const html=data.map(p=>{
      const period=`${new Date(p.starts_at).toLocaleDateString('fr-DZ')} → ${new Date(p.ends_at).toLocaleDateString('fr-DZ')}`;
      return `<div class="promo-card"><span>${p.active?'✓ Active':'⏸ Inactive'} ${p.code?'· '+esc(p.code):''}</span><h3>${esc(p.name)}${p.discount_percent?` — -${p.discount_percent}%`:''}</h3><p>${period}</p><button class="primary" data-toggle-promo="${p.id}" data-active="${p.active}">${p.active?'Désactiver':'Activer'}</button></div>`;
    }).join('');
    holder.insertAdjacentHTML('beforeend',html);
    holder.querySelectorAll('[data-toggle-promo]').forEach(btn=>btn.addEventListener('click',async()=>{
      const id=btn.dataset.togglePromo, nowActive=btn.dataset.active==='true';
      const {error}=await window.bmsDb.from('promotions').update({active:!nowActive}).eq('id',id);
      if(error)return toast('Mise à jour refusée : '+error.message);
      toast(nowActive?'Offre désactivée.':'Offre activée.');
      loadPromos();
    }));
  }

  document.querySelector('.admin-tab[data-panel="promos"]')?.addEventListener('click',loadPromos);
  window.bmsRefreshPromos=loadPromos;
})();
