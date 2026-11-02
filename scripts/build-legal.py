#!/usr/bin/env python3
"""Generate policy pages, footer links and the sample invoice for toppercalc.in.

All business details live in BIZ below. Edit them here and re-run:
    python3 scripts/build-legal.py
"""
import pathlib
from string import Template

ROOT = pathlib.Path(__file__).resolve().parent.parent / "vovo-site"

# ---------------------------------------------------------------- business facts
BIZ = {
    "brand": "topper.calc",
    "legal_name": "Nuke Labs",
    "email": "always.toppercalc@gmail.com",
    # No phone or street address is published on the site by choice. The full
    # return address is shared by email when a return is approved.
    "phone": "",
    "address": "Kerala, India",
    "city": "Kerala",
    "hours": "Monday to Saturday, 10:00 to 18:00 IST",
    "response": "1-2 business days",
    "price": "6,499",
    "lead_time": "about 2 weeks",
}
BIZ["phone_plain"] = BIZ["phone"].replace(" ", "").replace("+", "")


def t(text):
    return Template(text).substitute(BIZ)


NAV = """    <header class="header">
        <div class="container nav">
            <a href="/" class="brand">topper.calc</a>
            <nav class="nav-links">
                <a href="/#how" class="nav-hide-sm">How it works</a>
                <a href="/education/">Education</a>
                <a href="/app/">Web app</a>
                <a href="/product/" class="nav-cta">Buy</a>
            </nav>
        </div>
    </header>"""

FOOTER = t("""    <footer class="footer">

        <div class="container footer-inner">
            <div>
                <div class="brand">topper.calc</div>
                <p class="footer-tag">Your notes, hidden in a calculator.</p>
            </div>
            <div class="footer-links">
                <a href="/#how">How it works</a>
                <a href="/tools/">Study tools</a>
                <a href="/app/">Web app</a>
                <a href="/product/">Product</a>
                <a href="/product/">Buy</a>
            </div>
        </div>
        <div class="footer-legal container">
            <nav class="footer-policy" aria-label="Policies">
                <a href="/about/">About</a>
                <a href="/education/">Education</a>
                <a href="/contact/">Contact</a>
                <a href="/terms/">Terms</a>
                <a href="/privacy/">Privacy</a>
                <a href="/refunds/">Refunds</a>
                <a href="/shipping/">Shipping</a>
            </nav>
            <p class="footer-contact">$email &middot; $address</p>
        </div>
        <div class="disclaimer container">
            <p>The use of this device in examination settings is strictly discouraged.</p>
            <p>We assume no liability for any academic misconduct or malpractice resulting from the use of this device.</p>
        </div>
        <div class="container footer-bottom">
            <p>&copy; 2026 $legal_name. All product names are trademarks of their respective owners.</p>
        </div>
    </footer>""")

PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title - topper.calc</title>
    <meta name="description" content="$desc">
    <link rel="canonical" href="https://www.toppercalc.in$path">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body id="top">
$nav

    <main>
        <article class="legal container">
            <h1>$title</h1>
            <p class="legal-updated">Last updated: 1 November 2026</p>
$body
        </article>
    </main>

$footer
</body>
</html>
"""


def page(path, title, desc, body):
    html = Template(PAGE).substitute(
        title=title, desc=desc, path=path, nav=NAV, footer=FOOTER, body=t(body)
    )
    out = ROOT / path.strip("/") / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html)
    print("wrote", out.relative_to(ROOT))


def sec(title, text):
    return "            <h2>" + title + "</h2>\n" + t(text)


# ------------------------------------------------------------------- about
page(
    "/about/",
    "About topper.calc",
    "What topper.calc is, how it is made and who is behind it.",
    """
            <p>topper.calc is a scientific calculator with a second, wider display. The calculator works exactly like a normal calculator; the wide screen holds your own notes, formulas or reference images, and one button takes you back to the calculator.</p>

            <p>We build it in small batches in India. Each unit is assembled by hand, tested, and shipped with the software already installed.</p>

""" + sec("What it is for", "<p>It is a study aid: a place to keep the formulas, diagrams and reminders you would otherwise write on paper or scroll for on a phone. It is not a recording device, it has no camera or microphone, and it does not connect to the internet on its own.</p>")
    + "\n\n" + sec("What it is not for", "<p>It is not intended for use in examinations, tests or any setting where a second display or reference material is not allowed. Using it in an examination is against the rules of that examination and against our <a href=\"/terms/\">Terms</a>. We do not support, encourage or take responsibility for such use.</p>")
    + "\n\n" + sec("How orders work", "<p>Orders are placed on this website and paid through Razorpay. We start production after payment and dispatch in $lead_time. You will receive shipping updates on the email or phone number you provide at checkout.</p>")
    + "\n\n" + sec("Who we are", "<p>$legal_name operates this website and sells the device. You can reach us at <a href=\"mailto:$email\">$email</a> or through the <a href=\"/contact/\">contact page</a>.</p>")
    + "\n\n" + sec("Not affiliated", "<p>topper.calc is an independent product. Brand names of calculator manufacturers that appear in photographs are the property of their respective owners and are shown only to describe the hardware. We are not affiliated with, endorsed by or sponsored by any calculator manufacturer.</p>"),
)

# ------------------------------------------------------------------- education
page(
    "/education/",
    "Education and study use",
    "How school and college students use topper.calc as a study aid, and the free study tools we provide.",
    """
            <p>Education is the reason topper.calc exists. We build a study aid for school and college students: a calculator shaped device with a wide second screen that holds the formula sheets, diagrams and notes a student would otherwise carry on paper or scroll for on a phone.</p>

            <p>We also publish free browser based <a href="/tools/">study tools</a> - a scientific calculator, a unit converter, a quadratic solver, a percentage calculator and a searchable formula reference - for any student, whether or not they own the device.</p>

""" + sec("What students keep on the screen", """
<p>The wide screen holds one page at a time, about 288 characters or one full screen image. Students typically load:</p>
<ul>
    <li>Formula sheets for physics, chemistry and mathematics</li>
    <li>Diagrams, labelled figures and circuit symbols</li>
    <li>Periodic table extracts and common constants</li>
    <li>Vocabulary lists, dates and timelines</li>
    <li>Their own revision notes and reminders</li>
</ul>
""")
    + "\n\n" + sec("Subjects", """
<p>The device is subject agnostic. In practice it is used most for:</p>
<ul>
    <li><strong>Physics</strong> - equations, constants, circuit and ray diagrams</li>
    <li><strong>Chemistry</strong> - periodic trends, reaction summaries, mole formulas</li>
    <li><strong>Mathematics</strong> - identities, standard results, geometry formulas</li>
    <li><strong>Biology</strong> - labelled diagrams and process summaries</li>
    <li><strong>Engineering</strong> - reference tables, conversion factors, standard values</li>
</ul>
""")
    + "\n\n" + sec("Free study tools", """
<p>Our <a href="/tools/">study tools page</a> has a scientific calculator with degree and radian modes, a length, mass and temperature converter, a quadratic equation solver with discriminant and vertex, a percentage calculator and a searchable formula reference covering maths, physics and chemistry. Everything runs in the browser, needs no account, and sends nothing to a server.</p>
""")
    + "\n\n" + sec("Academic honesty", """
<p>topper.calc is a revision and reference aid, not examination equipment. It must not be used in examinations, tests or any setting where a second display or reference material is not allowed. Using it in an examination is against the rules of that examination and against our <a href="/terms/">Terms</a>. We do not support, encourage or take responsibility for such use.</p>
""")
    + "\n\n" + sec("For teachers, tutors and institutions", """
<p>We supply single units and small batches. If you run a coaching class, school or college and want to order for a group, write to <a href="mailto:$email">$email</a> with the quantity and we will reply with pricing and lead time.</p>
"""),
)

# ------------------------------------------------------------------- contact
page(
    "/contact/",
    "Contact us",
    "Contact topper.calc for order, shipping, refund or product questions.",
    """
            <p>We answer order, shipping, refund and product questions by email. Include your order id (the reference Razorpay sends you) so we can find your order quickly.</p>

            <h2>Email</h2>
            <p><a href="mailto:$email">$email</a></p>

            <h2>Location</h2>
            <p>$legal_name<br>$address</p>

            <h2>Call or WhatsApp</h2>
            <p>We do not publish a phone number. Email us with a good time to call and we will call or message you back the same working day.</p>

            <h2>Response time</h2>
            <p>We reply within $response. If your message is about a payment that has already gone through, you will also get a confirmation from Razorpay with the payment id.</p>

            <h2>Grievance officer</h2>
            <p>For complaints about an order or about how we handle your personal data, write to <a href="mailto:$email">$email</a> with the subject line <span class="mono">Grievance</span>. We will acknowledge within 48 hours and resolve within 15 days.</p>

            <h2>Useful links</h2>
            <ul>
                <li><a href="/shipping/">Shipping policy</a></li>
                <li><a href="/refunds/">Cancellation and refund policy</a></li>
                <li><a href="/terms/">Terms and conditions</a></li>
                <li><a href="/privacy/">Privacy policy</a></li>
            </ul>""",
)

# ------------------------------------------------------------------- terms
page(
    "/terms/",
    "Terms and conditions",
    "The terms that apply when you browse toppercalc.in or buy a topper.calc device.",
    """
            <p>These terms apply to this website and to every order placed through it. By using the site or placing an order you agree to them. If you do not agree, please do not use the site.</p>

""" + sec("1. Who you are dealing with", "<p>This website is operated by $legal_name, $address. Contact: <a href=\"mailto:$email\">$email</a>.</p>")
    + "\n\n" + sec("2. The product", "<p>topper.calc is a scientific calculator fitted with an additional wide display. Product images are representative; the exact finish and calculator model may vary between batches. We describe the main features on the <a href=\"/product/\">product page</a>.</p>")
    + "\n\n" + sec("3. Prices and payment", "<p>All prices are shown in Indian Rupees (INR). The price for one device is &#8377;$price and includes shipping within India. Payment is collected by Razorpay on our behalf; we do not see or store your card or UPI credentials. An order is accepted when payment is received and you see the confirmation page.</p>")
    + "\n\n" + sec("4. Orders and production", "<p>Devices are made to order. Production takes $lead_time from the date of payment, after which we dispatch. If we cannot fulfil an order we will cancel it and refund the full amount.</p>")
    + "\n\n" + sec("5. Shipping", "<p>Delivery timelines, serviceable areas and what to do if a parcel arrives damaged are set out in the <a href=\"/shipping/\">shipping policy</a>.</p>")
    + "\n\n" + sec("6. Cancellation, returns and refunds", "<p>Cancellation, replacement and refunds are governed by the <a href=\"/refunds/\">cancellation and refund policy</a>, which forms part of these terms.</p>")
    + "\n\n" + sec("7. Acceptable use", "<p>You agree not to use the device or this website to break any law or any rule of an examination, competition or institution. The device is sold as a study aid. It is not intended for use in examinations, and using it there is your responsibility and not ours. You also agree not to resell the device as an official product of any calculator manufacturer.</p>")
    + "\n\n" + sec("8. Software and updates", "<p>The device runs open firmware. We may publish software updates; installing third-party or modified firmware is at your own risk and may affect how the device works.</p>")
    + "\n\n" + sec("9. Intellectual property", "<p>The topper.calc name, this website and its content belong to us. Third-party brand names shown in photographs belong to their owners and are used only to identify the hardware.</p>")
    + "\n\n" + sec("10. Liability", "<p>We are responsible for delivering a working device and for refunds as described in the refund policy. To the extent permitted by law, we are not liable for indirect losses, loss of data, or any consequence of using the device in a way it is not intended for, including academic or disciplinary action. Nothing in these terms limits rights you have under Indian consumer law.</p>")
    + "\n\n" + sec("11. Privacy", "<p>How we handle personal data is described in the <a href=\"/privacy/\">privacy policy</a>.</p>")
    + "\n\n" + sec("12. Changes and governing law", "<p>We may update these terms; the version on this page applies when you place an order. These terms are governed by the laws of India, and disputes are subject to the jurisdiction of Indian courts.</p>"),
)

# ------------------------------------------------------------------- privacy
page(
    "/privacy/",
    "Privacy policy",
    "What personal data toppercalc.in collects, why, and how you can control it.",
    """
            <p>This policy explains what personal data we collect when you use toppercalc.in or buy a device, why we collect it, and the choices you have. It applies to this website and to orders placed through it.</p>

""" + sec("1. Who is responsible", "<p>$legal_name, $address. For any privacy question or request, write to <a href=\"mailto:$email\">$email</a>.</p>")
    + "\n\n" + sec("2. What we collect", """<ul>
                <li><strong>Order details</strong> - name, email address, phone number and shipping address you provide at checkout.</li>
                <li><strong>Payment information</strong> - the payment id, order id, amount and status returned to us by Razorpay. We do not receive or store your card number, UPI id, CVV or bank credentials.</li>
                <li><strong>Support messages</strong> - what you send us by email, including attachments.</li>
                <li><strong>Technical data</strong> - the hosting provider logs basic request data such as IP address, browser and the page requested, for security and to keep the site running.</li>
            </ul>""")
    + "\n\n" + sec("3. Why we use it", """<ul>
                <li>To take payment, confirm the order and produce the device.</li>
                <li>To ship the device and share the minimum details a courier needs.</li>
                <li>To answer support questions and handle returns or refunds.</li>
                <li>To meet tax, accounting and other legal obligations.</li>
                <li>To keep the website secure and prevent abuse.</li>
            </ul>
            <p>We rely on your consent and on the need to perform the contract you entered into with us. You can withdraw consent at any time by writing to us, but we may still need to keep records where the law requires it.</p>""")
    + "\n\n" + sec("4. Who we share it with", """<ul>
                <li><strong>Razorpay</strong> - to process the payment.</li>
                <li><strong>Our hosting provider (Vercel)</strong> - to serve this website.</li>
                <li><strong>Courier partners</strong> - name, phone and address, to deliver the order.</li>
                <li><strong>Email and support tools</strong> - to send order updates and reply to you.</li>
                <li><strong>Authorities</strong> - where we are legally required to disclose information.</li>
            </ul>
            <p>We do not sell your personal data.</p>""")
    + "\n\n" + sec("5. Cookies", "<p>This website does not set advertising or analytics cookies. Razorpay sets its own cookies on its payment pages; those are governed by Razorpay's privacy policy.</p>")
    + "\n\n" + sec("6. How long we keep it", "<p>Order and payment records are kept for as long as needed to support the order and to meet tax and accounting requirements. Support emails are kept for up to three years. You can ask us to delete other data at any time.</p>")
    + "\n\n" + sec("7. Your rights", """<p>You can ask us to:</p>
            <ul>
                <li>tell you what personal data we hold about you;</li>
                <li>correct anything that is wrong;</li>
                <li>delete data we no longer need;</li>
                <li>withdraw consent for future use.</li>
            </ul>
            <p>Write to <a href="mailto:$email">$email</a> and we will respond within 30 days. If you are not satisfied, you can complain to the Data Protection Board of India.</p>""")
    + "\n\n" + sec("8. Security", "<p>The site is served over HTTPS. Access to order data is limited to the people who need it to fulfil and support orders. No system is completely secure, so please avoid sending sensitive documents by email unless we ask for them.</p>")
    + "\n\n" + sec("9. Children", "<p>The site is not directed at children under 18. If you are under 18, please place an order with a parent or guardian.</p>")
    + "\n\n" + sec("10. Changes", "<p>If this policy changes, the new version will be published on this page with a new date. Material changes will also be notified by email to customers with an open order.</p>"),
)

# ------------------------------------------------------------------- refunds
page(
    "/refunds/",
    "Cancellation and refund policy",
    "How to cancel an order, return a device and when a refund is issued.",
    """
            <p>We want you to receive a working device. This policy explains cancellation, replacement and refunds. It applies to orders placed on this website and paid through Razorpay.</p>

""" + sec("1. Cancelling before dispatch", "<p>You can cancel any time before the order is dispatched for a full refund. Email us with your order id; we will confirm the cancellation and start the refund.</p>")
    + "\n\n" + sec("2. Cancelling after dispatch", "<p>Once the parcel is with the courier it cannot be cancelled. If you refuse delivery, the parcel returns to us and we refund the amount minus the actual two-way courier cost once we receive it back in saleable condition.</p>")
    + "\n\n" + sec("3. Damaged or not working on arrival", "<p>Check the parcel when it arrives. If the device is damaged, does not switch on, or is not what you ordered, email us within 48 hours of delivery with your order id and photographs or a short video. We will arrange a replacement or a full refund, including any shipping you paid.</p>")
    + "\n\n" + sec("4. What is not covered", """<ul>
                <li>Damage caused after delivery, including drops, liquid damage and cracked displays.</li>
                <li>Devices opened, soldered or modified by you beyond installing published firmware updates.</li>
                <li>Change of mind after the device has been delivered and used.</li>
                <li>Orders where the address or phone number provided was wrong and the parcel was returned.</li>
            </ul>""")
    + "\n\n" + sec("5. How refunds are paid", "<p>Refunds are sent back to the original payment method through Razorpay. We initiate the refund within 2 business days of approving it. Banks usually credit the amount in 5-7 business days; UPI refunds are often faster. You will get an email confirming the refund and a reference number you can use to track it.</p>")
    + "\n\n" + sec("6. Replacement", "<p>Where a replacement is agreed, we ship it after the original unit reaches us, or earlier if we ask you to keep it. Replacement units are tested before dispatch.</p>")
    + "\n\n" + sec("7. How to start a request", "<p>Email <a href=\"mailto:$email\">$email</a> with:</p><ul><li>your order id or Razorpay payment id;</li><li>the date the parcel arrived;</li><li>what is wrong, with photographs or a short video.</li></ul><p>We reply within $response. If the device needs to come back to us, we email you the return address with the approval.</p>")
    + "\n\n" + sec("8. Your statutory rights", "<p>Nothing in this policy affects your rights under the Consumer Protection Act, 2019 or any other law that applies to your order.</p>"),
)

# ------------------------------------------------------------------- shipping
page(
    "/shipping/",
    "Shipping policy",
    "Where we ship, how long production and delivery take, and what to do if something goes wrong.",
    """
            <p>topper.calc is made to order. This page explains where we ship, how long it takes, and what happens if a parcel is delayed or damaged.</p>

""" + sec("1. Where we ship", "<p>We ship across India to serviceable PIN codes. We do not ship internationally yet. If your PIN code is not serviceable, we will contact you and refund the order in full.</p>")
    + "\n\n" + sec("2. Production time", "<p>Each device is assembled and tested after payment. Production takes $lead_time. We dispatch as soon as the unit passes testing.</p>")
    + "\n\n" + sec("3. Delivery time", "<p>After dispatch, delivery usually takes 3-7 business days depending on your location and courier coverage. Remote PIN codes can take longer.</p>")
    + "\n\n" + sec("4. Charges", "<p>Shipping is included in the price of &#8377;$price shown on the product page. There is nothing extra to pay on delivery.</p>")
    + "\n\n" + sec("5. Tracking", "<p>When the parcel leaves us we email you the courier name and tracking number, and send updates to the phone number you provided at checkout. If you do not receive tracking within 3 business days of dispatch, write to us.</p>")
    + "\n\n" + sec("6. Delivery attempts", "<p>Couriers usually make two or three attempts. Please keep the phone number reachable. If the parcel is returned because the address was wrong or nobody was available, we contact you to arrange re-shipping at the actual courier cost.</p>")
    + "\n\n" + sec("7. Damaged in transit", "<p>If the outer box is visibly damaged, take photographs before opening and, if possible, refuse the parcel. If you only discover the damage after opening, email us within 48 hours at <a href=\"mailto:$email\">$email</a> with photographs and your order id. We will arrange a replacement or refund under the <a href=\"/refunds/\">refund policy</a>.</p>")
    + "\n\n" + sec("8. Delays", "<p>Courier delays, weather and local disruptions are outside our control. If your parcel has not arrived within the estimate, write to us and we will follow up with the courier. If it is lost, we will replace it or refund you in full.</p>")
    + "\n\n" + sec("9. Questions", "<p>Write to <a href=\"mailto:$email\">$email</a> with your order id. We reply within $response.</p>"),
)

# ------------------------------------------------------------------- invoice
invoice = t("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sample invoice - topper.calc</title>
<style>
    @page { size: A4; margin: 18mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; color: #111; margin: 0; padding: 24px; background: #fff; }
    .sheet { max-width: 720px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; }
    h1 { font-size: 20px; margin: 0 0 4px; letter-spacing: -0.02em; }
    .muted { color: #555; font-size: 12px; line-height: 1.6; }
    .right { text-align: right; }
    .tag { display: inline-block; margin-top: 8px; padding: 3px 8px; border: 1px solid #111; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
    section { display: flex; gap: 32px; margin-top: 28px; }
    section > div { flex: 1; }
    h2 { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #555; margin: 0 0 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 28px; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #ddd; font-size: 13px; }
    th { font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #555; border-bottom: 1px solid #111; }
    .num { text-align: right; white-space: nowrap; }
    .totals { margin-left: auto; width: 260px; margin-top: 12px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 8px; font-size: 13px; }
    .totals .grand { border-top: 1px solid #111; margin-top: 6px; padding-top: 10px; font-weight: 700; font-size: 15px; }
    footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 14px; font-size: 11px; color: #555; line-height: 1.7; }
</style>
</head>
<body>
<div class="sheet">
    <header>
        <div>
            <h1>$legal_name</h1>
            <div class="muted">$address<br>$email</div>
        </div>
        <div class="right">
            <h1>Tax invoice</h1>
            <div class="muted">Invoice no. TC-000001<br>Date: 1 November 2026</div>
            <div class="tag">Sample</div>
        </div>
    </header>

    <section>
        <div>
            <h2>Billed to</h2>
            <div class="muted">Customer name<br>Customer address line<br>City, State - PIN<br>Phone &middot; email</div>
        </div>
        <div>
            <h2>Shipped to</h2>
            <div class="muted">Customer name<br>Customer address line<br>City, State - PIN<br>Phone</div>
        </div>
    </section>

    <table>
        <thead>
            <tr><th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th></tr>
        </thead>
        <tbody>
            <tr>
                <td>topper.calc device (scientific calculator with wide display)</td>
                <td class="num">1</td>
                <td class="num">&#8377;$price.00</td>
                <td class="num">&#8377;$price.00</td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <div><span>Subtotal</span><span>&#8377;$price.00</span></div>
        <div><span>Shipping</span><span>Included</span></div>
        <div><span>Payment</span><span>Razorpay</span></div>
        <div class="grand"><span>Total paid</span><span>&#8377;$price.00</span></div>
    </div>

    <footer>
        This is a sample invoice generated for payment gateway verification. Prices are in Indian Rupees.
        Payment reference: pay_SAMPLE0000000000. For questions write to $email.
    </footer>
</div>
</body>
</html>
""")
(ROOT / "invoice-sample.html").write_text(invoice)
print("wrote invoice-sample.html")

# ------------------------------------------------------------------- patch footers
LEGAL_BLOCK = t("""        <div class="footer-legal container">
            <nav class="footer-policy" aria-label="Policies">
                <a href="/about/">About</a>
                <a href="/contact/">Contact</a>
                <a href="/terms/">Terms</a>
                <a href="/privacy/">Privacy</a>
                <a href="/refunds/">Refunds</a>
                <a href="/shipping/">Shipping</a>
            </nav>
            <p class="footer-contact">$email &middot; $address</p>
        </div>""")


def patch(path, anchor):
    p = ROOT / path
    s = p.read_text()
    if "footer-legal" in s:
        print("skip (already patched)", path)
        return
    if anchor not in s:
        print("!! anchor missing in", path)
        return
    s = s.replace(anchor, anchor + "\n" + LEGAL_BLOCK, 1)
    p.write_text(s)
    print("patched", path)


patch("index.html", """            <div class="footer-links">
                <a href="#how">How it works</a>
                <a href="app/">Web app</a>
                <a href="product/">Product</a>
                <a href="product/">Buy</a>
            </div>
        </div>""")

patch("product/index.html", """            <div class="footer-links">
                <a href="../index.html#how">How it works</a>
                <a href="../app/">Web app</a>
                <a href="../index.html">Home</a>
            </div>
        </div>""")

patch("thank-you.html", """            <div class="footer-links">
                <a href="index.html#how">How it works</a>
                <a href="app/">Web app</a>
                <a href="product/">Product</a>
            </div>
        </div>""")

patch("app/index.html", """            <div class="footer__links">
                <a href="/">Home</a>
                <a href="/product/">Buy</a>
            </div>
        </div>""")

# ------------------------------------------------------------------- sync contact line
import re
CONTACT = t('<p class="footer-contact">$email &middot; $address</p>')
for html in ROOT.rglob("*.html"):
    s = html.read_text()
    if 'class="footer-contact"' not in s:
        continue
    new = re.sub(r'<p class="footer-contact">.*?</p>', CONTACT, s)
    if new != s:
        html.write_text(new)
        print("synced footer contact:", html.relative_to(ROOT))
