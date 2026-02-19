import fs from "fs/promises";
import path from "path";
const supabaseUrl = "https://kwxdkuljhwdbwqvzdgpw.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3eGRrdWxqaHdkYndxdnpkZ3B3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTI2NjMzNCwiZXhwIjoyMDg2ODQyMzM0fQ.ubb-b68b-CXix1xSS28mXWaC94jzwaX-XTwXXz9mMBw";
const files = ["crm_contacts-export-2026-02-16_15-14-07.csv","crm_companies-export-2026-02-16_15-14-44.csv","crm_activities-export-2026-02-16_15-13-16.csv","hubspot_companies-export-2026-02-16_16-09-53.csv","hubspot_contacts-export-2026-02-16_16-09-35.csv","hubspot_deals-export-2026-02-16_16-09-17.csv"];
async function run() {
  for (const f of files) {
    const table = f.split("-export")[0];
    console.log("Importing " + table);
    const txt = await fs.readFile("data-import/" + f, "utf-8");
    const lines = txt.split("\n").filter(l=>l.trim());
    const hdrs = lines[0].split(";").map(h=>h.replace(/^"|"$/g,""));
    const data = lines.slice(1).map(r=>{
      const vals = r.split(";").map(v=>v.replace(/^"|"$/g,""));
      return hdrs.reduce((o,h,i)=>{o[h]=vals[i]===""?null:vals[i];return o;},{});
    });
    const res = await fetch(supabaseUrl+"/rest/v1/"+table,{method:"POST",headers:{"apikey":serviceKey,"Authorization":"Bearer "+serviceKey,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates"},body:JSON.stringify(data)});
    console.log(res.ok?"  OK":"  ERR: "+await res.text());
  }
}
run();
