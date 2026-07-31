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

  document.querySelector('.admin-tab[data-panel="finance"]')?.addEventListener('click',loadFinance);
  window.bmsRefreshFinance=loadFinance;
})();
