/* Écran caisse (POS) : ouverture de caisse, panier vendeur, encaissement réel via record_pos_sale. */
(function(){
  const q=id=>document.querySelector(id);
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let posProducts=[]; let posCart=[]; let sessionId=localStorage.getItem('bms-pos-session')||null;

  function money(n){return new Intl.NumberFormat('fr-DZ').format(Number(n)||0)+' DZD'}

  function renderSessionBar(){
    const bar=q('#posSessionBar'); if(!bar)return;
    if(sessionId){
      bar.innerHTML=`<div class="pos-session-status open"><span class="dot"></span><b>Caisse ouverte</b></div><button class="secondary" id="closeSession">Clôturer la caisse</button>`;
      q('#closeSession').addEventListener('click',closeSession);
    }else{
      bar.innerHTML=`<div class="pos-session-status"><span class="dot"></span><b>Caisse fermée</b></div><button class="primary" id="openSession">Ouvrir la caisse</button>`;
      q('#openSession').addEventListener('click',openSession);
    }
  }

  async function openSession(){
    if(!window.bmsDb)return toast('Connectez Supabase pour ouvrir la caisse.');
    const amount=Number(prompt('Montant en caisse au départ (DZD) ?','0')||0);
    const {data:{user}}=await window.bmsDb.auth.getUser();
    if(!user)return toast('Connectez-vous pour ouvrir la caisse.');
    const {data,error}=await window.bmsDb.from('cash_sessions').insert({opened_by:user.id,opening_amount:amount}).select('id').single();
    if(error)return toast('Ouverture refusée : '+error.message);
    sessionId=data.id; localStorage.setItem('bms-pos-session',sessionId); renderSessionBar(); toast('Caisse ouverte.');
  }

  async function closeSession(){
    if(!window.bmsDb||!sessionId)return;
    const amount=Number(prompt('Montant compté en caisse à la clôture (DZD) ?','0')||0);
    const {error}=await window.bmsDb.from('cash_sessions').update({closing_amount:amount,closed_at:new Date().toISOString()}).eq('id',sessionId);
    if(error)return toast('Clôture refusée : '+error.message);
    sessionId=null; localStorage.removeItem('bms-pos-session'); renderSessionBar(); toast('Caisse clôturée.');
  }

  async function loadPosProducts(){
    if(!window.bmsDb)return;
    const {data,error}=await window.bmsDb.from('products').select('*').order('name_fr');
    if(error)return toast('Impossible de charger les produits : '+error.message);
    posProducts=data||[]; renderPosProducts();
  }

  function renderPosProducts(){
    const grid=q('#posProductGrid'); if(!grid)return;
    const term=(q('#posSearch')?.value||'').toLowerCase();
    const list=posProducts.filter(p=>p.name_fr.toLowerCase().includes(term)||(p.sku||'').toLowerCase().includes(term));
    grid.innerHTML=list.map(p=>`<button type="button" class="pos-product" data-add="${p.id}" ${p.stock_quantity<1?'disabled':''}>${p.image_url?`<img src="${p.image_url}" alt="" style="width:100%;height:64px;object-fit:cover;border-radius:8px">`:'<span style="font-size:28px">🧸</span>'}<b>${esc(p.name_fr)}</b><span>Stock : ${p.stock_quantity}</span><span class="pos-price">${money(p.sale_price)}</span></button>`).join('')||'<p class="pos-empty">Aucun produit.</p>';
    grid.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>addToPosCart(btn.dataset.add)));
  }

  function addToPosCart(id){
    const p=posProducts.find(x=>x.id===id); if(!p)return;
    const line=posCart.find(x=>x.id===id);
    if(line){ if(line.qty<p.stock_quantity) line.qty++; else return toast('Stock insuffisant.'); }
    else posCart.push({id,qty:1});
    renderPosCart();
  }

  function changePosQty(id,delta){
    const line=posCart.find(x=>x.id===id); const p=posProducts.find(x=>x.id===id);
    if(!line)return; line.qty+=delta;
    if(line.qty>p.stock_quantity)line.qty=p.stock_quantity;
    if(line.qty<=0)posCart=posCart.filter(x=>x.id!==id);
    renderPosCart();
  }

  function posTotal(){return posCart.reduce((s,x)=>{const p=posProducts.find(y=>y.id===x.id);return s+(p?Number(p.sale_price)*x.qty:0)},0)}

  function renderPosCart(){
    const holder=q('#posCartItems'); if(!holder)return;
    holder.innerHTML=posCart.length?posCart.map(x=>{const p=posProducts.find(y=>y.id===x.id);return `<div class="pos-cart-line"><div><b>${esc(p.name_fr)}</b><br><span>${money(p.sale_price)}</span></div><div class="qty"><button type="button" data-less="${x.id}">−</button><b>${x.qty}</b><button type="button" data-more="${x.id}">+</button></div></div>`}).join(''):'<p class="pos-empty">Panier vide. Cliquez un produit à gauche.</p>';
    holder.querySelectorAll('[data-less]').forEach(b=>b.addEventListener('click',()=>changePosQty(b.dataset.less,-1)));
    holder.querySelectorAll('[data-more]').forEach(b=>b.addEventListener('click',()=>changePosQty(b.dataset.more,1)));
    const total=posTotal();
    q('#posTotal').textContent=money(total);
    if(q('#posMethod').value==='cash'&&!q('#posReceived').dataset.touched)q('#posReceived').value=total;
    updateChange();
  }

  function updateChange(){
    const total=posTotal(); const received=Number(q('#posReceived').value||0);
    const change=received-total;
    q('#posChange').innerHTML=change>=0?`Monnaie à rendre : <b>${money(change)}</b>`:`Il manque <b>${money(-change)}</b> pour couvrir le total`;
  }

  async function encaisser(){
    if(!window.bmsDb)return toast('Connectez Supabase pour encaisser.');
    if(!sessionId)return toast('Ouvrez la caisse avant d’encaisser une vente.');
    if(!posCart.length)return toast('Le panier caisse est vide.');
    const method=q('#posMethod').value; const received=Number(q('#posReceived').value||0);
    const name=q('#posCustomerName').value.trim(); const phone=q('#posCustomerPhone').value.trim();
    const items=posCart.map(x=>({product_id:x.id,quantity:x.qty}));
    const {data,error}=await window.bmsDb.rpc('record_pos_sale',{p_items:items,p_method:method,p_received:received,p_customer_name:name||null,p_customer_phone:phone||null});
    if(error)return toast('Vente refusée : '+error.message);
    posCart=[]; q('#posCustomerName').value=''; q('#posCustomerPhone').value=''; q('#posReceived').removeAttribute('data-touched'); q('#posReceived').value='';
    renderPosCart(); await loadPosProducts();
    const r=q('#posReceipt'); r.classList.add('show');
    const changeLine=Number(data.change)>0?`Monnaie rendue : ${money(data.change)}`:(Number(data.remaining)>0?`Reste à recevoir : ${money(data.remaining)}`:'Montant exact');
    r.innerHTML=`<b>Ticket ${esc(data.order_number)}</b><br>Total : ${money(data.total)}<br>Reçu : ${money(data.received)}<br>${changeLine}<br>Statut : ${esc(data.payment_status)}`;
    toast('Vente enregistrée en caisse.');
  }

  document.querySelector('.admin-tab[data-panel="pos"]')?.addEventListener('click',()=>{renderSessionBar();loadPosProducts()});
  q('#posSearch')?.addEventListener('input',renderPosProducts);
  q('#posMethod')?.addEventListener('change',()=>{q('#posReceived').removeAttribute('data-touched');renderPosCart()});
  q('#posReceived')?.addEventListener('input',e=>{e.target.dataset.touched='1';updateChange()});
  q('#posCheckout')?.addEventListener('click',encaisser);
  renderSessionBar();
})();
