/* Gestion réelle des produits : disponible uniquement après connexion Supabase. */
(function(){
  const modal=document.querySelector('#productModal');
  const form=document.querySelector('#productForm');
  const message=document.querySelector('#productMessage');
  const oldButton=document.querySelector('#addProduct');
  const button=oldButton.cloneNode(true);
  oldButton.replaceWith(button);

  const field=id=>document.querySelector(id);
  const mapProduct=p=>({id:p.id,name:p.name_fr,age:p.age_group||'0-6',category:p.age_group?`${p.age_group} mois`:'Essentiels',price:Number(p.sale_price),cost:Number(p.purchase_price||0),stock:p.stock_quantity,sku:p.sku,icon:'🧸',color:'#ffe7ef',badge:p.seasonal?'Saison':'Disponible'});
  const close=()=>{modal.classList.add('hidden');message.textContent=''};
  async function loadProducts(){
    if(!window.bmsDb)return;
    const {data,error}=await window.bmsDb.from('products').select('*').order('created_at',{ascending:false});
    if(error){toast('Impossible de charger le stock : '+error.message);return}
    products.splice(0,products.length,...data.map(mapProduct));renderProducts();renderInventory();
  }

  button.addEventListener('click',()=>{if(!window.bmsDb)return toast('Connectez Supabase avant d’ajouter un produit.');modal.classList.remove('hidden');field('#productSku').focus()});
  field('#closeProduct').addEventListener('click',close);
  modal.addEventListener('click',event=>{if(event.target===modal)close()});
  document.querySelector('.admin-tab[data-panel="inventory"]').addEventListener('click',loadProducts);
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!window.bmsDb)return;
    message.textContent='Enregistrement…';
    const item={sku:field('#productSku').value.trim(),name_fr:field('#productName').value.trim(),age_group:field('#productAge').value,purchase_price:Number(field('#productCost').value),sale_price:Number(field('#productPrice').value),stock_quantity:Number(field('#productStock').value),reorder_level:Number(field('#productReorder').value),published:field('#productPublished').checked};
    const {error}=await window.bmsDb.from('products').insert(item);
    if(error){message.textContent='Erreur : '+error.message;return}
    event.target.reset();field('#productReorder').value=5;close();await loadProducts();toast('Produit ajouté et stock enregistré.');
  });
})();
