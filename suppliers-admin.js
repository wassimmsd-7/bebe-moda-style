/* Connecte le panneau "Fournisseurs" : liste réelle des fournisseurs, et
   enregistrement du bon de commande suggéré (produits sous le seuil d'alerte)
   dans purchase_orders / purchase_order_items. */
(function(){
  const q=id=>document.querySelector(id);
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  async function loadSuppliers(){
    if(!window.bmsDb)return;
    const list=q('.supplier-list'); if(!list)return;
    const {data,error}=await window.bmsDb.from('suppliers').select('*').eq('active',true).order('name');
    if(error){list.innerHTML='<li>Fournisseurs indisponibles : '+esc(error.message)+'</li>';return}
    list.innerHTML=(data&&data.length?data:[]).map(s=>`<li><b>${esc(s.name)}</b><span>${esc(s.contact_name||'')}${s.phone?' · '+esc(s.phone):''}${s.address?' · '+esc(s.address):''}</span></li>`).join('')||'<li>Aucun fournisseur actif. Ajoutez-en un dans Supabase &gt; Table Editor &gt; suppliers.</li>';
  }

  async function savePurchaseOrder(){
    if(!window.bmsDb)return toast('Connectez Supabase pour enregistrer un bon de commande.');
    const low=products.filter(p=>p.stock<6);
    if(!low.length)return toast('Aucun produit sous le seuil d’alerte actuellement.');
    // Regroupe les articles par fournisseur si l'info est disponible, sinon un bon "sans fournisseur".
    const {data:po,error:poError}=await window.bmsDb.from('purchase_orders').insert({status:'draft'}).select('id').single();
    if(poError)return toast('Bon de commande refusé : '+poError.message);
    const items=low.map(p=>({purchase_order_id:po.id,product_id:p.id,quantity:Math.max(12,25-p.stock),unit_cost:p.cost||0}));
    const {error:itemsError}=await window.bmsDb.from('purchase_order_items').insert(items);
    if(itemsError)return toast('Lignes du bon refusées : '+itemsError.message);
    toast(`Bon de commande enregistré avec ${items.length} article(s).`);
  }

  document.querySelector('.admin-tab[data-panel="suppliers"]')?.addEventListener('click',loadSuppliers);
  const saveBtn=document.querySelector('#suppliers .panel-card .primary.wide');
  if(saveBtn)saveBtn.addEventListener('click',savePurchaseOrder);
  window.bmsRefreshSuppliers=loadSuppliers;
})();
