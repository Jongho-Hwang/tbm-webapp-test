<div className="fixed top-0 left-0 right-0 h-16 bg-white/70 backdrop-blur-sm flex items-center justify-center px-4 shadow-soft z-20">
  {showBack && (
    <button onClick={() => nav(-1)} className="absolute left-4 p-2">
      <ChevronLeftIcon className="w-6 h-6 text-primary" />
    </button>
  )}
  <h1 className="text-xl font-semibold">{title}</h1>
</div>
