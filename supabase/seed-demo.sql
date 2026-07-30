-- Données de démonstration Bébé Moda Style.
-- Exécuter APRÈS schema.sql dans Supabase > SQL Editor.
-- Remplacez ensuite les fournisseurs et prix par vos données réelles.

insert into public.categories(slug,name_fr,name_ar,name_en,name_dz,sort_order) values
 ('naissance','Naissance & 0–6 mois','حديثو الولادة و0–6 أشهر','Newborn & 0–6 months','البيبي الصغير',1),
 ('vetements','Vêtements bébé','ملابس أطفال','Baby clothing','حوايج البيبي',2),
 ('repas','Repas & soins','الأكل والعناية','Feeding & care','الماكلة والعناية',3),
 ('eveil','Éveil & jouets','الألعاب والتطوير','Toys & development','اللعب والتطوير',4),
 ('chaussures','Chaussures & accessoires','أحذية وإكسسوارات','Shoes & accessories','صباط وإكسسوارات',5)
on conflict(slug) do update set name_fr=excluded.name_fr,name_ar=excluded.name_ar,name_en=excluded.name_en,name_dz=excluded.name_dz,sort_order=excluded.sort_order;

insert into public.suppliers(name,contact_name,phone,address,notes)
select 'Fournisseur textile (à remplacer)','Responsable achats','', 'Algérie', 'Exemple : remplacez par votre vrai fournisseur.'
where not exists(select 1 from public.suppliers where name='Fournisseur textile (à remplacer)');
insert into public.suppliers(name,contact_name,phone,address,notes)
select 'Fournisseur puériculture (à remplacer)','Responsable achats','', 'Algérie', 'Exemple : remplacez par votre vrai fournisseur.'
where not exists(select 1 from public.suppliers where name='Fournisseur puériculture (à remplacer)');

insert into public.products(sku,category_id,supplier_id,name_fr,name_ar,name_en,name_dz,description_fr,age_group,purchase_price,sale_price,stock_quantity,reorder_level,published,seasonal) values
 ('BMS-001',(select id from public.categories where slug='naissance'),(select id from public.suppliers where name='Fournisseur textile (à remplacer)'),'Ensemble nuage en coton','طقم سحابة قطني','Cotton cloud set','طقم السحاب القطني','Ensemble doux en coton pour les premiers mois.', '0-6',1450,2890,24,5,true,false),
 ('BMS-002',(select id from public.categories where slug='eveil'),(select id from public.suppliers where name='Fournisseur puériculture (à remplacer)'),'Doudou lapin douceur','دمية أرنب ناعمة','Soft bunny comforter','أرنب ناعم','Doudou réconfortant et doux.', '0-6',820,1950,5,6,true,false),
 ('BMS-003',(select id from public.categories where slug='vetements'),(select id from public.suppliers where name='Fournisseur textile (à remplacer)'),'Look mini aventurier','طقم المغامر الصغير','Mini adventurer look','لوك المغامر الصغير','Tenue légère pour les sorties.', '6-18',2350,4590,0,5,true,true),
 ('BMS-004',(select id from public.categories where slug='repas'),(select id from public.suppliers where name='Fournisseur puériculture (à remplacer)'),'Coffret repas silicone','طقم أكل سيليكون','Silicone feeding set','طقم الماكلة سيليكون','Assiette, cuillère et bavoir en silicone.', '6-18',1800,3750,12,5,true,false),
 ('BMS-005',(select id from public.categories where slug='vetements'),(select id from public.suppliers where name='Fournisseur textile (à remplacer)'),'Pyjama étoiles 2 pièces','بيجاما نجوم قطعتين','Two-piece star pyjama','بيجاما النجوم','Pyjama confortable pour la nuit.', '18-36',1620,3490,3,6,true,false),
 ('BMS-006',(select id from public.categories where slug='chaussures'),(select id from public.suppliers where name='Fournisseur textile (à remplacer)'),'Chaussures premiers pas','حذاء الخطوات الأولى','First steps shoes','صباط الخطوات الأولى','Chaussures souples et confortables.', '18-36',2190,4250,18,5,true,false),
 ('BMS-007',(select id from public.categories where slug='vetements'),(select id from public.suppliers where name='Fournisseur textile (à remplacer)'),'Chapeau léger soleil','قبعة شمس خفيفة','Light sun hat','شاشية الشمس','Chapeau léger pour l’été.', '6-18',690,1690,8,5,true,true),
 ('BMS-008',(select id from public.categories where slug='eveil'),(select id from public.suppliers where name='Fournisseur puériculture (à remplacer)'),'Tapis d’éveil safari','بساط لعب سفاري','Safari activity mat','طابلة اللعب سفاري','Tapis d’éveil avec activités.', '0-6',4700,8990,2,4,true,false)
on conflict(sku) do update set name_fr=excluded.name_fr,name_ar=excluded.name_ar,name_en=excluded.name_en,name_dz=excluded.name_dz,description_fr=excluded.description_fr,purchase_price=excluded.purchase_price,sale_price=excluded.sale_price,stock_quantity=excluded.stock_quantity,reorder_level=excluded.reorder_level,published=excluded.published,seasonal=excluded.seasonal;
