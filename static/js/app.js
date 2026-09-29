function el(id) { return document.getElementById(id); }
async function api(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}
async function post(path, data) {
  const r = await fetch(path, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)});
  const d = await r.json();
  if (!r.ok) { alert(d.error || r.statusText); return {error: d.error}; }
  return d;
}
function rupiah(n) { return "Rp" + Number(n || 0).toLocaleString("id-ID"); }
