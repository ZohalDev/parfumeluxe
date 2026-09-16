import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ChevronRight, Calendar, Clock, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ARTICLES = [{"title":"Les 10 Meilleurs Parfums pour Homme en 2026 : Notre Sélection Élite","paragraphs":[{"type":"p","text":"Meta Title : Les 10 Meilleurs Parfums pour Homme en 2026"},{"type":"p","text":"Meta Description : Découvrez notre sélection des 10 meilleurs parfums pour homme en 2026 : fragrances tendances, durables et irrésistibles."},{"type":"p","text":"Slug : /blog/meilleurs-parfums-homme-2026"},{"type":"h2","text":"Pourquoi le choix d'un parfum est-il si important pour un homme ?"},{"type":"p","text":"Un parfum est une signature invisible mais inoubliable. Il dit qui vous êtes avant même que vous ayez prononcé un mot. Des études montrent que le sens olfactif est directement lié à la mémoire et aux émotions — un bon parfum peut donc laisser une impression durable, renforcer votre confiance et même influencer la perception des autres."},{"type":"p","text":"Choisir le bon parfum homme, c'est donc bien plus qu'une question d'esthétique. C'est une déclaration d'identité."},{"type":"h2","text":"Notre Top 10 des Parfums Homme en 2026"},{"type":"h3","text":"1. Bleu de Chanel Eau de Parfum"},{"type":"p","text":"Un classique indémodable. Bleu de Chanel offre un équilibre parfait entre fraîcheur et profondeur boisée. Notes de citron, de gingembre et de santal, avec un sillage élégant qui dure toute la journée. Idéal pour les hommes modernes qui cherchent à allier sobriété et charisme."},{"type":"h3","text":"2. Dior Sauvage Elixir"},{"type":"p","text":"Le plus vendu en Europe pour la troisième année consécutive. Sauvage Elixir est une concentration intense et animale. Un mélange de bergamote, de gingembre cannelle et d'olibanum qui envoûte littéralement. Pour l'homme qui ose."},{"type":"h3","text":"3. Tom Ford Oud Wood"},{"type":"p","text":"Un chef-d'œuvre pour les amateurs de fragrances orientales. Le bois de oud, la vanille et le vétiver créent une profondeur rare. Oud Wood est le parfum de ceux qui veulent se démarquer dans le luxe discret."},{"type":"h3","text":"4. Creed Aventus"},{"type":"p","text":"La référence en termes de statut et de puissance. Ananas, bouleau fumé, mousse de chêne et ambre. Aventus incarne la réussite et l'ambition. Un parfum d'exception à chaque occasion."},{"type":"h3","text":"5. Yves Saint Laurent L'Homme Intense"},{"type":"p","text":"Une version enrichie et séduisante de la gamme L'Homme. Des notes de cèdre, de gingembre et de vétiver pour un résultat masculin, solide et enveloppant."},{"type":"h2","text":"Comment porter ces parfums au quotidien ?"},{"type":"p","text":"Appliquez sur les points de chaleur : poignets, cou, derrière les oreilles, creux du coude."},{"type":"p","text":"Ne frottez pas — laissez le parfum se diffuser naturellement."},{"type":"p","text":"Hydratez votre peau avant : le parfum tient mieux sur peau hydratée."},{"type":"h2","text":"Conclusion"},{"type":"p","text":"Que vous soyez à la recherche d'un parfum quotidien, d'un sillage puissant pour les grandes occasions ou d'un cadeau élégant, notre sélection 2026 vous offre le meilleur de la parfumerie masculine."},{"type":"h2","text":"FAQ"},{"type":"p","text":"Quel est le parfum homme le plus populaire en 2026 ? Dior Sauvage Elixir reste le parfum le plus vendu en 2026, grâce à son sillage intense et à sa polyvalence."},{"type":"p","text":"Quelle est la différence entre un parfum et une eau de toilette pour homme ? La concentration en huiles essentielles est plus élevée dans un parfum (15-20%) que dans une eau de toilette (5-15%)."},{"type":"p","text":"Quel parfum homme choisir pour une première impression réussie ? Pour une première impression mémorable, optez pour Creed Aventus ou Bleu de Chanel EDP."}]},{"title":"Les 10 Meilleurs Parfums pour Femme en 2026 : Élégance et Séduction","paragraphs":[{"type":"p","text":"Meta Title : Les 10 Meilleurs Parfums pour Femme en 2026"},{"type":"p","text":"Slug : /blog/meilleurs-parfums-femme-2026"},{"type":"h2","text":"L'art de choisir son parfum féminin"},{"type":"p","text":"Un parfum pour femme est une extension de la personnalité. Il se transforme au contact de la peau, révèle des facettes inattendues, et crée une empreinte mémorable."},{"type":"h2","text":"Le Top 10 des Parfums Femme en 2026"},{"type":"h3","text":"1. Chanel N°5 L'Eau"},{"type":"p","text":"L'icône absolue, modernisée. La version L'Eau du mythique N°5 offre une version plus légère et contemporaine, avec ses notes d'ylang-ylang, de rose et de musc blanc."},{"type":"h3","text":"2. Dior Miss Dior Blooming Bouquet"},{"type":"p","text":"La fraîcheur incarnée. Une explosion de pivoine, de rose et de musc doux qui évoque la légèreté et la joie."},{"type":"h3","text":"3. Lancôme La Vie Est Belle"},{"type":"p","text":"Un succès mondial depuis plus d'une décennie. Iris, praline, patchouli et vanille composent cette ode au bonheur féminin."},{"type":"h3","text":"4. YSL Black Opium"},{"type":"p","text":"La rebelle séduisante. Café noir, jasmin blanc et vanille créent un contraste saisissant, electrisant, addictif."},{"type":"h3","text":"5. Guerlain Mon Guerlain"},{"type":"p","text":"Un hymne à la féminité française. La lavande de Provence, la vanille Tahitia et le santal blanc composent un accord à la fois doux, profond et poétique."},{"type":"h2","text":"Conclusion"},{"type":"p","text":"En 2026, les parfums féminins atteignent des sommets de créativité et de sophistication."}]},{"title":"Comment Choisir le Parfum Idéal selon Votre Personnalité","paragraphs":[{"type":"p","text":"Slug : /blog/choisir-parfum-selon-personnalite"},{"type":"h2","text":"Comprendre les familles olfactives"},{"type":"p","text":"Avant de choisir votre parfum, il est essentiel de comprendre les grandes familles olfactives. Chacune raconte une histoire différente et correspond à des traits de caractère particuliers."},{"type":"h3","text":"Les parfums floraux"},{"type":"p","text":"Les fragrances florales — rose, jasmin, pivoine, iris — évoquent la douceur, le romantisme et la féminité. Elles s'adressent aux personnalités sensibles, créatives et en harmonie avec leurs émotions."},{"type":"h3","text":"Les parfums boisés"},{"type":"p","text":"Santal, cèdre, oud, vétiver : les boisés symbolisent la force, la profondeur et la masculinité."},{"type":"h3","text":"Les parfums orientaux"},{"type":"p","text":"Vanille, ambre, encens, musc : les orientaux sont chauds, sensuels et mystérieux."},{"type":"h2","text":"Quel parfum pour quelle personnalité ?"},{"type":"h3","text":"Vous êtes romantique et sensible"},{"type":"p","text":"Optez pour un floral doux comme Guerlain Mon Guerlain, Jo Malone Peony & Blush Suede ou Chanel Chance Eau Tendre."},{"type":"h3","text":"Vous êtes ambitieux et charismatique"},{"type":"p","text":"Les boisés intenses et les orientaux puissants sont vos alliés. Creed Aventus, Dior Sauvage Elixir ou Tom Ford Oud Wood projettent confiance et magnétisme."},{"type":"h2","text":"Conseils pratiques"},{"type":"p","text":"Testez toujours sur peau, jamais sur papier — votre chimie cutanée transforme le parfum."},{"type":"p","text":"Attendez 20 à 30 minutes avant de juger : les notes de fond sont les plus révélatrices."}]},{"title":"Eau de Parfum ou Eau de Toilette : Quelle Différence Choisir ?","paragraphs":[{"type":"p","text":"Slug : /blog/difference-eau-de-parfum-eau-de-toilette"},{"type":"h2","text":"Qu'est-ce que la concentration d'un parfum ?"},{"type":"p","text":"La concentration d'un parfum désigne le pourcentage de composés odorants dissous dans un mélange d'alcool et d'eau. Plus la concentration est élevée, plus le parfum est intense et persistant."},{"type":"h3","text":"L'Eau de Cologne (EDC) — 2 à 5 %"},{"type":"p","text":"La concentration la plus faible. Légère, fraîche et éphémère. Elle ne tient que 1 à 2 heures."},{"type":"h3","text":"L'Eau de Toilette (EDT) — 5 à 15 %"},{"type":"p","text":"Le format le plus vendu dans le monde. L'EDT offre un bon équilibre entre légèreté et présence. Elle tient généralement entre 3 et 6 heures."},{"type":"h3","text":"L'Eau de Parfum (EDP) — 15 à 20 %"},{"type":"p","text":"Un niveau de concentration plus élevé, pour une expérience plus riche et plus durable. L'EDP tient entre 6 et 8 heures."},{"type":"h3","text":"Le Parfum / Extrait — 20 à 40 %"},{"type":"p","text":"Le nec plus ultra de la concentration. L'extrait peut tenir plus de 12 heures. Quelques touches suffisent."},{"type":"h2","text":"EDP vs EDT : laquelle choisir ?"},{"type":"p","text":"La réponse dépend de plusieurs facteurs : votre mode de vie, votre budget, la saison, l'occasion et vos préférences personnelles."}]},{"title":"Comment Faire Tenir son Parfum Plus Longtemps : 10 Astuces d'Experts","paragraphs":[{"type":"p","text":"Slug : /blog/faire-tenir-parfum-plus-longtemps"},{"type":"h2","text":"1. Hydratez votre peau avant d'appliquer le parfum"},{"type":"p","text":"C'est sans doute le conseil le plus important : une peau bien hydratée retient beaucoup mieux les molécules odorantes."},{"type":"h2","text":"2. Ciblez les points de chaleur"},{"type":"p","text":"Les zones de chaleur de votre corps amplifient la diffusion du parfum : poignets, creux du coude, cou, décolleté."},{"type":"h2","text":"3. Ne frottez pas vos poignets"},{"type":"p","text":"En frottant vos poignets après avoir vaporisé, vous brisez mécaniquement les molécules odorantes. Laissez le parfum se poser naturellement."},{"type":"h2","text":"4. Vaporisez dans les cheveux"},{"type":"p","text":"Les cheveux sont d'excellents diffuseurs de parfum. Vaporisez légèrement dans les airs et passez les cheveux dans le nuage."},{"type":"h2","text":"5. Choisissez un parfum concentré (EDP ou Extrait)"},{"type":"p","text":"Si la longévité est votre priorité, misez sur les concentrations élevées. Une EDP tient 6 à 8 heures, un Extrait plus de 12 heures."}]},{"title":"Les Meilleurs Parfums pour l'Été 2026 : Fraîcheur, Légèreté et Éclat","paragraphs":[{"type":"p","text":"Slug : /blog/meilleurs-parfums-ete"},{"type":"h2","text":"Quelles fragrances privilégier en été ?"},{"type":"p","text":"Sous la chaleur, les molécules aromatiques se diffusent plus vite. Il faut éviter les parfums trop lourds qui peuvent devenir oppressants."},{"type":"h2","text":"Les meilleurs parfums d'été pour femme"},{"type":"h3","text":"Chanel Chance Eau Fraîche"},{"type":"p","text":"La quintessence de la légèreté estivale. Citron vert, jacinthe d'eau et teck créent une fraîcheur aquatique et florale absolument irrésistible."},{"type":"h3","text":"Jo Malone Wood Sage & Sea Salt"},{"type":"p","text":"Une fragrance marine, minérale et naturelle qui évoque les côtes et les embruns. Unique, aérien, dépaysant."},{"type":"h2","text":"Les meilleurs parfums d'été pour homme"},{"type":"h3","text":"Acqua di Gio — Giorgio Armani EDT"},{"type":"p","text":"Le parfum balnéaire masculin par excellence. Marine, bergamote et musc blanc créent un accord iodé et frais."}]},{"title":"Les Meilleurs Parfums pour l'Hiver 2026 : Chaleur, Sensualité et Profondeur","paragraphs":[{"type":"p","text":"Slug : /blog/meilleurs-parfums-hiver"},{"type":"h2","text":"Pourquoi choisir un parfum différent en hiver ?"},{"type":"p","text":"La chimie olfactive est directement influencée par la température. Par temps froid, les molécules aromatiques se diffusent plus lentement, permettant aux notes de fond de s'exprimer pleinement."},{"type":"h2","text":"Les meilleures fragrances d'hiver pour femme"},{"type":"h3","text":"Lancôme La Nuit Trésor"},{"type":"p","text":"Un sillage irrésistible pour les soirées hivernales. Rose, framboises noires, vanille et héliotrope."},{"type":"h3","text":"Tom Ford Black Orchid"},{"type":"p","text":"Orchidée noire, truffe, épices orientales et bois de santal : un vortex olfactif profond et envoûtant."},{"type":"h2","text":"Les meilleures fragrances d'hiver pour homme"},{"type":"h3","text":"Tom Ford Tobacco Vanille"},{"type":"p","text":"Tabac, vanille, épices et bois de cacao : l'archétype du parfum hivernal. Chaleureux, gourmand et absolument addictif."}]},{"title":"Les Parfums les Plus Puissants en Tenue et en Sillage : Notre Sélection 2026","paragraphs":[{"type":"p","text":"Slug : /blog/parfums-plus-puissants-tenue-sillage"},{"type":"h2","text":"Qu'est-ce que le sillage d'un parfum ?"},{"type":"p","text":"Le sillage désigne la traîne olfactive qu'un parfum laisse derrière soi. Un grand sillage, c'est être présent olfactivement même après avoir quitté la pièce."},{"type":"h2","text":"Les ingrédients qui assurent la puissance"},{"type":"p","text":"L'oud : notes animales, profondes et persistantes. L'ambre et la vanille : bases chaudes qui ancrent le parfum. Le patchouli : molécule puissante et fixateur naturel. Le musc : la colle qui retient toutes les autres notes."},{"type":"h2","text":"Top des parfums les plus puissants pour homme"},{"type":"h3","text":"Dior Sauvage Elixir — Tenue 12h+"},{"type":"p","text":"La version la plus concentrée et la plus intense de la gamme Sauvage. Un accord boisé musqué avec cannelle, bergamote et olibanum."},{"type":"h3","text":"Creed Aventus — Extrait"},{"type":"p","text":"La version Extrait est d'une puissance olfactive extraordinaire. Quelques gouttes suffisent pour une présence qui dure 24 heures."}]},{"title":"Les Meilleurs Parfums à Offrir en Cadeau en 2026 : Guide Complet","paragraphs":[{"type":"p","text":"Slug : /blog/meilleurs-parfums-cadeau"},{"type":"h2","text":"Comment choisir un parfum pour quelqu'un d'autre ?"},{"type":"p","text":"Avant de choisir, posez-vous ces questions essentielles : personnalité du destinataire, ses parfums habituels, l'occasion, votre budget."},{"type":"h2","text":"Les meilleurs parfums cadeaux pour elle"},{"type":"h3","text":"Chanel N°5 — L'indétrônable classique"},{"type":"p","text":"Offrir Chanel N°5, c'est offrir un morceau de légende. Impossible de se tromper avec ce parfum universel et sophistiqué."},{"type":"h3","text":"Dior Miss Dior Blooming Bouquet"},{"type":"p","text":"Frais, floral et romantique, ce parfum convient parfaitement aux jeunes femmes et aux esprits romantiques."},{"type":"h2","text":"Les meilleurs parfums cadeaux pour lui"},{"type":"h3","text":"Dior Sauvage EDT"},{"type":"p","text":"Le parfum masculin le plus offert en France depuis 5 ans. Son accord frais-boisé est universellement apprécié."},{"type":"h2","text":"Idées cadeaux par occasion"},{"type":"p","text":"Saint-Valentin : orientaux sensuels. Fête des mères : floraux doux. Noël : orientaux et boisés chaleureux."}]},{"title":"Comment Reconnaître un Parfum Original d'une Contrefaçon : Guide Complet","paragraphs":[{"type":"p","text":"Slug : /blog/reconnaitre-parfum-original-contrefacon"},{"type":"h2","text":"Vérifier le flacon et l'emballage"},{"type":"h3","text":"La qualité du verre"},{"type":"p","text":"Les grands parfumeurs utilisent du verre épais, lourd et parfaitement transparent. Un flacon contrefait est souvent plus léger, avec des bulles d'air ou des imperfections."},{"type":"h3","text":"L'étiquette et les inscriptions"},{"type":"p","text":"Examinez les polices de caractères, l'alignement, la précision des graphismes. Sur un original, elles sont parfaites, nettes, sans bavures."},{"type":"h2","text":"Analyser la boîte d'emballage"},{"type":"p","text":"Vérifiez le numéro de lot sur la boîte et le flacon : ils doivent correspondre. Examinez la qualité du carton, le cellophane, le code QR."},{"type":"h2","text":"Sentir et évaluer le parfum"},{"type":"p","text":"Un parfum original est une composition parfaitement équilibrée. Les contrefaçons sentent souvent trop âcre ou trop chimique, sans progression ni complexité."},{"type":"h2","text":"Les bonnes pratiques d'achat"},{"type":"p","text":"Achetez uniquement auprès de revendeurs officiels. Méfiez-vous des prix anormalement bas. Demandez toujours une facture détaillée."}]}];

const BLOG_IMAGES = [
  "/images/hero_man.png",
  "/images/perfume1.jpg",
  "/images/romantic.png",
  "/images/bottle_shot.png",
  "/images/hero_lifestyle.png",
  "/images/albehr.png",
  "/images/nar_alshawq.png",
  "/images/sultan.png",
  "/images/taj_elmansour.png",
  "/images/almalika.png"
];

export default function Blogs() {
  const [selectedArticleIdx, setSelectedArticleIdx] = useState<number | null>(null);

  // Scroll to top when article is selected
  useEffect(() => {
    if (selectedArticleIdx !== null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedArticleIdx]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      
      {/* Blog Page Header */}
      <div className="bg-[#2D241E] dark:bg-slate-950 text-white py-16 text-center border-b border-[#C5A059]/20">
        <div className="container mx-auto px-6">
          <p className="text-[#C5A059] font-bold tracking-[0.3em] uppercase text-xs mb-4">Journal Olfactif</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Le Blog <span className="italic text-gold-gradient font-normal">Parfums</span></h1>
          <p className="text-white/70 max-w-xl mx-auto text-sm">
            Découvrez nos conseils, guides d'achat et secrets d'experts pour trouver la fragrance parfaite et maîtriser l'art de la parfumerie.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Main Article Content or Grid */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            {selectedArticleIdx === null ? (
              // GRID VIEW
              <div className="grid sm:grid-cols-2 gap-8">
                {ARTICLES.map((article, idx) => {
                  const firstP = article.paragraphs.find(p => p.type === 'p' && !p.text.startsWith('Meta') && !p.text.startsWith('Slug'))?.text || "Découvrez notre article complet...";
                  return (
                    <div 
                      key={idx} 
                      className="group cursor-pointer bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden hover:border-[#C5A059]/40 transition-all shadow-sm flex flex-col"
                      onClick={() => setSelectedArticleIdx(idx)}
                    >
                      <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-900 relative overflow-hidden flex items-center justify-center p-6">
                        {/* Placeholder aesthetic image for blog covers */}
                        <img 
                          src={BLOG_IMAGES[idx]} 
                          alt={article.title} 
                          className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                           <span className="text-white text-xs font-bold tracking-widest uppercase border-b border-white pb-1">Lire l'article</span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Mai 2026</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 5 min</span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-[#2D241E] dark:text-foreground mb-3 line-clamp-2 group-hover:text-[#C5A059] transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow">
                          {firstP}
                        </p>
                        <button className="text-[#C5A059] text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all mt-auto w-fit">
                          Lire la suite <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // DETAIL VIEW
              <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-8 md:p-12 shadow-sm animate-fade-in">
                <button 
                  onClick={() => setSelectedArticleIdx(null)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-[#C5A059] transition-colors mb-8 text-sm font-medium"
                >
                  <ArrowLeft className="h-4 w-4" /> Retour aux articles
                </button>
                
                <Badge className="bg-[#C5A059] text-white hover:bg-[#C5A059]/90 mb-6 rounded-sm uppercase tracking-widest text-[10px] px-3 py-1">
                  Article #{String(selectedArticleIdx + 1).padStart(2, '0')}
                </Badge>

                <div className="w-full h-[300px] md:h-[400px] mb-8 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img 
                    src={BLOG_IMAGES[selectedArticleIdx]} 
                    alt={ARTICLES[selectedArticleIdx].title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2D241E] dark:text-foreground mb-6 leading-tight">
                  {ARTICLES[selectedArticleIdx].title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10 pb-10 border-b border-gray-100 dark:border-border">
                  <span className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-[#2D241E] dark:text-foreground">OR</span>
                    Oud Royale
                  </span>
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> 18 Mai 2026</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Lecture 5 min</span>
                </div>
                
                <div className="prose prose-slate dark:prose-invert prose-headings:font-serif prose-headings:text-[#2D241E] dark:prose-headings:text-foreground prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100 dark:prose-h2:border-border prose-h3:text-xl prose-h3:text-[#C5A059] prose-h3:font-normal prose-h3:italic prose-h3:mt-8 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed max-w-none">
                  {ARTICLES[selectedArticleIdx].paragraphs.filter(p => !p.text.startsWith('Meta') && !p.text.startsWith('Slug')).map((p, i) => {
                    if (p.type === 'h2') return <h2 key={i}>{p.text}</h2>;
                    if (p.type === 'h3') return <h3 key={i}>{p.text}</h3>;
                    return <p key={i}>{p.text}</p>;
                  })}
                </div>
                
                <div className="mt-16 pt-8 border-t border-gray-100 dark:border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm font-bold text-[#2D241E] dark:text-foreground uppercase tracking-widest">Partager l'article</p>
                  <div className="flex gap-4">
                     <button className="text-muted-foreground hover:text-[#C5A059] transition-colors text-sm font-medium">Facebook</button>
                     <button className="text-muted-foreground hover:text-[#C5A059] transition-colors text-sm font-medium">Twitter</button>
                     <button className="text-muted-foreground hover:text-[#C5A059] transition-colors text-sm font-medium">LinkedIn</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="sticky top-24">
              <div className="bg-[#FDFBF9] dark:bg-slate-900 border border-[#C5A059]/20 rounded-2xl p-8 mb-8">
                 <h3 className="text-xl font-serif font-bold text-[#2D241E] dark:text-foreground mb-4">À propos du Blog</h3>
                 <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                   Bienvenue sur le journal d'Oud Royale. Ici, nos experts parfumeurs partagent avec vous leurs secrets, des guides de sélection et l'actualité des fragrances de luxe.
                 </p>
                 <Link to="/products" className="block w-full text-center py-3 px-4 bg-[#2D241E] dark:bg-primary text-white dark:text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-full hover:bg-black dark:hover:bg-primary/90 transition-colors">
                   Découvrir nos parfums
                 </Link>
              </div>

              <div className="bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl p-6">
                <h3 className="text-sm font-bold text-[#2D241E] dark:text-foreground uppercase tracking-widest border-b border-gray-100 dark:border-border pb-4 mb-4">
                  Articles Populaires
                </h3>
                <div className="flex flex-col gap-4">
                  {ARTICLES.slice(0, 5).map((art, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setSelectedArticleIdx(idx)}
                      className="text-left group flex items-start gap-4"
                    >
                      <span className="text-2xl font-serif text-[#C5A059]/30 group-hover:text-[#C5A059] font-bold transition-colors">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm text-[#2D241E] dark:text-foreground group-hover:text-[#C5A059] transition-colors line-clamp-2 leading-tight mt-1">
                        {art.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
