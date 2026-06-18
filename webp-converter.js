/**
 * <webp-converter> — convert an image to WebP entirely in the browser (Canvas API).
 * Nothing is uploaded. Shows the size saving and a download link. Zero dependencies.
 * Built & maintained by SGBP — Singapore Build Partners (https://sgbp.tech). MIT.
 */
class WebpConverter extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); this.quality = 0.8; this._file = null; this._url = null; }
  connectedCallback() { this.render(); }
  _fmt(b) { return b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(2) + " MB"; }
  _convert() {
    const $ = (s) => this.shadowRoot.querySelector(s);
    const out = $("#out");
    if (!this._file) { out.innerHTML = ""; return; }
    out.innerHTML = `<p class="hint">Converting…</p>`;
    const img = new Image();
    const objUrl = URL.createObjectURL(this._file);
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      URL.revokeObjectURL(objUrl);
      c.toBlob((blob) => {
        if (!blob) { out.innerHTML = `<p class="err">Your browser couldn't export WebP from canvas.</p>`; return; }
        if (this._url) URL.revokeObjectURL(this._url);
        this._url = URL.createObjectURL(blob);
        const orig = this._file.size, saved = Math.max(0, Math.round((1 - blob.size / orig) * 100));
        const name = (this._file.name.replace(/\.[^.]+$/, "") || "image") + ".webp";
        out.innerHTML = `
          <div class="prev"><img src="${this._url}" alt="WebP preview"></div>
          <table>
            <tr><td>Original</td><td>${this._fmt(orig)} <span class="t">${this._file.type || "image"}</span></td></tr>
            <tr><td>WebP</td><td><b>${this._fmt(blob.size)}</b> <span class="save">−${saved}%</span></td></tr>
            <tr><td>Dimensions</td><td>${img.naturalWidth} × ${img.naturalHeight}px</td></tr>
          </table>
          <a class="dl" href="${this._url}" download="${name}">Download ${name}</a>`;
      }, "image/webp", this.quality);
    };
    img.onerror = () => { out.innerHTML = `<p class="err">Couldn't read that file as an image.</p>`; };
    img.src = objUrl;
  }
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        *,*::before,*::after{box-sizing:border-box}
        :host{display:block;width:100%;max-width:480px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
        .card{border:1px solid #e2e2e2;border-radius:12px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.06);padding:16px}
        .drop{display:block;border:2px dashed #ccc;border-radius:10px;padding:22px;text-align:center;color:#666;cursor:pointer;font-size:14px}
        .drop:hover{border-color:#EB0028;color:#EB0028}
        input[type=file]{display:none}
        .ctrl{display:flex;align-items:center;gap:10px;margin-top:14px}
        .ctrl label{font-size:12px;font-weight:600;color:#555;flex:0 0 auto}
        input[type=range]{flex:1;min-width:0;accent-color:#EB0028}
        .ctrl output{font-size:12px;font-family:ui-monospace,monospace;width:34px;text-align:right}
        .clr{font:inherit;font-size:11px;font-weight:700;color:#EB0028;background:none;border:0;cursor:pointer;margin-left:auto}
        .prev{margin-top:14px;text-align:center}.prev img{max-width:100%;max-height:200px;border-radius:8px;border:1px solid #eee}
        table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
        td{padding:6px 4px;border-top:1px solid #f0f0f0;color:#444}td:last-child{text-align:right}
        td b{color:#EB0028}.t{color:#999;font-size:11px}.save{color:#137333;font-weight:700}
        .dl{display:block;margin-top:14px;text-align:center;background:#EB0028;color:#fff;text-decoration:none;font-weight:600;padding:10px;border-radius:8px}
        .hint{color:#888;font-size:13px;text-align:center;margin:14px 0 0}.err{color:#c5221f;font-size:13px;text-align:center}
      </style>
      <div class="card">
        <label class="drop" id="drop">Click to choose an image (PNG, JPG, GIF) — converted in your browser, never uploaded.
          <input type="file" id="file" accept="image/*"></label>
        <div class="ctrl"><label>Quality</label>
          <input type="range" id="q" min="10" max="100" value="${Math.round(this.quality * 100)}"><output id="qo">${Math.round(this.quality * 100)}</output>
          <button class="clr" id="clear">Clear</button></div>
        <div id="out"></div>
      </div>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    $("#file").addEventListener("change", (e) => { this._file = e.target.files[0] || null; this._convert(); });
    $("#q").addEventListener("input", (e) => { this.quality = +e.target.value / 100; $("#qo").textContent = e.target.value; if (this._file) this._convert(); });
    $("#clear").addEventListener("click", () => { this._file = null; if (this._url) URL.revokeObjectURL(this._url); this._url = null; this.render(); });
  }
}
if (!customElements.get("webp-converter")) customElements.define("webp-converter", WebpConverter);
