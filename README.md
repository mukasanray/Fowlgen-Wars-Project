# Fowlgen Wars Project - Kanban Integration

This project contains the OpenSpec ↔ GitHub Kanban integration system for Fowlgen Wars.

## 📁 Project Structure

### Root Directory
- `.agents/` - Configuration files
- `.git/` - Git repository
- `.github/` - GitHub Actions workflows
- `api/` - API endpoints
- `app/` - Application code
- `build/` - Build artifacts
- `config/` - Configuration files
- `design/` - Design assets
- `devsecops/` - DevSecOps tools
- `docs/` - Documentation
- `k8s/` - Kubernetes configurations
- `kanban/` - Kanban integration files
- `openspec/` - OpenSpec project files
- `program/` - Program code
- `prompt/` - Prompt templates
- `src/` - Source code
- `unity/` - Unity project
- `.gitignore` - Git ignore file
- `.gitleaksignore` - Gitleaks ignore file
- `.gitmodules` - Git submodules
- `AGENTS.md` - Agent documentation
- `CONFIG_SETUP.md` - Configuration setup
- `docker-compose.yml` - Docker configuration
- `Dockerfile` - Docker build file
- `fowlgowwars-kanban-sync.sh` - Main Kanban sync script
- `generate-kanban-dashboard.sh` - Dashboard generation script
- `install.sh` - Installation script
- `KANBAN_ORGANIZATION_SUMMARY.md` - Kanban organization summary
- `KANBAN_PROJECT_SUMMARY.md` - Kanban project summary
- `PROJECT_SUMMARY.md` - Project summary
- `QUICK_START.md` - Quick start guide
- `README_KANBAN_SETUP.md` - Kanban setup README
- `setup_run_log.txt` - Setup run log
- `sync-openpec-to-github.sh` - Sync OpenSpec to GitHub
- `unity_batch.log` - Unity batch log
- `update-kanban-columns.sh` - Update Kanban columns
- `VERIFY_SETUP.sh` - Verify setup
- `VIEW_KANBAN_STATUS.sh` - View Kanban status

### Kanban Directory
The `kanban/` folder contains all OpenSpec ↔ GitHub Kanban integration files:

```
kanban/
├── scripts/              # Main scripts
│   ├── fowlgowwars-kanban-sync.sh      # Main orchestrator
│   ├── sync-openpec-to-github.sh       # Sync to GitHub
│   ├── update-kanban-columns.sh       # Update columns
│   ├── generate-kanban-dashboard.sh   # Generate dashboard
│   ├── VIEW_KANBAN_STATUS.sh          # View status
│   └── VERIFY_SETUP.sh                # Verify setup
│
├── docs/                  # Documentation
│   ├── CONFIG_SETUP.md
│   ├── PROJECT_SUMMARY.md
│   └── QUICK_START.md
├── README.md              # Kanban README
└── setup_structure.ps1   # PowerShell setup script
```

## 🚀 Getting Started

### Quick Start

1. **Install dependencies:**
   ```bash
   sudo apt-get update
   sudo apt-get install git gh
   ```

2. **Configure GitHub CLI:**
   ```bash
   gh auth login
   ```

3. **Run the main orchestrator:**
   ```bash
   ./fowlgowwars-kanban-sync.sh
   ```

4. **View current status:**
   ```bash
   ./VIEW_KANBAN_STATUS.sh
   ```

5. **Verify configuration:**
   ```bash
   ./VERIFY_SETUP.sh
   ```

### Development Workflow

#### For Developers (Marcos/Jorge/Maria)

1. **Start a task:**
   ```bash
   agent atualizar "**2.1**" "Em Andamento" "Marcos"
   gh issue edit "$ISSUE_ID" --label "em-progresso"
   ```

2. **Test the task:**
   ```bash
   agent atualizar "**2.5**" "Testando" "Maria"
   gh issue create --title "Test: $(agent consultar openspec/changes/*/proposal.md)" --label "testando,aprovado"
   ```

3. **Complete the task:**
   ```bash
   agent atualizar "**2.5**" "Concluído" "Maria"
   gh issue edit "$ISSUE_ID" --label "concluído" --status "Done"
   ```

#### For QA and Verification (Maria Clara)

1. **Test features:**
   ```bash
   agent atualizar "**2.5**" "Testando" "Maria"
   gh issue create --title "Test: $(agent consultar openspec/changes/*/proposal.md)" --label "testando,aprovado"
   ```

2. **Report bugs:**
   ```bash
   gh issue create --title "Bug: <descrição>" --label "bug,reportado"
   ```

#### For Kanban Backlog (Samuel - PO)

1. **Check OpenSpec backlog:**
   ```bash
   agent consultar openspec/changes/*/tasks.md
   ```

2. **Prioritize in GitHub Projects:**
   ```bash
   gh project list --format json | jq '.[] | select(.name == "Backlog de Features")'
   ```

3. **Validate and approve:**
   ```bash
   agent validar ideia "<id>"
   agent aprovar ideia "<id>" "Samuel"
   ```

## 📊 Project Summary

### Overview

This project implements a complete OpenSpec ↔ GitHub Kanban integration system for Fowlgen Wars, allowing bidirectional synchronization between the OpenSpec task management system and the GitHub Projects Kanban board.

### Features

- **Automated Synchronization**: Real-time sync between OpenSpec and GitHub Projects
- **GitHub Actions Integration**: Daily automated synchronization
- **Dashboard Generation**: Real-time status dashboards
- **Task Management**: Complete task lifecycle management
- **Documentation**: Comprehensive documentation and guides

### Key Components

1. **Scripts**: 6 shell scripts for complete automation
2. **Documentation**: 3 documentation files for easy setup
3. **GitHub Actions**: Automated daily synchronization workflow
4. **OpenSpec Integration**: Native support for OpenSpec projects

### Status

✅ **All features implemented and tested**
✅ **Documentation complete**
✅ **Automation ready**
✅ **Production ready**

## 🔧 Setup Requirements

### Prerequisites

- **GitHub CLI (gh)**: `brew install gh` (macOS) or `winget install GitHub CLI` (Windows)
- **GitHub Authentication**: `gh auth login`
- **OpenSpec CLI**: Available in PATH
- **Node.js (optional)**: For TypeScript scripts

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Make scripts executable:**
   ```bash
   chmod +x fowlgowwars-kanban-sync.sh
   chmod +x sync-openpec-to-github.sh
   chmod +x update-kanban-columns.sh
   chmod +x generate-kanban-dashboard.sh
   chmod +x VIEW_KANBAN_STATUS.sh
   chmod +x VERIFY_SETUP.sh
   ```

3. **Configure GitHub token (for GitHub Actions):**
   ```bash
   # Create a GitHub token with repository permissions
   # Add it as a secret named GH_TOKEN in GitHub repository settings
   ```

4. **Run initial synchronization:**
   ```bash
   ./fowlgowwars-kanban-sync.sh
   ```

5. **Verify setup:**
   ```bash
   ./VERIFY_SETUP.sh
   ```

6. **Configure GitHub Actions (optional):**
   ```bash
   # The workflow is already configured in .github/workflows/kanban-sync.yml
   # Just configure the GH_TOKEN secret
   ```

## 📚 Documentation

### Configuration

- **`CONFIG_SETUP.md`** - Complete configuration guide
- **`PROJECT_SUMMARY.md`** - Project overview and metrics
- **`QUICK_START.md`** - Quick start guide

### Scripts

- **`fowlgowwars-kanban-sync.sh`** - Main orchestrator script
- **`sync-openpec-to-github.sh`** - Sync OpenSpec tasks to GitHub
- **`update-kanban-columns.sh`** - Update GitHub columns based on OpenSpec
- **`generate-kanban-dashboard.sh`** - Generate dashboard
- **`VIEW_KANBAN_STATUS.sh`** - View current status
- **`VERIFY_SETUP.sh`** - Verify configuration

### Development

- **`README_KANBAN_SETUP.md`** - Kanban setup documentation
- **`KANBAN_ORGANIZATION_SUMMARY.md`** - Organization summary
- **`KANBAN_PROJECT_SUMMARY.md`** - Project summary

## 🏗️ Architecture

### System Components

1. **OpenSpec System** - Task management system (source of truth)
2. **GitHub Projects** - Kanban board (interface)
3. **Automation Scripts** - Synchronization and management
4. **Documentation** - User and developer guides
5. **GitHub Actions** - Automated daily synchronization

### Data Flow

```
OpenSpec (proposal.md, tasks.md) → Scripts → GitHub Projects → Dashboard → Reports
                     ↑                                        ↓
                Agent commands ↔ GitHub CLI (gh) ← GitHub Projects
```

### Integration Points

1. **Backlog Management**: PO manages backlog in OpenSpec
2. **Development Tracking**: Developers track progress in GitHub
3. **Quality Assurance**: QA validates and tests in GitHub
4. **Status Synchronization**: All changes kept in sync
5. **Reporting**: Dashboards provide visibility

## 📊 Metrics

### Project Status

- **OpenSpec Features**: 2 features complete
- **GitHub Projects**: Configured with 4 columns
- **Scripts**: 6 main scripts
- **Documentation**: 3 documentation files
- **Automation**: Ready for production

### Current Features

1. **health-bar-black-bg/** - Complete OpenSpec feature
2. **route-lines-hidden/** - Complete OpenSpec feature

### Kanban Columns

1. **Backlog** - New/pending features
2. **Em Progresso** - Features in development
3. **Review** - Features under review/testing
4. **Done** - Completed features

## 🎯 Goals

### Primary Goals

1. **Eliminate Manual Work**: Automate all OpenSpec ↔ GitHub synchronization
2. **Improve Visibility**: Provide real-time status dashboards
3. **Enhance Collaboration**: Streamline team workflows
4. **Ensure Consistency**: Keep all systems in sync
5. **Provide Documentation**: Complete setup and usage guides

### Success Metrics

- **Zero manual synchronization** required
- **100% automated** daily updates
- **Real-time** dashboard visibility
- **Complete** documentation coverage
- **Production-ready** with minimal setup

## 🛡️ Security

### Best Practices

1. **Token Security**: GitHub tokens stored as secrets
2. **Permission Management**: Minimal required permissions
3. **Access Control**: Proper authentication
4. **Audit Trail**: GitHub Actions logs for security
5. **Error Handling**: Safe error recovery

### Security Features

- **GitHub Token Management**: Secure storage and rotation
- **Authentication**: Proper GitHub CLI authentication
- **Authorization**: Role-based access control
- **Error Recovery**: Safe failure handling
- **Logging**: Comprehensive logging for debugging

## 🔄 Future Enhancements

### Planned Features

1. **Slack/Teams Integration**: Real-time notifications
2. **Advanced Metrics**: Performance tracking and analytics
3. **Custom Workflows**: Team-specific automation
4. **API Integration**: Programmatic access
5. **Mobile Support**: Mobile dashboard access

### Roadmap

- **Phase 1**: Core integration (completed)
- **Phase 2**: Advanced features (planned)
- **Phase 3**: Enterprise features (future)

## 📞 Support

### Troubleshooting

#### Common Issues

1. **GitHub CLI not installed:**
   ```bash
   # macOS
   brew install gh

   # Windows
   winget install GitHub CLI

   # Linux
   sudo apt-get install gh
   ```

2. **Authentication issues:**
   ```bash
   gh auth login
   ```

3. **Script errors:**
   ```bash
   # Check logs and permissions
   chmod +x *.sh
   ./fowlgowwars-kanban-sync.sh
   ```

#### Getting Help

- **Documentation**: Check `CONFIG_SETUP.md`, `PROJECT_SUMMARY.md`, `QUICK_START.md`
- **Issues**: Report issues in the repository
- **Discussions**: Join community discussions
- **Support**: Contact project maintainers

## 🎉 Conclusion

This project provides a complete OpenSpec ↔ GitHub Kanban integration system for Fowlgen Wars, featuring:

✅ **Automated Synchronization**: Zero manual work required
✅ **GitHub Actions Integration**: Daily automated updates
✅ **Complete Documentation**: Easy setup and usage
✅ **Production Ready**: Ready for enterprise use
✅ **Security Focused**: Secure authentication and authorization
✅ **Future Ready**: Extensible architecture for enhancements

The system keeps the OpenSpec project in sync with the GitHub Kanban board, providing real-time visibility and eliminating manual data entry. Team members can work in their preferred system while maintaining consistency across all platforms.

**Ready to get started? Follow the quick start guide and start automating your OpenSpec ↔ GitHub synchronization today!** 🚀