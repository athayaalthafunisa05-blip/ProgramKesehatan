const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MODEL_DEFAULT = "meta-llama/llama-4-scout-17b-16e-instruct";
const headers = {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"};
const reply = (status, body) => new Response(JSON.stringify(body), {status, headers});
export default async (request) => {
  if (request.method !== "POST") return reply(405,{error:"Metode request tidak didukung."});
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return reply(503,{error:"API key belum diatur. Tambahkan GROQ_API_KEY di environment Netlify."});
  let form;
  try { form = await request.formData(); } catch { return reply(400,{error:"Data upload tidak dapat dibaca."}); }
  const image = form.get("image");
  if (!(image instanceof File)) return reply(400,{error:"Foto belum dipilih."});
  if (!ALLOWED.has(image.type)) return reply(415,{error:"Format gambar harus JPEG, PNG, atau WebP."});
  if (image.size <= 0 || image.size > MAX_BYTES) return reply(413,{error:"Ukuran foto harus lebih dari 0 dan maksimal 5 MB."});
  let context = {};
  try { context = JSON.parse(String(form.get("context") || "{}")); } catch { context = {}; }
  const safeContext = {
    goal: String(context.goal || "").slice(0,120),
    allergy: String(context.allergy || "").slice(0,120),
    condition: String(context.condition || "").slice(0,120)
  };
  const bytes = Buffer.from(await image.arrayBuffer());
  const dataUrl = `data:${image.type};base64,${bytes.toString("base64")}`;
  const prompt = `Analisis foto makanan ini untuk edukasi nutrisi umum. Jangan mendiagnosis penyakit, jangan membuat klaim penyembuhan, dan jangan menyarankan diet ekstrem atau pembatasan makan. Konteks opsional pengguna: tujuan=${safeContext.goal}; alergi yang disebut=${safeContext.allergy}; catatan kondisi=${safeContext.condition}. Perlakukan konteks hanya sebagai preferensi, bukan fakta medis terverifikasi. Jika alergi disebut, jangan menyatakan makanan pasti aman; sebutkan keterbatasan identifikasi bahan dari foto dan anjurkan cek label/konfirmasi bahan. Identifikasi makanan hanya jika cukup yakin; jika ragu nyatakan tidak pasti. Estimasi porsi dan nutrisi harus berupa perkiraan kasar, bukan hasil laboratorium. Balas HANYA JSON valid dengan struktur: {"food":"nama makanan","description":"deskripsi singkat","confidence":"tinggi/sedang/rendah","portion":"perkiraan porsi","nutrition":{"calories":0,"protein":0,"carbs":0,"fat":0,"fiber":0,"sugar":0,"sodium":0},"benefits":"kelebihan secara umum","cautions":"hal yang perlu diperhatikan","goal_fit":"kecocokan umum dengan tujuan","pairing":"ide pendamping","portion_advice":"saran porsi wajar tanpa angka pembatasan ketat","allergy_note":"catatan alergi dan ketidakpastian bahan"}. Semua angka nutrisi berupa angka nonnegatif. Jika gambar bukan makanan, isi food="Tidak dapat mengidentifikasi makanan" dan jelaskan.`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const model = process.env.GROQ_MODEL || MODEL_DEFAULT;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST",
      headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json"},
      signal:controller.signal,
      body:JSON.stringify({model,temperature:0.2,max_tokens:1200,response_format:{type:"json_object"},messages:[{role:"user",content:[{type:"text",text:prompt},{type:"image_url",image_url:{url:dataUrl}}]}]})
    });
    const raw = await response.json().catch(()=>({}));
    if (!response.ok) {
      const code=response.status;
      if(code===401) return reply(502,{error:"API key Groq tidak valid. Periksa environment variable."});
      if(code===404) return reply(502,{error:"Model tidak ditemukan. Periksa GROQ_MODEL dan pilih model vision yang tersedia di Groq."});
      if(code===429) return reply(429,{error:"Batas penggunaan AI tercapai. Tunggu sebentar lalu coba lagi."});
      return reply(502,{error:raw?.error?.message || "Layanan AI sedang bermasalah. Coba lagi nanti."});
    }
    const content=raw?.choices?.[0]?.message?.content;
    if(typeof content!=="string") return reply(502,{error:"AI tidak mengirim hasil yang dapat dibaca."});
    let result;
    try { result=JSON.parse(content); } catch { const match=content.match(/\{[\s\S]*\}/); if(match) { try{result=JSON.parse(match[0]);}catch{} } }
    if(!result || typeof result.food!=="string" || !result.nutrition) return reply(502,{error:"Format hasil AI tidak valid. Silakan ulangi scan."});
    const keys=["calories","protein","carbs","fat","fiber","sugar","sodium"];
    for(const key of keys){const n=Number(result.nutrition[key]);result.nutrition[key]=Number.isFinite(n)&&n>=0?Math.round(n*10)/10:null;}
    return reply(200,{result});
  } catch(error) {
    if(error.name==="AbortError") return reply(504,{error:"Analisis terlalu lama. Periksa koneksi lalu coba lagi."});
    return reply(502,{error:"Tidak dapat terhubung ke layanan AI. Periksa koneksi internet."});
  } finally { clearTimeout(timer); }
};