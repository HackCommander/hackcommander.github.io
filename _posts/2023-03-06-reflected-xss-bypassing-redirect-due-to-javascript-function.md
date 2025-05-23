---
layout: single
title: Reflected XSS bypassing a 302 Security Redirect due to the presence of Javascript function calls
excerpt: "Partial disclosure of a bug bounty report: reflected XSS bypassing a *302 Security Redirect* due to the presence of Javascript function calls."
date: 2023-03-06
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
  - utm parameters
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

In this post I am going to show an interesting XSS that I reported in a bug bounty program: reflected XSS bypassing a *302 Security Redirect* due to the presence of Javascript function calls. As a good novel, it has all the elements to be an interesting report: a bypass, a custom payload, a PortSwigger's research article... I hope you enjoy it and learn something new!

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

I found this vulnerability through gau + kxss. If you are looking for XSS in the subdomain www.example.com, you can use the following command

{% include codeHeader.html %}
```console
gau www.example.com | kxss
```

[Gau](https://github.com/lc/gau) is a tool used to fetch known URLs from AlienVault's Open Threat Exchange, the Wayback Machine, Common Crawl and URLScan for any given domain. This tool does not always find all the URLs of a domain but it is a good starting point to search XSS or other types of vulnerabilities.

[Kxss](https://github.com/Emoe/kxss) is a tool used to find all the "problematic characters" that are reflected in the response of any URL given as a parameter. The reflection of some problematic characters does not mean that an XSS exists but it is an indication that it could exist.

Both tools are based in other tools of [tomnomnom](https://github.com/tomnomnom).

In this case I got an output like the following

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/gau-kxss-output.png)

where the blue color is obfuscating unimportant findings and the red color is obfuscating the XSS candidate URLs.

As you can see, there are 2 parameters that reflect all the dangerous characters: *utm_campaign* and *utm_source*. Both parameters belong to the same URL and in fact in the URL there were more [UTM parameters](https://en.wikipedia.org/wiki/UTM_parameters) in the same situation. It is not the first time I find an XSS in this type of parameters so it is always worth taking a look at them.

<div id='section-id-3'/>
## 3. Vulnerability exploitation

<div id='section-id-3-1'/>
## 3.1. Steps of exploitation

Although there are several UTM parameters that may be vulnerable to XSS, I am going to focus on the *utm_source* parameter. I have seen that the *utm_source* parameter reflects all the dangerous characters but it's important to see where the parameter is reflected in the response, that is, the context of the XSS. Why is this important? Because it's essential to build a customized payload.

By sending the payload *HackCommander* through the *utm_source* parameter I got the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-exploitation-1.png)

As you can see the payload is reflected inside a Javascript script, so the potential XSS would be in a Javascript context. Within the script, the payload is reflected inside a dictionary that is passed as a parameter to the *push* method of the *dataLayer* array. The yellow color is obfuscating the value of one of the dictionary keys so the payload *HackCommander* is reflected inside one of the dictionary values, not inside one of the keys.

So if I want to inject Javascript code I have to send a payload with the following characters:

1. <span style="color:red">"</span> to close the string.
2. <span style="color:red">}</span> to close the dictionary.
3. <span style="color:red">)</span> to close the call to the *push* method.
4. <span style="color:red">;</span> to close the Javascript line of code which calls the push method of the *dataLayer* array.
5. A Javascript payload such as <span style="color:red">alert(1);</span>.
6. A <span style="color:red"></script></span> tag to close the Javascript script to avoid Javascript syntax errors.

Before injecting any Javascript payload, let's see if I can close the *push* method and inject some string into the script. Sending a payload like the following

{% include codeHeader.html %}
```html
"});HackCommander;</script>
```

I got the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-exploitation-2.png)

So far so good! Then I tried to send the following payload

{% include codeHeader.html %}
```html
"});alert(1);</script>
```

and I got the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-exploitation-3.png)

The server didn't like something because when I changed the *HackCommander* payload to the Javascript payload *alert(1)* it returned a *302 Security Redirect*. It is possible that there was some WAF or server-side configuration implemented to detect potentially dangerous payloads, in this case Javascript function calls.

Javascript allows to use &#96;&#96; instead of () to call functions such as alert ([Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)), that is, it allows to use calls of the form alert&#96;1&#96;. Not all security measures take into account this flexibility of Javascript and only blacklist expressions of the form *string1(string2)*. Therefore, a typical bypass for this type of situation is to change the () to &#96;&#96;, that is, use a payload of the type

{% include codeHeader.html %}
```html
"});alert`1`;</script>
```

In spite of this, I received the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-exploitation-4.png)

DAMN! It doesn't work. So... I had to follow another strategy.

After a while, I remembered a Linkedin post I had seen from the PortSwigger researching team that talked about different ways to call a JavaScript function without parentheses

[The seventh way to call a JavaScript function without parentheses (PortSwigger)](https://portswigger.net/research/the-seventh-way-to-call-a-javascript-function-without-parentheses)

After taking a look at all the proposed payloads, I thought that the seventh method discovered might fit my needs. Therefore I sent the following payload

{% include codeHeader.html %}
```html
"});[].map.call`${alert}1`;</script>
```

and I received the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-exploitation-5.png)

The payload is completely reflected! Redirection bypassed!

After that, clicking in the option *Show response in browser* I got the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-exploitation-6.png)

with an empty alert. After clicking *OK* I got the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-exploitation-7.png)

with the *alert(1)*. I am not sure why the empty *alert* appeared but the important fact is that the *alert(1)* was executed.

This is why it is important to keep up to date in the cybersecurity field and read all the researching articles.

<div id='section-id-3-2'/>
## 3.2. Why does the payload work?

It is not the purpose of this section to explain the meaning of the payload as this can be seen in the PortSwigger link above. What this section is intended to explain is... Why did this payload bypass the *302 Security Redirect*? **It is impossible to know for sure the answer to this question without having the source code but here is my theory**.

If you remember, in the previous section, the following payload

{% include codeHeader.html %}
```html
"});alert(1);</script>
```

returned a *302 Security Redirect*.

But... What is the origin of this redirection? The *alert* string? The brackets? The combination of both?. The following payload

{% include codeHeader.html %}
```html
"});HackCommander(1);</script>
```

is the same as the previous one but changing the *alert* string to the *HackCommander* string, and I got the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-demonstration-blacklist-1.png)

so... the problem was the *alert* string? To solve this question I sent the following payload

{% include codeHeader.html %}
```html
"});alert;</script>
```

and I got the following response

![](/assets/images/2023-03-06-reflected-xss-bypassing-redirect-due-to-javascript-function/repeater-demonstration-blacklist-2.png)

so the problem was not the *alert* string. As you can see the problem was combination of the *alert* string plus the input argument.

So what I think is causing the redirection is some regex-like mechanism that rejects payloads of the type *keyword(inputParams)* or *keyword&#96;inputParams&#96;* (calls to Javascript functions and methods, in general) where *keyword* is any element of a blacklist composed of Javascript method names, a blacklist of the type

{% include codeHeader.html %}
```html
alert
prompt
...
```

So the following payload

{% include codeHeader.html %}
```html
"});[].map.call`${alert}1`;</script>
```

probably bypass the redirection because the string *call* is not in the blacklist.

In a nutshell, **I think the vulnerability comes from using a blacklist of Javascript methods to reject suspicious payloads instead of using another more robust and general validation method**.

<div id='section-id-4'/>
## 4. Report resolution

As I said before, the affected domain was one the most important domains of the company so the asset criticity was classified as high. In fact at the time I reported this vulnerability there was a 3X reward multiplier on any vulnerability reported in certain domains of the company, including this one. Also an XSS usually is considered a medium severity vulnerability and because I wasn't able to sign up and log in the website, I couldn't demonstrate a high impact such as session hijacking. Therefore, the report was classified as 

- **Asset criticity**: High
- **Vulnerability severity**: Medium
- **Bounty**: More than $600 (because of the 3X reward multiplier)

<div id='section-id-5'/>
## 5. Lessons learned

- Scan all the company's domains, do not stop looking for vulnerabilities in a domain because it is well known and you think that all the vulnerabilities are already reported. In this case I discovered an XSS in a well known domain of the company because the XSS was not obvious, it required a bypass, which although it was simple no one had discovered before. So... be humble with your colleagues but be confident, it is fundamental if you want to dedicate yourself seriously to bug bounty.
- Be aware of the multipliers applied to the programs in which you participate. These multipliers can turn a low hanging fruit into a big banana :banana:.
- It's important to keep up to date in the cybersecurity field and read all the researching articles. Today's discoveries can invalidate yesterday's security measures.


