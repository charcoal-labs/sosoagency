#!/usr/bin/env python3
"""
Generates the SEO sub-pages from the single source of truth in index.html:

  services/<slug>/index.html   one page per core service (content below)
  work/<slug>/index.html       one case study per project card in index.html
  sitemap.xml                  every public URL

Run from the repo root after editing projects in index.html or the
service copy below:

    python3 tools/build_pages.py
"""
import html
import re
from datetime import date
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://sosocreativeagency.co.za"
TODAY = date.today().isoformat()

# ---------------------------------------------------------------------------
# Service pages
# ---------------------------------------------------------------------------
# `cat` matches the data-cat values on the project cards in index.html, so each
# service page lists the real projects in that discipline.
SERVICES = [
    {
        "slug": "branding-agency-johannesburg",
        "cat": "brand",
        "num": "01",
        "name": "Branding & Identity",
        "title": "Branding Agency in Johannesburg | Logo & Corporate Identity | Soso",
        "description": "Soso is a branding agency in Johannesburg designing logos, corporate identities, brand guidelines, stationery, vehicle branding and packaging for South African businesses.",
        "h1": "Branding agency in Johannesburg",
        "lead": "Logos, corporate identities and brand systems for South African businesses that want to be recognised, remembered and chosen.",
        "sections": [
            ("A brand is more than a logo",
             "<p>Your logo is the first thing people see, but a brand is everything they experience after that: the colours on your delivery van, the feel of your business card, the tone of your website and the sign outside your door. When those pieces match, people trust you faster. When they don’t, even a great business can look smaller than it is.</p>"
             "<p>As a branding agency in Johannesburg, we design complete corporate identities, not just a mark. We start with what makes your business different, turn it into a clear visual idea, and then carry that idea into every place your customers meet you.</p>"),
            ("What’s included in a Soso brand identity",
             "<ul class=\"page__list\">"
             "<li><b>Brand strategy and positioning</b> – who you’re for, what you stand for and how you should sound.</li>"
             "<li><b>Logo design</b> – a primary logo plus alternate versions for small spaces, dark backgrounds and social media.</li>"
             "<li><b>Visual identity</b> – colour palette, typography, patterns, imagery style and graphic elements.</li>"
             "<li><b>Brand guidelines</b> – a clear guide so your team, printers and suppliers apply the brand correctly.</li>"
             "<li><b>Corporate stationery</b> – business cards, letterheads, email signatures, invoices and presentation templates.</li>"
             "<li><b>Vehicle, signage and workwear branding</b> – designs ready for your fleet, building and uniforms.</li>"
             "<li><b>Packaging and merchandise</b> – product packaging, gift items and branded apparel.</li>"
             "</ul>"),
            ("Branding for every kind of organisation",
             "<p>We’ve built identities for a water and irrigation company, an office furniture manufacturer, a florist, a mobile beauty clinic, a medical centre, a rural high school in Limpopo, a national labour union and community foundations. The industries are different, but the goal is the same: an identity that looks professional from day one and still works as the organisation grows.</p>"
             "<p>Whether you’re a start-up that needs a logo and business cards, or an established company ready for a rebrand, we scale the work to what you actually need.</p>"),
            ("Rebranding an existing business",
             "<p>If your brand no longer reflects the quality of your work, a rebrand can change how customers, staff and investors see you. We review what you already have, keep the equity that’s worth keeping, and modernise the rest, so loyal customers still recognise you while new ones take you more seriously.</p>"),
        ],
        "faqs": [
            ("How long does a branding project take?",
             "A logo and core identity usually takes three to six weeks, depending on how many rounds of feedback are needed. Full rollouts with signage, vehicles and packaging take longer because they involve suppliers."),
            ("Do you only work with businesses in Johannesburg?",
             "No. We’re based in Johannesburg and love meeting clients in person, but we work with organisations across South Africa remotely."),
            ("Will I own my logo and brand files?",
             "Yes. When the project is complete you receive all final logo files and brand assets, and full ownership of the work."),
            ("Can you also build our website?",
             "Yes. Many of our branding clients also get a website from us, so the brand and the site launch together and match perfectly."),
        ],
        "related": ["web-design-johannesburg", "digital-marketing-johannesburg"],
    },
    {
        "slug": "web-design-johannesburg",
        "cat": "web",
        "num": "02",
        "name": "Website Design & Development",
        "title": "Web Design in Johannesburg | Website Design & Development | Soso",
        "description": "Custom website design and development in Johannesburg. Fast, mobile-friendly, SEO-ready websites for South African businesses, from landing pages to e-commerce.",
        "h1": "Website design &amp; development in Johannesburg",
        "lead": "Fast, mobile-friendly websites that look like your brand, rank on Google and turn visitors into enquiries.",
        "sections": [
            ("Your website is your hardest-working salesperson",
             "<p>For most customers, your website is the first real impression of your business. It needs to load quickly on a phone, explain what you do in seconds and make it easy to get in touch. A slow or dated site quietly sends people to your competitors.</p>"
             "<p>We design and build websites in Johannesburg for businesses, schools, non-profits and organisations across South Africa. Every site is designed around your brand and your goals, not squeezed into a generic template.</p>"),
            ("What we build",
             "<ul class=\"page__list\">"
             "<li><b>Business websites</b> – clear, professional sites that explain your services and generate enquiries.</li>"
             "<li><b>Landing pages</b> – focused pages built to win quote requests or sign-ups for a campaign.</li>"
             "<li><b>E-commerce</b> – online shops with secure payments, product management and delivery options.</li>"
             "<li><b>Booking and lead websites</b> – sites built around appointments, bookings and contact forms.</li>"
             "<li><b>Organisation and school websites</b> – easy-to-update sites for news, events and information.</li>"
             "<li><b>Website redesigns</b> – modernising an existing site without losing what already works.</li>"
             "</ul>"),
            ("Built to be found and to perform",
             "<p>Every website we build is responsive, so it works on phones, tablets and desktops. We optimise images and code so pages load fast, set up the technical SEO foundations Google looks for (page titles, descriptions, structured data and a sitemap), and make sure the site is accessible to as many people as possible.</p>"
             "<p>We also design with conversion in mind: clear calls to action, simple contact forms and pages that answer the questions customers actually ask before they buy.</p>"),
            ("Design and development under one roof",
             "<p>Because we’re a branding agency as well as a web studio, your website will look and feel like the rest of your brand. Our designers and developers work together from the first sketch to launch day, so nothing gets lost between the design and the build. After launch we can stay on to update content, add features and keep the site secure.</p>"),
        ],
        "faqs": [
            ("How long does it take to build a website?",
             "A focused landing page can be ready in two to three weeks. A full business website usually takes four to eight weeks, and e-commerce sites take longer depending on the number of products and integrations."),
            ("Will my website work on mobile?",
             "Yes. Every site we build is fully responsive and tested on phones, tablets and desktops."),
            ("Can I update the website myself?",
             "Yes. Where you need to edit content regularly we build on a content management system and show you how to use it."),
            ("Do you help with hosting and domains?",
             "Yes. We can advise on and set up hosting, your domain and business email, or work with the provider you already use."),
        ],
        "related": ["branding-agency-johannesburg", "app-development-johannesburg"],
    },
    {
        "slug": "app-development-johannesburg",
        "cat": "app",
        "num": "03",
        "name": "Mobile App Design & Development",
        "title": "App Development in Johannesburg | iOS & Android App Design | Soso",
        "description": "Mobile app design and development in Johannesburg. UI/UX design, prototyping and iOS and Android apps for South African businesses, from idea to App Store launch.",
        "h1": "Mobile app design &amp; development in Johannesburg",
        "lead": "iOS and Android apps designed around real users, from the first prototype to App Store and Google Play launch.",
        "sections": [
            ("From idea to app store",
             "<p>A good app starts with a clear problem to solve. Before anything is built, we work with you to understand who will use the app, what they need to get done and how the app supports your business. Then we design, prototype and test the experience so you can see and feel it before development begins.</p>"
             "<p>We design and develop mobile apps in Johannesburg for start-ups and established businesses that want a product people actually keep on their phones.</p>"),
            ("What we do",
             "<ul class=\"page__list\">"
             "<li><b>Product discovery</b> – defining the users, features and goals for a first version you can launch.</li>"
             "<li><b>UI/UX design</b> – user flows, wireframes and polished interface design that feels natural on each platform.</li>"
             "<li><b>Interactive prototypes</b> – clickable prototypes to test with users and show investors or stakeholders.</li>"
             "<li><b>iOS and Android development</b> – one codebase for both platforms wherever possible, to save time and cost.</li>"
             "<li><b>App Store and Google Play launch</b> – store listings, screenshots and submission.</li>"
             "<li><b>Updates and support</b> – improvements and new features after launch, based on how people use the app.</li>"
             "</ul>"),
            ("UI/UX design that people understand",
             "<p>The best apps feel obvious. We base our UI/UX design on research and testing, build consistent design systems, and add the small interactions that make an app feel fast and polished. If you already have an app that people find confusing, we can also redesign the experience.</p>"),
            ("Apps that match your brand",
             "<p>Because we also design brands and websites, your app will feel like part of the same family as the rest of your business, with the same look, tone and quality across every screen.</p>"),
        ],
        "faqs": [
            ("Do you build apps for both iPhone and Android?",
             "Yes. We design for both platforms and, where it suits the project, build with a single codebase so one app runs on iOS and Android."),
            ("How much does an app cost?",
             "It depends on the features, integrations and platforms involved. After a short discovery conversation we give you a clear quote and can suggest a smaller first version to launch sooner."),
            ("Can you design an app that another team develops?",
             "Yes. We can deliver UI/UX design and interactive prototypes ready for your in-house or partner developers."),
        ],
        "related": ["web-design-johannesburg", "branding-agency-johannesburg"],
    },
    {
        "slug": "digital-marketing-johannesburg",
        "cat": "marketing",
        "num": "04",
        "name": "Digital Marketing & Campaigns",
        "title": "Digital Marketing Agency in Johannesburg | Campaigns & Social | Soso",
        "description": "Digital marketing and advertising campaigns in Johannesburg: social media, content, paid ads, billboards and editorial design for South African brands and organisations.",
        "h1": "Digital marketing &amp; campaigns in Johannesburg",
        "lead": "Campaigns, social media and content that earn attention and help your brand reach the right people.",
        "sections": [
            ("Marketing with a clear idea behind it",
             "<p>Good marketing starts with one sharp message, then repeats it everywhere your audience spends time. We help businesses and organisations in Johannesburg and across South Africa plan and create campaigns that are easy to understand, memorable and consistent with their brand.</p>"
             "<p>Our work ranges from a national out-of-home campaign for the National Credit Regulator to an annual review magazine for the Small Enterprise Development Agency and campaign concepts for community organisations.</p>"),
            ("What we do",
             "<ul class=\"page__list\">"
             "<li><b>Campaign concepts</b> – the big idea, key message and visual direction for a launch or awareness campaign.</li>"
             "<li><b>Social media</b> – content planning, post design and campaign assets for Facebook, Instagram, LinkedIn and TikTok.</li>"
             "<li><b>Paid advertising</b> – ad creative and campaigns for Google and social platforms.</li>"
             "<li><b>SEO and content</b> – website content and optimisation that helps the right people find you on Google.</li>"
             "<li><b>Billboards and out-of-home</b> – large-format creative designed to be read in seconds.</li>"
             "<li><b>Editorial and print</b> – annual reports, magazines, brochures, posters and infographics.</li>"
             "</ul>"),
            ("Strategy first, then creative",
             "<p>Before we design anything, we look at your audience, your goals and what your competitors are doing. That gives every piece of content a job, whether it’s building awareness, generating leads or explaining something complex in a simple way. After launch, we measure what’s working and adjust.</p>"),
            ("One team for brand and marketing",
             "<p>Because we also design brand identities and websites, your campaigns stay consistent with everything else your customers see, and the people who know your brand best are the ones creating your marketing.</p>"),
        ],
        "faqs": [
            ("Do you manage social media accounts?",
             "We plan and design social content and campaigns, and can manage posting and paid promotion for you as an ongoing service."),
            ("Do you work with government and non-profit organisations?",
             "Yes. We’ve created campaigns and publications for organisations including the National Credit Regulator, SEDA and POPCRU, as well as community foundations."),
            ("Can you help my business show up on Google?",
             "Yes. We combine website optimisation, useful content and Google Business Profile setup to help local customers find you."),
        ],
        "related": ["branding-agency-johannesburg", "web-design-johannesburg"],
    },
]
SERVICE_BY_SLUG = {s["slug"]: s for s in SERVICES}
SERVICE_BY_CAT = {s["cat"]: s for s in SERVICES}

PROCESS = [
    ("Discover", "We dig into your business, your audience and your competitors until we find the tension worth building on."),
    ("Define", "Strategy distilled into one sharp idea and a creative platform the whole team can rally behind."),
    ("Design", "Fast, iterative, in the open. We prototype early, test often and sweat the details nobody asked us to."),
    ("Deliver", "Launch is the starting line. We ship, measure, learn and keep the brand moving long after go-live."),
]


# ---------------------------------------------------------------------------
# Read projects from index.html
# ---------------------------------------------------------------------------
class ProjectParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.projects, self._cur, self._in_cat = [], None, False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "a" and "project" in (a.get("class") or "").split():
            self._cur = {k[5:]: v for k, v in a.items() if k.startswith("data-")}
            self.projects.append(self._cur)
        elif tag == "li" and self._cur is not None and a.get("class") == "tags__cat":
            self._in_cat = True

    def handle_data(self, data):
        if self._in_cat:
            self._cur["catlabel"] = data.strip()
            self._in_cat = False

    def handle_endtag(self, tag):
        if tag == "a":
            self._cur = None


def load_projects():
    p = ProjectParser()
    p.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    for proj in p.projects:
        proj["slug"] = proj["img"]
        proj["cats"] = proj["cat"].split()
        proj["services_list"] = proj["services"].split("|")
        proj["alts_list"] = proj["alts"].split("|")
    return p.projects


# ---------------------------------------------------------------------------
# Templates
# ---------------------------------------------------------------------------
e = lambda s: html.escape(s, quote=True)


def head(title, description, path, og_image, jsonld):
    url = SITE + path
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(description)}">
  <link rel="canonical" href="{url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0A0A0A">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="apple-touch-icon" href="/favicon.png">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Soso Creative Agency">
  <meta property="og:locale" content="en_ZA">
  <meta property="og:url" content="{url}">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(description)}">
  <meta property="og:image" content="{SITE}{og_image}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{e(title)}">
  <meta name="twitter:description" content="{e(description)}">
  <meta name="twitter:image" content="{SITE}{og_image}">

  <script type="application/ld+json">
{jsonld}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/page.css">
</head>
<body class="subpage">
  <a class="skip" href="#main">Skip to content</a>
"""


NAV = """
  <header class="nav" data-nav>
    <a class="nav__logo" href="/" aria-label="Soso Creative Agency — home">
      <img class="nav__logo-img nav__logo-img--dark" src="/logo-full.png" alt="" width="1400" height="761">
      <img class="nav__logo-img nav__logo-img--light" src="/logo-full-light.png" alt="" width="1400" height="761">
    </a>
    <nav class="nav__links" aria-label="Primary">
      <a href="/#work"><span data-roll>Work</span></a>
      <a href="/#services"><span data-roll>Services</span></a>
      <a href="/#about"><span data-roll>About</span></a>
      <a href="/#contact"><span data-roll>Contact</span></a>
    </nav>
    <a class="btn btn--pill nav__cta" href="/#contact">
      <span data-roll>Let's Talk</span> <span class="btn__arrow" aria-hidden="true">→</span>
    </a>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="menu">
      <span class="nav__toggle-label">Menu</span>
      <span class="nav__toggle-icon" aria-hidden="true"><i></i><i></i></span>
    </button>
  </header>

  <div class="menu" id="menu" aria-hidden="true" inert>
    <nav class="menu__list" aria-label="Mobile">
      <a href="/#work"><small>01</small><span>Work</span></a>
      <a href="/#services"><small>02</small><span>Services</span></a>
      <a href="/#about"><small>03</small><span>About</span></a>
      <a href="/#contact"><small>04</small><span>Contact</span></a>
    </nav>
    <div class="menu__foot">
      <a href="mailto:info@sosocreativeagency.co.za">info@sosocreativeagency.co.za</a>
      <div class="menu__socials">
        <a href="tel:+27763101288">+27 76 310 1288</a><span>Johannesburg, South Africa</span>
      </div>
    </div>
  </div>
"""


def crumbs(items):
    """items: list of (name, path or None). Visible breadcrumb nav."""
    parts = []
    for name, path in items:
        parts.append(f'<a href="{path}">{e(name)}</a>' if path else f'<span aria-current="page">{e(name)}</span>')
    return '<nav class="crumbs mono" aria-label="Breadcrumb">' + '<span aria-hidden="true">/</span>'.join(parts) + "</nav>"


def crumbs_ld(items):
    return {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": name, "item": SITE + (path or items[-1][2])}
            for i, (name, path, *_rest) in enumerate(items)
        ],
    }


def cta(heading="Let's make<br>something<br>loud<span class=\"accent\">.</span>", label="Start a project"):
    return f"""
    <section class="page-cta">
      <span class="label mono">Ready when you are</span>
      <h2 class="display display--xl">{heading}</h2>
      <div class="page-cta__actions">
        <a class="btn btn--pill btn--big" href="/#contact"><span data-roll>{label}</span> <span class="btn__arrow" aria-hidden="true">→</span></a>
        <a class="page-cta__alt" href="mailto:info@sosocreativeagency.co.za">info@sosocreativeagency.co.za</a>
        <a class="page-cta__alt" href="tel:+27763101288">+27 76 310 1288</a>
      </div>
    </section>
"""


FOOTER = """
  <footer class="footer">
    <div class="footer__top">
      <img class="footer__logo" src="/logo-full-light.png" alt="Soso Creative Agency" width="1400" height="761" loading="lazy">
      <div class="footer__col">
        <span class="mono label">Services</span>
        <a href="/services/branding-agency-johannesburg/">Branding &amp; identity</a>
        <a href="/services/web-design-johannesburg/">Website design</a>
        <a href="/services/app-development-johannesburg/">App development</a>
        <a href="/services/digital-marketing-johannesburg/">Digital marketing</a>
      </div>
      <div class="footer__col">
        <span class="mono label">Location</span>
        <address class="footer__address">100 Oakmond,<br>Jackals Creek Golf Estate,<br>Johannesburg</address>
        <a class="footer__map" href="https://maps.google.com/?q=100+Oakmond+Jackals+Creek+Golf+Estate+Johannesburg" target="_blank" rel="noopener"><span data-roll>Get directions</span> ↗</a>
      </div>
      <div class="footer__col">
        <span class="mono label">Say hello</span>
        <a class="footer__email" href="mailto:info@sosocreativeagency.co.za">info@sosocreativeagency.co.za</a>
        <a class="footer__phone" href="tel:+27763101288"><span data-roll>+27 76 310 1288</span></a>
        <span class="footer__clock mono">Johannesburg <span data-clock>--:--</span></span>
      </div>
    </div>
    <div class="footer__legal mono">
      <span>© <span data-copyright-year>2026</span> Soso Creative Agency</span>
      <span>Made loud, on purpose.</span>
    </div>
  </footer>

  <script src="/js/page.js" defer></script>
</body>
</html>
"""


def picture(slug, n, alt, sizes, eager=False):
    base = f"/assets/work/{slug}-{n}"
    loading = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<img src="{base}-1600.webp" srcset="{base}-800.webp 800w, {base}-1600.webp 1600w" '
            f'sizes="{sizes}" alt="{e(alt)}" width="1600" height="900" {loading} decoding="async">')


def project_card(p):
    return f"""
        <a class="pcard" href="/work/{p['slug']}/">
          <span class="pcard__media">{picture(p['slug'], 1, p['alts_list'][0], '(max-width: 860px) 100vw, 33vw')}</span>
          <span class="pcard__title">{e(p['title'])}</span>
          <span class="pcard__meta mono">{e(p['catlabel'])} — {e(p['sector'])}</span>
        </a>"""


def jsonld(graph):
    import json
    return "  " + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2).replace("\n", "\n  ")


BUSINESS_ID = SITE + "/#business"


# ---------------------------------------------------------------------------
# Builders
# ---------------------------------------------------------------------------
def build_service(s, projects):
    path = f"/services/{s['slug']}/"
    work = [p for p in projects if s["cat"] in p["cats"]]
    og = f"/assets/work/{work[0]['slug']}-1-1600.webp" if work else "/og-image.jpg"
    plain_name = s["name"]

    graph = [
        {
            "@type": "Service",
            "@id": SITE + path + "#service",
            "name": plain_name,
            "serviceType": plain_name,
            "description": s["description"],
            "url": SITE + path,
            "provider": {"@id": BUSINESS_ID},
            "areaServed": [{"@type": "City", "name": "Johannesburg"}, {"@type": "Country", "name": "South Africa"}],
        },
        crumbs_ld([("Home", "/"), ("Services", "/#services"), (plain_name, None, path)]),
    ]

    sections = "".join(
        f"""
        <section class="page__section">
          <h2>{e(h)}</h2>
          {body}
        </section>""" for h, body in s["sections"])

    steps = "".join(
        f'<li><span class="mono">0{i + 1}</span><h3>{n}</h3><p>{t}</p></li>' for i, (n, t) in enumerate(PROCESS))

    if work:
        work_html = f"""
    <section class="page-work">
      <div class="page-work__head">
        <span class="label mono">Selected work</span>
        <h2 class="display display--md">{e(plain_name)} projects</h2>
      </div>
      <div class="pgrid">{''.join(project_card(p) for p in work)}
      </div>
    </section>"""
    else:
        work_html = """
    <section class="page-work page-work--empty">
      <span class="label mono">Selected work</span>
      <p>We’re putting the finishing touches on our app showcase. Have an app idea? Let’s talk about it.</p>
    </section>"""

    faqs = "".join(
        f'<details class="faq"><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in s["faqs"])

    related = "".join(
        f'<a class="related__link" href="/services/{r}/"><span class="mono">{SERVICE_BY_SLUG[r]["num"]}</span>'
        f'<span>{e(SERVICE_BY_SLUG[r]["name"])}</span><span aria-hidden="true">→</span></a>'
        for r in s["related"])

    body = f"""{NAV}
  <main id="main">
    <section class="page-hero">
      {crumbs([("Home", "/"), ("Services", "/#services"), (plain_name, None)])}
      <span class="label mono">({s['num']}) — {e(plain_name)}</span>
      <h1 class="page-hero__title">{s['h1']}</h1>
      <p class="page-hero__lead">{e(s['lead'])}</p>
      <a class="btn btn--pill btn--big" href="/#contact"><span data-roll>Get a quote</span> <span class="btn__arrow" aria-hidden="true">→</span></a>
    </section>

    <div class="page__body">{sections}
    </div>

    <section class="page-process">
      <span class="label mono">How we work</span>
      <h2 class="display display--md">How the magic<br>gets made.</h2>
      <ol class="page-process__steps">{steps}</ol>
    </section>
{work_html}

    <section class="page-faq">
      <span class="label mono">FAQ</span>
      <h2 class="display display--md">Good questions.</h2>
      <div class="page-faq__list">{faqs}</div>
    </section>

    <section class="related">
      <span class="label mono">Also from Soso</span>
      {related}
    </section>
{cta()}
  </main>
{FOOTER}"""
    return head(s["title"], s["description"], path, og, jsonld(graph)) + body


def build_project(p, i, projects):
    path = f"/work/{p['slug']}/"
    services_lc = ", ".join(p["services_list"][:3]).lower()
    title = f"{p['title']} — {p['services_list'][0]} | Soso Creative Agency"
    description = re.sub(r"\s+", " ", p["desc"])
    if len(description) > 158:
        description = description[:155].rsplit(" ", 1)[0].rstrip(",.;") + "…"

    cats = [SERVICE_BY_CAT[c] for c in p["cats"] if c in SERVICE_BY_CAT]
    primary = cats[0] if cats else SERVICES[0]
    nxt = projects[(i + 1) % len(projects)]

    graph = [
        {
            "@type": "CreativeWork",
            "@id": SITE + path + "#work",
            "name": f"{p['title']} — {p['services_list'][0]}",
            "description": p["desc"],
            "url": SITE + path,
            "image": [f"{SITE}/assets/work/{p['slug']}-{n + 1}-1600.webp" for n in range(len(p["alts_list"]))],
            "creator": {"@id": BUSINESS_ID},
            "about": p["sector"],
            "keywords": ", ".join(p["services_list"]),
        },
        crumbs_ld([("Home", "/"), ("Work", "/#work"), (p["title"], None, path)]),
    ]

    gallery = "".join(
        f'<figure class="case-page__shot">{picture(p["slug"], n + 1, alt, "(max-width: 860px) 100vw, 92vw", eager=(n == 0))}</figure>'
        for n, alt in enumerate(p["alts_list"]))

    services = "".join(f"<li>{e(sv)}</li>" for sv in p["services_list"])
    service_links = "".join(
        f'<a class="related__link" href="/services/{c["slug"]}/"><span class="mono">{c["num"]}</span>'
        f'<span>{e(c["name"])}</span><span aria-hidden="true">→</span></a>' for c in cats)

    body = f"""{NAV}
  <main id="main">
    <article class="case-page">
      <header class="page-hero page-hero--case">
        {crumbs([("Home", "/"), ("Work", "/#work"), (p['title'], None)])}
        <span class="label mono">{e(p['catlabel'])} — {e(p['sector'])}</span>
        <h1 class="page-hero__title">{e(p['title'])}</h1>
        <p class="page-hero__lead">{e(p['desc'])}</p>
      </header>

      <dl class="case-page__facts">
        <div><dt class="mono">Client</dt><dd>{e(p['client'])}</dd></div>
        <div><dt class="mono">Sector</dt><dd>{e(p['sector'])}</dd></div>
        <div><dt class="mono">Services</dt><dd><ul class="tags">{services}</ul></dd></div>
      </dl>

      <div class="case-page__gallery">{gallery}</div>
    </article>

    <section class="related">
      <span class="label mono">Services on this project</span>
      {service_links}
    </section>

    <a class="next-case" href="/work/{nxt['slug']}/">
      <span class="mono">Next project</span>
      <span class="next-case__title">{e(nxt['title'])} <span aria-hidden="true">→</span></span>
    </a>
{cta(label=f"Start a {e(primary['name'].split(' &')[0].lower())} project")}
  </main>
{FOOTER}"""
    return head(title, description, path, f"/assets/work/{p['slug']}-1-1600.webp", jsonld(graph)) + body


def build_sitemap(projects):
    urls = ["/"] + [f"/services/{s['slug']}/" for s in SERVICES] + [f"/work/{p['slug']}/" for p in projects]
    rows = "\n".join(f"  <url>\n    <loc>{SITE}{u}</loc>\n    <lastmod>{TODAY}</lastmod>\n  </url>" for u in urls)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}\n</urlset>\n'


def write(rel, text):
    out = ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding="utf-8")
    print("wrote", rel)


def main():
    projects = load_projects()
    for s in SERVICES:
        write(f"services/{s['slug']}/index.html", build_service(s, projects))
    for i, p in enumerate(projects):
        write(f"work/{p['slug']}/index.html", build_project(p, i, projects))
    write("sitemap.xml", build_sitemap(projects))


if __name__ == "__main__":
    main()
