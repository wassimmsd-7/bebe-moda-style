/* Connexion production optionnelle : le mode démo reste disponible sans Supabase. */
(function(){
  const config=window.BMS_CONFIG||{}; const publicKey=config.supabasePublishableKey||config.supabaseAnonKey;
  const btn=document.querySelector('#checkoutBtn');
  const fresh=btn.cloneNode(true); btn.replaceWith(fresh);
  fresh.addEventListener('click',()=>{if(!cart.length)return toast('Votre panier est vide.');document.querySelector('#checkoutForm').classList.remove('hidden');document.querySelector('#buyerName').focus()});
  document.querySelector('#checkoutForm').addEventListener('submit',async e=>{
    e.preventDefault(); if(!cart.length)return toast('Votre panier est vide.');
    if(!window.bmsDb)return toast('Mode démo : renseignez Supabase pour envoyer cette commande à votre base.');
    const {data,error}=await window.bmsDb.rpc('place_guest_order',{p_name:buyerName.value,p_phone:buyerPhone.value,p_wilaya:buyerWilaya.value,p_address:buyerAddress.value,p_note:buyerNote.value,p_items:cart.map(x=>({product_id:x.id,quantity:x.qty}))});
    if(error)return toast('Commande non envoyée : '+error.message);
    cart=[];saveCart();e.target.reset();e.target.classList.add('hidden');toast(`Commande ${data.order_number} reçue ! Nous vous contacterons bientôt.`);
  });
  async function connect(){
    if(!config.supabaseUrl||!publicKey||!window.supabase)return;
    window.bmsDb=window.supabase.createClient(config.supabaseUrl,publicKey);
    const {data,error}=await window.bmsDb.from('catalog_products').select('*').order('name_fr');
    if(error){console.warn('Supabase catalogue:',error.message);return}
    if(data&&data.length){products.splice(0,products.length,...data.map(p=>({id:p.id,name:p.name_fr,age:p.age_group||'0-6',category:p.age_group?`${p.age_group} mois`:'Essentiels',price:Number(p.sale_price),cost:0,stock:p.stock_quantity,sku:p.sku,icon:'🧸',color:'#ffe7ef',badge:p.seasonal?'Saison':'Disponible'})));renderProducts();renderInventory();toast('Catalogue synchronisé avec Supabase.');}
  }
  connect();
})();
