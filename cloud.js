import { createClient } from './vendor/supabase.js';
const config = window.BARBER_CONFIG || {};
function isPublicKey(key) {
    if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key || '')) return true;
    try { const body=key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'); return JSON.parse(atob(body)).role==='anon'; } catch { return false; }
}
export const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.supabaseUrl || '') && isPublicKey(config.supabasePublishableKey);
export const cloud = configured ? createClient(config.supabaseUrl,config.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
export async function rpc(action,payload={}) {
    if (!cloud) throw new Error('O acesso online ainda não foi configurado.');
    const {data,error}=await cloud.rpc('barber_api',{action,payload});
    if(error) throw error;
    return data;
}
export async function importLegacy(payload) {
    const {data,error}=await cloud.rpc('barber_import',{payload});
    if(error) throw error;
    return data;
}
