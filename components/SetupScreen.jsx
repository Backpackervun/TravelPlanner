import { CORE_REGIONS } from "@/lib/utils";

const SetupScreen = ({ region, onRegionChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

      {CORE_REGIONS.map((item) => (
        <div
          key={item.id}
          onClick={() => onRegionChange(item.id)}
          className={`cursor-pointer rounded-xl border p-3 text-center 
            transition-all duration-200 ease-out transform
            hover:scale-105 hover:shadow-md active:scale-95
            ${region === item.id
              ? "border-blue-500 bg-blue-50 scale-105 shadow-md"
              : "hover:border-blue-500"}`}
        >
          <div className="text-lg">{item.flag}</div>
          <div className="text-sm font-medium">{item.id}</div>
          <div className="text-xs text-gray-400">{item.subtitle}</div>
        </div>
      ))}

    </div>
  );
};

export default SetupScreen;