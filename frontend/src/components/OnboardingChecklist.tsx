import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { CheckCircle2, Circle, X, ChevronDown, ChevronUp, Trophy, Sparkles } from 'lucide-react';
import './OnboardingChecklist.css';

interface OnboardingChecklistProps {
  userId: Id<"users">;
}

export const OnboardingChecklist = ({ userId }: OnboardingChecklistProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Query progress
  const progress = useQuery(api.onboarding.getProgress, { userId });
  const completionPercentage = useQuery(api.onboarding.getCompletionPercentage, { userId });

  // Mutation
  const dismissChecklist = useMutation(api.onboarding.dismissChecklist);

  // Check if we should show the checklist
  useEffect(() => {
    if (progress?.checklistDismissed) {
      setIsDismissed(true);
    }

    // Check if just completed
    if (completionPercentage === 100 && !progress?.checklistCompletedAt) {
      setShowCompletionModal(true);
    }
  }, [progress, completionPercentage]);

  // Check if within first 7 days
  const daysActive = progress?.createdAt
    ? Math.floor((Date.now() - progress.createdAt) / (1000 * 60 * 60 * 24))
    : 0;

  const shouldShow = !isDismissed && daysActive <= 7 && completionPercentage !== 100;

  const handleDismiss = async () => {
    await dismissChecklist({ userId });
    setIsDismissed(true);
  };

  const tasks = [
    {
      key: 'analyzedFirstProperty',
      title: 'Analyze your first property',
      description: 'Try PropIQ AI analysis with a sample or real property',
      completed: progress?.analyzedFirstProperty || false,
      link: '#analyze-property',
    },
    {
      key: 'exploredCalculator',
      title: 'Explore the Deal Calculator',
      description: 'Open the Basic, Advanced, and Scenarios tabs',
      completed: progress?.exploredCalculator || false,
      link: '#calculator',
    },
    {
      key: 'triedScenarios',
      title: 'Try different scenarios',
      description: 'Model best/worst case outcomes in the Scenarios tab',
      completed: progress?.triedScenarios || false,
      link: '#calculator-scenarios',
    },
    {
      key: 'readKeyMetricsArticle',
      title: 'Learn about deal scores',
      description: 'Read: Understanding your property analysis report',
      completed: progress?.readKeyMetricsArticle || false,
      link: '#help-center/understanding-analysis-report',
    },
    {
      key: 'setInvestmentCriteria',
      title: 'Set your investment criteria',
      description: 'Define your min cash flow and max risk tolerance',
      completed: progress?.setInvestmentCriteria || false,
      link: '#settings',
    },
    {
      key: 'exportedReport',
      title: 'Export your first report',
      description: 'Try print or PDF export for your analysis',
      completed: progress?.exportedReport || false,
      link: '#export',
    },
    {
      key: 'analyzedThreeProperties',
      title: 'Analyze 3 properties total',
      description: 'Use all your free trial analyses',
      completed: progress?.analyzedThreeProperties || false,
      link: '#analyze-property',
    },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercent = (completedCount / totalTasks) * 100;

  if (!shouldShow && !showCompletionModal) return null;

  // Completion Modal
  if (showCompletionModal) {
    return (
      <div className="completion-modal-overlay">
        <div className="completion-modal">
          <div className="completion-icon">
            <Trophy className="h-16 w-16 text-yellow-400" />
            <Sparkles className="sparkle sparkle-1" />
            <Sparkles className="sparkle sparkle-2" />
            <Sparkles className="sparkle sparkle-3" />
          </div>
          <h2>🎉 You're a PropIQ Pro!</h2>
          <p>
            You've completed all onboarding tasks. You're ready to analyze properties like a pro!
          </p>
          <div className="completion-reward">
            <p className="reward-text">
              <strong>Bonus:</strong> 5 free analyses added to your account!
            </p>
          </div>
          <button
            className="completion-button"
            onClick={() => setShowCompletionModal(false)}
          >
            Start Analyzing →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`onboarding-checklist ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="checklist-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <div className="progress-circle">
            <svg className="progress-ring" width="40" height="40">
              <circle
                className="progress-ring-circle-bg"
                cx="20"
                cy="20"
                r="16"
              />
              <circle
                className="progress-ring-circle"
                cx="20"
                cy="20"
                r="16"
                strokeDasharray={`${progressPercent} ${100 - progressPercent}`}
              />
            </svg>
            <span className="progress-text">{completedCount}/{totalTasks}</span>
          </div>
          <div className="header-text">
            <h3>Get Started with PropIQ</h3>
            <p>
              {completedCount} of {totalTasks} tasks complete · {Math.round(progressPercent)}%
            </p>
          </div>
        </div>
        <div className="header-actions">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
          <button
            className="dismiss-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            title="Dismiss checklist"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="checklist-body">
          <div className="tasks-list">
            {tasks.map((task) => (
              <div
                key={task.key}
                className={`task-item ${task.completed ? 'completed' : 'pending'}`}
              >
                <div className="task-icon">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="task-content">
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                </div>
                {!task.completed && (
                  <button className="task-action" onClick={() => console.log('Navigate to:', task.link)}>
                    Start
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="checklist-footer">
            <p className="footer-hint">
              💡 Complete all tasks to unlock a bonus reward!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
