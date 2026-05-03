const SetupScreen = ({ region, onRegionChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

      {[
        { name: "Japan", flag: "🇯🇵", sub: "Tokyo" },
        { name: "South Korea", flag: "🇰🇷", sub: "Seoul" },
        { name: "Thailand", flag: "🇹🇭", sub: "Bangkok" },
        { name: "Singapore", flag: "🇸🇬", sub: "City state" },
        { name: "Malaysia", flag: "🇲🇾", sub: "KL • Penang" },
        { name: "China", flag: "🇨🇳", sub: "Beijing • Shanghai" },
      ].map((item) => (
        <div
          key={item.name}
          onClick={() => onRegionChange(item.name)}
          className={`cursor-pointer rounded-xl border p-3 text-center 
            transition-all duration-200 ease-out transform
            hover:scale-105 hover:shadow-md active:scale-95
            ${region === item.name
              ? "border-blue-500 bg-blue-50 scale-105 shadow-md"
              : "hover:border-blue-500"}`}
        >
          <div className="text-lg">{item.flag}</div>
          <div className="text-sm font-medium">{item.name}</div>
          <div className="text-xs text-gray-400">{item.sub}</div>
        </div>
      ))}

    </div>
  );
};

export default SetupScreen;