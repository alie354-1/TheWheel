import React from "react";
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from "react-dnd";
import { Grid } from "@mui/material";
import DomainCard from "./DomainCard";
import { BusinessDomain } from "../types/domain.types";
import { DomainSummary } from "../types/domain-extended.types";

export interface DraggableDomainCardProps {
  domain: BusinessDomain;
  summary?: DomainSummary;
  isLoading: boolean;
  active: boolean;
  index: number;
  onClick: () => void;
  onEdit: () => void;
  moveDomain: (from: number, to: number) => void;
}

const ITEM_TYPE = "DOMAIN_CARD";

export const DraggableDomainCard: React.FC<DraggableDomainCardProps> = ({
  domain,
  summary,
  isLoading,
  active,
  index,
  onClick,
  onEdit,
  moveDomain,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item: { index: number }, monitor: DropTargetMonitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveDomain(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={4}
      lg={3}
      xl={2}
      ref={ref}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        position: "relative",
        cursor: "move",
        transition: "opacity 0.2s",
        minWidth: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
        maxWidth: "100%",
        touchAction: "manipulation",
      }}
    >
      <DomainCard
        domain={domain}
        summary={summary}
        isLoading={isLoading}
        onClick={onClick}
        active={active}
      />
      {/* Edit button */}
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 3,
        }}
      >
        <button
          type="button"
          aria-label="Edit domain"
          tabIndex={0}
          style={{
            background: "white",
            border: "1px solid #eee",
            borderRadius: 4,
            padding: 2,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            outline: "none",
          }}
          onClick={onEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEdit();
            }
          }}
        >
          <span role="img" aria-label="Edit domain">✏️</span>
        </button>
      </span>
    </Grid>
  );
};

export default DraggableDomainCard;
