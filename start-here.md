## Workflow

Do not push directly to the main branch

### Starting a Task

1. Pull the latest changes:

```bash
git checkout main
git pull
```

2. Create a feature branch:

```bash
git checkout -b feature/taskname
```

### Saving Your Work

```bash
git add .
git commit -m "changes that you did"
git push -u origin feature/taskname
```

### Finishing a Task

Create a Pull Request from your feature branch into the main branch for review before merging.
