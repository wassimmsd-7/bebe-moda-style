/* Synchronisation en temps réel avec Supabase (stock, catalogue, commandes).
   S'appuie sur window.bmsDb créé par production.js. Comme la connexion est
   asynchrone, on patiente jusqu'à ce que le client soit prêt avant de
   s'abonner aux canaux "postgres_changes". */
(function(){
  let attempts=0;
  function waitForDb(){
    if(window.bmsDb){startRealtime();return}
    attempts++;
    if(attempts>50)return; // ~15s : pas de config Supabase, on reste en mode démo
    setTimeout(waitForDb,300);
  }

  function startRealtime(){
    const db=window.bmsDb;
    // Premier rafraîchissement dès que la connexion est prête, au cas où
    // l'utilisateur est déjà sur un panneau admin concerné.
    if(window.bmsRefreshOrders)window.bmsRefreshOrders();
    if(window.bmsRefreshCustomers)window.bmsRefreshCustomers();
    if(window.bmsRefreshInventory)window.bmsRefreshInventory();
    if(window.bmsRefreshPos)window.bmsRefreshPos();
    if(window.bmsRefreshSuppliers)window.bmsRefreshSuppliers();
    if(window.bmsRefreshFinance)window.bmsRefreshFinance();
    if(window.bmsRefreshSettings)window.bmsRefreshSettings();

    // 1) Catalogue public (boutique) : toute variation de stock, prix ou
    //    publication d'un produit publié se reflète immédiatement, sans que
    //    le client ait besoin de recharger la page.
    db.channel('public:catalog')
      .on('postgres_changes',{event:'*',schema:'public',table:'products'},payload=>{
        refreshCatalog();
        if(window.bmsRefreshInventory)window.bmsRefreshInventory();
        if(window.bmsRefreshPos)window.bmsRefreshPos();
        if(window.bmsRefreshSuppliers)window.bmsRefreshSuppliers();
        if(window.bmsRefreshSettings)window.bmsRefreshSettings();
      })
      .subscribe();

    // 2) Commandes : utile côté back-office pour voir arriver une commande
    //    COD ou une vente caisse sans avoir à changer d'onglet.
    db.channel('public:orders')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'orders'},payload=>{
        if(document.querySelector('#backoffice')?.classList.contains('active'))
          toast('Nouvelle commande reçue : '+(payload.new?.order_number||''));
        if(window.bmsRefreshOrders)window.bmsRefreshOrders();
        if(window.bmsRefreshCustomers)window.bmsRefreshCustomers();
        if(window.bmsRefreshFinance)window.bmsRefreshFinance();
      })
      .subscribe();
  }

  async function refreshCatalog(){
    const {data,error}=await window.bmsDb.from('catalog_products').select('*').order('name_fr');
    if(error)return;
    if(data){
      products.splice(0,products.length,...data.map(p=>({id:p.id,name:p.name_fr,name_ar:p.name_ar,name_en:p.name_en,age:p.age_group||'0-6',category:p.age_group?`${p.age_group} mois`:'Essentiels',price:Number(p.sale_price),cost:0,stock:p.stock_quantity,sku:p.sku,image_url:p.image_url,icon:p.image_url?`<img src="${p.image_url}" alt="${p.name_fr||''}">`:'🧸',color:'#ffe7ef',badge:p.seasonal?'Saison':'Disponible'})));
      renderProducts();
      if(document.querySelector('#cart')?.classList.contains('active'))renderCart();
    }
  }

  waitForDb();
})();
