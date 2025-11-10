#!/bin/bash

# PropIQ Social CLI Setup Script
# Installs dependencies and guides through initial configuration

echo "🚀 PropIQ Social CLI Setup"
echo "=========================="
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✅ Python detected: $python_version"
echo ""

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔧 Next steps:"
echo ""
echo "1. Setup LinkedIn:"
echo "   python3 propiq-cli.py setup linkedin"
echo ""
echo "2. Setup Instagram (optional):"
echo "   python3 propiq-cli.py setup instagram"
echo ""
echo "3. Setup YouTube (optional):"
echo "   python3 propiq-cli.py setup youtube"
echo ""
echo "4. Check connection status:"
echo "   python3 propiq-cli.py status"
echo ""
echo "5. Post your first content:"
echo "   python3 propiq-cli.py post linkedin \"Testing PropIQ Social CLI!\""
echo ""
echo "📚 Full documentation: README.md"
echo "⚡ Quick start guide: QUICK_START.md"
echo ""
echo "✅ Setup complete!"
