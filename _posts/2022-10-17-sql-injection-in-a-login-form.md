---
layout: single
title: Time-based SQL injection in a login form
excerpt: "Partial disclosure of a bug bounty report: time-based SQL injection in login form."
date: 2022-10-17
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
  - leakix
  - portswigger
  - burpsuite
  - sql injection
  - mysql
  - information_schema
  - sqlmap
  - php info page
---

## Summary 

- [1. Asset discovery](#section-id-1)
- [2. Vulnerability discovery](#section-id-2)
- [3. Vulnerability exploitation](#section-id-3)
  - [3.1. Steps of exploitation](#section-id-3-1)
  - [3.2. Why does the payload work?](#section-id-3-2)
  - [3.3. Is it possible to extract information from the database through this type of SQL injections?](#section-id-3-3)
- [4. Report resolution](#section-id-4)
- [5. Lessons learned](#section-id-5)

![](/assets/images/general/bug-bounty.jpg)

> :warning: <span style="color:red">This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a partial disclosure, only the essential technical details are exposed.</span>

In this post I am going to show the most critical vulnerability I have reported in a bug bounty program so far: a time-based SQL injection in a login form.

<div id='section-id-1'/>
## 1. Asset discovery

I found this asset through [LeakIX](https://leakix.net/). LeakIX is an OSINT platform that combines a search engine that indexes public information and an open reporting platform linked to the results. I found this asset making a domain query of the type

**example.com**

and I got the following results

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/leakix-results.png)

where the colours are ofustating the following info:

- <span style="color:red">Red</span>: not important info.
- <span style="color:blue">Blue</span>: the domain name of the company that I was looking for.
- <span style="color:green">Green</span>: the IP of the asset.

The asset that I discovered didn't have a related domain name, it was just an HTTP service on port 80 of an IP, so... Why did leakix return this IP as one of the results?

That's because the PHP info page was present in the website and the PHP variable $_SERVER['SERVER_ADMIN'] had assigned an email address whose domain was the domain used in the search. Continuing with the example domain, you can think of it as the e-mail address found is something like **admin@example.com**.

As you can see in the following HackerOne report

[PHP info page disclosure report in HackerOne](https://hackerone.com/reports/1118898)

PHP info page disclosure is considered a low severity vulnerability but a vulnerability should not be underestimated by its scoring. For example, the PHP info page can be used to bypass the HttpOnly flag in the cookies during the exploitation of an XSS to get a session hijacking. 

In this case, PHP info page disclosure has been crucial in finding this vulnerable asset because the HTTP service doesn't have an related domain and naturally doesn't have a TLS certificate to indicate that this asset belongs to the company in question. In fact, the company asked me how I had found this asset since they didn't have it in their inventory.

<div id='section-id-2'/>
## 2. Vulnerability discovery

When I accessed to the website, I saw the following landing page

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/landing-page.png)

with the company logo and, when I saw this, I was sure that the asset belonged to the company. 

The website was an operations center for the clients of the company and it looked very simple, in fact Wappalyzer didn't alert me that any web framework had been used. That's a very good fact because to not use a web framework is usually less safe than using it.

As you can see, the website has 2 buttons: one for login and the other one for signing up. The signing up button didn't work because it was a closed registration website and to sign up on the website it was necessary to send an email to the email address that I have obfuscated with blue color. That was the same email address that appeared in the PHP variable $_SERVER['SERVER_ADMIN'] in the results of LeakIX.

After clicking in the login button I got the following login form

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/login-form.png)

but... How did I discover the vulnerability?

I sent a login request and intercepted it with Burpsuite. Then using the repeater I sent a request with a typical SQL injection payload in the parameter nombre_usuario and I got the following response

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/error-500.png)

The characters such as single quote, hashtag and others are the typical characters that can lead to break the SQL query (in this case, a SQL query to verify the credentials) in the backend, and getting an HTTP error 500 response is the symptom that there could be a SQL injection.

You can see more info about how to detect SQL injection vulnerabilities in the following link

[How to detect SQL injection vulnerabilities](https://portswigger.net/web-security/sql-injection)

An interesting fact is that the parameter password didn't appear to be vulnerable. We will see why this might be in the section 3.2 but it could be because this parameter is not being entered in the vulnerable query.

<div id='section-id-3'/>
## 3. Vulnerability exploitation

<div id='section-id-3-1'/>
## 3.1. Steps of exploitation

First of all, it's necessary to guess what is the DataBase Management System (DBMS), because each of them uses a different syntax. In the following link

[SQL injection cheat sheet](https://portswigger.net/web-security/sql-injection/cheat-sheet)

you can see different payloads for different DBMS and purposes.

This is not a CTF so, to discover the DBMS, it's always best to examine the website well before fuzzing intensely. 

Do you remember the PHP info page disclosure vulnerability? Yes, this page will be useful in this step too, this is the power of a low severity vulnerability. As you can see in the following screenshot

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/php-info-page.png)

looking at the info.php page I found several references to MySQL. So MySQL is a candidate to be the DBMS used in the query.

After a long time of testing MySQL payloads for different purposes such as login bypass, RCE... Finally the only one that worked was

{% include codeHeader.html %}
```console 
user'+OR+(SELECT+SLEEP(0.02))=1#
```

which is a time-based SQL injection payload, where the + sign is the URL encoded form of the space character although %20 is valid too. I don't know why, but there was a change of units in the sleep function, that is, a value of 0.02 in the sleep function produces a delay of approximately 2 seconds (2452 miliseconds) in the response, as you can see in the following screenshot

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/response-delay.png)

To make sure that the delay was proportional to the input of the sleep function, I sent the following request to the intruder 

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/intruder-positions.png)

varying the value of the sleep function from 0.01 to 0.09

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/intruder-payloads.png)

 and the result was as follows

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/response-delay-intruder.png)

where you can see the payloads in the column "Payload" and the delays in the columns "Response received" and "Response completed", in miliseconds.

This is the proof that SQL code is being executed.

<div id='section-id-3-2'/>
## 3.2. Why does the payload work?

I don't have the source code of the website but, I think that in the backend there was a MySQL query similar to this

{% include codeHeader.html %}
```sql 
SELECT id, username, password FROM users WHERE username = $_POST["nombre_usuario"]
```

I think this because the parameter password didn't appear to be vulnerable so probably only the parameter nombre_usuario was used in the vulnerable query, that is, the query to get the data of the user. After that, the password retrieved in the query will be compared with the one entered by the user.

If we enter a "non-malicious" user, such as 

{% include codeHeader.html %}
```console 
HackCommander
```

the query that will be executed is

{% include codeHeader.html %}
```sql 
SELECT id, username, password FROM users WHERE username = 'HackCommander'
```

but if we enter a "malicious" user such as

{% include codeHeader.html %}
```sql 
HackCommander' OR (SELECT SLEEP(0.02))=1#
```

and **no input sanitization is being applied in the backend**, the query that will be executed is

{% include codeHeader.html %}
```sql 
SELECT id, username, password FROM users WHERE username = 'HackCommander' OR (SELECT SLEEP(0.02))=1#Here would be the remaining code
```

and, as you can see, the injected SQL code is executed in the where clause of the query. The reason of the hashtag is that the query could have some code after the evaluation of the parameter username so, to avoid syntax errors, it is a good practice to use the hashtag at the end of the payload, which is the character used in MySQL to write comments.


<div id='section-id-3-3'/>
## 3.3. Is it possible to extract information from the database through this type of SQL injections?

The answer is **yes**. But... Where do we get the information if we don't know the name of any table, attribute...?

In MySQL, and not only in MySQL, there is an important element to get informacion from the database: the **information schema**. The information schema (information_schema) is an ANSI-standard set of read-only views that provide information about all of the tables, views, columns, and procedures in a database. You can see more details about information_schema in the following link

[Learn SQL: The INFORMATION_SCHEMA Database](https://www.sqlshack.com/learn-sql-the-information_schema-database/)

This is one of the resources used by Sqlmap to dump the content of a database in blind SQL injections, but this is not a CTF, it's not necessary to dump all the database to get some usernames and the hashes of some passwords. In a bug bounty program it's not necessary to dump all the database to get the bounty, it's enough to give a PoC showing how you can get some information from the database. The most simple PoC that I could find was the following

![](/assets/images/2022-10-17-sql-injection-in-a-login-form/number-of-tables-in-the-database.png)

using the following payload

{% include codeHeader.html %}
```console 
USER'+OR+(SELECT+IF((select+count(*)+from+information_schema.tables)=341,SLEEP(0.05),"NO"))=1#
```

This PoC shows that the number of tables in the database is 341. I am going to explain the payload by breaking it down into several points:

- [MySQL IF()](https://www.geeksforgeeks.org/mysql-if-function/) is a MySQL function is a function that receives 3 parameters using the following syntax

**IF(condition, value_if_true, value_if_false)**

and it returns a value if a condition is TRUE, or another value if a condition is FALSE.

- The [information_schema.tables](https://www.mssqltips.com/sqlservertutorial/196/information-schema-tables/) is a view that allows to obtain information about all the views and tables of the database. Therefore, the following SQL code

{% include codeHeader.html %}
```console 
select+count(*)+from+information_schema.tables
```

returns the number of tables in the database.

- The following SQL code

{% include codeHeader.html %}
```console 
(select+count(*)+from+information_schema.tables)=341
```

compares the number of tables in the database with the number 341.

- The following SQL code

{% include codeHeader.html %}
```console 
IF((select+count(*)+from+information_schema.tables)=341,SLEEP(0.05),"NO"))
```

produces a delay of 5 seconds if the number of tables is 341 and returns the string "NO" otherwise.


- The above payload needs to be embedded into a SQL query so the following SQL code

{% include codeHeader.html %}
```console 
(SELECT+IF((select+count(*)+from+information_schema.tables)=341,SLEEP(0.05),"NO"))=1
```

is SQL query that executes the IF function inside a comparison statement in a select clause.

<br>

As you can see in the previous screenshot, the request produces a delay of approximately 5 seconds (5822 miliseconds) so the number of tables in the database is 341. I sent the request to the intruder varying the value from 1 to 500 and the only request that produced a delay was the request with the value 341.

As you have just seen, it is possible to get information from the database through a time-based SQL injection. This process can be generalized to obtain table names, attributes... character by character, in order to make queries to the really important tables and finally dump all the tables that can be accessed by the user executing the query.

However, it is not an easy process and although there are tools such as Sqlmap that execute the process automatically, it is not necessary to run this type of tools in a bug bounty program to **exploit** a SQL injection because you can get the bounty just by attaching a simple poc that you can get information from the database. That is why I attached a very simple PoC obtaining only the number of tables in the database. 

Nevertheless, Sqlmap can be a good tool to **detect** SQL injections because this tool tests several payloads to automatically detect and classify the possible SQL injections present, and this process is not as noisy and aggressive as the one used to exploit them.

<div id='section-id-4'/>
## 4. Report resolution

The asset didn't have a related domain name but it was an important asset of the company, that is why it was a closed registration website. SQL injection is usually considered a vulnerability of critical severity, especially in this case that I provided a PoC of how this injection could be used to get information from the database. Therefore, the report was classified as 

- **Asset criticity**: High
- **Vulnerability severity**: Critical
- **Bounty**: More than $900

and I won the highest bounty of the program.

<div id='section-id-5'/>
## 5. Lessons learned

- The reconnaisance step it's very important, probably the most important one. It's not a lost of time to use different OSINT tools, like LeakIX.
- Low severity vulnerabilities should not be underestimated. Some of them, such as PHP info page disclosure, can lead to dangerous situations or make other vulnerabilities more critical.
- Blind vulnerabilities, such as blind SQL injection, blind RCE... can be just as dangerous as non-blind vulnerabilities. Although it is not possible to obtain information directly from the response, it can be inferred through various techniques, such as producing delays based on a boolean condition.


