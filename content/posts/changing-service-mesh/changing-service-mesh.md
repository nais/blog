---
title: "Changing Service Mesh"
description: "How we swapped Istio with Linkerd" #j ...in-flight? zero downtime?
date: 2021-05-04T20:37:13+02:00
draft: true
author: Frode Sundby
tags: [istio, linkerd, LoadBalancing]
---

# Zero downtime service-mesh change

## Why change?
With an ambition of making our environments as secure as possible, we jumped on the service-mesh band wagon in 2018 with Istio 0.7 and have stuck with it since. #j bandwagon

Istio is a large and feature rich system that brings capabilities in heaps and bounds.
Although there are a plethora of nifty and useful things you can do, our main use case was mTLS and authorization policies.
However, the added capabilities brings added complexities; both when configuring, maintaining and troubleshooting.  #j capabilities comes with a cost, namely complexity...
And since we don’t use (nor have the need for) more than a smidgeon of the capabilities, we would prefer to opt out of the added complexity. #j Since we don't make use of ... we want to simplify where we can.

#j føler det mangler noeTM her, evt bare en annen overgang. 
#j f.eks. ta med leseren på en reise der vi fant ut at "hm, kanskje vi skulle sett på noe annet", til kjapp analyse, til kjapp poc til bæng vi gønner på med linkerd. Deretter, "la oss ta en titt på hvordan arkitekturen så ut... <original architecture>

## Original architecture: 
The first thing an end user encounters, is our Google LoadBalancer. (This LoadBalancer was created and configured by an Istio Operator in each cluster.) #j load balancer. Kanskje vurdere om det som står i parentes er viktig for leser her, eller mer forvirrende
The traffic is then shipped to the Istio Ingressgateway. (Istio Ingressgateway is configured by a VirtualService and a Gateway.)
Istio Ingressgateway then establish an mTLS connection to the Istio sidecar injected to the application's pod. (mTLS is authorized by an AuthorizationPolicy)
In order for the Ingressgateway to reach the destination, a NetworkPolies for both Istio Ingressgateway and the application needs to allow the traffic #j .
Both AuthorizationPolicies and VirtualServices are created by an [operator](https://github.com/nais/naiserator) during application deploy.

![changing-service-mesh](/blog/images/changing-service-mesh-1.png)


## How did we do it?

### New LoadBalancers and ingress controllers
Since our LoadBalancers were configured by (and sent traffic to) Istio, we had to change the way we configure them.
Separating LoadBalancing from mesh is a healthy separation of concern that will give us greater flexibility in the future as well.
We also had to swap out Istio Ingressgateway with an Ingress Controller - we opted for NGINX.

We started by creating IP-addresses and Cloud Armor security policies for our new LoadBalancers with [Terraform](https://www.terraform.io/).

The loadbalancers themselves were created by an Ingress object:
```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  annotations:
    networking.gke.io/v1beta1.FrontendConfig: <tls-config>
    kubernetes.io/ingress.global-static-ip-name: <global-ip-name> 
    kubernetes.io/ingress.allow-http: "false"
  name: <loadbalancer-name>
  namespace: <ingress-controller-namespace>
spec:
  backend:
    serviceName: <ingress-controller-service>
    servicePort: 443
  tls:
    - secretName: <kubernetes-secret-with-certificates>
```

We tied the Cloud Armor security policy to the Loadbalancer with a `BackendConfig` on the Ingress Controller's service:
```yaml
apiVersion: v1
kind: Service
metadata:
  annotations:
    cloud.google.com/app-protocols: '{"https": "HTTP2"}'
    cloud.google.com/backend-config: '{"default": "<backendconfig-name>"}'
    cloud.google.com/neg: '{"ingress": true}'
    ...
---
apiVersion: cloud.google.com/v1
kind: BackendConfig
metadata:
  name: <backendconfig-name>
spec:
  securityPolicy:
    name: <security-policy-name>
  ...
````
``

Alrighty. We'd now gotten ourselves a brand new set of independantly configured LoadBalancers and a shiny new Ingress Controller.
![changing-service-mesh](/blog/images/changing-service-mesh-2.png)

However - if we'd start shipping traffic to the new components at this stage, things would start breaking, as there were no ingresses in the cluster - only VirtualServices.
To avoid downtime, we created an interim ingress that forwarded all traffic to the Istio IngressGateway:
```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
spec:
  rules:
  - host: '<domain-name>'
    http:
      paths:
      - backend:
          serviceName: <istio-ingressgateway-service>
          servicePort: 443
        path: /
  ...
```
Now we could change the DNS records for *.<domain> to point to the new rig and no one would notice a thing.

#j *.sub.domain.tld i eksempel kanskje


workloads to linkerd.
remove istio and istio lb

#
