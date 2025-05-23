---
layout: single
title: Subdomain takeover via unclaimed Azure VM
excerpt: "Partial disclosure of a bug bounty report: subdomain takeover via unclaimed Azure VM."
date: 2023-11-13
classes: wide
header:
  teaser: /assets/images/general/bug-bounty.jpg
  teaser_home_page: true
  icon:
categories:
  - bug bounty
tags:  
  - web
  - vps
  - osint
  - reconftw
  - nuclei
  - subdomain takeover
---

## Summary 

- [1. Asset discovery](#section-id-1)
- [2. Vulnerability discovery](#section-id-2)
- [3. Vulnerability exploitation](#section-id-3)
  - [3.1. Steps of exploitation](#section-id-3-1)
  - [3.2. Why does this vulnerability exist?](#section-id-3-2)
- [4. Report resolution](#section-id-4)
- [5. Lessons learned](#section-id-5)

![](/assets/images/general/bug-bounty.jpg)

> :warning: <span style="color:red">This bug was reported in a private program in which it is not allowed to publish the vulnerabilities found. So this is a partial disclosure, only the essential technical details are exposed.</span>

In this post I am going to show the first subdomain takeover (STO) I reported in a bug bounty program: subdomain takeover via unclaimed Azure VM. I was quite excited to find this vulnerability because, although it is almost always very easy to find and exploit, it is a very shocking vulnerability. 

Simplifying a lot, what an attacker gets by exploiting this vulnerability is to configure the web that he wants in the vulnerable subdomain. In this way, any user accessing that domain will not see the legitimate website of the company but will be seeing the website that the attacker has configured.

<div id='section-id-1'/>
## 1. Asset discovery

I found this asset through reconFTW on my VPS. [ReconFTW](https://github.com/six2dez/reconftw) is a recon tool to automate the entire process of reconnaissance for you. It outperforms the work of subdomain enumeration along with various vulnerability checks and obtaining maximum information about your target.

The command that I used and that you can also use in your VPS is

{% include codeHeader.html %}
```console
nohup ~/reconftw/reconftw.sh -d example.com -r --deep -o ~/reconftw-output/ > ~/nohup-history/nohup_1.log 2>&1 &
```

The meaning of each of the elements of the command is:

- **nohup**: this command runs another command in the background and ensures it continues running even if the user logs out. This allows us to run a reconFTW execution and exit the VPS whenever we want without the process being terminated. If we did not use nohup, when we exit the SSH session on the VPS the process will end its execution.
- **-d example.com**: specifies the target domain as *example.com*.
- **-r --deep**: performs [full recon with more time intense tasks (VPS intended only)](https://github.com/six2dez/reconftw#perform-full-recon-with-more-time-intense-tasks-vps-intended-only).
- **-o ~/reconftw-output/**: sets the output directory for the results of the reconftw.sh script to *~/reconftw-output/*.
- **> ~/nohup-history/nohup_1.log**: redirects standard output to the file *nohup_1.log* in the directory *~/nohup-history/*. This is useful to see how the execution is going at each moment. Simplifying, this file stores in each moment the reconFTW console output that we would see if we were executing reconFTW in the usual way (without nohup or in the background).
- **2>&1**: redirects standard error to the same location as standard output, ensuring both are captured in the log file.
- **&**: runs the entire command in the background, allowing the user to continue using the VPS terminal for other tasks without waiting for the command to finish.

Depending on the number of subdomains, the execution of this command can take days to finish, so if you launch reconFTW in this mode it is highly recommended to do it from a VPS. After the execution finishes, the subdomains appear in the file *~/reconftw-output/example.com/subdomains/subdomains.txt*.

Remember that if you want to have a VPS like mine you can rent it through my [referral links](https://blog.hackcommander.com/advertising/#section-id-1)! You'll pay the same and you'll be helping me!

<div id='section-id-2'/>
## 2. Vulnerability discovery

I also found this vulnerability through reconFTW, specifically through the execution of nuclei that reconFTW performs on the subdomains that it finds. As you can see in the following capture

![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/nuclei-output.png)

the nuclei findings are stored in the directory */nuclei_output*, divided into different txt files by criticality. Subdomain takeover is a high criticality vulnerability so they are stored in the high.txt file, and as you can see... I found 2 at the same time! These subdomains were the same except for some different letters at the end, something like *support.example.com* and *support-e.example.com*. They probably represented the same website but in different environments: PRE, QA, PRO...

As this was my first subdomain takeover, I was looking for information on the internet to understand the vulnerability and see a PoC, and I found this post

[Subdomain Takeover in Azure: making a PoC](https://godiego.co/posts/STO-Azure/)

which saved my life. Thanks to this post I could interpret the output of nuclei taking into account the lowest level subdomains:

- Both Azure assets are VMs (virtual machines) due to the subdomain *cloudapp.azure.com*.
- Both machines are in Eastern North America due to the string *eastus* of the highest subdomain.
- Although they are in the same region, they are in different datacenters, since the highest subdomain of the first one is *eastus2* (datacenter 2) and the second one is *eastus* (we could say that it is datacenter 1).

Both subdomains can be exploited in exactly the same way, so we will concentrate only on the first one.

To check that the subdomain was really vulnerable I execute a command of the type

{% include codeHeader.html %}
```console
dig test.example.com
```

and the result was

![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/dig-before-takeover.png)

As you can see, the status field has the value *NXDOMAIN*, which means that the queried subdomain does not exist in the DNS. Specifically, *NXDOMAIN* stands for *Non-Existent Domain* and this status is returned when the DNS resolver cannot find any information, such as IP address or other records, for the specified subdomain. Also in *ANSWER SECTION* and *AUTHORITY SECTION* you can see how Azure appears and how the subdomain points to an *Azure CloudApp* subdomain through the *CNAME* record.

<div id='section-id-3'/>
## 3. Vulnerability exploitation

<div id='section-id-3-1'/>
## 3.1. Steps of exploitation

Exploitation of this vulnerability is very simple, especially being an Azure VM. Although you have all the information in the GoDiego's post I mentioned before, I will detail the process step by step:

1. Create an Azure account. At the beginning you will have a free subscription that will allow you to make your first subdomain takeovers for free.

   [Create a free Azure account](https://azure.microsoft.com/en-us/free/)
   
2. Log in and select the option *Virtual Machines*.

   ![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/azure-home.png)
   
3. Select de option *Create*.

   ![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/azure-create-vm.png)

4. Configure the machine as follows, but change the machine's region to the one that corresponds in your case. In mine, as I said before, the region is *(US) East US 2*.

   ![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/azure-vm-conf-1.png)
   
   ![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/azure-vm-conf-2.png)
   
5. Once you have created the machine, access the configuration and enter the name of the Azure subdomain associated with the takeover. If all goes well you will see something like the following

   ![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/azure-vm-conf-3.png)

   If not, you might get an error message like *The subdomain is already taken* or similar. I was talking to other bug bounty hunters who even had automated detection and exploitation of this vulnerability and they told me that Azure introduced a mitigation to subdomain takeovers recently. This mitigation includes a delay after the expiration of the domain, so although it looks vulnerable in the dig query, it is not possible to perform the subdomain takeover until some time has passed. In my case, a month passed from detection to exploitation because I could not perform the subdomain takeover before.
   
6. You must connect to the virtual machine via SSH using the assigned public IP and with the credentials you chose during configuration. This is necessary to store the HTML code you want to display on the vulnerable domain and to run the web service.

   ![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/azure-vm-connection.png)
   
   You will have to execute some commands like the following ones
   
   <div class="code-header">
      <button class="copy-code-button">
        Copy
      </button>
   </div>
   ```console
   ssh <your-username>@<your-public-azure-vm-ip>
   mkdir www
   cd /www
   nano index.html
   nohup sudo python3 -m http.server 80 &
   ```
   
   where during the execution of the command *nano* you will have to write the HTML code you want.
   
   In my case I used the following HTML code generated by ChatGPT

   <div class="code-header">
      <button class="copy-code-button">
        Copy
      </button>
   </div>
   ```html
   <!-- Subdomain takeover by HackCommander at dd/mm/aaaa -->
   <!DOCTYPE html>
   <html>
   <head>
     <title>PUT THE NAME OF THE COMPANY HERE</title>
     <style>
       body {
         font-family: Arial, sans-serif;
       }
    
       .container {
         width: 300px;
         margin: 0 auto;
         padding: 20px;
         border: 1px solid #ccc;
         border-radius: 5px;
       }
    
       h2 {
         text-align: center;
       }
    
       .form-group {
         margin-bottom: 15px;
       }
    
       .form-group label {
         display: block;
         margin-bottom: 5px;
       }
    
       .form-group input {
         width: 100%;
         padding: 7px;
         border: 1px solid #ccc;
         border-radius: 3px;
       }
    
       .form-group button {
         width: 100%;
         padding: 10px;
         background-color: #4CAF50;
         color: #fff;
         border: none;
         border-radius: 3px;
         cursor: pointer;
       }
    
       .form-group button:hover {
         background-color: #45a049;
       }
     </style>
   </head>
   <body>
     <div class="container">
       <h2>PUT THE NAME OF THE COMPANY'S PLATFORM HERE</h2>
       <form>
         <div class="form-group">
           <label for="username">Username</label>
           <input type="text" id="username" name="username" placeholder="Enter your username">
         </div>
         <div class="form-group">
           <label for="password">Password</label>
           <input type="password" id="password" name="password" placeholder="Enter your password">
         </div>
         <div class="form-group">
           <button type="submit">Login</button>
         </div>
       </form>
     </div>
   </body>
   </html>
   ```

   I wanted to simulate a fake login form to increase the criticality of the report and "impact" the triager but the truth is that this is not necessary :satisfied:. It is enough that you use a simple HTML code in which you indicate your user of the platform in a comment in the code.

7. Finally, you can run the dig command again on the vulnerable subdomain

   ![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/dig-after-takeover.png)
   
   and you will see how the subdomain already appears as taken and pointing to the IP of your virtual machine (region covered in green). Then by accessing the vulnerable subdomain you will see that the response is the one associated with the HTML code you coded in the Azure VM.
   
   ![](/assets/images/2023-11-13-subdomain-takeover-via-unclaimed-azure-vm/website.png)
   
8. And lastly, and most importantly... don't forget to shut down and decommission the virtual machine and all Azure assets you may have created in the process! Azure charges by the hour, and if you're not careful, they will take away your bounty :satisfied:.

YEAH! The first subdomain takeover always feels like...

<p style="text-align:center;"><img src="/assets/images/general/magic.gif"></p>

<div id='section-id-3-2'/>
## 3.2. Why does this vulnerability exist?

As you can see, this is not the typical vulnerability due to a flaw in the code. It seems more like a vulnerability related to the human factor and the management of the company's assets. Some of the reasons that could lead to the presence of this vulnerability are:

- **Unused or forgotten services**: companies often use various third-party services or cloud platforms for different purposes. Over time, they might stop using a particular service or platform, but the corresponding subdomains are still configured in their DNS records.
- **Incomplete cleanup**: when organizations migrate services or shut down projects, there might be oversight in cleaning up DNS records. Subdomains pointing to services that are no longer in use may be left behind.
- **Third-Party integrations**: companies frequently integrate third-party services or applications into their infrastructure. If these integrations involve creating subdomains, neglecting to update or remove DNS records after discontinuing the service can lead to subdomain takeover vulnerabilities.
- **External contractors and developers**: companies often work with external contractors or developers for specific projects. If these external parties set up subdomains for their use, and the company doesn't manage DNS records properly, subdomain takeover vulnerabilities may arise if the external parties' services are terminated.
- **Lack of inventory and monitoring**: some organizations may not maintain a comprehensive inventory of their subdomains or lack proper monitoring mechanisms. This can result in not promptly identifying and addressing subdomains that are no longer in use.
- **Dynamic cloud infrastructure**: in cloud environments, organizations may dynamically create and destroy resources. If a subdomain is associated with a cloud resource (e.g., an Amazon S3 bucket) that gets deleted, but the DNS record remains, it can lead to subdomain takeover.
- **Employee turnover**: when employees who manage DNS records leave the organization, and there is no proper knowledge transfer or documentation, it can lead to lapses in managing subdomains effectively.

<div id='section-id-4'/>
## 4. Report resolution

The subdomain was the typical forgotten asset that the company did not even remember, so the criticality of the asset was low. Getting this criticality in an asset when reporting this type of vulnerability is quite common. As we saw in the previous section, if this vulnerability exists in an asset, it is possibly because it is not monitored, and this would be because it is not an important asset for them.

On the other hand, this vulnerability is commonly classified as high or critical because as you have seen, it is possible to gain full control of the content that will display the subdomain. Therefore, the report was classified as 

- **Asset criticity**: Low
- **Vulnerability severity**: High
- **Bounty**: More than $200 for each subdomain takeover (because of a 2X reward multiplier on high and critical vulnerabilities)

<div id='section-id-5'/>
## 5. Lessons learned

- VPS are a very useful tool for bug bounty. In this case with the report of these subdomain takeovers I already amortized the cost of the VPS for the next 2 years and I had to to practically nothing.
- When you find a vulnerability in a subdomain, try to look for the same vulnerability in other subdomains with a similar name. As we saw in this post, I found 2 subdomain takeovers in domains with very similar names, possibly because one belonged to the production environment and the other to a pre-production or QA environment.
- There are some vulnerabilities whose exploitation can be very hard and whose impact is not always very high, as we saw in the post about [HTTP request smuggling](https://blog.hackcommander.com/posts/2023/05/03/te-te-http-request-smuggling-obfuscating-te-header/). However, there are also the opposite cases, like this one, in which we have a vulnerability that is very easy to detect and exploit and yet its impact is high. Many bug bounty hunters have fully automated detection, exploitation and reporting of vulnerabilities such as this one.
- Try to help content creators you like. For example, the creator of reconFTW, [Alexis](https://es.linkedin.com/in/alexisfdezfdez/es), has a [Buy Me a Coffee](https://www.buymeacoffee.com/six2dez) account where he can make donations. Making a donation of 1 coffee costs nothing and is a sign of recognition and admiration that encourages content creators to continue creating quality content.
