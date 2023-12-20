---
layout: single
title: Reflected XSS in search filter clear button in an e-commerce website
excerpt: "Partial disclosure of a bug bounty report: reflected XSS in search filter clear button in an e-commerce website."
date: 2023-06-24
classes: wide
header:
  teaser: /assets/images/general/bug-bounty.jpg
  teaser_home_page: true
  icon:
categories:
  - bug bounty
tags:  
  - web pentesting
  - osint
  - amass
  - httpx
  - burpsuite
  - portswigger
  - xss
---

## Summary 

- [1. Asset discovery](#section-id-1)
- [2. Vulnerability discovery](#section-id-2)
- [3. Vulnerability exploitation](#section-id-3)
  - [3.1. Steps of exploitation](#section-id-3-1)
    - [3.1.1. Struggling to find a payload](#section-id-3-1-1)
    - [3.1.2. The winning payload](#section-id-3-1-2)
  - [3.2. Why does the payload work?](#section-id-3-2)
- [4. Report resolution](#section-id-4)
- [5. Lessons learned](#section-id-5)

![](/assets/images/general/bug-bounty.jpg)

> :warning: <span style="color:red">This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a partial disclosure, only the essential technical details are exposed.</span>

In this post I am going to show an interesting XSS that I reported in a bug bounty program: reflected XSS in search filter clear button in an e-commerce website. I will show you all the payloads I tried, some of them quite curious, and how my friend [Fran](https://www.linkedin.com/in/cybersecurityfranciscogilamoros/) ended up giving me the winning payload. Sometimes the important thing is not the result but the way.

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

I discovered this XSS by chance while waiting for the *Burp Scanner* to finish. I sent the payload

{% include codeHeader.html %}
```html
HackCommander"'><
```

with some "dangerous" characters and I received the following response

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/detection-request.png)

As you can see the payload broke the a tag. The < character was not reflected but the "'> characters were, because as you can see it breaks the a tag making that the characters "> that formed the end of the tag are no longer part of it and now they are outside, as the arrow points out. This made me think that there could be an XSS.


<div id='section-id-3'/>
## 3. Vulnerability exploitation

<div id='section-id-3-1'/>
## 3.1. Steps of exploitation

<div id='section-id-3-1-1'/>
### 3.1.1. Struggling to find a payload

As you saw in the above capture, the < character was not reflected so I had to try XSS in the context of the attributes.

Therefore, the first payload I sent was

{% include codeHeader.html %}
```html
"+onclick="alert(1)
```

and I got the following response

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-onclick-burp.png)

The response in the browser looked like this

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-onclick-browser.png)

and by clicking on the *X*, the *alert(1)* was executed, as you can see in the following capture

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-onclick-alert.png)

But... what is this *X*? It is the tag that we are dealing with in this XSS and its function is to serve as a kind of "button" to remove the filters set when you are looking for a product to buy, since this website was an e-commerce website. It serves to remove a concrete filter that as you can guess is of the type price, manufacturer, rating... and the title attribute of each a tag is something like *Remove + "name of the filter"*. The title attribute is the injection point.

For example, if you were looking for chairs for less than 100 euros with a rating of at least 4 stars, you will have an *X* button for each of these filters, which you can delete individually by clicking on the corresponding *X*. The title attribute of the a tag used to remove the price would be *Remove price*.

This XSS requires user interaction, it requires the user to click on that tiny X. So the goal I had was to scale this XSS to one that required no interaction or a more likely interaction.

So first I tried to make it so that the user didn't have to click but simply hover the mouse over the *X*, that means, I sent the payload

{% include codeHeader.html %}
```html
"+onmouseover="alert(1)
```
and it worked as you can see in the following capture

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-onmouseover-burp.png)

Hovering the mouse over the X the *alert(1)* was executed. But... the X is very small, the *alert(1)* will only be executed if the user accidentally hover the mouse over the *X*, which is not very likely.

The way to make the user more likely to mouse over the *X* is to make the X bigger, but... is this possible? YEAH, IT IS. The way to do this is by injecting CSS code through the *style* attribute, so I sent the payload

{% include codeHeader.html %}
```html
"+style="position:+fixed;width:+2000px;height:2000px;background-color:purple;"+onmouseover="alert(1)
```
where the meaning of each property is

- **position: fixed;**: Sets the positioning of the element to be fixed, meaning it will remain in a fixed position even when the page is scrolled.
- **width: 2000px;**: Sets the width of the element to be 2000 pixels.
- **height: 2000px;**: Sets the height of the element to be 2000 pixels.
- **background-color: purple;**: Sets the background color of the element to purple.

and it worked as you can see in the following capture

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-style-burp.png)

Now almost the whole screen is purple (the blue areas were placed by me to obfuscate information) as you can see in the following capture

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-style-browser.png)

and it is enough to put the mouse over the purple area to execute the *alert(1)*. This XSS still requires user interaction but this interaction is much more likely, it is almost certain. This is already something reportable.

However, I wanted to achieve an XSS that did not require user interaction. The only one that I could think of was the typical

{% include codeHeader.html %}
```html
"+autofocus+onfocus="alert(1)
```

I sent this payload and it was reflected as you can see in the following capture

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-autofocus-burp.png)

but the *alert(1)* was not executed. Why? Because the only tags that support the *autofocus* attribute are *input*, *button*, *select* and *textarea*.

And that's as far as my creativity went, so I decided to report the XSS with the *style* attribute, which was the best payload I could find.

<div id='section-id-3-1-2'/>
### 3.1.2. The winning payload

Before reporting I told my friend [Fran](https://www.linkedin.com/in/cybersecurityfranciscogilamoros/) about the case and he told me to try this payload

{% include codeHeader.html %}
```html
"+onfocus="alert(1)"+id="xss">
```

adding the term *#xss* at the end of the URL. So if the domain is *example.com* and the vulnerable param is *vulnerable-param*, the malicious URL would be

{% include codeHeader.html %}
```html
https://example.com/?vulnerable-param="+onfocus="alert(1)"+id="xss">#xss
```

When I saw this payload I thought... Damn! Shame on me! How could I not realize it!

I can't use the *autofocus* attribute but I can name the tag with the attribute assignment *id="xss"* and force the focus on it with the term *#xss*. It worked as you can see in the following capture

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-hash-burp.png)

Now the *alert(1)* is executed with no user interaction as you can see in the following capture

![](/assets/images/2023-06-24-reflected-xss-in-search-filter-clear-button/expoitation-hash-alert.png)

 :clap: :clap: :clap:
 
He then told me that he had read about this payload in the following Portswigger article

[One XSS cheatsheet to rule them all (PortSwigger)](https://portswigger.net/research/one-xss-cheatsheet-to-rule-them-all)
 
God bless Portswigger! :pray: :raised_hands:

<div id='section-id-3-2'/>
## 3.2. Why does the payload work?

Given what we have seen, it is easy to understand why the payload works:

1. The user clicks on the malicious link and sends the request with the payload

    <div class="code-header">
      <button class="copy-code-button">
        Copy
      </button>
    </div>
    ```html
    "+onfocus="alert(1)"+id="xss">
    ```
    
2. The user's browser receives and processes the response. Within that response is the label

    <div class="code-header">
      <button class="copy-code-button">
        Copy
      </button>
    </div>
    ```html
    <a class="OBFUSCATED" href="https://OBFUSCATED.OBFUSCATED" title="OBFUSCATED" onfocus="alert(1)" id="xss">
    ```
    
    The string *OBFUSCATED* does not really appear in the answer, I have put it to obfuscate information about the target.
    
3. The user puts the focus on the tag above due to the term *#xss* at the end of the URL and the *id="xss"* attribute assignment of the tag.

4. Due to the onfocus event of the tag above, the Javascript code *alert(1)* is executed.

<div id='section-id-4'/>
## 4. Report resolution

The subdomain is an e-commerce asset but, I don't know why, they considered the asset to be of medium criticity. Also an XSS usually is considered a medium severity vulnerability and because I wasn't able to sign up and log in the website, I couldn't demonstrate a high impact such as session hijacking. Therefore, the report was classified as 

- **Asset criticity**: Medium
- **Vulnerability severity**: Medium
- **Bounty**: More than $100

<div id='section-id-5'/>
## 5. Lessons learned

- Bug bounty is a competitive field but whenever you can collaborate with other bug bounty hunters. I think bug bounty is a scientific-technical field and in science collaboration is essential. Sharing the bounty is just a nice consequence of collaboration.
- The way is usually more important than the result. In this case you saw how I was struggling until I found the winning payload and along the way I found beautiful jewels. In this case they were not necessary but in the future maybe I will find cases where the winning payload is not possible and I can use some of these payloads that I found.
- The solution is sometimes obvious. See how I've been racking my brain trying to find a payload, and in the end, this one was much simpler than all the ones I had thought of. Always try to apply [Occam's razor](https://en.wikipedia.org/wiki/Occam%27s_razor).


