// Vercel serverless function: receives COD orders and emails them via Resend.
// Secrets live in Vercel environment variables only, never in the frontend.
const PROV=['AB','BC','MB','NB','NL','NT','NS','NU','ON','PE','QC','SK','YT'];
const clean=(v,n)=>String(v||'').replace(/[<>]/g,'').trim().slice(0,n);
module.exports=async(req,res)=>{
  if(req.method!=='POST')return res.status(405).json({ok:false});
  const {RESEND_API_KEY,ORDER_TO_EMAIL,ORDER_FROM_EMAIL}=process.env;
  if(!RESEND_API_KEY||!ORDER_TO_EMAIL||!ORDER_FROM_EMAIL)return res.status(503).json({ok:false,error:'not_configured'});
  let d=req.body;if(typeof d==='string'){try{d=JSON.parse(d)}catch{return res.status(400).json({ok:false})}}
  d=d||{};
  if(d.website)return res.status(200).json({ok:true,id:'OK'});   // honeypot: fake success for bots
  if(!(d.elapsed>3000))return res.status(400).json({ok:false});   // submitted too fast = bot
  const o={name:clean(d.name,80),phone:clean(d.phone,25),province:clean(d.province,2),city:clean(d.city,60),address:clean(d.address,160),
    email:clean(d.email,100),postal:clean(d.postal,10),notes:clean(d.notes,400),contact:d.contact==='sms'?'SMS':'Phone call',
    qty:Math.min(5,Math.max(1,parseInt(d.quantity)||1)),lang:d.lang==='fr'?'FR':'EN'};
  const digits=o.phone.replace(/\D/g,'').replace(/^1(?=\d{10}$)/,'');
  if(o.name.length<2||digits.length!==10||!PROV.includes(o.province)||o.city.length<2||o.address.length<5)return res.status(400).json({ok:false});
  const id='AUR-'+Date.now().toString(36).toUpperCase();
  const text=`Order ${id} (COD)\nQty: ${o.qty}\nName: ${o.name}\nPhone: ${o.phone}\nConfirm by: ${o.contact}\nAddress: ${o.address}, ${o.city}, ${o.province} ${o.postal}\nEmail: ${o.email||'-'}\nNotes: ${o.notes||'-'}\nSite language: ${o.lang}`;
  try{
    const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+RESEND_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({from:ORDER_FROM_EMAIL,to:[ORDER_TO_EMAIL],subject:`New COD order ${id}`,text})});
    if(!r.ok)return res.status(502).json({ok:false});
    return res.status(200).json({ok:true,id});
  }catch{return res.status(502).json({ok:false})}
};
