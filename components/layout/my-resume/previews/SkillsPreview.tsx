import { useFormContext } from "@/lib/context/FormProvider";
import { themeColors } from "@/lib/utils";
import React from "react";

const proficiencyLevels: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

const SkillBadge = ({
  rating,
  themeColor,
}: {
  rating: number;
  themeColor: string;
}) => {
  const level = Math.min(Math.max(rating || 1, 1), 5);
  const label = proficiencyLevels[level];

  return (
    <span
      style={{
        fontSize: "9px",
        fontWeight: 500,
        color: themeColor,
        border: `1px solid ${themeColor}`,
        borderRadius: "3px",
        padding: "1px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

const SkillsPreview = () => {
  const { formData } = useFormContext();
  const themeColor = formData?.themeColor || themeColors[0];

  return (
    <div className="my-6">
      <h2
        className="text-center font-bold text-sm mb-2"
        style={{ color: themeColor }}
      >
        Skill{formData?.skills.length > 1 ? "s" : ""}
      </h2>
      <hr style={{ borderColor: themeColor }} />

      <div className="grid grid-cols-2 gap-x-12 max-sm:gap-x-4 max-md:gap-x-8 gap-y-2 my-4">
        {formData?.skills.map((skill: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2"
          >
            <h2 className="text-xs font-medium">{skill.name}</h2>
            <SkillBadge rating={skill?.rating} themeColor={themeColor} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsPreview;
