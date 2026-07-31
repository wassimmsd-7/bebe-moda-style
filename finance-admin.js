/* Connecte le panneau "Finance" : ventes caisse vs en ligne, charges du mois,
   et dernière clôture de caisse — calculés depuis les vraies données Supabase. */
(function(){
  const q=id=>document.querySelector(id);
  const dzMoney=n=>new Intl.NumberFormat('fr-DZ').format(Number(n)||0)+' DZD';

  async function loadFinance(){
    if(!window.bmsDb)return;
    const panel=q('#finance'); if(!panel)return;
    const monthStart=new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const [{data:posOrders},{data:onlineOrders},{data:expenses},{data:lastSession}]=await Promise.all([
      window.bmsDb.from('orders').select('total').eq('source','pos').neq('status','cancelled').gte('created_at',monthStart.toISOString()),
      window.bmsDb.from('orders').select('total').neq('source','pos').neq('status','cancelled').gte('created_at',monthStart.toISOString()),
      window.bmsDb.from('expenses').select('amount').gte('expense_date',monthStart.toISOString().slice(0,10)),
      window.bmsDb.from('cash_sessions').select('*').order('opened_at',{ascending:false}).limit(1)
    ]);
    const sum=(rows,key)=>((rows||[]).reduce((s,r)=>s+(Number(r[key])||0),0));
    const posTotal=sum(posOrders,'total'), onlineTotal=sum(onlineOrders,'total'), expTotal=sum(expenses,'amount');
    const grandTotal=posTotal+onlineTotal||1;
    const metrics=panel.querySelectorAll('.metric-grid article');
    if(metrics[0])metrics[0].innerHTML=`<span>Ventes caisse (ce mois)</span><b>${dzMoney(posTotal)}</b><small>${Math.round(posTotal/grandTotal*100)}% des ventes</small>`;
    if(metrics[1])metrics[1].innerHTML=`<span>Ventes en ligne (ce mois)</span><b>${dzMoney(onlineTotal)}</b><small>${Math.round(onlineTotal/grandTotal*100)}% des ventes</small>`;
    if(metrics[2])metrics[2].innerHTML=`<span>Charges (ce mois)</span><b>${dzMoney(expTotal)}</b><small>Toutes catégories confondues</small>`;
    const session=lastSession&&lastSession[0];
    const cashControl=q('#finance .panel-card p');
    if(cashControl){
      if(session&&session.closed_at){
        cashControl.innerHTML=`Dernière clôture (${new Date(session.closed_at).toLocaleDateString('fr-DZ')}) : <b>${dzMoney(session.closing_amount)}</b> · Ouverture : ${dzMoney(session.opening_amount)}`;
      }else if(session){
        cashControl.innerHTML=`Caisse actuellement ouverte depuis ${new Date(session.opened_at).toLocaleString('fr-DZ')} · Montant d'ouverture : ${dzMoney(session.opening_amount)}`;
      }else{
        cashControl.innerHTML=`Aucune session de caisse enregistrée pour le moment.`;
      }
    }
  }

  async function printDailyReport(){
    if(!window.bmsDb)return toast('Connectez Supabase pour générer le reçu journalier.');
    const dayStart=new Date(); dayStart.setHours(0,0,0,0);
    const {data:dayPayments,error}=await window.bmsDb.from('payments').select('method,amount,status').gte('received_at',dayStart.toISOString());
    if(error)return toast('Reçu indisponible : '+error.message);
    const methodLabel={cash:'Espèces',card:'Carte',transfer:'Virement',credit:'Crédit client',cod:'Paiement à la livraison',partial:'Partiel'};
    const byMethod={};
    (dayPayments||[]).forEach(p=>{if(p.status==='refunded')return;byMethod[p.method]=(byMethod[p.method]||0)+Number(p.amount)});
    const total=Object.values(byMethod).reduce((s,v)=>s+v,0);
    const rows=Object.keys(byMethod).map(m=>`<tr><td>${methodLabel[m]||m}</td><td style="text-align:right">${dzMoney(byMethod[m])}</td></tr>`).join('')||'<tr><td colspan="2">Aucun encaissement aujourd’hui.</td></tr>';
    const win=window.open('','_blank','width=380,height=600');
    if(!win)return toast('Autorisez les pop-ups pour imprimer le reçu.');
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Reçu journalier</title>
      <style>body{font-family:'Courier New',monospace;font-size:13px;padding:16px;color:#111}h1{font-size:16px;text-align:center;margin:0}
      p.center{text-align:center;margin:2px 0 12px;font-size:11px}table{width:100%;border-collapse:collapse;margin:10px 0}
      td{padding:3px 0;border-bottom:1px dashed #999}.totals td{border:0;font-weight:bold}hr{border:none;border-top:1px dashed #999}</style></head><body>
      <h1>Bébé Moda Style</h1><p class="center">Reçu journalier — ${new Date().toLocaleDateString('fr-DZ')}</p>
      <hr><table>${rows}</table><hr>
      <table class="totals"><tr><td>Total encaissé</td><td style="text-align:right">${dzMoney(total)}</td></tr></table>
      <p class="center">Document généré automatiquement.</p>
      <script>window.onload=()=>{window.print()}</script></body></html>`);
    win.document.close();
  }

  document.querySelector('#printDailyReport')?.addEventListener('click',printDailyReport);
  document.querySelector('.admin-tab[data-panel="finance"]')?.addEventListener('click',loadFinance);
  window.bmsRefreshFinance=loadFinance;
})();
