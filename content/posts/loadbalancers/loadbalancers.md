---
title: "Configuring Google Loadbalancers with Terraform and Istio"
description: "How we configure Google loadbalancers with Terraform and Istio"
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
All configuration for all GCP nais clusters take place in a common [workflow](https://github.com/navikt/gcp-terraform/blob/master/.github/workflows/cicd.yaml) (private repo).
In brief, the workflow will create the GCP projects and all required components for private [GKE](https://cloud.google.com/kubernetes-engine) clusters using terraform.
Once the vanilla clusters are created, Istio and its components will be installed and configured by a custom [IstioOperator config](https://istio.io/latest/docs/reference/config/istio.operator.v1alpha1/) for each cluster


## Terraform
The interesting part of terraform in this context, is that a google compute address will be created for each gateway defined in a vars file.

```terraform
gateway_domains = ["gw-domain1", "gw-domain2", "..."]
```

```terraform
resource "google_compute_address" "gateway_address" {
  for_each     = toset(var.gateway_domains)
  name         = each.key
  network_tier = "PREMIUM"
  project      = google_project.nais.project_id
}
```

To allow us easy access to the gateway names and the addresses created by terraform, we've added them to terraform's output:
```terraform
output "address" {
  value = {
    for address in google_compute_address.gateway_address :
    address.name => address.address
  }
```
Which gives us the following format to work with later:
```bash
▶ terraform output
address = {
  "gw-domain1" = "35.228.1.1"
  "gw-domain2" = "35.228.2.2"
}
```

## Naisplater
Once Terraform completes, the Github workflow adds the gateway names and their IP-addresses to the cluster's variable file.
```bash
echo "loadBalancers:" >> istio/vars/${{ inputs.env }}/operator-config.yaml
for gateway in $(terraform output -no-color -json) | jq -r '.address.value | to_entries[] | "\(.key):\(.value)"'); do
  echo $gateway | awk -F":" '{print "- name: " $1 "\n" "  loadBalancerIP: " $2}' >> istio/vars/${{ inputs.env }}/operator-config.yaml;
done
```

We're using [Naisplater](https://github.com/nais/naisplater) to build a custom Istio Operator Configuration based on the variable file and a template.

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
spec:
  [...]
  components:
    ingressGateways:
  [...]
    {{- range .loadBalancers }}
    - name: {{ .name }}
      enabled: true
      label:
        gateway: {{ .name }}
      k8s:
        service:
          type: LoadBalancer
          loadBalancerIP: {{ .loadBalancerIP }}
          loadBalancerSourceRanges:
          {{- range $.allowedSourceRanges }}
          - {{ . }}
          {{- end }}
    {{- end }}
  [...]
```

## Istio operatorconfig
A whole range of Istio components and CRD's are added to the cluster when the Istio Operator configuration is applied, but for this post the interesting component is the service created for each Istio Ingressgateway.
When a service in GKE is of the type LoadBalancer, a Google Cloud controller will configure a passthrough L4 loadbalancer with the IP we created with Terraform.
Note that this type of load balancer is not a proxy server. It forwards packets with no change to the source and destination IP addresses.
This is important to note, since it is based on the user's source IP we allow or disallow the connection.
Which source IP's are allowed in to a particular ingressgateway is determined by a firewall that has been automatically configured with the loadBalancerSourceRanges from the Istio Operator Config.
