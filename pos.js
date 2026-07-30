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

  let lastReceipt=null;

  async function encaisser(){
    if(!window.bmsDb)return toast('Connectez Supabase pour encaisser.');
    if(!sessionId)return toast('Ouvrez la caisse avant d’encaisser une vente.');
    if(!posCart.length)return toast('Le panier caisse est vide.');
    const method=q('#posMethod').value; const received=Number(q('#posReceived').value||0);
    const name=q('#posCustomerName').value.trim(); const phone=q('#posCustomerPhone').value.trim();
    const lines=posCart.map(x=>({name:posProducts.find(p=>p.id===x.id)?.name_fr||'',qty:x.qty,price:Number(posProducts.find(p=>p.id===x.id)?.sale_price||0)}));
    const items=posCart.map(x=>({product_id:x.id,quantity:x.qty}));
    const {data,error}=await window.bmsDb.rpc('record_pos_sale',{p_items:items,p_method:method,p_received:received,p_customer_name:name||null,p_customer_phone:phone||null});
    if(error)return toast('Vente refusée : '+error.message);
    posCart=[]; q('#posCustomerName').value=''; q('#posCustomerPhone').value=''; q('#posReceived').removeAttribute('data-touched'); q('#posReceived').value='';
    renderPosCart(); await loadPosProducts();
    const r=q('#posReceipt'); r.classList.add('show');
    const changeLine=Number(data.change)>0?`Monnaie rendue : ${money(data.change)}`:(Number(data.remaining)>0?`Reste à recevoir : ${money(data.remaining)}`:'Montant exact');
    lastReceipt={orderNumber:data.order_number,total:data.total,received:data.received,change:data.change,remaining:data.remaining,status:data.payment_status,method,customer:name,phone,lines,date:new Date()};
    r.innerHTML=`<b>Ticket ${esc(data.order_number)}</b><br>Total : ${money(data.total)}<br>Reçu : ${money(data.received)}<br>${changeLine}<br>Statut : ${esc(data.payment_status)}<br><button id="posPrint" class="secondary wide">🖨 Imprimer le ticket</button>`;
    q('#posPrint').addEventListener('click',()=>printReceipt(lastReceipt));
    toast('Vente enregistrée en caisse.');
  }

  function printReceipt(r){
    if(!r)return;
    const methodLabel={cash:'Espèces',card:'Carte',transfer:'Virement',credit:'Crédit client'}[r.method]||r.method;
    const rows=r.lines.map(l=>`<tr><td>${esc(l.name)}</td><td style="text-align:center">${l.qty}</td><td style="text-align:right">${money(l.price*l.qty)}</td></tr>`).join('');
    const win=window.open('','_blank','width=380,height=600');
    if(!win)return toast('Autorisez les pop-ups pour imprimer le ticket.');
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Ticket ${esc(r.orderNumber)}</title>
      <style>body{font-family:'Courier New',monospace;font-size:13px;padding:16px;color:#111}h1{font-size:16px;text-align:center;margin:0}
      p.center{text-align:center;margin:2px 0 12px;font-size:11px}table{width:100%;border-collapse:collapse;margin:10px 0}
      td{padding:3px 0;border-bottom:1px dashed #999}.totals td{border:0;font-weight:bold}hr{border:none;border-top:1px dashed #999}
      .center{text-align:center}</style></head><body>
      <h1>Bébé Moda Style</h1><p class="center">Ticket de caisse</p>
      <p>Ticket : <b>${esc(r.orderNumber)}</b><br>Date : ${r.date.toLocaleString('fr-DZ')}${r.customer?`<br>Client : ${esc(r.customer)}`:''}${r.phone?`<br>Tél : ${esc(r.phone)}`:''}</p>
      <hr><table>${rows}</table><hr>
      <table class="totals"><tr><td>Total</td><td style="text-align:right">${money(r.total)}</td></tr>
      <tr><td>Payé (${esc(methodLabel)})</td><td style="text-align:right">${money(r.received)}</td></tr>
      ${Number(r.change)>0?`<tr><td>Monnaie rendue</td><td style="text-align:right">${money(r.change)}</td></tr>`:''}
      ${Number(r.remaining)>0?`<tr><td>Reste à payer</td><td style="text-align:right">${money(r.remaining)}</td></tr>`:''}</table>
      <p class="center">Merci de votre confiance 💗</p>
      <script>window.onload=()=>{window.print()}</script></body></html>`);
    win.document.close();
  }

  /* ---- Historique & retours ---- */
  let posHistData=[];
  const statusLabel={paid:'Payée',partial:'Partielle',unpaid:'Impayée',refunded:'Remboursée'};

  async function loadPosHistory(){
    if(!window.bmsDb)return;
    const holder=q('#posHistList'); if(holder)holder.innerHTML='<p class="pos-empty">Chargement…</p>';
    const {data,error}=await window.bmsDb.from('orders').select('*,order_items(*),pos_returns(*,pos_return_items(*)),customers(full_name,phone)').eq('source','pos').order('created_at',{ascending:false}).limit(80);
    if(error){if(holder)holder.innerHTML='<p class="pos-empty">Historique indisponible : '+esc(error.message)+'</p>';return}
    posHistData=data||[]; renderPosHistory();
  }

  function renderPosHistory(){
    const holder=q('#posHistList'); if(!holder)return;
    const term=(q('#posHistSearch')?.value||'').toLowerCase();
    const list=posHistData.filter(o=>!term||o.order_number.toLowerCase().includes(term)||(o.customers?.phone||'').includes(term)||(o.customers?.full_name||'').toLowerCase().includes(term));
    holder.innerHTML=list.length?list.map(o=>{
      const date=new Date(o.created_at).toLocaleString('fr-DZ');
      const who=o.customers?.full_name?`${esc(o.customers.full_name)}${o.customers.phone?' · '+esc(o.customers.phone):''}`:'Client de passage';
      return `<div class="pos-hist-card"><div><b>${esc(o.order_number)}</b><span class="pos-hist-meta">${date} · ${who}</span></div><b>${money(o.total)}</b><span class="pos-hist-status ${esc(o.payment_status)}">${statusLabel[o.payment_status]||o.payment_status}</span><button class="secondary" data-return="${o.id}">Détails / Retour</button></div>`;
    }).join(''):'<p class="pos-empty">Aucune vente trouvée.</p>';
    holder.querySelectorAll('[data-return]').forEach(b=>b.addEventListener('click',()=>openReturnModal(b.dataset.return)));
  }

  function openReturnModal(orderId){
    const order=posHistData.find(o=>o.id===orderId); if(!order)return;
    q('#posReturnOrderNumber').textContent=order.order_number;
    q('#posReturnModal').dataset.orderId=orderId;
    const returnedByItem={};
    (order.pos_returns||[]).forEach(r=>(r.pos_return_items||[]).forEach(ri=>{returnedByItem[ri.order_item_id]=(returnedByItem[ri.order_item_id]||0)+ri.quantity}));
    const lines=(order.order_items||[]).map(it=>{
      const already=returnedByItem[it.id]||0; const remain=it.quantity-already;
      return `<div class="pos-return-line"><div><b>${esc(it.product_name)}</b><br><span>${money(it.unit_price)} · vendu ${it.quantity}${already?` · déjà retourné ${already}`:''}</span></div>${remain>0?`<input type="number" min="0" max="${remain}" value="0" data-order-item="${it.id}" />`:'<span>Rien à retourner</span>'}</div>`;
    }).join('');
    q('#posReturnLines').innerHTML=lines||'<p class="pos-empty">Aucun article sur cette vente.</p>';
    q('#posReturnReason').value=''; q('#posReturnMessage').textContent=''; q('#posReturnRestock').checked=true;
    q('#posReturnModal').classList.remove('hidden');
  }

  async function confirmReturn(){
    const orderId=q('#posReturnModal').dataset.orderId; if(!orderId)return;
    const items=[...q('#posReturnLines').querySelectorAll('[data-order-item]')].map(i=>({order_item_id:i.dataset.orderItem,quantity:Number(i.value||0)})).filter(i=>i.quantity>0);
    if(!items.length)return q('#posReturnMessage').textContent='Choisissez au moins un article et une quantité.';
    const restock=q('#posReturnRestock').checked; const reason=q('#posReturnReason').value.trim();
    q('#posReturnMessage').textContent='Traitement du retour…';
    const {data,error}=await window.bmsDb.rpc('record_pos_return',{p_order_id:orderId,p_items:items,p_restock:restock,p_reason:reason||null});
    if(error){q('#posReturnMessage').textContent='Erreur : '+error.message;return}
    q('#posReturnModal').classList.add('hidden');
    toast(`Retour enregistré · remboursement ${money(data.refund_amount)}${data.full_return?' · vente entièrement retournée':''}`);
    await loadPosHistory(); await loadPosProducts();
  }

  document.querySelector('.admin-tab[data-panel="posHistory"]')?.addEventListener('click',loadPosHistory);
  q('#posHistSearch')?.addEventListener('input',renderPosHistory);
  q('#closePosReturn')?.addEventListener('click',()=>q('#posReturnModal').classList.add('hidden'));
  q('#posReturnModal')?.addEventListener('click',e=>{if(e.target.id==='posReturnModal')q('#posReturnModal').classList.add('hidden')});
  q('#posReturnConfirm')?.addEventListener('click',confirmReturn);

  document.querySelector('.admin-tab[data-panel="pos"]')?.addEventListener('click',()=>{renderSessionBar();loadPosProducts()});
  q('#posSearch')?.addEventListener('input',renderPosProducts);
  q('#posMethod')?.addEventListener('change',()=>{q('#posReceived').removeAttribute('data-touched');renderPosCart()});
  q('#posReceived')?.addEventListener('input',e=>{e.target.dataset.touched='1';updateChange()});
  q('#posCheckout')?.addEventListener('click',encaisser);
  renderSessionBar();
})();
