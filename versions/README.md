# PropIQ Versions Directory

**Purpose:** Version-based file cabinet organization for PropIQ documentation

---

## 🎯 Quick Navigation

- **[Current Version](./CURRENT.md)** - Always points to active version
- **[Version Index](./INDEX.md)** - Master index of all versions
- **[v3.1.1 Changelog](./v3.1/v3.1.1/CHANGELOG.md)** - Current version details
- **[v3.2.0 Roadmap](./v3.2/v3.2.0/ROADMAP.md)** - Planned features

---

## 📁 Directory Structure

```
versions/
├── CURRENT.md              # Points to current version (v3.1.1)
├── INDEX.md                # Master version index
├── v3.1/                   # v3.1.x series (current production)
│   ├── SUMMARY.md          # Series overview
│   └── v3.1.1/             # Specific version
│       ├── CHANGELOG.md    # What changed
│       ├── DEPLOYMENT.md   # How it was deployed
│       ├── FIXES_COMPLETE.md
│       └── FEATURES.md
└── v3.2/                   # v3.2.x series (planned)
    └── v3.2.0/             # Next version
        ├── ROADMAP.md      # Planned features
        └── FEATURE_REQUESTS.md
```

---

## 🚀 Getting Started

1. **Check current version:** See [CURRENT.md](./CURRENT.md)
2. **View version history:** See [INDEX.md](./INDEX.md)
3. **Read changelog:** See [v3.1/v3.1.1/CHANGELOG.md](./v3.1/v3.1.1/CHANGELOG.md)
4. **See planned features:** See [v3.2/v3.2.0/ROADMAP.md](./v3.2/v3.2.0/ROADMAP.md)

---

## 📝 Adding a New Version

### For Patch Release (v3.1.1 → v3.1.2)

```bash
mkdir versions/v3.1/v3.1.2
touch versions/v3.1/v3.1.2/CHANGELOG.md
# Document changes, deploy, update INDEX.md
```

### For Minor Release (v3.1.x → v3.2.0)

```bash
mkdir -p versions/v3.2/v3.2.0
touch versions/v3.2/v3.2.0/ROADMAP.md
# Plan features, start development
```

---

## 📚 Documentation

- **[Version System Guide](../VERSION_SYSTEM.md)** - Complete system documentation
- **[Migration Guide](../MIGRATION_TO_VERSION_SYSTEM.md)** - How to migrate existing files

---

**Last Updated:** November 2025

