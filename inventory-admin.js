/* Gestion réelle des produits : disponible uniquement après connexion Supabase. */
(function(){
  const modal=document.querySelector('#productModal');
  const form=document.querySelector('#productForm');
  const message=document.querySelector('#productMessage');
  const oldButton=document.querySelector('#addProduct');
  const button=oldButton.cloneNode(true);
  oldButton.replaceWith(button);

  /* Remarque : le chargement réel du stock (avec images, édition, suppression)
     est géré par media-manager.js, qui écoute déjà l'onglet "Produits & stock".
     Ce fichier ne gère plus que l'ouverture du formulaire d'ajout, pour éviter
     un double chargement qui écrasait les photos/statuts de publication. */
  const field=id=>document.querySelector(id);
  const close=()=>{modal.classList.add('hidden');message.textContent=''};

  button.addEventListener('click',()=>{if(!window.bmsDb)return toast('Connectez Supabase avant d’ajouter un produit.');modal.classList.remove('hidden');field('#productSku').focus()});
  field('#closeProduct').addEventListener('click',close);
  modal.addEventListener('click',event=>{if(event.target===modal)close()});
  /* La soumission du formulaire (ajout ET modification, avec photos) est gérée
     par media-manager.js, qui remplace ce <form> par un clone juste après ce script. */
})();
