---
layout: single
title: TE.TE HTTP request smuggling obfuscating the TE header
excerpt: "Partial disclosure of a bug bounty report: TE.TE HTTP request smuggling obfuscating the TE header."
date: 2023-05-03
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
  - burpsuite
  - burp scanner
  - portswigger
  - http request smuggling
  - xss
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

In this post I am going to show an HTTP request smuggling that I reported in a bug bounty program: TE.TE HTTP request smuggling obfuscating the TE header. This type of vulnerability is not as well known as other vulnerabilities such as XSS, SQL injection... but it's no less important. It is recommended to have at least a basic knowledge about this vulnerability before reading this post. There are numerous sources where you can get information but as I always do I recommend you to go to PortSwigger

[HTTP request smuggling (PortSwigger)](https://portswigger.net/web-security/request-smuggling)

<div id='section-id-1'/>
## 1. Asset discovery

I found this asset through amass + httpx. If you are looking for http services on subdomains of the domain example.com and you have your config file in the path */home/user/.config/amass/config.ini*, you can use the following command

{% include codeHeader.html %}
```console
amass enum -brute -d example.com '/home/user/.config/amass/config.ini' | httpx -title -tech-detect -status-code -ip -p 66,80,81,443,445,457,1080,1100,1241,1352,1433,1434,1521,1944,2301,3000,3128,3306,4000,4001,4002,4100,5000,5432,5800,5801,5802,6082,6346,6347,7001,7002,8080,8443,8888,30821
```

[Amass](https://github.com/OWASP/Amass) is an OSINT tool to perform network mapping of attack surfaces and external asset discovery which is a very famous tool used in the recon step in bug bounty. The output of the above amass command is a list of subdomains of the given domain, i.e, a list of potential targets.

[Httpx](https://github.com/projectdiscovery/httpx) is a multi-purpose HTTP toolkit allow to run multiple probers. In this case, the input of httpx is a list of subdomains and the output is a list of subdomains that have an http service in any of the ports given as a parameter. Also it shows some additional information about the service such as the title, the detected technologies... that I have specified in the parameters to be displayed.

<div id='section-id-2'/>
## 2. Vulnerability discovery

I found this vulnerability through the *Burp Scanner*, as you can see in the following capture

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/vulnerability-detection.png)

As you can see, several HTTP request smuggling alerts appeared, the first one with a higher confidence level than the others, *Confidence Firm*. I have also pointed out in the capture an alert about cross-site scripting but we will talk about this in section 3.2 :wink:

In my experience, this *Burpsuite* alert yields many false positives about HTTP request smuggling. Let's look at the requests that triggered this alert and why I investigated it further.

The first request was

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/detection-request-1.png)

and the response was

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/detection-response-1.png)

The request sent is typical when testing for TE.TE HTTP request smuggling vulnerabilities. It is not the purpose of this post to explain what HTTP request smuggling is but if you want a more detailed explanation you can see it in section 3.2.
The HTTP response code was 400 which usually indicates that the request sent is malformed. This alone is not a solid indicator that there is HTTP request smuggling but it fits.

The second request was

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/detection-request-2.png)

and the response was

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/detection-response-2.png)

The request is essentially the same except that there is a GET request attached to the end of the request, and this detail is quite important. On the other hand, the response was the same.

The third request was

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/detection-request-3.png)

and the response was

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/detection-response-3.png)

This set off alarm bells in my mind :mega: :mega: :fire: The path and the parameter on which the request is made was the same as in the case of request 1 and yet the HTTP response code was 404. This is the HTTP code returned when a request is made to a non-existent web resource. So this resource existed when request 1 was made but not when request 3 was made... Suspicious :suspect:

Why might this have happened? Possibly because request 2 had an influence on the server, polluting request 3, and making it instead of being a POST request to the resource of request 3, a GET request to the resource */jobwwkhkhhzuufxcva6jakjqjql9y04tskm8gy4oref3*, which is attached at the end of request 2. This type of behavior fits the typical behavior of an HTTP request smuggling.

<div id='section-id-3'/>
## 3. Vulnerability exploitation

<div id='section-id-3-1'/>
## 3.1. Steps of exploitation

To check if the hypothesis that I stated in the previous section is true, I sent the following request in the *Burpsuite Repeater*

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/dos-request.png)

If my hypothesis was true, the next request to any path in the domain should return an HTTP 404 response. I tried to access the web through the browser and I got the following response

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/dos-test.png)

I made this check accessing from different PCs, different networks... and the behavior was always the same so it was already sure that I had found an HTTP request smuggling.

In this case the impact that I had managed to demonstrate was a DoS (Denial of Service) because by constantly sending the previous request using a tool like the *Burpsuite Intruder* for example, you can contaminate the requests of other users who are interacting with the web. Since this was the first time I encountered HTTP request smuggling, I was a bit playful and thought.... Could I get a bigger impact?

There was a login form but it had no credentials, there was also a contact form... and not much else but... remember in section 2 I talked about the existence of cross-site scripting? In this program I have access to the reports of the rest of bug bounty hunters and this XSS corresponds to a reported XSS not yet patched so unfortunately I will not receive any bounty for it, but maybe I can use it to escalate my report :smirk:

The idea I had in mind was, instead of polluting user requests with a request to a non-existent resource, to pollute them with an XSS. So I sent the following request in the *Burpsuite Repeater*

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/xss-request.png)

I tried to access the web through the browser and I got the following response

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/xss-test.png)

so I managed to poison user requests with an XSS. By constantly sending the above request using a tool like the *Burpsuite Intruder*, the impact achieved would be something like an stored XSS triggered by any request made to the web. Sounds dangerous, right? :skull:

<div id='section-id-3-2'/>
## 3.2. Why does the payload work?

Why does, for example, the request associated with the XSS work? By following this link

[HTTP request smuggling (PortSwigger)](https://portswigger.net/web-security/request-smuggling)

it seems that the type of the HTTP request smuggling I found is TE.TE. The main reason is the space in front of the *Transfer-Encoding* header which seems to be a kind of obfuscation. In fact in the link this type of obfuscation is contemplated

![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/transfer-encoding-obfuscation.png)

Let's see what could possibly be happening when sending this request:

1. The hacker sends the following request

   ![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/xss-request.png)
   
2. The request arrives at the front-end.

3. The front-end tries to process the *Transfer-Encoding* header but cannot so it tries to process the *Content-Length* header

   ![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/payload-works-1.png)
   
4. After processing, the front-end considers the entire request as a single request in the normal way, and sends it to the back-end

   ![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/payload-works-2.png)
   
5. The back-end tries to process the *Transfer-Encoding* header and in this case it can process it successfully, so it considers that the request ends at 0, leaving the rest of the request queued to be part of the beginning of the next one. It looks something like this

   ![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/payload-works-3.png)
   
   where request 1 is processed by the back-end and request 2 remains queued. Using the following PortSwigger capture
   
   ![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/payload-works-4.png)
   
   the blue request is the request 1, the red request is the request 2 and the green requests are the requests made by the users.
   
6. A user sends a request to the web and it will be attached to the end of the malicious request queued, after the header *X-Ignore: X*, leaving a situation like this

   ![](/assets/images/2023-05-03-te-te-http-request-smuggling-obfuscating-te-header/payload-works-5.png)
   
   This is why you have to put a header after the GET request. It doesn't matter if it is the header *X-Ignore: X* or any other like *Foo: x*, the important thing is to put one so that the final request that arrives to the back-end is similar to the one that I showed in the previous capture. If you want to obtain more information on this topic you can check the following link
   
   [What is the use of X-Ignore HTTP header? (PortSwigger)](https://forum.portswigger.net/thread/what-is-the-use-of-x-ignore-http-header-8d60afc1)
   
As you can see, it is a TE.TE HTTP request smuggling whose exploitation has been the same as that of a CL.TE HTTP request smuggling since the front-end processes the *Content-Length* header and the back-end processes the *Transfer-Encoding* header.

<div id='section-id-4'/>
## 4. Report resolution

The subdomain was not too important and as I indicated earlier some vulnerabilities had been reported on it. The severity of an HTTP request smuggling is highly variable as it depends directly on the impact achieved. In the following links you can see several HTTP request smuggling reported in HackerOne classified with different severities

[Low severity HTTP request smuggling in HackerOne](https://hackerone.com/reports/1063627)

[Medium severity HTTP request smuggling in HackerOne](https://hackerone.com/reports/1238709)

[High severity HTTP request smuggling in HackerOne](https://hackerone.com/reports/867952)

[Critical severity HTTP request smuggling in HackerOne](https://hackerone.com/reports/955170)

In this case I managed to use this HTTP request smuggling to give temporary persistence to an already reported reflected XSS, but without major impact. Therefore, the report was classified as

- **Asset criticity**: Medium
- **Vulnerability severity**: Medium
- **Bounty**: More than $100

I consider that the bounty was quite low considering the potential danger of the vulnerability, but that's how it goes :angry:

<div id='section-id-5'/>
## 5. Lessons learned

- *Burp Scanner* is a very important tool that, if conditions permit, should be launched. It performs many tests automatically that can provide very interesting alerts.
- It is advisable to analyze all alerts received, not only from *Burpsuite*, but from any software. The existence of false positives is not a reason to stop manually inspecting alerts.
- If you have the possibility, it's good to see the reports of other bug bounty hunters. You will learn from them, you will know the existence of other assets... but try not to step on their work doing pentesting on the same assets at the same time as them.


