---
layout: single
title: HackerNight 2024&#58; my first live hacking event
excerpt: "Review of my experience at the HackerNight live hacking event in RootedCON and how I got the first blood on one of the customers."
date: 2024-06-11
classes: wide
header:
  teaser: /assets/images/2024-06-11-hackernight-2024-my-first-live-hacking-event/first-blood.png
  teaser_home_page: true
  icon:
categories:
  - review
  - bug bounty
tags:  
  - life hacking event
  - hackernight
  - rootedcon
  - yogosha
  - first blood
---

## Summary 

- [1. What is HackerNight?](#section-id-1)
- [2. Why did I sign up for HackerNight?](#section-id-2)
- [3. The course of HackerNight](#section-id-3)
  - [3.1. Entry to the event](#section-id-3-1)
  - [3.2. During the event](#section-id-3-2)
  - [3.3. Outcome of the event](#section-id-3-3)
- [4. Conclusions of HackerNight](#section-id-4)

![](/assets/images/2024-06-11-hackernight-2024-my-first-live-hacking-event/rooted-hn-logo.jpg)

> :warning: <span style="color:red">This post does not contain technical details about the vulnerabilities I found in the event because in order to participate in the event I signed a NDA (non-disclosure agreement), so this post is a review about the event and not a technical post about bug bounty.</span>

In this post I am going to review my experience at the HackerNight live hacking event organized by Yogosha at RootedCON. This was my first live hacking event and against all odds I got the first blood on one of the customers.

<div id='section-id-1'/>
## 1. What is HackerNight?

[HackerNight](https://www.rootedcon.com/noticias/rooted2024-hackernight/) is a live hacking event (LHE) for bug bounty hunters organized by [Yogosha](https://yogosha.com/) at the [RootedCON](https://www.rootedcon.com/) conference in [Kinepolis](https://kinepolis.es/), a cinema in Madrid. This year's RootedCON Spain took place on March 7 to 9 in Madrid and HackerNight took place during the night of March 8 to 9. In this event bug bounty hunters from different countries gather in person to hack on the programs selected for the event, sharing snacks and experiences.

To sign up for this event you don't need to be a pro bounty hunter (I'm not) or have previous bug bounty experience as access to the event is free and anyone can sign up for a cost of 50 euros. You don't even have to attend the RootedCon congress, because, although the HackerNight is organized in the context of the RootedCON, they are different events. In my case I went to both events because both tickets were paid for by the company I work for, [Tarlogic](https://www.tarlogic.com/). Nobody will be watching you, if you don't find any bug it's ok :smiley:

However, it is one thing to sign up for the event and another to find a valid bug. If you are a beginner hunter I recommend you to go with low expectations in this sense because there are many variables that influence the fact of finding something: scope and age of the programs, quality of the event that year, luck... Of the almost 100 hackers that attended the event, I think only about 15% of the participants got a valid report.

In my case I found several bugs by chance, as I will explain below. I was very lucky, and if I had not found anything I would not be a worse hunter than I am. In fact the event was attended by many hackers better than me who did not find any bug, and they are still better than me.

That's why I recommend that you take the event as a time for leisure and fun with other hackers, rather than as a challenge where failing means you're a loser. Enjoy the people, the food, the atmosphere, and, above all, the hacking.

<div id='section-id-2'/>
## 2. Why did I sign up for HackerNight?

I signed up for this event because it was my third time going to RootedCON and none of the previous years I felt confident enough to sign up. I always thought that maybe I wasn't ready to participate in this kind of event and besides, I found more interesting the idea of spending the night drinking beer than with a computer :beers:

However this time I signed up because during the last year I have collaborated with some people who are dedicated to bug bounty but with whom I only talk through Telegram and Discord. So it seemed like a good opportunity to meet many of them face to face.

<div id='section-id-3'/>
## 3. The course of HackerNight

<div id='section-id-3-1'/>
## 3.1. Entry to the event

To be honest, when it was time to enter I didn't really want to get into the event. I love hacking, but it's something I do in my spare time at home, and while I had to go to the event, my friends were drinking beer. I had also woken up at 10:00 am to go to the RootedCON talks, I hadn't taken a nap and I hadn't had dinner either. I also didn't have any script ready to do recon because so far all the bug bounty I do is essentially manual. In short, I was tired, hungry and not in the mood to hack :satisfied:. However, it was obvious that I had to go in because I wanted to live the experience.

The event was supposed to run from 8:00 pm on March 8 to 8:00 am on March 9, that is, 12 hours of hacking. However, due to a delay in the registrations and in the preparation of the event, in the end the event started around 11:00 pm. When I entered I sat at a table with my colleagues of Tarlogic and, although there is no picture of me at the event, I can tell you that I'm the one sitting there on the right:

![](/assets/images/2024-06-11-hackernight-2024-my-first-live-hacking-event/me.png)

<div id='section-id-3-2'/>
## 3.2. During the event

I don't keep a logbook about the event, but the approximate timeline of the event was:

- **11:00 pm:** start of HackerNight.
- **11:00 pm - 1:00 am:** participating in one of the programs without a defined strategy and without understanding the logic of the application.
- **1:00 am - 4:00 am:** eating pringles and hamburgers and drinking monsters to drown my sorrows because I wasn't focused and couldn't find anything :cry:.
- **4:00 am - 4:25 am:** taking a look at the scope of another program, I found a vulnerability by chance.
- **4:25 am:** reported the first vulnerability as *Medium*.
- **4:42 am:** the customer accepted the vulnerability as *Medium* and my nickname, *HackCommander*, appeared on the movie screen in the first bloods section to applause. At that moment, all my accumulated fatigue vanished, and I felt a rush of excitement.

  ![](/assets/images/2024-06-11-hackernight-2024-my-first-live-hacking-event/first-blood.png)
  
  This picture was taken long after I got the first blood so I had already been kicked off the leaderboard, but I was present for some hours. In fact, I think if they had updated the leaderboard after I was accepted for the *High* vulnerability, I might have been in.
  
- **4:42 am - 6:58 am:** working hard on the same program to test some ideas that came up after the first report.
- **6:58 am:** reported the second vulnerability as *Medium*.
- **7:27 am:** the customer replied that they were not able to reproduce the bug, and it was true. Due to all the fatigue, I made a mistake in the report.
- **7:43 am:** corrected the error in the report, but the event was about to end.
- **8:00 am:** HackerNight ends with [Diego Jurado](https://es.linkedin.com/in/djuradopallares) as the winner.

Therefore, I finished the HackerNight with a *Medium* vulnerability accepted and another *Medium* pending in triage, completely zombie-like from lack of sleep but full of pride. The battle was over and I was still standing, with traces of blood on my sword.

<p style="text-align:center;"><img src="/assets/images/general/300-rain.gif" style="width: 600px;"></p>

However, the best was yet to come. By the end of the event I was absolutely exhausted so I was unable to work, but I knew that the last vulnerability I had reported could be escalated with a little more work. That's why the following days I continue working on this vulnerability and I managed to escalate it to *High*. The customer was very good and accepted the vulnerability with the new impact.

Being my first live hacking event, I was very excited when my nickname appeared on the screen. I felt that I had achieved another milestone in my career as pentester.

<div id='section-id-3-3'/>
## 3.3. Outcome of the event

In the following Linkedin post you can see how Yogosha published a thank you to customers:

- [Yogosha post on Linkedin about HackerNight 2024](https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7176490844202381313)

<p style="text-align:center;"><img src="/assets/images/2024-06-11-hackernight-2024-my-first-live-hacking-event/linkedin-post.png"></p>

They also published a video about the event:

- [Yogosha video on Youtube about HackerNight 2024](https://www.youtube.com/watch?v=45b8ykxyY7o&ab_channel=Yogosha)

In this video you can see that in the screen appear the nicknames of many hackers next to the customers where they got the first blood. For example *Lobuhi* got the first blood at *Arize*, *Borgi* at *Spartoo*... This is public information published by Yogosha, so I guess I can say that **I got the first blood at Carter Cash**.

Finally, the outcome of the event was:

- **First blood in the Carter Cash program.** HackCommander appeared on the Kinepolis screen!
- **A good amount of money for a few hours of work.** I wish my hourly wage was what I earned that night...
- **Direct access to the [Yogosha Strike Force](https://yogosha.com/hackers/).** To enter this community it's necessary to pass a series of CTFs, but if you report in a LHE a vulnerability of at least *Medium* severity, you get a direct access to the community. I just had to write them a ticket because the process is not automatic, and since then I already receive invitations to private programs and I have a public profile as [HackCommander](https://app.yogosha.com/r/hackcommander) on Yogosha.

<div id='section-id-3-4'/>
## 3.4. Conclusions of HackerNight

After all that I have explained, I believe that HackerNight has the following pros and cons:

### <u>Pros</u>:
- The **experience is incredible**, it's immersive and unique.
- The **price is good** for everything they offer, even if you don't win any bounties.
- The **people are great**, they are hackers, just like you.
- Yogosha gave away **merchandise and food** during the night.
- It's **not just a one-night experience** because if you leave a report unfinished, you can continue working on it in the following days.

### <u>Cons</u>:
- It somewhat **disrupts the RootedCON experience** because you miss the beers that night and possibly the talks during the the day if you've been sleeping to be well-rested.
- Since it takes place at night, **the schedule is challenging**, so you either sleep during the day or go more than 24 hours without sleep, as I did.
- The **work setup is not comfortable** because they don't have monitors for the hackers, so you can only work with your laptop screen.
- Other **minor cons related to the programs**, but which I shouldn't discuss due to the NDA.

Although some of the cons are fixable, I think **HackerNight is a great event worth attending** that every bounty hunter should attend at least once in their lifetime. I will probably return next year :blush:.
