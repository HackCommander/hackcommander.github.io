---
layout: single
title: Defeating XSS filters using unexpected HTML attributes
excerpt: "Partial disclosure of a bug bounty report: defeating XSS filters using unexpected HTML attributes."
date: 2025-03-30
classes: wide
header:
  teaser: /assets/images/general/bug-bounty.jpg
  teaser_home_page: true
  icon:
categories:
  - bug bounty
tags:  
  - web
  - osint
  - amass
  - httpx
  - waymore
  - kxss
  - burpsuite
  - portswigger
  - xss
  - bypass
---

## Summary 

- [1. Asset discovery](#section-id-1)
- [2. Vulnerability discovery](#section-id-2)
- [3. Vulnerability exploitation](#section-id-3)
  - [3.1. Steps of exploitation](#section-id-3-1)
  - [3.2. Why does the payload work?](#section-id-3-2)
- [4. Report resolution](#section-id-4)
- [5. Lessons learned](#section-id-5)

![](/assets/images/general/bug-bounty.jpg)

> :warning: <span style="color:red">This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a partial disclosure, only the essential technical details are exposed.</span>


In this post, I’m going to explain a tricky XSS that I found a few years ago while doing bug bounty. This isn’t a mind-blowing finding, as I simply managed to bypass the filters and execute an *alert()*. However, I decided to write about it for several reasons:

1. **It may be useful for bug bounty hunters.** Those who struggle with bypassing WAFs, filters, or sanitization mechanisms when exploiting XSS might find inspiration in this post to develop their own payloads manually and lose less money on collaborations.
2. **It may also be valuable for pentesters.** As you can see on my LinkedIn, although I started my career in offensive security as a bug bounty hunter, I later worked as a pentester for cybersecurity consulting firms. During my time as a pentester, I noticed something very interesting: many pentesters who don’t do bug bounty often struggle to bypass WAFs, filters, or sanitization mechanisms. Since audit timelines are usually tight, they are often able to detect the XSS but fail to find a working payload, and because they never have the time to practice, they never truly master the technique. In this post, I will share a general methodology that can help, even when working under time constraints.

I hope you enjoy it!

<div id='section-id-1'/>
## 1. Asset discovery

I found this asset through amass + httpx. If you are looking for http services on subdomains of the domain example.com and you have your config file in the path */home/user/.config/amass/config.ini*, you can use the following command

{% include codeHeader.html %}
```console
amass enum -brute -d example.com '/home/user/.config/amass/config.ini' | httpx -title -tech-detect -status-code -ip -p 66,80,81,443,445,457,1080,1100,1241,1352,1433,1434,1521,1944,2301,3000,3128,3306,4000,4001,4002,4100,5000,5432,5800,5801,5802,6082,6346,6347,7001,7002,8080,8443,8888,30821
```

[Amass](https://github.com/OWASP/Amass) is an OSINT tool to perform network mapping of attack surfaces and external asset discovery which is a very famous tool used in the recon step in bug bounty. The output of the above amass command is a list of subdomains of the given domain, i.e, a list of potential targets.

[Httpx](https://github.com/projectdiscovery/httpx) is a multi-purpose HTTP toolkit allow to run multiple probers. In this case, the input of httpx is a list of subdomains and the output is a list of subdomains that have an http service in any of the ports given as a parameter. Also it shows some additional information about the service such as the title, the detected technologies... that I have specified in the parameters to be displayed.

**This domain is one of the most important domains of the company**, so it could also be obtained by googling the name of the company without the need to use any specific subdomain discovery tool.

<div id='section-id-2'/>
## 2. Vulnerability discovery

I found this vulnerability through waymore + kxss. If you are looking for XSS in the subdomain www.example.com, you can execute the following commands

{% include codeHeader.html %}
```console
python3 waymore.py -i www.example.com -mode U
cd ~/waymore/results/www.example.com
cat waymore.txt | grep "?" | uro > param.txt
cat param.txt | kxss > kxss.txt
```

[Waymore](https://github.com/xnl-h4ck3r/waymore) is a tool used to fetch known URLs from the Wayback Machine, Common Crawl, AlienVault's Open Threat Exchange, URLScan Virus Total and Intelligence X for any given domain. This tool does not always find all the URLs of a domain but it is a good starting point to search XSS or other types of vulnerabilities. The biggest difference between waymore and other tools is that it can also download the archived responses for URLs on wayback machine so that you can then search these for even more links, developer comments, extra parameters, etc.

[Kxss](https://github.com/Emoe/kxss) is a tool used to find all the "problematic characters" that are reflected in the response of any URL given as a parameter. The reflection of some problematic characters does not mean that an XSS exists but it is an indication that it could exist.

The code above runs waymore to gather URLs for www.example.com in "U" mode (URL collection), then filters URLs with parameters (containing "?") and extracts them into param.txt. Finally, it pipes those URLs into kxss to detect potential XSS reflections, saving the results to kxss.txt.

I no longer have the output file, but the result contained some lines as follows

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/waymore-kxss-output.png)

where red color is obfuscating the XSS candidate URLs and parameters.

<div id='section-id-3'/>
## 3. Vulnerability exploitation

<div id='section-id-3-1'/>
## 3.1. Steps of exploitation

The URL was some sort of resource for redeeming benefits or activating promotions. The vulnerable parameter was the parameter *code*, which should be the promotion code or something like that. So I first sent the < character and the response was as follows

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-repeater-1.png)

The response was an HTTP 400 code, and considering that the initial scan showed that the < character was reflected, I thought it might be an encoding issue. So, I sent the same < character but URL-encoded and the response was as follows

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-repeater-2.png)

In this case the server responded with HTTP code 200 and the character was reflected correctly.

Then I sent the payload `<script>` to check if I could send HTML tags

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-repeater-3.png)

but the server responded with a security redirection, returning HTTP code 302. This could mean that the filter was blocking any type of HTML tag or maybe only script tags. To check it out, I sent the tag `<img src=1>` and I got the following response

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-repeater-4.png)

HTTP code 200, great! This means the filter is flexible, and I can send HTML tags with attributes, so I can play a bit :smiling_imp:

Then I sent the payload `<img src=1 onerror="">` to check if I can inject JavaScript code, that means, whether the filter accepts all types of attributes or blocks certain dangerous attributes. The response was the following

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-repeater-5.png)

The server responded with a security redirection, which implies that the server does block certain attributes.

To determine which attributes the filter was blocking, I performed fuzzing on the attribute using all possible events from the [cross-site scripting (XSS) cheat sheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet):

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/cheat-sheet-1.png)

The result of performing the fuzzing with burp intruder was as follows:

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-intruder.png)

This fuzzing reveals different events that can be used within an `<img>` tag specifically, those associated with an HTTP 200 status code. For example, the filter accepts inputs in the form of `<img src=1 onafterscriptexecute="">`.

However, it’s important to note that the filter may allow these events for the `<img>` tag while accepting different events for other tags. This would require a more general fuzzing approach, combining all tags with all possible events, that is, performing a cluster bomb attack using as parameters the tag name and the event. As we will see next, this case is simpler, as it seems to only blacklist events without considering the tag they are in.

At this point I changed strategy and, instead of continuing to use the img tag, I looked for payloads that used the events found in the fuzzing and did not require user interaction to execute. I only had to test the first 3 payloads:

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/cheat-sheet-2.png)

I didn’t even test the payload associated with the *onafterscriptexecute* event because, as you may remember, the filter blocks `<script>` tags, so it’s guaranteed to fail.

Using the payload of the *onanimationcancel* attribute and changing the payload from *print* to *alert*, that is, using the payload

{% include codeHeader.html %}
```html
<style>@keyframes x{from {left:0;}to {left: 1000px;}}:target {animation:10s ease-in-out 0s 1 x;}</style><xss id=x style="position:absolute;" onanimationcancel="alert(1)"></xss>
```

the response was the following

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-repeater-6.png)

This implies that the filter is blocking this payload. The question is... is it blocking any of the tags, any of the attributes or the javascript code? To check if it was blocking the JavaScript code I changed it to the following code

{% include codeHeader.html %}
```html
[].map.call`${alert}1`
```

which we have already seen in previous posts, resulting in the payload as follows

{% include codeHeader.html %}
```html
<style>@keyframes x{from {left:0;}to {left: 1000px;}}:target {animation:10s ease-in-out 0s 1 x;}</style><xss id=x style="position:absolute;" onanimationcancel="[].map.call`${alert}1`"></xss>
```

When I sent the payload, the response was the following

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-repeater-7.png)

Great! The answer fully reflects the payload, so the problem was the JavaScript code, but the *alert* function was not executed. This code defines a CSS animation that moves an element when it becomes the target and the `<xss>` element has an onanimationcancel event that, when triggered, executes the JavaScript payload. So I think the JavaScript payload didn't execute, among other reasons, because I forgot to add #x to the URL :laughing:

Then I tried the payload of the *onanimationend* event, but changing the JavaScript code for the one I discovered in the previous payload, resulting in the following payload

{% include codeHeader.html %}
```html
<style>@keyframes x{}</style><xss style="animation-name:x" onanimationend="[].map.call`${alert}1`"></xss>
```

I got the following response

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/burp-repeater-8.png)

and the alert function is executed

![](/assets/images/2025-03-30-defeating-xss-filters-using-unexpected-html-attributes/alert.png)

<div id='section-id-3-2'/>
## 3.2. Why does the payload work?

The main reason the payload works is because the **XSS filter is deficient**. It implements a blacklist of tags and attributes that it considers dangerous, but it doesn't cover all possible cases and leaves dangerous tag and attribute combinations unfiltered. Using a blacklist as a filtering method is not secure for this reason, so it’s better to implement a whitelist or a regex that only allows inputs following a specific structure.

On the other hand, it remains to be explained what the payload used does. First of all, it is defined the CSS animation:

{% include codeHeader.html %}
```html
<style>@keyframes x{}</style>
```

This code defines an empty animation called *x*. The fact that it does nothing specific inside the {} doesn’t affect the purpose of the code, as the animation is simply used as a trigger for the *onanimationend* event in the next step.

After this, it is defined the xss element:

- `<xss>:` this is a fictitious element or custom tag, which doesn’t have a specific purpose in standard HTML, but some browsers process it as valid.
- `style="animation-name:x":` the animation x defined earlier is applied to the element. Even though the animation doesn’t have any visible effects because it’s empty, it still generates an event when it ends, which is what matters here.
- `onanimationend="[].map.call${alert}1":` the onanimationend event fires when the x animation ends, even though it does nothing visually. When this happens, the JavaScript code is executed, displaying the *alert*.

So, this is the execution flow when the victim access to the vulnerable link:

1. The x animation is applied to the `<xss>` element.
2. Even though the animation doesn’t do anything visually, the browser triggers the *onanimationend* event when the animation finishes.
3. When the *onanimationend* event is fired, the malicious JavaScript code is executed, displaying an *alert* in the browser.

<div id='section-id-4'/>
## 4. Report resolution

As I said before, the affected domain was one the most important domains of the company so the asset criticity was classified as high. In fact at the time I reported this vulnerability there was a 3X reward multiplier on any vulnerability reported in certain domains of the company, including this one. Also an XSS usually is considered a medium severity vulnerability and because I wasn't able to sign up and log in the website, I couldn't demonstrate a high impact such as session hijacking. Therefore, the report was classified as 

- **Asset criticity**: High
- **Vulnerability severity**: Medium
- **Bounty**: More than $600 (because of the 3X reward multiplier)

<div id='section-id-5'/>
## 5. Lessons learned

- **Don’t base your tests on using predefined payload lists or randomly copying and pasting payloads, as they may require modifications.** As we've seen, the payload associated with the *onanimationend* event worked in the end, but only after modifying the JavaScript payload (which was initially rejected by the filter) with one I discovered during manual testing. If I had used the predefined payload with the original JavaScript, the server would have rejected the request with a security redirect.
- **Take your time, reading and understanding the payloads you're using.** We saw how I found a valid payload related to the *onanimationcancel* event, but I couldn't execute the alert because I didn’t take the time to understand the payload. Instead, I rushed ahead and quickly moved on to the next event. If I had stopped to read and understand the payload, I probably would have realized I needed to add #x to the URL to trigger the alert.
- **Frame your testing within a general strategy, but don’t go overboard with unnecessary tests too early.** In this case, I started with some manual testing and later moved on to some fuzzing to determine which attributes the filter accepted for the img tag. Then, I continued the exploitation, assuming that those attributes would be accepted not just for the img tag, but for all tags, and I was correct. Start with manual testing and some basic fuzzing, and if things don’t go as expected, reassess your hypotheses and perform a more thorough scan or advanced fuzzing.
