export type PipelineSortKey = 'company' | 'stage' | 'product' | 'origin_rep' | 'next_action' | 'next_at';
export type PipelineSort = {key:PipelineSortKey;direction:'asc'|'desc'} | null;
type Lead = {company:string;name:string;stage:string;product:string;origin_rep:string;next_action?:string|null;next_at?:string|null};
const collator = new Intl.Collator('en', {sensitivity:'base',numeric:true});

export function sortPipeline<T extends Lead>(leads:T[],sort:PipelineSort,members:{rep_code:string;name:string}[],offers:{id:string;name:string}[],stages:readonly string[]):T[] {
  if(!sort)return leads;
  const reps=new Map(members.map(member=>[member.rep_code,member.name]));
  const packages=new Map(offers.map(offer=>[offer.id,offer.name]));
  function value(lead:T):string|number {
    switch(sort!.key){
      case 'stage': {const index=stages.indexOf(lead.stage);return index<0?stages.length:index;}
      case 'product': return packages.get(lead.product)||'To be scoped';
      case 'origin_rep': return reps.get(lead.origin_rep)||'Direct';
      default: return lead[sort!.key]?.trim()||'';
    }
  }
  return [...leads].sort((a,b)=>{
    const av=value(a),bv=value(b);
    // Unscheduled/empty values remain at the bottom in either direction.
    if(av===''||bv==='')return av===bv?0:av===''?1:-1;
    let comparison=typeof av==='number'&&typeof bv==='number'?av-bv:collator.compare(String(av),String(bv));
    if(!comparison&&sort.key==='company')comparison=collator.compare(a.name,b.name);
    return comparison*(sort.direction==='asc'?1:-1);
  });
}
