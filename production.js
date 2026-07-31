/* Connexion production optionnelle : le mode démo reste disponible sans Supabase. */
(function(){
  const config=window.BMS_CONFIG||{}; const publicKey=config.supabasePublishableKey||config.supabaseAnonKey;
  const authModal=document.querySelector('#authModal'), authForm=document.querySelector('#authForm'), authMessage=document.querySelector('#authMessage');
  const ownerButton=document.querySelector('.owner-fab'), secureOwnerButton=ownerButton.cloneNode(true); ownerButton.replaceWith(secureOwnerButton);
  const staffRoles=['owner','super_admin','cashier','preparer','courier'];
  function openAuth(){if(!window.bmsDb)return toast('Configurez Supabase avant d’ouvrir l’espace équipe.');authModal.classList.remove('hidden');document.querySelector('#authEmail').focus()}
  function closeAuth(){authModal.classList.add('hidden');authMessage.textContent=''}
  async function openBackofficeIfAllowed(){const {data:{user}}=await window.bmsDb.auth.getUser();if(!user)return openAuth();const {data:profile}=await window.bmsDb.from('profiles').select('role').eq('id',user.id).single();if(!profile||!staffRoles.includes(profile.role)){await window.bmsDb.auth.signOut();return toast('Ce compte n’a pas accès à l’espace équipe.')}showView('backoffice')}
  secureOwnerButton.addEventListener('click',openBackofficeIfAllowed);document.querySelector('#closeAuth').addEventListener('click',closeAuth);authModal.addEventListener('click',e=>{if(e.target===authModal)closeAuth()});
  authForm.addEventListener('submit',async e=>{e.preventDefault();authMessage.textContent='Connexion en cours…';const {data,error}=await window.bmsDb.auth.signInWithPassword({email:authEmail.value,password:authPassword.value});if(error){authMessage.textContent='Connexion refusée : '+error.message;return}const {data:profile}=await window.bmsDb.from('profiles').select('role').eq('id',data.user.id).single();if(!profile||!staffRoles.includes(profile.role)){await window.bmsDb.auth.signOut();authMessage.textContent='Ce compte n’est pas autorisé. Contactez le propriétaire.';return}closeAuth();showView('backoffice');toast('Connexion équipe réussie.');});
  const btn=document.querySelector('#checkoutBtn');
  const fresh=btn.cloneNode(true); btn.replaceWith(fresh);
  fresh.addEventListener('click',()=>{if(!cart.length)return toast(t('toast.cartEmpty'));document.querySelector('#checkoutForm').classList.remove('hidden');document.querySelector('#buyerName').focus()});
  document.querySelector('#checkoutForm').addEventListener('submit',async e=>{
    e.preventDefault(); if(!cart.length)return toast(t('toast.cartEmpty'));
    if(!window.bmsDb)return toast(t('toast.orderDemo'));
    const {data,error}=await window.bmsDb.rpc('place_guest_order',{p_name:buyerName.value,p_phone:buyerPhone.value,p_wilaya:buyerWilaya.value,p_address:buyerAddress.value,p_note:buyerNote.value,p_items:cart.map(x=>({product_id:x.id,quantity:x.qty}))});
    if(error)return toast('Commande non envoyée : '+error.message);
    cart=[];saveCart();e.target.reset();e.target.classList.add('hidden');toast(t('toast.orderPlaced',{n:data.order_number}));
  });
  async function connect(){
    if(!config.supabaseUrl||!publicKey||!window.supabase)return;
    window.bmsDb=window.supabase.createClient(config.supabaseUrl,publicKey);
    const {data,error}=await window.bmsDb.from('catalog_products').select('*').order('name_fr');
    if(error){console.warn('Supabase catalogue:',error.message);return}
    if(data&&data.length){window.bmsCatalogLoaded=true;products.splice(0,products.length,...data.map(p=>({id:p.id,name:p.name_fr,name_ar:p.name_ar,name_en:p.name_en,age:p.age_group||'0-6',category:p.age_group?`${p.age_group} mois`:'Essentiels',price:Number(p.sale_price),cost:0,stock:p.stock_quantity,sku:p.sku,image_url:p.image_url,icon:p.image_url?`<img src="${p.image_url}" alt="${p.name_fr||''}">`:'🧸',color:'#ffe7ef',badge:p.seasonal?'Saison':'Disponible'})));renderProducts();renderInventory();}
    else{window.bmsCatalogLoaded=true;products.splice(0,products.length);renderProducts()}
  }
  connect();
})();
