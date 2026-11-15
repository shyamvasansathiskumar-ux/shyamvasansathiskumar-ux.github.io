# Adds SRI and a content version (?v=<sha256 prefix>) to every local script and stylesheet,
# so a new deploy can never pair a fresh page with a stale cached file.
import re, hashlib, base64, sys, os
root = sys.argv[1]
def digest(path):
    b = open(path, "rb").read()
    return "sha384-" + base64.b64encode(hashlib.sha384(b).digest()).decode(), hashlib.sha256(b).hexdigest()[:10]
for page in ["index.html", "404.html"]:
    fp = os.path.join(root, page)
    if not os.path.exists(fp): continue
    base = os.path.dirname(fp)
    h = open(fp).read()
    def fix(tag, attr):
        def rep(m):
            url = m.group(1).split("?")[0]
            if url.startswith(("http:", "https:", "//", "data:")): return m.group(0)
            sri, v = digest(os.path.join(base, url))
            if tag == "link": return f'<link rel="stylesheet" href="{url}?v={v}" integrity="{sri}">'
            return f'<script src="{url}?v={v}" integrity="{sri}"></script>'
        return rep
    h = re.sub(r'<link rel="stylesheet" href="([^"]+)"(?: integrity="[^"]+")?>', fix("link", "href"), h)
    h = re.sub(r'<script src="([^"]+)"(?: integrity="[^"]+")?></script>', fix("script", "src"), h)
    open(fp, "w").write(h)
print("sri + versions ok")
