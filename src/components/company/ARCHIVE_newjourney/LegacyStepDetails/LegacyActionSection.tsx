import React from "react";

interface ActionSectionProps {
  status: "not_started" | "in_progress" | "completed" | "skipped";
  isFocusArea: boolean;
  isTogglingFocus: boolean;
  onToggleFocus: () => void;
  isCompleting: boolean;
  onMarkComplete: () => void;
  isSkipping: boolean;
  onSkipStep: () => void;
  askExpertEnabled: boolean;
  onAskExpert: () => void;
  askWheelEnabled: boolean;
  onAskWheel: () => void;
  onTrackManually: () => void;
  onInvestigateTools: () => void;
}

const ActionSection: React.FC<ActionSectionProps> = ({
  status,
  isFocusArea,
  isTogglingFocus,
  onToggleFocus,
  isCompleting,
  onMarkComplete,
  isSkipping,
  onSkipStep,
  askExpertEnabled,
  onAskExpert,
  askWheelEnabled,
  onAskWheel,
  onTrackManually,
  onInvestigateTools,
}) => {
  return (
    <div className="card bg-base-100 shadow-md mt-6">
      <div className="card-body flex flex-wrap gap-2">
        {/* Focus Area Toggle Button */}
        <button
          className={`btn btn-sm ${isFocusArea ? "btn-primary" : "btn-outline btn-primary"}`}
          onClick={onToggleFocus}
          disabled={isTogglingFocus}
        >
          {isTogglingFocus ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : isFocusArea ? (
            <>★ Remove Focus</>
          ) : (
            <>☆ Set as Focus</>
          )}
        </button>

        {/* Mark Complete Button */}
        <button
          className={`btn btn-sm ${status === "completed" ? "btn-success" : "btn-outline btn-success"}`}
          onClick={onMarkComplete}
          disabled={isCompleting || status === "completed" || status === "skipped"}
        >
          {isCompleting ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : status === "completed" ? (
            <>✔ Completed</>
          ) : (
            <>✔ Mark Complete</>
          )}
        </button>

        {/* Skip Step Button */}
        {status !== "completed" && status !== "skipped" && (
          <button
            className="btn btn-sm btn-outline btn-warning"
            onClick={onSkipStep}
            disabled={isSkipping}
          >
            {isSkipping ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <>⏭ Skip Step</>
            )}
          </button>
        )}

        {/* Track Manually Button */}
        {status !== "completed" && status !== "skipped" && (
          <button
            className="btn btn-sm btn-outline btn-accent"
            onClick={onTrackManually}
          >
            <>📝 Track Manually</>
          </button>
        )}

        {/* Ask an Expert Button */}
        {status !== "completed" && status !== "skipped" && askExpertEnabled && (
          <button
            className="btn btn-sm btn-outline btn-secondary"
            onClick={onAskExpert}
          >
            <>👤 Ask an Expert</>
          </button>
        )}

        {/* Ask The Wheel Button */}
        {status !== "completed" && status !== "skipped" && askWheelEnabled && (
          <button
            className="btn btn-sm btn-outline btn-info"
            onClick={onAskWheel}
          >
            <>🎡 Ask The Wheel</>
          </button>
        )}

        {/* Investigate Tools Button */}
        {status !== "completed" && status !== "skipped" && (
          <button
            className="btn btn-sm btn-outline btn-primary"
            onClick={onInvestigateTools}
          >
            <>🔍 Investigate Tools</>
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionSection;
