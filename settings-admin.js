/* Connecte le panneau "Super admin" aux vraies données Supabase :
   - liste des comptes équipe (profiles) avec changement de rôle en direct
   - statut de synchronisation réel (connecté ou non, nombre de produits)
   Reste en mode "connectez-vous" tant que Supabase n'est pas configuré,
   comme les autres panneaux admin. */
(function(){
  const q=id=>document.querySelector(id);
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ROLES=['owner','super_admin','cashier','preparer','courier','customer'];
  const ROLE_LABELS={owner:'Propriétaire',super_admin:'Administrateur',cashier:'Vendeur caisse',preparer:'Préparateur',courier:'Livreur',customer:'Client'};

  async function loadStaff(){
    const holder=q('#staffList'); if(!holder)return;
    if(!window.bmsDb){holder.innerHTML='<p class="muted">Connectez-vous à l\'espace propriétaire pour voir l\'équipe.</p>';return}
    const {data:{user}}=await window.bmsDb.auth.getUser();
    if(!user){holder.innerHTML='<p class="muted">Connectez-vous à l\'espace propriétaire pour voir l\'équipe.</p>';return}
    const {data,error}=await window.bmsDb.from('profiles').select('*').neq('role','customer').order('created_at');
    if(error){holder.innerHTML='<p class="muted">Accès équipe indisponible : '+esc(error.message)+'</p>';return}
    if(!data||!data.length){holder.innerHTML='<p class="muted">Aucun compte équipe pour le moment.</p>';return}
    holder.innerHTML=data.map(p=>`<div class="staff-row"><div><b>${esc(p.full_name)||'(sans nom)'}</b><span>${esc(p.phone||'—')}</span></div><select data-role-for="${p.id}" ${p.id===user.id?'disabled title="Vous ne pouvez pas modifier votre propre rôle ici"':''}>${ROLES.map(r=>`<option value="${r}" ${r===p.role?'selected':''}>${ROLE_LABELS[r]}</option>`).join('')}</select></div>`).join('');
    holder.querySelectorAll('[data-role-for]').forEach(sel=>sel.addEventListener('change',async()=>{
      const id=sel.dataset.roleFor, newRole=sel.value;
      if(!confirm(`Confirmer le nouveau rôle "${ROLE_LABELS[newRole]}" pour ce compte ?`)){await loadStaff();return}
      const {error}=await window.bmsDb.from('profiles').update({role:newRole}).eq('id',id);
      if(error){toast('Changement refusé : '+error.message);await loadStaff();return}
      toast('Rôle mis à jour.');
    }));
  }

  async function loadSyncStatus(){
    const dot=q('#syncDot'), status=q('#syncStatus'), detail=q('#syncDetail');
    if(!dot)return;
    if(!window.bmsDb){dot.style.background='#c54b63';status.textContent='Supabase non configuré (mode démo)';detail.textContent='Renseignez supabase-config.js pour activer la synchronisation.';return}
    const {count,error}=await window.bmsDb.from('products').select('id',{count:'exact',head:true});
    if(error){dot.style.background='#c54b63';status.textContent='Connecté, mais erreur de lecture';detail.textContent=error.message;return}
    dot.style.background='#3bb785';status.textContent='Boutique, stock et caisse synchronisés';detail.textContent=`${count ?? 0} produit(s) en base · vérifié à ${new Date().toLocaleTimeString('fr-DZ')}`;
  }

  function refreshSettings(){loadStaff();loadSyncStatus()}
  document.querySelector('.admin-tab[data-panel="settings"]')?.addEventListener('click',refreshSettings);
  window.bmsRefreshSettings=refreshSettings;
})();
