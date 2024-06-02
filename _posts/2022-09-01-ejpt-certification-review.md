---
layout: single
title: eJPT certification review
excerpt: "Review of the eJPT (eLearnSecurity Junior Penetration Tester), certification of eLearnSecurity intended for students interested in obtaining the necessary training that a junior pentester should have."
date: 2022-09-01
classes: wide
header:
  teaser: /assets/images/2022-09-01-ejpt-certification-review/ejpt-logo.png
  teaser_home_page: true
  icon:
categories:
  - review
tags:  
  - certification
  - elearnsecurity
  - ejpt
  - pentesting
---

## Summary 

- [1. What is eJPT?](#section-id-1)
- [2. What will you learn and what previous knowledge do you need?](#section-id-2)
- [3. Is it useful for the curriculum?](#section-id-3)
- [4. Is it affordable?](#section-id-4)
- [5. How is the content?](#section-id-5)
  - [5.1. Penetration Testing Prerequisites](#section-id-5-1)
  - [5.2. Penetration Testing: Preliminary Skills & Programming](#section-id-5-2)
  - [5.3. Penetration Testing Basics](#section-id-5-3)
  - [5.4. eJPT Exam Preparation](#section-id-5-4)
- [6. How is the exam?](#section-id-6)
- [7. Conclusions](#section-id-7)

<p style="text-align:center;"><img src="/assets/images/2022-09-01-ejpt-certification-review/ejpt-logo.png" alt="Logo"></p>

In this post I am going to review the eLearnSecurity Junior Penetration Tester certification, better known as eJPT.

<div id='section-id-1'/>
## 1. What is eJPT?

We can consider eLearnSecurity Junior Penetration Tester (eJPT) certification as the first of multiples certs that the company eLearnSecurity offers to the IT professionals to begin their career in cybersecurity. The course covers the fundamentals about networking devices and protocols, web applications, programming and operative systems, all this from the point of view of offensive security, i.e., studying the most common types of attacks that you can perform. You can see the details in the following link

[eJPT index](https://elearnsecurity.com/product/ejpt-certification/)

<div id='section-id-2'/>
## 2. What will you learn and what previous knowledge do you need?

If you click on the above link, you will see that the topics you will learn are

- TCP/IP.<br>
- IP routing.<br>
- LAN protocols and devices.<br>
- HTTP and web technologies.<br>
- Essential penetration testing processes and methodologies.<br>
- Basic vulnerability assessment of networks.<br>
- Basic vulnerability assessment of web applications.<br>
- Exploitation with Metasploit.<br>
- Simple web application manual exploitation.<br>
- Basic information gathering and reconnaissance.<br>
- Simple scanning and profiling the target.<br>

and I can assure you that it is absolutely correct. As you can see the words **"basic"** and **"simple"** appears a lot and that is important, eJPT is not an advanced certification, it is a beginner certification but you will learn a lot of useful recon and hacking techniques. 

Also as you can see in the link above, you can see the following prerequisites

- Deep understanding of networking concepts.<br>
- Simple manual web application security assessment and exploitation.<br>
- Basic vulnerability assessment of networks.<br>
- Using Metasploit for performing simple attacks.<br>
- Web application manual exploitation through attack vectors.<br>
- Ability to perform protocol analysis of a traffic capture.<br>
- Understanding of information gathering techniques.<br>
- Understanding of the penetration testing process.<br>

and I have to say that I don't agree with it. The link says that the above prerequisites could help you to pass the exam, and that is true, but that long prerequisites list might scare you. If you don't know what a PC is, probably you will have problems taking the course and passing the exam but if you have a basic knowledge about computers and you are determined and motivated to learn, you will not have any problem.

<div id='section-id-3'/>
## 3. Is it useful for the curriculum?

First of all, I would like to say that I don't recommend to anyone to get into a certification process only to get a nice small piece of paper to impress the RRHH team. However, I am not a hater of certifications, I think that certs (good certs) are a very good way to start studying cybersecurity in a solid and structured way.

Taking into account the above statement, I think that eJPT could be a **very good cover letter** for IT professionals who want to get his first job in cybersecurity and to aspire to obtain other more advanced certifications like OSCP. If you are a senior pentester or if you have more advanced certifications such as OSCP, eJPT is probably not the best option for you.

<div id='section-id-4'/>
## 4. Is it affordable?

The course is free and is provided by INE in the following link

[eJPT course](https://my.ine.com/CyberSecurity/learning-paths/a223968e-3a74-45ed-884d-2d16760b8bbd/penetration-testing-student)

but before you have to create a free account in the following link

[Free INE subscription](https://checkout.ine.com/starter-pass)

The price of the voucher is 200$ but I bought it for 100$ during a 50% off promotion on all certifications during July 2022. The voucher includes 1 free retake and a 6 months period time to begin the certification process. It is important to note that you don't need to buy the voucher to have access to the course so you can take a look at the course and then decide if you want to buy the voucher and start the certification process.

In my opinion, considering the free course, the price of the voucher and the possibility of taking the voucher with a discount, the free retake... I think that eJPT is a **very affordable certification**.

> :warning: Be careful with the name you use during the registration process on the INE website because that is the name that it will appear on the certificate of completion and you will not be able to change it on your own. In my case, I used only my name and my first surname so I had to contact to INE support to add my second surname to the profile and to the certificate of completion. I had to open several tickets and it took more than a month to make the change so I recommend that when you create the account you do it with the name you want to appear on your certificate of completion.

<div id='section-id-5'/>
## 5. How is the content?

The duration of the course is about 50 hours and it took me approximately three weeks to study all the content. I have to say that, although this is my first certification, it isn't my first contact with cybersecurity. Before passing the eJPT, I already had some experience in offensive cybersecurity as I had already participated in platforms like HackTheBox and TryHackMe, and I had some experience as a Bug Bounty Hunter doing Web Pentesting, topic on which I am going to start publishing posts very soon. At this point, I would like to recommend the TryHackMe Jr Penetration Tester Learning Path

[TryHackMe Jr Penetration Tester Learning Path](https://tryhackme.com/path/outline/jrpenetrationtester)

In this learning path you will learn and practice many of the topics that are present in the eJPT content, so it's a good idea to take this learning path before taking the eJPT, but it isn't neccesary. The goal of this section isn't to explain all the details about the course but I think that is a good idea to divide the section in points, one point for each course module.

<div id='section-id-5-1'/>
### 5.1. Penetration Testing Prerequisites

In this module you will learn:

- The basics of networking devices, such as what a router is and the differences between a switch and a hub.
- The basics of networking protocols such DNS, ARP, TCP and UDP...
- The basics of web applications, cookies, sessions, SOP, differences between HTTP and HTTPS...
- The basics of important tools such Wireshark and Burpsuite.
- A non-technical introduction to what pentesting is.

Although this module may seem very naive, I recommend you to study it, even if you already have previous knowledge of the subject matter . For example, I had medium previous knowledge about web pentesting but it was very useful for me to refresh some concepts about cookies and to see in practice the differences between HTTP and HTTPS. I knew that the main difference is data sent through HTTP is sent in clear text and data sent through HTTP is sent encrypted with TLS but I had never seen the difference in practice capturing traffic with wireshark.

At this point, I would like to comment that the labs of all the modules are very interesting but sometimes the statements are not very clear, so dont be afraid to take a look to the solution if you are stuck and you don't know what you are being asked to do. 

> :warning: Pay special attention to the lab **Find the Secret Server**. Its seems very simple and naive, and it is, but I advise to you to understand very well all the concepts of this lab because it could be very useful for you in the exam.

<div id='section-id-5-2'/>
### 5.2. Penetration Testing: Preliminary Skills & Programming 

In this module you will learn:

- What programming is.
- The basics of a low-level programming language, such as C++.
- The basics of a high-level programming language, such as Python.
- The basics of some command line scripting languages, such as Bash for Linux and CMD and Powershell for Windows.

Probably this is the least important of all the modules because you don't need to learn to program in C++ or Python to pass the exam but I think that it is a very important module if you want to improve as a pentester. In my opinion, it is very important to have a solid knowledge about programming to understand the main types of vulnerabilities and so you don't turn into a script kiddie who only knows how to exploit vulnerabilities with metasploit. Also knowing about programming will give you the possibility to develop your own pentesting tools that you can share with the community.

However, the section about Bash, CMD and Powershell it is very important, you need those languages to communicate with the operating systems in a non-graphical way. In fact you will need Bash to use in an optimal way your Linux Distribution to do pentesting, in my case Kali Linux, and to be able to launch the pentesting tools that you will see in this course.

<div id='section-id-5-3'/>
### 5.3. Penetration Testing Basics

In this module you will learn:

- A set of techniques to perform information gathering about the target.
- A set of techniques to perform discovering, scanning, footprinting... using tools such as Nmap.
- The basics of vulnerabilty assessment with Nessus.
- Different techniques to perform different kind of attacks in web applications, systems and in a network enviroment.
- The basics of pivoting and port forwarding.
- The use of the most basic tools of exploitation such as Arpspoof, Metasploit, Msfvenom, Xsser, Sqlmap, Burpsuite, John the Ripper, Hashcat...

Probably this is the core module of the course and, without a doubt, the one I enjoyed the most. Because of I made before the TryHackMe Jr Penetration Tester Learning Path and because of my experience as a Bug Bounty Hunter, there were a lot of topics and tools that I already knew but it was a good refresh. However, I learn new techniques such as how to perform a Man In The Middle Attack (MITM). Probably my weak point was network attacks, so I learned a lot in this sense.

Also, at the end of the module you will be able to practice the techniques learned during the course with 3 black-boxes. I advise you to pay special attention to these boxes and learn how to exploit RCE vulnerabilities on services like V-CMS and Werkzeug and learn about famous exploits like EternalBlue.

I only have 2 complaints about this module:

- Buffer Overflow is in the module but it is not explained how can be exploited and there isn't an associated lab. I would have loved to see some more info about this vulnerability.
- Pivoting and port forwarding techniques are not explained during the course. You will see directly these techniques in the blackboxes so if you don't know anything about that, you will have to take a look to the solution to see how is done with Metasploit, Meterpreter, Proxychains...

<div id='section-id-5-4'/>
### 5.4. eJPT Exam Preparation

In this module you will learn:

- Nothing new :laughing:

Essentially in this module you will see how to begin the certification process, i.e, how to connect to your exam enviroment. There are two labs but I don't understand the reason for its existence, you will not learn anything new with that labs. 

<div id='section-id-6'/>
## 6. How is the exam?

To begin the exam you have to log in Caendra and click on **"Begin certification process"**. After that you will receive a pcap file, a list of user names, a list of passwords and a ovpn file to connect to the exam enviroment. If the name of the ovpn file is ovpn_file.ovpn, I advise to you to use the following command to connect to the enviroment

{% include codeHeader.html %}
```
sudo openvpn --config ovpn_file.ovpn --daemon
```

to run the ovpn file a as daemon, in the background.

Then you should read all 20 questions before answering any questions and after that... the fun begins! First of all you will have to analyze the pcap looking for credentials, routers, servers, clients... interesting traffic in general. If you have difficulties in analyzing the pcap, I recommend you use the following pcap file analyzer

[Pcap file analyzer tool](https://apackets.com/)

but ideally you should be able to analyze it manually.

To answer the question you will have to use discovery and scanning techniques with Nmap, web pentesting tools like Burpsuite, Dirb or Sqlmap, exploiting tools like Metasploit, John the Ripper...

In my opinion the machines in the exam are much easier than the most difficult machines of the course so don't be afraid of failing the exam: if you have made the labs and you have understood it, you will pass the exam.

It took me approximately 10 hours to answer all the questions but since I had plenty of time (the duration of the exam is 72 hours), I took the rest of the day off and waited until the next day to check and submit the answers. I answered all 20 questions correctly, as you can see in the following capture

![](/assets/images/2022-09-01-ejpt-certification-review/ejpt-results.png)

although you only have to asnwer correctly 15 questions to pass the exam and failures don't penalize.

Finally, when you pass the exam you will get a nice certificate of completion as follows

![](/assets/images/2022-09-01-ejpt-certification-review/ejpt-certificate.png)

and a link to attach in your linkedin profile

[Link to my eJPT certificate](https://verified.elearnsecurity.com/certificates/b38d8ae2-8290-4f92-af3b-2e99336f5f4e)

<div id='section-id-7'/>
## 7. Conclusions

From all that we have seen we can say that the eJPT is a certification with the pros and cons:

### <u>Pros</u>:
- Beginner friendly.
- Very good content structure.
- Affordable price.
- Useful for the curriculum.
- Funny and not difficult exam.

### <u>Cons</u>:
- You can't download the videos and the slides in pdf.
- Sometimes the statements of the labs are not clear, so don't be afraid to take a look to the solution if you are stuck and you don't know what you are being asked to do.
- Part of the content is studied directly in the labs, such as pivoting and port forwarding. I think that is not good because you could waste a lot of time trying to solve the lab thinking that you have the necessary skills, but you don't have them.
- Not very good technical support from INE. As I mentioned in section 4, something as simple as changing the name of my INE profile was a very time consuming process.

Despite the cons, I think that the eJPT certification is a **highly recommended** cert for anyone interested in starting a career in the world of offensive security.
