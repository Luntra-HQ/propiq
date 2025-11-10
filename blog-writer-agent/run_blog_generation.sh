#!/bin/bash

# PropIQ Blog Generation Script
# Uses Google ADK Blog Writer Agent to generate content autonomously

echo "========================================="
echo "PropIQ Blog Generation Agent"
echo "========================================="
echo ""

# Check if adk is installed
if ! command -v adk &> /dev/null; then
    echo "❌ ADK is not installed. Installing..."
    pip3 install google-adk
fi

# Navigate to blog-writer directory
cd "$(dirname "$0")"

# Topic selection
if [ "$1" == "list" ] || [ -z "$1" ]; then
    echo "Available topics:"
    echo ""
    cat propiq_prompts.txt | grep "^TOPIC" | nl -w2 -s'. '
    echo ""
    echo "Usage:"
    echo "  ./run_blog_generation.sh <topic_number>"
    echo "  ./run_blog_generation.sh 1    # Generate topic 1"
    echo "  ./run_blog_generation.sh all  # Generate all topics (interactive)"
    echo ""
    exit 0
fi

# Create output directory
mkdir -p generated_blogs

# Extract topic prompt
if [ "$1" == "all" ]; then
    echo "🚀 Running ADK web interface for interactive generation of all topics..."
    echo ""
    echo "Instructions:"
    echo "1. The ADK web interface will open in your browser"
    echo "2. Select 'interactive_blogger_agent' from the dropdown"
    echo "3. Copy and paste topics from propiq_prompts.txt one at a time"
    echo "4. Review each blog post and approve"
    echo "5. Ask the agent to save the blog post when satisfied"
    echo ""
    echo "Press Enter to continue..."
    read

    # Launch ADK web interface
    adk web
else
    TOPIC_NUM=$1
    echo "📝 Generating blog post for Topic $TOPIC_NUM..."
    echo ""

    # Extract the specific topic from propiq_prompts.txt
    TOPIC_SECTION=$(awk "/^TOPIC $TOPIC_NUM:/{flag=1; next} /^TOPIC [0-9]+:|^===============/{flag=0} flag" propiq_prompts.txt)

    if [ -z "$TOPIC_SECTION" ]; then
        echo "❌ Topic $TOPIC_NUM not found in propiq_prompts.txt"
        exit 1
    fi

    # Save topic to temporary file
    TEMP_PROMPT="/tmp/propiq_topic_$TOPIC_NUM.txt"
    echo "$TOPIC_SECTION" > "$TEMP_PROMPT"

    echo "Topic prompt:"
    echo "----------------------------------------"
    cat "$TEMP_PROMPT"
    echo "----------------------------------------"
    echo ""
    echo "🚀 Opening ADK web interface..."
    echo ""
    echo "Instructions:"
    echo "1. The ADK web interface will open in your browser"
    echo "2. Select 'interactive_blogger_agent' from the dropdown"
    echo "3. Copy the topic prompt from above"
    echo "4. Paste it into the chat interface"
    echo "5. The agent will generate an outline - approve it"
    echo "6. Choose option 1 for visual placeholders"
    echo "7. The agent will write the blog post"
    echo "8. Review and approve (or request edits)"
    echo "9. Ask for social media posts"
    echo "10. Ask the agent to save the blog post"
    echo ""
    echo "📋 The topic prompt has been saved to: $TEMP_PROMPT"
    echo "   You can also copy it from there!"
    echo ""
    echo "Press Enter to launch ADK web interface..."
    read

    # Launch ADK web interface
    adk web
fi

echo ""
echo "✅ Blog generation session complete!"
echo ""
echo "Generated blog posts will be saved in the blogger_agent directory."
echo "Remember to:"
echo "  1. Review the generated content"
echo "  2. Move approved posts to propiq/content-library/"
echo "  3. Schedule social media posts in Buffer"
echo ""
