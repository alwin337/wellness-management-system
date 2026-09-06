const StatCard = ({ title, value, subtitle, delta, icon: Icon, color = "sky" }) => {
  const tintStyles = {
    sky: { bg: "bg-[#E7EFF4]", text: "text-[#4E7FA0]" },
    green: { bg: "bg-[#E6F1EC]", text: "text-[#1F6F5C]" },
    emerald: { bg: "bg-[#E6F1EC]", text: "text-[#1F6F5C]" },
    primary: { bg: "bg-[#E6F1EC]", text: "text-[#1F6F5C]" },
    violet: { bg: "bg-[#EEEAF6]", text: "text-[#7A6BA6]" },
    purple: { bg: "bg-[#EEEAF6]", text: "text-[#7A6BA6]" },
    gold: { bg: "bg-[#FBF3E1]", text: "text-[#B8903E]" },
    orange: { bg: "bg-[#FBF3E1]", text: "text-[#B8903E]" },
    coral: { bg: "bg-[#F7E9E5]", text: "text-[#B25848]" },
    rose: { bg: "bg-[#F7E9E5]", text: "text-[#B25848]" },
    blue: { bg: "bg-[#E7EFF4]", text: "text-[#4E7FA0]" },
  };

  const currentTint = tintStyles[color] || tintStyles.sky;

  return (
    <div className="bg-white border border-[#DFE6E0] rounded-xl p-4.5 flex flex-col justify-between shadow-2xs hover:shadow-sm transition">
      <div className="flex items-center justify-between">
        {Icon ? (
          <div className={`w-8 h-8 rounded-lg ${currentTint.bg} ${currentTint.text} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        ) : (
          <div className={`w-8 h-8 rounded-lg ${currentTint.bg} ${currentTint.text} flex items-center justify-center font-bold text-xs`}>
            •
          </div>
        )}
        {delta && (
          <span className="text-[11px] font-semibold text-[#7C9885]">{delta}</span>
        )}
      </div>

      <div className="mt-3">
        <div className="font-serif text-[#152420] text-2xl font-bold leading-none">{value}</div>
        <div className="text-[#8A9A94] text-xs font-semibold mt-1.5">{title}</div>
        {subtitle && (
          <div className="text-[11px] text-[#51625C] font-medium mt-1 truncate">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

export default StatCard;