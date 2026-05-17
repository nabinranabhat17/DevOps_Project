# cicd-devops-project

Minimal scaffold for the CI/CD demo from the prompt. Implements a simple Node.js app, a Jenkins pipeline scaffold, an Ansible playbook for deployment, and a Prometheus+Grafana monitoring stack.

Quick start (assumes Docker, Docker Compose, Ansible are installed):

1. Build and run the app locally for smoke tests:

```bash
cd cicd-devops-project
docker compose build app
docker compose up -d app
curl http://localhost:3000/health
```

2. Start monitoring stack:

```bash
cd monitoring
docker compose up -d
```

3. Run Ansible deploy locally (example):

```bash
ansible-galaxy collection install -r ansible/requirements.yml
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml -e image_tag=latest
```

Next steps: configure Jenkins container and create a Pipeline job pointing to this repository. See `jenkins/Jenkinsfile` for pipeline stages.
