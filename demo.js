import { addDays } from './domain.js';
// A demonstração é isolada, somente leitura, e nunca acessa registros reais.
export function demoState(role='owner') {
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
    const profiles=[{id:'owner',name:'Administrador',role:'owner',email:'dono@example.invalid',active:true,commission_rate:50},{id:'barber1',name:'Lucas',role:'barber',email:'lucas@example.invalid',active:true,commission_rate:50},{id:'barber2',name:'Rafael',role:'barber',email:'rafael@example.invalid',active:true,commission_rate:45}];
    const clients=[{id:'client1',name:'André — exemplo',phone:'',notes:'Cliente fictício para apresentação.',active:true,created_by:'owner',last_day:today},{id:'client2',name:'Bruno — exemplo',phone:'',notes:'',active:true,created_by:'barber1',last_day:addDays(today,-22)}];
    const catalog=[{id:'cut',name:'Corte',price:30,active:true},{id:'beard',name:'Barba',price:30,active:true},{id:'combo',name:'Corte/Barba',price:55,active:true},{id:'brow',name:'Sobrancelha',price:10,active:true}];
    const services=[{id:'s1',client_id:'client1',client_name:clients[0].name,barber_id:'barber1',barber_name:'Lucas',service_name:'Corte/Barba',amount:55,commission:27.5,day:today,payment:'Pix',canceled:false},{id:'s2',client_id:'client1',client_name:clients[0].name,barber_id:'barber2',barber_name:'Rafael',service_name:'Corte',amount:30,commission:13.5,day:today,payment:'Cartão',canceled:false},{id:'s3',client_id:'client2',client_name:clients[1].name,barber_id:'barber1',barber_name:'Lucas',service_name:'Barba',amount:30,commission:15,day:addDays(today,-22),payment:'Dinheiro',canceled:false}];
    const me=role==='owner'?profiles[0]:profiles[1];
    return {me,today,month:today.slice(0,7),profiles,clients,catalog,services:services.filter(s=>role==='owner'||s.barber_id===me.id),goals:[{profile_id:'barber1',month:today.slice(0,7)+'-01',daily:150,weekly:800,monthly:3500}],shop:{name:'Martins Barbearia',phone:'',address:''}};
}
export async function demoRpc(action,payload={},role='owner') {
    const state=demoState(role);
    if(action==='state') return state;
    if(action==='report') return state.services.filter(s=>s.day>=payload.start&&s.day<=payload.end&&(!payload.barber_id||s.barber_id===payload.barber_id));
    if(action==='history') return demoState('owner').services.filter(s=>s.client_id===payload.client_id);
    if(action==='audit') return [];
    throw new Error('Esta é uma demonstração somente para consulta. Ative o acesso online para salvar seus dados.');
}
