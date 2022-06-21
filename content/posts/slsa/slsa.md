---
title: "SLSA"
description: "Spice up your supply chain"
date: 2022-06-20T22:10:00+02:00
draft: true
author: Jan-Kåre Solbakken
tags: [slsa,sikkerhet,supplychain]
---

![salsa](/blog/images/salsa.webp)

"Software supply chain" is a term describing everything that happens to code from the time it leaves the developers fingers until it runs in production. The code needs to be compiled, tested, packaged and deployed, and these steps take place in a variety of systems and uses lots of complex third party solutions. Our apps also depend on an increasing number of third party libraries and frameworks that we often know next to nothing about. 

![dependencies](/blog/images/react-hello-world-deps.png)

Every step in the supply chain represents a possible attack vector. If a malicious actor is able to compromise one or more parts of the chain it is trivial to inject any kind of malware into our products. Why use loads of resources trying to circumvent all the security measures in production when you can quietly insert all the back doors you need beforehand? The steady [rise](https://www.enisa.europa.eu/news/enisa-news/understanding-the-increase-in-supply-chain-security-attacks) in supply chain attacks shows that more and more threat actors are embracing these types of attacks.

There are several steps we can take to maintain the integrity of our supply chains. The first and most obvious one is to put as much care into securing our build and development pipelines as we do our production environments. Anyone with a few years experience in this industry has seen far to many unpatched and misconfigured Jenkins servers loaded with crappy plugins that store secrets in plain text. Not that it makes a huge difference anyway since the same secrets are readily available in the company-wide Slack and haven't been rotated in 5 years. 2FA, proper handling of secrets and configuration, regular patching, all that good stuff must also be applied to the dev side of the house. 

![unpatched jenkins](/blog/images/jenkins-security-warnings.png)

Another step is actually knowing what it is that we put into production. When we ask someone to trust our software to handle their personal information and money we should at least be able to tell them what parts our products are made of and how they are put together. The U.S. government has already published an [Executive Order](https://www.whitehouse.gov/briefing-room/presidential-actions/2021/05/12/executive-order-on-improving-the-nations-cybersecurity/) that require their vendors to produce a "SBOM", or "software bill of materials", which is a list of components analogous to the list of ingredients on food packaging. Others are likely to follow suit.

Several initiatives have been started in an attempt to address the issues surrounding supply chain integrity, the most noticeable one being [Supply chain Levels for Software Artifacts - SLSA](https://slsa.dev/). SLSA aims to be vendor neutral and is backed by major players like [the Cloud Native Computing Foundation](https://www.cncf.io/) and [Google](https://security.googleblog.com/2021/06/introducing-slsa-end-to-end-framework.html) in addition to startups such as [Chainguard](https://www.chainguard.dev/about-us).

```
SLSA is "a security framework, a check-list of standards and controls to prevent tampering, improve integrity, and secure packages and 
infrastructure in your projects, businesses or enterprises".
```

The framework defines four levels of increasing assurance defined by best practices. The term "provenance" is basically the same as a "SBOM".

| Level | Description                            | Example                                               |
| ----- | -------------------------------------- | ----------------------------------------------------- |
| 1     | Documentation of the build process     | Unsigned provenance                                   |
| 2     | Tamper resistance of the build service | Hosted source/build, signed provenance                |
| 3     | Extra resistance to specific threats   | Security controls on host, non-falsifiable provenance |
| 4     | Highest levels of confidence and trust | Two-party review + hermetic builds                    |

Level 4 is not feasible for most organizations unless their software powers missiles or nuclear reactors. Level 2 or 3, on the other hand, is achievable without to much hassle.

A series of of tools and services to ease the implementations of frameworks like SLSA are also starting to appear. Cryptographic signing and verification is hard to get right, but [the Sigstore project](https://www.sigstore.dev/) makes it a whole lot easier with their "Cosign" tool. Cosign can sign artifacts using ephemeral keys generated on the fly, or you can bring your own keys. 

TODO: et par-tre avsnitt om hva vi har laget og planer for framtidig funksjonalitet
