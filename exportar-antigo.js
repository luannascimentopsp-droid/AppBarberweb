const data={format:'martins-legacy-v1'};
try{
    for(const key of ['clientes','servicos','barbeiros','metas','conta']) data[key]=JSON.parse(localStorage.getItem(key)||'null');
    if(Array.isArray(data.barbeiros))data.barbeiros=data.barbeiros.map(p=>({nome:typeof p==='string'?p:p.nome}));
    data.clientes??=[];data.servicos??=[];
    document.getElementById('summary').textContent=`${data.clientes.length} clientes e ${data.servicos.length} atendimentos encontrados.`;
    document.getElementById('export').disabled=!data.clientes.length&&!data.servicos.length;
    document.getElementById('export').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='martins-historico-antigo.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
}catch{document.getElementById('summary').textContent='Não foi possível ler os dados antigos. Nenhum dado foi modificado.';document.getElementById('export').disabled=true;}
