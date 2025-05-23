var store = [{
        "title": "eJPT certification review",
        "excerpt":"Summary 1. What is eJPT? 2. What will you learn and what previous knowledge do you need? 3. Is it useful for the curriculum? 4. Is it affordable? 5. How is the content? 5.1. Penetration Testing Prerequisites 5.2. Penetration Testing: Preliminary Skills &amp; Programming 5.3. Penetration Testing Basics 5.4. eJPT...","categories": ["review"],
        "tags": ["certification","elearnsecurity","ejpt","pentesting"],
        "url": "https://hackcommander.github.io/posts/2022/09/01/ejpt-certification-review/",
        "teaser":"https://hackcommander.github.io/assets/images/2022-09-01-ejpt-certification-review/ejpt-logo.png"},{
        "title": "Reflected XSS bypassing HTML tag removal sanitization",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.2. Why does the payload work? 3.2.1. Sanitization algorithm based on a boolean variable 3.2.2. Sanitization algorithm based on a data structure 3.2.3. Code of the algorithms 4. Report resolution 5. Lessons learned :warning: This bug...","categories": ["bug bounty"],
        "tags": ["web","osint","amass","httpx","burpsuite","gau","kxss","xss","python","bypass","sanitization"],
        "url": "https://hackcommander.github.io/posts/2022/09/20/reflected-xss-bypassing-html-tag-removal-sanitization/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "Time-based SQL injection in a login form",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.2. Why does the payload work? 3.3. Is it possible to extract information from the database through this type of SQL injections? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private...","categories": ["bug bounty"],
        "tags": ["web","osint","leakix","portswigger","burpsuite","sql injection","mysql","information_schema","sqlmap","php info page"],
        "url": "https://hackcommander.github.io/posts/2022/10/17/sql-injection-in-a-login-form/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "How to bypass the HttpOnly flag via the PHP info page to exfiltrate the user cookies during an XSS exploitation",
        "excerpt":"Summary 1. Setting up the environment 2. Hands-on! 2.1. Trying to exfiltrate the cookies through the usual method 2.2. Exfiltrating the cookies bypassing the HttpOnly flag through the PHP info page 2.3. Using my Github tool to generate an improved payload 2.4. Important notes 3. Conclusions PHP info page disclosure...","categories": ["research"],
        "tags": ["web","burpsuite","base64","metasploitable 2","xss","exfiltrate cookies","session hijacking","php info page","bypass"],
        "url": "https://hackcommander.github.io/posts/2022/11/12/bypass-httponly-via-php-info-page/",
        "teaser":"https://hackcommander.github.io/assets/images/2022-11-12-bypass-httponly-via-php-info-page/phpinfo-dvwa-1.png"},{
        "title": "Reflected XSS bypassing a 302 Security Redirect due to the presence of Javascript function calls",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.2. Why does the payload work? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a...","categories": ["bug bounty"],
        "tags": ["web","osint","amass","httpx","gau","kxss","utm parameters","burpsuite","portswigger","xss","bypass"],
        "url": "https://hackcommander.github.io/posts/2023/03/06/reflected-xss-bypassing-redirect-due-to-javascript-function/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "TE.TE HTTP request smuggling obfuscating the TE header",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.2. Why does the payload work? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a...","categories": ["bug bounty"],
        "tags": ["web","osint","amass","httpx","burpsuite","burp scanner","portswigger","http request smuggling","xss"],
        "url": "https://hackcommander.github.io/posts/2023/05/03/te-te-http-request-smuggling-obfuscating-te-header/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "Reflected XSS in search filter clear button in an e-commerce website",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.1.1. Struggling to find a payload 3.1.2. The winning payload 3.2. Why does the payload work? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private program in which it is not...","categories": ["bug bounty"],
        "tags": ["web","osint","amass","httpx","burpsuite","portswigger","xss"],
        "url": "https://hackcommander.github.io/posts/2023/06/24/reflected-xss-in-search-filter-clear-button/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "Reflected XSS through POST request in a login form",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.2. Why does the payload work? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a...","categories": ["bug bounty"],
        "tags": ["web","osint","amass","httpx","burpsuite","portswigger","xss","sop","cors"],
        "url": "https://hackcommander.github.io/posts/2023/11/05/reflected-xss-through-post-request-in-login-form/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "Subdomain takeover via unclaimed Azure VM",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.2. Why does this vulnerability exist? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a...","categories": ["bug bounty"],
        "tags": ["web","vps","osint","reconftw","nuclei","subdomain takeover"],
        "url": "https://hackcommander.github.io/posts/2023/11/13/subdomain-takeover-via-unclaimed-azure-vm/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "Defeating XSS filters using unexpected HTML attributes",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.2. Why does the payload work? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a...","categories": ["bug bounty"],
        "tags": ["web","osint","amass","httpx","gau","kxss","burpsuite","xss","bypass"],
        "url": "https://hackcommander.github.io/posts/2023/12/10/reflected-xss-bypassing-hidden-input-tag-and-auto-submit-script/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "Human 1 - sqlmap 0&#58; defeating automation through manual exploitation",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.1.1. Bypassing the sanitization of the symbol = 3.1.2. Bypassing the sanitization of quotes 3.1.3. Bypassing the blacklisting of the SUBSTR function 3.1.4. Weaponizing the payload to dump the database name 3.2. Why does the payload...","categories": ["bug bounty"],
        "tags": ["web","collaboration","osint","google dorking","portswigger","burpsuite","0iq","sqlmap","sql injection","mysql","bypass"],
        "url": "https://hackcommander.github.io/posts/2024/03/19/human-1-sqlmap-0-defeating-automation-through-manual-exploitation/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "VulNyx&#58; HackingStation",
        "excerpt":"Summary 1. Port and service scanning 2. Gaining access 2.1. Detecting the command injection 2.2. Getting a shell as hacker 2.3. Why does this command injection exist? 3. Privilege escalation 3.1. Detecting the nmap vulnerability 3.2. Getting a shell as root 3.3. Why does this privilege escalation via nmap exist?...","categories": ["ctf"],
        "tags": ["vulnyx","nmap","web","command injection","gtfobins","binary exploitation"],
        "url": "https://hackcommander.github.io/posts/2024/03/31/vulnyx-hackingstation/",
        "teaser":"https://hackcommander.github.io/assets/images/2024-03-31-vulnyx-hackingstation/box-info.png"},{
        "title": "VulNyx&#58; Diff3r3ntS3c",
        "excerpt":"Summary 1. Port and service scanning 2. Gaining access 2.1. Detecting the arbitrary file upload 2.2. Getting a shell as candidate 2.3. Why does this arbitrary file upload exist? 3. Privilege escalation 3.1. Detecting the cronjob vulnerability 3.2. Getting a shell as root 3.3. Why does this privilege escalation via...","categories": ["ctf"],
        "tags": ["vulnyx","nmap","web","burpsuite","arbitrary file upload","ffuf","directory listing","command injection","cronjob"],
        "url": "https://hackcommander.github.io/posts/2024/04/08/vulnyx-diff3r3nts3c/",
        "teaser":"https://hackcommander.github.io/assets/images/2024-04-08-vulnyx-diff3r3nts3c/box-info.png"},{
        "title": "HackerNight 2024&#58; my first live hacking event",
        "excerpt":"Summary 1. What is HackerNight? 2. Why did I sign up for HackerNight? 3. The course of HackerNight 3.1. Entry to the event 3.2. During the event 3.3. Outcome of the event 4. Conclusions of HackerNight :warning: This post does not contain technical details about the vulnerabilities I found in...","categories": ["review","bug bounty"],
        "tags": ["life hacking event","hackernight","rootedcon","yogosha","first blood"],
        "url": "https://hackcommander.github.io/posts/2024/06/10/hackernight-2024-my-first-live-hacking-event/",
        "teaser":"https://hackcommander.github.io/assets/images/2024-06-10-hackernight-2024-my-first-live-hacking-event/first-blood.png"},{
        "title": "Breaking the perimeter by exploiting routing-based SSRF via a misconfigured load balancer",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.1.1. Accessing the internal network 3.1.2. Scanning the internal network 3.2. Why does this vulnerability exist? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private program in which it is not...","categories": ["bug bounty"],
        "tags": ["web","portswigger","burpsuite","burp scanner","nikto","mod_proxy_balancer","ssrf"],
        "url": "https://hackcommander.github.io/posts/2024/12/07/breaking-the-perimeter-by-exploiting-routing-based-ssrf-via-a-misconfigured-load-balancer/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"},{
        "title": "Defeating XSS filters using unexpected HTML tags and attributes",
        "excerpt":"Summary 1. Asset discovery 2. Vulnerability discovery 3. Vulnerability exploitation 3.1. Steps of exploitation 3.2. Why does the payload work? 4. Report resolution 5. Lessons learned :warning: This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a...","categories": ["bug bounty"],
        "tags": ["web","osint","amass","httpx","waymore","kxss","burpsuite","portswigger","xss","bypass"],
        "url": "https://hackcommander.github.io/posts/2025/03/30/defeating-xss-filters-using-unexpected-html-tags-and-attributes/",
        "teaser":"https://hackcommander.github.io/assets/images/general/bug-bounty.jpg"}]
