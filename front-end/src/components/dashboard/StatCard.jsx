const StatCard = ({ title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
      {subtitle && (
        <p className="text-xs mt-2 opacity-70">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;