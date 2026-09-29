import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultPlacements,heroFilms,orderFilms,publicCatalog,typeExample,withOpener,validatePlacements} from '../lib/video-placement.ts';
const films=[{id:'a',product:'spot',placement:'gallery'},{id:'b',product:'spot',placement:'featured'},{id:'c',product:'avatar',placement:'gallery'},{id:'d',product:'universe',placement:'gallery'},{id:'e',product:'impossible',placement:'gallery'},{id:'f',product:'spot',placement:'gallery'}];
const empty=()=>({hero:['','','','','',''],examples:{spot:'',impossible:'',avatar:'',universe:''},openers:{spot:'',impossible:'',avatar:'',universe:''},order:[]});
test('explicit hero slots are preserved and automatic slots never steal a later assignment',()=>{
 const p={...empty(),hero:['','a','c','d','e','f']};
 assert.deepEqual(heroFilms(films,p).map(f=>f.id),['b','a','c','d','e','f']);
});
test('unpublished and missing assignments safely fall back without duplicate screens',()=>{
 const p={...empty(),hero:['missing','a','a','','','']};
 const ids=heroFilms(films,p).map(f=>f.id);assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);assert.ok(!ids.includes('missing'));
});
test('homepage example and type-page opening film remain independent of gallery order',()=>{
 const ordered=orderFilms(films,['b','a']);
 assert.equal(typeExample(ordered,'spot','a').id,'a');
 assert.equal(withOpener(ordered.filter(f=>f.product==='spot'),'f')[0].id,'f');
 assert.equal(ordered[0].id,'b');
 assert.equal(typeExample(ordered,'spot','c').id,'b');
});
test('unknown new films append stably and filtering keeps the configured relative order',()=>{
 const ordered=orderFilms(films,['f','c','a']);
 assert.deepEqual(ordered.map(f=>f.id),['f','c','a','b','d','e']);
 assert.deepEqual(ordered.filter(f=>f.product==='spot').map(f=>f.id),['f','a','b']);
});
test('saved assignments reject private, duplicate and wrong-channel selections',()=>{
 assert.equal(validatePlacements({...empty(),hero:['a','a','','','','']},films),'Choose a different film for each hero screen.');
 assert.match(validatePlacements({...empty(),order:['private']},films),/no longer published/);
 assert.match(validatePlacements({...empty(),examples:{...empty().examples,spot:'c'}},films),/match their channel/);
 assert.equal(validatePlacements({...empty(),hero:['a','b','','','',''],order:['c','b']},films),null);
});
test('migrated records replace legacy entries; hiding a record never resurrects its original',()=>{
 const row={...films[0],status:'Ready',published:1,consent:1,provider:'bunny'};
 assert.equal(publicCatalog([row],films,false).filter(f=>f.id==='a').length,1);
 assert.equal(publicCatalog([{...row,published:0}],films,false).some(f=>f.id==='a'),false);
 assert.equal(publicCatalog([{...row,placement:'none'}],films,false).some(f=>f.id==='a'),false);
 assert.equal(publicCatalog([{...row,deleted_at:'2026-09-29T23:45:00Z'}],films,false).some(f=>f.id==='a'),false);
 assert.equal(publicCatalog([{...row,consent:0}],films,true).length,0);
 assert.equal(defaultPlacements().hero.length,6);
});
