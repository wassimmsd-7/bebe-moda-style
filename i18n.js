/* Traduction de l'interface boutique (FR / AR / EN) + bascule RTL pour l'arabe.
   L'espace propriétaire (back-office) reste en français dans cette phase. */
const I18N = {
  fr: {
    'announcement':"Livraison disponible partout en Algérie · Paiement à la livraison",
    'nav.shop':"Boutique",'nav.advice':"Conseils parents",'nav.tracking':"Suivre ma commande",
    'theme.toggle':"Mode sombre",'cart.label':"Panier",'menu.label':"Menu",
    'hero.eyebrow':"LA DOUCEUR AU QUOTIDIEN",'hero.title':'Chaque petit moment mérite le <em>meilleur.</em>',
    'hero.desc':"Vêtements, éveil et essentiels soigneusement choisis pour les bébés de 0 à 36 mois et plus.",
    'hero.cta':"Découvrir la collection",'hero.secondary':"Conseils d'experts →",
    'trust.cod':"✓ Paiement à la livraison",'trust.exchange':"✓ Échange facile",'trust.delivery':"✓ Livraison Algérie & monde",
    'hero.badge':"Confort & tendresse",
    'category.all':"Tous les essentiels",'category.0-6':"0–6 mois",'category.6-18':"6–18 mois",'category.18-36':"18–36 mois",'category.season':"Collection été",
    'products.eyebrow':"NOS COUPS DE CŒUR",'products.title':"Tout pour grandir avec style",'products.search':"Rechercher un produit...",'products.empty':"Aucun produit trouvé.",
    'promise.title':"Des produits pensés pour la vraie vie",'promise.desc':"Des matières confortables, des pièces faciles à vivre et des parents bien accompagnés.",
    'promise.stat1':"familles heureuses",'promise.stat2':"avis clients",'promise.stat3':"livraison locale",
    'advice.eyebrow':"LE COIN DES PARENTS",'advice.title':"Grandir sereinement, ensemble.",'advice.lead':"Des repères simples préparés avec des professionnels pour vous accompagner à chaque étape.",
    'advice.art1':"Préparer un sommeil plus doux",'advice.art2':"Les essentiels pour la diversification",'advice.art3':"Encourager l'autonomie avec bienveillance",'advice.link':"Lire le conseil →",
    'tracking.eyebrow':"SUIVI DE COMMANDE",'tracking.title':"Où est votre petit bonheur ?",'tracking.lead':"Entrez votre numéro de commande et votre téléphone.",
    'tracking.orderPh':"Ex. BMS-2026-1042",'tracking.phonePh':"Votre téléphone",'tracking.btn':"Suivre ma commande",
    'tracking.status':"En préparation",'tracking.resultText':"Votre commande est soigneusement préparée. Nous vous contacterons avant l'expédition.",
    'cart.eyebrow':"VOTRE SÉLECTION",'cart.title':"Mon panier",'cart.summary':"Récapitulatif",'cart.subtotal':"Sous-total",'cart.delivery':"Livraison",'cart.deliveryValue':"Selon wilaya",'cart.total':"Total",
    'cart.checkoutBtn':"Commander par paiement à la livraison",'cart.smallNote':"Vous serez contacté pour confirmer votre commande.",
    'cart.namePh':"Nom et prénom",'cart.phonePh':"Téléphone (WhatsApp si possible)",'cart.wilayaPh':"Wilaya",'cart.addressPh':"Adresse complète de livraison",'cart.notePh':"Note pour la commande (facultatif)",
    'cart.confirmBtn':"Confirmer ma commande COD",'cart.empty':"Votre panier est encore vide. Découvrez nos essentiels tout doux.",
    'owner.fab':"Espace propriétaire",
    'quickview.qty':"Quantité",'quickview.add':"Ajouter au panier",'quickview.outOfStock':"Rupture de stock",
    'quickview.lowStock':"Il ne reste que {n} en stock.",'quickview.restock':"Ce produit reviendra bientôt en stock.",
    'quickview.defaultDesc':"Une pièce douce et confortable, pensée pour le confort de bébé au quotidien.",
    'toast.added':"Ajouté au panier ✨",'toast.cartEmpty':"Votre panier est vide.",'toast.orderPlaced':"Commande {n} reçue ! Nous vous contacterons bientôt.",
    'toast.orderDemo':"Mode démo : renseignez Supabase pour envoyer cette commande à votre base.",'toast.maxQty':"Quantité maximale disponible atteinte."
  },
  ar: {
    'announcement':"التوصيل متوفر في جميع أنحاء الجزائر · الدفع عند الاستلام",
    'nav.shop':"المتجر",'nav.advice':"نصائح للوالدين",'nav.tracking':"تتبع طلبيتي",
    'theme.toggle':"الوضع الداكن",'cart.label':"السلة",'menu.label':"القائمة",
    'hero.eyebrow':"الرقة في كل يوم",'hero.title':'كل لحظة صغيرة تستحق <em>الأفضل.</em>',
    'hero.desc':"ملابس، ألعاب تحفيزية وأساسيات مختارة بعناية لأطفالكم من 0 إلى 36 شهرًا وأكثر.",
    'hero.cta':"اكتشفي المجموعة",'hero.secondary':"نصائح الخبراء ←",
    'trust.cod':"✓ الدفع عند الاستلام",'trust.exchange':"✓ تبديل سهل",'trust.delivery':"✓ توصيل داخل الجزائر وخارجها",
    'hero.badge':"راحة وحنان",
    'category.all':"كل الأساسيات",'category.0-6':"0–6 أشهر",'category.6-18':"6–18 شهرًا",'category.18-36':"18–36 شهرًا",'category.season':"مجموعة الصيف",
    'products.eyebrow':"مفضلاتنا",'products.title':"كل ما يحتاجه طفلك بأناقة",'products.search':"ابحثي عن منتج...",'products.empty':"لم يتم العثور على أي منتج.",
    'promise.title':"منتجات مصممة للحياة اليومية",'promise.desc':"أقمشة مريحة وقطع عملية، مع مرافقة حقيقية للوالدين.",
    'promise.stat1':"عائلة سعيدة",'promise.stat2':"تقييم من العملاء",'promise.stat3':"توصيل محلي",
    'advice.eyebrow':"ركن الوالدين",'advice.title':"لنكبر معًا براحة بال.",'advice.lead':"إرشادات بسيطة أعدها متخصصون لمرافقتكم في كل مرحلة.",
    'advice.art1':"تحضير نوم أهدأ",'advice.art2':"أساسيات التنويع الغذائي",'advice.art3':"تشجيع الاستقلالية بلطف",'advice.link':"اقرئي النصيحة ←",
    'tracking.eyebrow':"تتبع الطلب",'tracking.title':"أين وصلت سعادتك الصغيرة؟",'tracking.lead':"أدخلي رقم طلبيتك ورقم هاتفك.",
    'tracking.orderPh':"مثال: BMS-2026-1042",'tracking.phonePh':"رقم هاتفك",'tracking.btn':"تتبع طلبيتي",
    'tracking.status':"قيد التحضير",'tracking.resultText':"طلبيتك قيد التحضير بعناية. سنتصل بك قبل الشحن.",
    'cart.eyebrow':"اختياراتك",'cart.title':"سلتي",'cart.summary':"ملخص الطلب",'cart.subtotal':"المجموع الفرعي",'cart.delivery':"التوصيل",'cart.deliveryValue':"حسب الولاية",'cart.total':"المجموع",
    'cart.checkoutBtn':"اطلبي بالدفع عند الاستلام",'cart.smallNote':"سيتم التواصل معك لتأكيد طلبيتك.",
    'cart.namePh':"الاسم الكامل",'cart.phonePh':"الهاتف (واتساب إن أمكن)",'cart.wilayaPh':"الولاية",'cart.addressPh':"العنوان الكامل للتوصيل",'cart.notePh':"ملاحظة على الطلب (اختياري)",
    'cart.confirmBtn':"تأكيد الطلب (الدفع عند الاستلام)",'cart.empty':"سلتك لا تزال فارغة. اكتشفي أساسياتنا الناعمة.",
    'owner.fab':"مساحة المالك",
    'quickview.qty':"الكمية",'quickview.add':"أضيفي إلى السلة",'quickview.outOfStock':"نفدت الكمية",
    'quickview.lowStock':"لم يتبق سوى {n} في المخزون.",'quickview.restock':"سيتوفر هذا المنتج قريبًا.",
    'quickview.defaultDesc':"قطعة ناعمة ومريحة، صُممت لراحة طفلك يوميًا.",
    'toast.added':"أُضيف إلى السلة ✨",'toast.cartEmpty':"سلتك فارغة.",'toast.orderPlaced':"تم استلام طلبك {n}! سنتواصل معك قريبًا.",
    'toast.orderDemo':"وضع تجريبي: يرجى إعداد Supabase لإرسال هذا الطلب إلى قاعدة بياناتك.",'toast.maxQty':"تم بلوغ الكمية القصوى المتوفرة."
  },
  en: {
    'announcement':"Delivery available across Algeria · Cash on delivery",
    'nav.shop':"Shop",'nav.advice':"Parenting tips",'nav.tracking':"Track my order",
    'theme.toggle':"Dark mode",'cart.label':"Cart",'menu.label':"Menu",
    'hero.eyebrow':"SOFTNESS EVERY DAY",'hero.title':'Every little moment deserves the <em>best.</em>',
    'hero.desc':"Clothing, playtime essentials and baby must-haves, carefully chosen for babies from 0 to 36 months and beyond.",
    'hero.cta':"Discover the collection",'hero.secondary':"Expert tips →",
    'trust.cod':"✓ Cash on delivery",'trust.exchange':"✓ Easy exchange",'trust.delivery':"✓ Delivery across Algeria & abroad",
    'hero.badge':"Comfort & tenderness",
    'category.all':"All essentials",'category.0-6':"0–6 months",'category.6-18':"6–18 months",'category.18-36':"18–36 months",'category.season':"Summer collection",
    'products.eyebrow':"OUR FAVOURITES",'products.title':"Everything to grow up in style",'products.search':"Search a product...",'products.empty':"No products found.",
    'promise.title':"Products made for real life",'promise.desc':"Comfortable fabrics, easy-to-live-with pieces, and parents well supported.",
    'promise.stat1':"happy families",'promise.stat2':"customer reviews",'promise.stat3':"local delivery",
    'advice.eyebrow':"PARENTS' CORNER",'advice.title':"Growing up serenely, together.",'advice.lead':"Simple guidance prepared with professionals to support you at every stage.",
    'advice.art1':"Preparing for gentler sleep",'advice.art2':"Essentials for starting solids",'advice.art3':"Encouraging independence with care",'advice.link':"Read the tip →",
    'tracking.eyebrow':"ORDER TRACKING",'tracking.title':"Where is your little bundle of joy?",'tracking.lead':"Enter your order number and your phone number.",
    'tracking.orderPh':"e.g. BMS-2026-1042",'tracking.phonePh':"Your phone number",'tracking.btn':"Track my order",
    'tracking.status':"Being prepared",'tracking.resultText':"Your order is being carefully prepared. We'll contact you before shipping.",
    'cart.eyebrow':"YOUR SELECTION",'cart.title':"My cart",'cart.summary':"Summary",'cart.subtotal':"Subtotal",'cart.delivery':"Delivery",'cart.deliveryValue':"Based on wilaya",'cart.total':"Total",
    'cart.checkoutBtn':"Order with cash on delivery",'cart.smallNote':"You'll be contacted to confirm your order.",
    'cart.namePh':"Full name",'cart.phonePh':"Phone (WhatsApp if possible)",'cart.wilayaPh':"Wilaya",'cart.addressPh':"Full delivery address",'cart.notePh':"Note for the order (optional)",
    'cart.confirmBtn':"Confirm my COD order",'cart.empty':"Your cart is still empty. Discover our soft essentials.",
    'owner.fab':"Owner area",
    'quickview.qty':"Quantity",'quickview.add':"Add to cart",'quickview.outOfStock':"Out of stock",
    'quickview.lowStock':"Only {n} left in stock.",'quickview.restock':"This product will be back in stock soon.",
    'quickview.defaultDesc':"A soft, comfortable piece designed for your baby's everyday comfort.",
    'toast.added':"Added to cart ✨",'toast.cartEmpty':"Your cart is empty.",'toast.orderPlaced':"Order {n} received! We'll contact you soon.",
    'toast.orderDemo':"Demo mode: set up Supabase to send this order to your database.",'toast.maxQty':"Maximum available quantity reached."
  }
};
const I18N_LANGS = ['fr','ar','en'];
let currentLang = (localStorage.getItem('bms-lang')||'fr');
if(!I18N_LANGS.includes(currentLang))currentLang='fr';

function t(key,vars){
  let str = (I18N[currentLang]&&I18N[currentLang][key]) || I18N.fr[key] || key;
  if(vars)Object.keys(vars).forEach(k=>{str=str.replace('{'+k+'}',vars[k])});
  return str;
}
function pname(p){ // nom du produit dans la langue active, avec repli sur le français
  if(currentLang==='ar'&&p.name_ar)return p.name_ar;
  if(currentLang==='en'&&p.name_en)return p.name_en;
  return p.name;
}
function catLabel(p){ // libellé de catégorie/tranche d'âge dans la langue active
  const key='category.'+(p.age||'all');
  return (I18N[currentLang]&&I18N[currentLang][key])||I18N.fr[key]||p.category||'';
}
function applyStaticI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n)});
  document.querySelectorAll('[data-i18n-html]').forEach(el=>{el.innerHTML=t(el.dataset.i18nHtml)});
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{el.placeholder=t(el.dataset.i18nPlaceholder)});
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{el.title=t(el.dataset.i18nTitle)});
  document.querySelectorAll('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',t(el.dataset.i18nAria))});
}
function setLanguage(lang){
  if(!I18N_LANGS.includes(lang))lang='fr';
  currentLang=lang; localStorage.setItem('bms-lang',lang);
  document.documentElement.lang=lang;
  document.documentElement.dir=(lang==='ar')?'rtl':'ltr';
  const btn=document.querySelector('#languageToggle'); if(btn){btn.textContent=lang.toUpperCase();btn.dataset.lang=lang}
  applyStaticI18n();
  if(typeof renderProducts==='function')renderProducts();
  if(document.querySelector('#cart')?.classList.contains('active')&&typeof renderCart==='function')renderCart();
}
document.addEventListener('DOMContentLoaded',()=>setLanguage(currentLang));
if(document.readyState!=='loading')setLanguage(currentLang);
