/**
 * Local-only profile + readiness for the HYBRID RACE PLAN programme.
 * Namespaced by authenticated user ID + programme ID so nothing can leak
 * between accounts. Authoritative results live in the database.
 */
import { useSyncExternalStore } from "react";

export type HrpUnits = "kg" | "lb";
export type HrpFormat = "Solo" | "Doubles";
export type HrpEvent = "HYROX" | "The Hybrid Games";
export type HrpSex = "Male" | "Female" | "";
export type HrpCategory = "Open" | "Pro" | "";
export type HrpTrack = "BUILD" | "STANDARD" | "PERFORMANCE";
export type HrpReadiness = "ready" | "average" | "heavy" | "pain";

export type HrpProfile = {
  displayName: string;
  units: HrpUnits;
  startDate: string | null;
  raceDate: string | null;
  event: HrpEvent;
  format: HrpFormat;
  sex: HrpSex;
  category: HrpCategory;
  track: HrpTrack;
  recent5k: string | null;
  twentyMinDistance: number | null;
  backSquat: number | null;
  deadlift: number | null;
  wallBallSet: number | null;
  machineBenchmark: string | null;
  equipment: string;
  limitations: string;
  soundCues: boolean;
  vibration: boolean;
  setupComplete: boolean;
};

const DEFAULT: HrpProfile = {
  displayName: "", units: "kg",
  startDate: null, raceDate: null,
  event: "HYROX", format: "Solo", sex: "", category: "", track: "STANDARD",
  recent5k: null, twentyMinDistance: null,
  backSquat: null, deadlift: null, wallBallSet: null,
  machineBenchmark: null, equipment: "", limitations: "",
  soundCues: true, vibration: true, setupComplete: false,
};

const PROGRAMME_ID = "hybrid-race-plan";
const PREFIX = "hrp";
let activeUserId: string | null = null;
const key = (n: string) => (activeUserId ? `${PREFIX}.${n}.v1:${activeUserId}:${PROGRAMME_ID}` : null);

const listeners = new Set<() => void>();
function emit(){listeners.forEach(l=>l());}
export function subscribe(l:()=>void){listeners.add(l);return()=>listeners.delete(l);}

function read<T>(k:string,f:T):T{if(typeof window==='undefined')return f;try{const r=window.localStorage.getItem(k);if(!r)return f;return JSON.parse(r) as T;}catch{return f;}}
function write<T>(k:string,v:T){if(typeof window==='undefined')return;try{window.localStorage.setItem(k,JSON.stringify(v));emit();}catch{}}

let _profile:HrpProfile|null=null;
let _readiness:Record<string,HrpReadiness>|null=null;
let _started:{started:boolean;at:string|null}|null=null;

if(typeof window!=='undefined'){window.addEventListener('storage',e=>{if(e.key?.includes(`${activeUserId}:${PROGRAMME_ID}`)){_profile=null;_readiness=null;_started=null;}emit();});}

export const hrpStore = {
  configureUser(userId:string|null){if(activeUserId===userId)return;activeUserId=userId;_profile=null;_readiness=null;_started=null;emit();},
  getProfile():HrpProfile{if(_profile)return _profile;const k=key('profile');_profile={...DEFAULT,...(k?read<Partial<HrpProfile>>(k,{}):{})};return _profile;},
  saveProfile(p:Partial<HrpProfile>){const n={...hrpStore.getProfile(),...p};_profile=n;const k=key('profile');if(k)write(k,n);},
  markStarted(){const v={started:true,at:new Date().toISOString()};_started=v;const k=key('started');if(k)write(k,v);},
  getStarted(){if(_started)return _started;const k=key('started');_started=k?read(k,{started:false,at:null}):{started:false,at:null};return _started;},
  getReadiness(){if(_readiness)return _readiness;const k=key('readiness');_readiness=k?read(k,{}):{};return _readiness;},
  setReadiness(sid:string,v:HrpReadiness){const n={...hrpStore.getReadiness(),[sid]:v};_readiness=n;const k=key('readiness');if(k)write(k,n);},
};

export function useHrpProfile(){return useSyncExternalStore(subscribe,hrpStore.getProfile,hrpStore.getProfile);}
export function useHrpStarted(){return useSyncExternalStore(subscribe,hrpStore.getStarted,hrpStore.getStarted);}
export function useHrpReadiness(){return useSyncExternalStore(subscribe,hrpStore.getReadiness,hrpStore.getReadiness);}

/** 1..12 based on start date, clamped. */
export function currentHrpWeek(startISO:string|null):number|null{
  if(!startISO)return null;
  const s=new Date(startISO+'T00:00:00');
  if(Number.isNaN(s.getTime()))return null;
  const days=Math.floor((Date.now()-s.getTime())/86_400_000);
  if(days<0)return 1;
  const wk=Math.floor(days/7)+1;
  return Math.min(12,Math.max(1,wk));
}
