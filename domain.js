export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(value || 0));
export const dateLabel = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso || '') ? iso.split('-').reverse().join('/') : '—';
export const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function addDays(iso, days) {
    const date = new Date(iso + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0,10);
}
export function period(kind, today) {
    if (kind === 'day') return {start:today,end:today};
    if (kind === 'week') { const day = new Date(today+'T12:00:00Z').getUTCDay(); const start=addDays(today,day===0?-6:1-day); return {start,end:addDays(start,6)}; }
    return {start:today.slice(0,7)+'-01',end:addDays(new Date(Date.UTC(Number(today.slice(0,4)),Number(today.slice(5,7)),1,12)).toISOString().slice(0,10),-1)};
}
export function totals(rows) {
    const active=rows.filter(s=>!s.canceled);
    const amount=active.reduce((sum,s)=>sum+Math.round(Number(s.amount)*100),0)/100;
    const commission=active.reduce((sum,s)=>sum+Math.round(Number(s.commission||0)*100),0)/100;
    return {count:active.length,amount,commission,net:Math.round((amount-commission)*100)/100,average:active.length?amount/active.length:0};
}
export function csv(rows) {
    return '\uFEFF'+rows.map(row=>row.map(value=>{
        let text=String(value??'');
        if (/^[\s]*[=+@-]/.test(text)) text="'"+text;
        return '"'+text.replace(/"/g,'""')+'"';
    }).join(';')).join('\r\n');
}
export function anniversaryReached(first,today) {
    if (!first) return false;
    const d=new Date(first+'T12:00:00Z'); d.setUTCFullYear(d.getUTCFullYear()+1);
    return d.toISOString().slice(0,10)<=today;
}
