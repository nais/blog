---
title: "OAuth del 3 (PKCE)"
description: "OAuth Proof Key for Code Exchange (PKCE)"
date: 2021-03-07T12:49:37+01:00
draft: true
author: Jan-Kåre Solbakken
tags: ["oauth", "oidc", "sikkerhet"]
---

## Bakgrunn

Dette er del 3 i serien om OAuth og OIDC. I [del 1](/blog/posts/2020/09/oauth-del-1.html) ble standarden og terminologien gjennomgått, ta en titt på den hvis du trenger en innføring eller oppfriskning. Den mest brukte OAuth-flyten, "Authorization Code flow", innebærer at `client` og `id provider` utveksler hemmeligheter. Klienten må derfor være i stand til å holde på hemmeligheter, i standarden omtales dette som `confidential clients`. For mobil-apps og "single page" webapplikasjoner har dette ikke vært gjennomførbart da hemmelighetene må distribueres helt ut til sluttbrukeren som en del av appen.

Authorization Code flow har også en svakhet som kalles "authorization code injection". Et slikt angrep er komplisert å gjennomføre og krever at mange ting skal klaffe samtidig, men er ingen umulighet. Dersom noen som har stjålet din `client_id` og `client_secret` klarer å fange opp en authorization code kan de gjøre et token-kall på dine vegne, og dermed utgi seg for den aktuelle sluttbrukeren. Hvordan klarer man så å fange opp en authorization code? Callbacks gjøres jo kun til (forhåpentligvis) forhåndsgodkjente URLer over HTTPS? Vel, ikke alltid. En måte er å utnytte custom "URL schemes" på telefoner. En telefon-app vil typisk registrere callback URLs av type `myapp://something`, dette gjør at kallene rutes til denne appen. Hvis en angriper får deg til å installere en app som registrerer seg som lytter på myapp-URLs vil denne appen også få tilsendt callbackene som inneholder koden.

## PKCE

For å bøte på disse svakhetene har det blitt laget et [tillegg](https://tools.ietf.org/html/rfc7636) til OAuth-standarden. Tillegget beskriver teknikken "Proof Key for Code Exchange" som forkortes "PKCE" og uttales "pixie".

Authorization Code flow ser ut som vist i figuren (se [del 1](/blog/posts/2020/09/oauth-del-1.html) for detaljer).

![authorization code flow](/blog/images/auth_code.png) 

PKCE legger på følgende tillegg:
 - Klienten genererer en tilfeldig verdi som kalles `code_verifier`. Denne brukes til å generere en `code_challenge`. Challengen og `code_challenge_method` legges som ekstra parametre på det initielle `/auth`-kallet til id-provideren.
 - Id-provider svarer som vanlig, men tar vare på `code_challenge` og `code_challenge_method`.
 - Klienten sender `authorization_code` som vanlig med i `/token`-kallet, men legger i tillegg på den samme `code_verifier` som ble generert i punkt 1.
 - Id-provider bruker `code_verifier` til å generere en `code_challenge` på samme måte som klienten gjorde. Hvis de to code challengene ikke er like avvises forespørselen.

Angripere som kjenner din `client_id` og `client_secret` vil dermed ikke kunne gjøre token-kall fordi de ikke kjenner verifieren som ble generert og brukt i punkt 1. Selv om de er i stand til å observere både requesten til og responsen fra `/auth`-endepunktet vil de ikke være i stand til å rekonstruere code challengen.

Standarden definerer to ulike metoder å lage code challenges på: `plain` og `S256`. Plain vil si at code_verifier og code_challenge er samme verdi. For S256 lages code_challenge etter følgende oppskrift: `base64UrlEncode(sha256(ascii(code_verifier)))`. Klienten er pålagt å bruke S256 med mindre særlige begrensninger i ressurser eller annet gjør at den ikke er i stand til det. 
