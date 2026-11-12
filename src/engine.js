export const CATEGORIES = ['Flower', 'Cartridges', 'Gummies', 'Beverages', 'Pre-rolls', 'Concentrates', 'Tinctures', 'Topicals', 'Other'];
export const STATES = 'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' ');
export const uid = () => crypto.randomUUID();
export const categoryQuestions = {
  Flower: ['Cultivar identity and provenance', 'Package format and net weight', 'Batch COA and terpenoid data'],
  Cartridges: ['Extraction method and formulation', 'Hardware and carton dimensions', 'Hardware markings and net contents'],
  Gummies: ['Flavor, formulation and ingredient list', 'Allergens and nutrition applicability', 'Servings, THC per serving and package total'],
  Beverages: ['Flavor, ingredients and allergens', 'Container volume and serving count', 'THC per serving, nutrition and container requirements'],
  'Pre-rolls': ['Infused or non-infused classification', 'Count, individual weight and total contents', 'Tube, carton or multipack specifications'],
  Concentrates: ['Extraction method and product classification', 'Container and net contents', 'Batch COA and handling information'],
  Tinctures: ['Formulation, ingredients and allergens', 'Bottle, dropper and volume', 'Verified serving and cannabinoid information'],
  Topicals: ['Ingredients, classification and intended use', 'Container, contents and instructions', 'Review of proposed claims'],
  Other: ['Confirm regulatory product classification', 'Define formula, contents and package', 'Identify category-specific required information']
};
export const sourceDirectories = {
  OK: {name:'Oklahoma Medical Marijuana Authority', url:'https://oklahoma.gov/omma/rules-and-legislation/rules.html'},
  CA: {name:'California Department of Cannabis Control',url:'https://www.cannabis.ca.gov/cannabis-laws/dcc-regulations/'},
  NY: {name:'New York Office of Cannabis Management',url:'https://cannabis.ny.gov/adult-use-regulations'}
};
export function validateBackup(d) {
  if (!d || d.schema !== 1 || !['clients','lines','variants','jobs','rules'].every(k => Array.isArray(d[k]))) throw Error('This is not an Agency OS backup.');
  for (const c of d.clients) if (!c.id || typeof c.name !== 'string' || !Array.isArray(c.markets) || !c.markets.every(s=>STATES.includes(s))) throw Error('A client record is invalid.');
  for (const l of d.lines) if (!d.clients.some(c=>c.id===l.clientId) || !l.id || typeof l.name !== 'string' || !CATEGORIES.includes(l.category)) throw Error('A product line is invalid.');
  for (const v of d.variants) if (!v.id || !d.lines.some(l=>l.id===v.lineId) || typeof v.name !== 'string') throw Error('A variant is invalid.');
  if (d.rules.some(r=>!r.id || !d.clients.some(c=>c.id===r.clientId) || !STATES.includes(r.state) || !CATEGORIES.includes(r.category))) throw Error('A market review record is invalid.');
  if (d.jobs.some(j=>!j.id || !d.variants.some(v=>v.id===j.variantId) || typeof j.brief!=='string' || !Array.isArray(j.holds))) throw Error('A job record is invalid.');
  return d;
}
export function checkRelease(client,line,variant,rules,now = new Date()) {
  const holds = [];
  if (!client.markets?.length) holds.push('Choose at least one sales state.');
  if (!line.guide?.trim()) holds.push('Add this product line’s own brand guide.');
  if (!variant.facts?.trim()) holds.push('Verified product data is missing.');
  if (!variant.specs?.trim()) holds.push('Supplier specifications are missing.');
  if (!variant.evidence?.trim()) holds.push('Supporting product documents are missing.');
  if (!variant.approved) holds.push('Client approval is pending.');
  for (const state of client.markets || []) {
    const rs = rules.filter(r=>r.clientId===client.id && r.state===state && r.category===line.category && r.program===client.program);
    const usable = rs.filter(r=>r.status==='Reviewed' && r.reviewer?.trim() && r.findings?.trim() && r.designImpact?.trim() && /^https:\/\//.test(r.url) && r.checked && r.effective && r.checked<=now.toISOString().slice(0,10) && r.effective<=now.toISOString().slice(0,10) && now-new Date(r.checked+'T00:00:00Z')<=7*86400000);
    if (!usable.length) holds.push(`${state}: current ${line.category.toLowerCase()} review required (including applicability and design adjustments).`);
  }
  return holds;
}
export function compileJob(db,variantId,now=new Date()) {
  const variant = db.variants.find(v=>v.id===variantId);
  if (!variant) throw Error('Select a product variant.');
  const line = db.lines.find(l=>l.id===variant.lineId);
  const client = db.clients.find(c=>c.id===line?.clientId);
  if (!client) throw Error('The client or product line is missing.');
  const holds = checkRelease(client,line,variant,db.rules,now);
  const siblings = db.variants.filter(v=>v.lineId===line.id && v.id!==variant.id);
  const sources=client.markets.map(s=>sourceDirectories[s] ? `${s}: ${sourceDirectories[s].url}` : `${s}: locate the official regulator and effective rules; no verified source is configured.`);
  const reviews=db.rules.filter(r=>r.clientId===client.id && client.markets.includes(r.state) && r.category===line.category && r.program===client.program);
  const brief = `# ${client.name} / ${line.name} / ${variant.name}\n\nCompiled ${now.toISOString()}. This is an automated brief, not AI-generated artwork or legal clearance.\n\n## Company context\n${client.about || 'Discovery pending.'}\nProgram: ${client.program}. Manufacturing state: ${client.manufacture || 'Unknown'}. Sales markets: ${client.markets.join(', ') || 'Unspecified'}.\n\n## Product-line identity\nCategory: ${line.category}.\n${line.positioning || 'Positioning pending.'}\nGuide revision: ${line.revision || 1}.\n${line.guide || 'No guide approved.'}\nHouse endorsement: ${line.endorsement || 'Decide deliberately; do not impose the parent look.'}\nFixed elements: ${line.fixed || 'Define before design.'}\nVariable elements: ${line.variable || 'Define before design.'}\nAvoid: ${line.avoid || 'Unrelated brand assets, copying existing marks, unverified claims.'}\n\n## Variant creative brief\n${variant.direction || 'Develop original concepts appropriate to the line and verified product.'}\nSource strain/material: ${variant.strain || 'Unspecified; do not invent.'}\nFlavor/formulation: ${variant.formulation || 'Unspecified; do not invent.'}\nRequested positioning is creative intent, not a promise of effects. Do not infer sleep, mobility or other benefits from a scene or strain.\n\n## Verified product facts\n${variant.facts || 'PENDING. Leave exact claims and potency blank.'}\nSupporting documents: ${variant.evidence || 'PENDING.'}\nSupplier specifications: ${variant.specs || 'PENDING. No production file dimensions are approved.'}\n\n## Sibling continuity\n${siblings.map(s=>`- ${s.name}: ${s.direction || 'Direction pending'}`).join('\n') || 'First variant in this line.'}\nUse this line’s guide and approved references. Create a new episode of its visual world. Do not copy the flower design onto carts, gummies or drinks. Do not borrow another client’s identity.\n\n## Category questions\n${categoryQuestions[line.category].map(q=>'- '+q).join('\n')}\n\n## Mandatory market research\n${sources.join('\n')}\nCheck current effective statutes, regulations, regulator guidance, federal/local applicability, license roles, package layers, channel and transition dates. Distinguish proposals from effective law. Check imagery and claim permission before rendering concepts and again before release.\n\n${reviews.map(r=>`### ${r.state} / ${r.status}\n${r.url}\nChecked: ${r.checked || 'pending'}. Effective: ${r.effective || 'pending'}. Reviewer: ${r.reviewer || 'pending'}.\nFindings: ${r.findings || 'pending'}\nRequired adjustments: ${r.designImpact || 'pending'}`).join('\n\n') || 'No market findings recorded. Source links alone are not a completed review.'}\n\n## Production holds\n${holds.map(h=>'- '+h).join('\n') || 'Recorded checks completed. This is not legal certification; final responsible review is still required.'}\n\n## Deliverables and quality\nDevelop three original variant concepts within the approved line. Use art generation for artwork, then place exact text and official symbols in editable layouts. Do not fabricate warnings, symbol artwork, certifications, lab values or claims. Check siblings, category identification, legibility at actual size, copy accuracy and supplier specifications. Deliver concept preview, editable masters, source/evidence list and unresolved questions separately.\n`;
  return {id:uid(),clientId:client.id,lineId:line.id,variantId,client:client.name,line:line.name,variant:variant.name,category:line.category,created:now.toISOString(),guideRevision:line.revision || 1,context:contextSnapshot(db,variantId),brief,holds,stage:'Brief ready',research:'Not run'};
}
export function contextSnapshot(db,variantId){const variant=db.variants.find(v=>v.id===variantId);const line=db.lines.find(l=>l.id===variant?.lineId);const client=db.clients.find(c=>c.id===line?.clientId);return JSON.stringify({client,line,variant,rules:db.rules.filter(r=>r.clientId===client?.id&&r.category===line?.category)});}
export function seed() {
  return {schema:1,clients:[{id:'demo-house',name:'Example House',about:'Fictional demonstration client. An independent cultivation and processing partnership with separate consumer product lines.',manufacture:'OK',markets:['OK'],program:'Medical marijuana',demo:true}],
    lines:[
      {id:'line-flower',clientId:'demo-house',name:'Flower archive',category:'Flower',positioning:'Cultivar-led craft and provenance.',guide:'A cultivation-focused identity. Precise typography and strain-specific character. Do not inherit the gummy or cart art direction.',fixed:'Line wordmark, provenance hierarchy and information positions.',variable:'Cultivar interpretation and approved palette.',endorsement:'Small Example House endorsement.',avoid:'Unsupported provenance claims or decorative lab charts.',revision:1},
      {id:'line-carts',clientId:'demo-house',name:'Current',category:'Cartridges',positioning:'Extraction-focused contemporary product line.',guide:'Independent cart identity: sharp lettering, concise formulation hierarchy and an original visual concept specific to the line. Its appearance must differ from the flower and gummy lines.',fixed:'Current wordmark, formulation hierarchy, line-specific composition.',variable:'Source/formulation expression and approved color.',endorsement:'By Example House, subordinate to Current.',avoid:'Copying flower packaging; unverified purity claims.',revision:1},
      {id:'line-gummies',clientId:'demo-house',name:'Elsewhere',category:'Gummies',positioning:'An adult illustrated world with distinct narrative variants. Market permission unresolved.',guide:'A gummy-specific visual world. Original painterly environments, consistent perspective, controlled detail and grown-up typography. Each variant is a new scene, not a recolored bag. No scene may be used on packaging until the applicable market review allows it.',fixed:'Elsewhere wordmark, illustration technique, title placement and serving-information hierarchy.',variable:'Scene, lighting, palette and narrative, subject to market permission.',endorsement:'A small Example House endorsement only.',avoid:'Candy imitation, youth appeal, unsupported effect promises; scene-based pack art pending Oklahoma review.',revision:1},
      {id:'line-drinks',clientId:'demo-house',name:'Still',category:'Beverages',positioning:'A separate beverage identity.',guide:'Beverage-specific typographic system, cylindrical reading order and flavor distinction. Develop its own voice and palette rather than inheriting gummies or flower.',fixed:'Still wordmark and serving hierarchy.',variable:'Flavor expression and approved colors.',endorsement:'By Example House.',avoid:'Alcohol imitation or unsupported health claims.',revision:1}
    ],variants:[
      {id:'v-flower',lineId:'line-flower',name:'Northern Lights',strain:'Northern Lights',direction:'Explore this cultivar within the flower archive. No invented cultivation facts.'},
      {id:'v-cart',lineId:'line-carts',name:'Resin study',direction:'Develop a cart-specific variant. Confirm actual extraction method before using resin terminology in final copy.'},
      {id:'v-gummy-a',lineId:'line-gummies',name:'Open shore',direction:'Concept exploration: a beach with space, daylight and gentle movement. Creative intent only; no promised effect. Check scene permission before packaging use.'},
      {id:'v-gummy-b',lineId:'line-gummies',name:'Forest room',direction:'Concept exploration: a cozy couch in a forest at dusk, within Elsewhere’s illustration style. No sleep claim. Check scene permission before packaging use.'},
      {id:'v-drink',lineId:'line-drinks',name:'First flavor',direction:'Create a drink-specific expression once flavor and formula are verified.'}
    ],jobs:[],rules:[]};
}
