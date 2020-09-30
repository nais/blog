---
title: "Loadbalancers with Terraform and Istio"
description: "How we configure Google loadbalancers with terraform and istio, and how do they work"
date: 2020-09-30T11:26:55+02:00
draft: true
author: Frode Sundby
tags: [sikkerhet, terraform, loadbalancer, gateway, istio, gcp, gke]
---

## Introduction
In each of our GCP Nais-clusters we’ve got a range of different domains for different purposes.
Each of these domains have different audiences and thus need different loadbalancer configuration.
In this post we aim to elaborate on how we've used [Github actions](https://github.com/features/actions), [Terraform](https://www.terraform.io/), [Naisplater](https://github.com/nais/naisplater) and [Istio](https://istio.io/) to set up loadbalancers automatically.

## Github actions
All configuration for all GCP nais clusters take place in a common [workflow](https://github.com/navikt/gcp-terraform/blob/master/.github/workflows/cicd.yaml) (private repo)
In brief, the workflow will create the GCP projects and all required components for private [GKE](https://cloud.google.com/kubernetes-engine) clusters using terraform.
Once the vanilla clusters are created, Istio and its components will be installed and configured by a custom [IstioOperator config](https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/) for each cluster


## Terraform
The interesting part of terraform in this context, is that a google compute address with a static IP address will be created for each of the gateway domains we've configured

```terraform
resource "google_compute_address" "gateway_address" {
  for_each     = toset(var.gateway_domains)
  name         = each.key
  network_tier = "PREMIUM"
  project      = google_project.nais.project_id
}
```

Variables for each cluster with gateway names
Terraform creates static ip-addresses for each gateway name
terraform output

## Naisplater
reads terraform output to get gateway name and IP
templates istio operator config and gateway config for each domain in each cluster
adds secret with certificate using gateway-name
istio operatoconfig installed

## Istio operatorconfig
creates service type loadbalancer with selector for gatewayname exposing ports on nodeport
creates Google TCP loadbalancer passthrough firewall source ranges  

## Gateways
adds gatewayconfiguration, credential name gw-name 


## Naiserator
application deploy with ingress
naiserator gateway mapping:
  gateway-mappings:
  - domainSuffix: .dev-adeo.no
    gatewayName: istio-system/ingress-gateway-dev-adeo-no
  - domainSuffix: .dev-nav.no
    gatewayName: istio-system/ingress-gateway-dev-nav-no
  - domainSuffix: .dev-gcp.nais.io
    gatewayName: istio-system/ingress-gateway-nais-io,istio-system/gw-dev-gcp-nais-io
  - domainSuffix: .dev.nav.no
    gatewayName: istio-system/ingress-gateway-devnav-no,istio-system/gw-dev-nav-no
  - domainSuffix: .dev.adeo.no
    gatewayName: istio-system/ingress-gateway-devadeo-no,istio-system/gw-dev-adeo-no
authorization policy allowing correct ingressgateway

